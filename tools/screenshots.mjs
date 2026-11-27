// Renders screenshots/ from the game's own ?shot= scenes listed in shots.json: serves game/ with
// serve.ts, opens each scene in headless Chrome at 1280×720 over the DevTools protocol (Node's
// built-in fetch and WebSocket, nothing to install), waits for window.__shotReady and saves a JPEG
// under the gate's 256 KiB cap.
//
//   node tools/screenshots.mjs [path-to-chrome]

import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const chromePath = process.argv[2] || process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SERVE_PORT = 8231;
const CDP_PORT = 9431;
const MAX_BYTES = 250 * 1024;
const SIZE = { width: 1280, height: 720 };
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const scenes = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });
for (const file of readdirSync(outDir)) rmSync(join(outDir, file));

const server = spawn(process.execPath, ['serve.ts', '--port', String(SERVE_PORT)], { cwd: root, stdio: 'ignore' });
const profileDir = join(tmpdir(), `wishbone-shots-${process.pid}`);
const chrome = spawn(chromePath, [
  '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--mute-audio',
  `--window-size=${SIZE.width},${SIZE.height}`, `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: 'ignore' });

async function connect() {
  let info;
  for (let tries = 0; tries < 80 && !info; tries += 1) {
    try {
      info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json();
    } catch {
      await sleep(200);
    }
  }
  if (!info) throw new Error('headless Chrome never opened its DevTools port');
  const socket = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const pending = new Map();
  let lastId = 0;
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') {
      console.error('page error:', message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      console.error('console error:', message.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    lastId += 1;
    pending.set(lastId, { resolve, reject });
    socket.send(JSON.stringify({ id: lastId, method, params, sessionId }));
  });
  return { send, close: () => socket.close() };
}

async function capture(cdp, scene) {
  const { browserContextId } = await cdp.send('Target.createBrowserContext');
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', { ...SIZE, deviceScaleFactor: 1, mobile: false }, sessionId);
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${SERVE_PORT}/${scene.query}` }, sessionId);
  let ready = false;
  for (let tries = 0; tries < 100 && !ready; tries += 1) {
    await sleep(100);
    const { result } = await cdp.send('Runtime.evaluate', { expression: 'window.__shotReady === true' }, sessionId);
    ready = result.value === true;
  }
  if (!ready) console.error(`${scene.name}: scene never reported ready`);
  let bytes;
  for (const quality of [90, 84, 78, 70, 62]) {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality }, sessionId);
    bytes = Buffer.from(data, 'base64');
    if (bytes.length <= MAX_BYTES) break;
  }
  writeFileSync(join(outDir, scene.name), bytes);
  await cdp.send('Target.disposeBrowserContext', { browserContextId });
  console.log(`${scene.name.padEnd(30)} ${(bytes.length / 1024).toFixed(1)} KiB`);
}

try {
  await sleep(600);
  const cdp = await connect();
  for (const scene of scenes) await capture(cdp, scene);
  cdp.close();
} finally {
  chrome.kill();
  server.kill();
  await sleep(600);
  rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
