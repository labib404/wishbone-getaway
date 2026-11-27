// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (slowed in near misses), sounds are played from the step's events, and the renderer paints the
// current screen: title, play, paused, or the end screen (caught or escaped) with a restart.
//
// ?seed=N fixes the course. ?shot=NAME stages a screenshot scene instead (see shots.js) and sets
// window.__shotReady once it is painted.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import {
  createWorld, EVENT_CAUGHT, EVENT_CORN, EVENT_ESCAPED, EVENT_FIRE, EVENT_FLAP, EVENT_HIT, EVENT_JUMP,
  EVENT_LAND, EVENT_NEAR, EVENT_OVER, EVENT_STAGE, EVENT_STICK, EVENT_THROW,
} from './world.js';
import { ACTION_CONFIRM, ACTION_JUMP, ACTION_MUTE, ACTION_PAUSE, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
/** The end screen ignores input briefly so a held jump key does not skip it. */
const END_LOCK = 0.8;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage may be off; the best score then lasts this visit only.
  }
}

/** Map one step's events to sounds. */
function playEvents(audio, events) {
  if (events & EVENT_JUMP) audio.jump();
  if (events & EVENT_FLAP) audio.flap();
  if (events & EVENT_LAND) audio.land();
  if (events & EVENT_CORN) audio.corn();
  if (events & EVENT_HIT) {
    audio.hit();
    audio.gobble();
  }
  if (events & EVENT_THROW) {
    audio.whoosh();
    audio.shout();
  }
  if (events & EVENT_STICK) audio.thunk();
  if (events & EVENT_FIRE) audio.oven();
  if (events & EVENT_NEAR) audio.nearMiss();
  if (events & EVENT_CAUGHT) audio.caught();
  if (events & EVENT_ESCAPED) audio.escaped();
  if (events & EVENT_STAGE) audio.gobble();
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, scene.menuT, false);
    painted += 1;
    if (painted < 3) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  const audio = createAudio();
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let menuT = 0;
  let endAt = 0;
  let jumpQueued = false;

  const announce = (message) => {
    status.textContent = message;
  };

  function startRun() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    audio.unlock();
    audio.setMusic(true);
    audio.gobble();
    announce('Run! Jump, duck and sprint away from the farmer.');
  }

  function endRun() {
    screen = SCREEN_OVER;
    endAt = menuT;
    audio.setMusic(false);
    const score = Math.floor(world.state.score);
    if (score > best) {
      best = score;
      saveBest(best);
    }
    announce(world.state.mode === 'escaped' ? `Escaped! Score ${score}.` : `Caught! Score ${score}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) audio.toggleMute();
    if (screen === SCREEN_TITLE && actions & ACTION_CONFIRM) startRun();
    else if (screen === SCREEN_OVER && actions & ACTION_CONFIRM && menuT - endAt > END_LOCK) startRun();
    else if (screen === SCREEN_PLAY && actions & ACTION_PAUSE) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (screen === SCREEN_PAUSED && actions & (ACTION_PAUSE | ACTION_CONFIRM)) {
      screen = SCREEN_PLAY;
    } else if (screen === SCREEN_PLAY && actions & ACTION_JUMP) jumpQueued = true;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    menuT += dt;
    handleActions();
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        const events = world.step(STEP, {
          jumpPressed: jumpQueued,
          jumpHeld: input.jumpHeld(),
          duck: input.duckHeld(),
          sprint: input.sprintHeld(),
        });
        jumpQueued = false;
        accumulator -= STEP;
        playEvents(audio, events);
        if (events & EVENT_OVER) endRun();
      }
      audio.tick(world.state.stage / 2);
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, menuT, audio.muted);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  });

  announce('Wishbone Getaway. Press Space or click to run.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
