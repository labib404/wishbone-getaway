// The menu screens, illustrated with little text: the title (the drifting farmyard, the logo,
// Tom bolting and Farmer Hoskins giving chase with his net, the oven glowing in the farmhouse
// window), the pause card, and the two endings: CAUGHT (dangled by the legs over a roasting pan)
// and ESCAPED (moonlit woods, a tiny bindle and a happy dance).
import { GOAL_M, GROUND_Y, VIEW } from '../config.js';
import { drawFarmer } from './farmer.js';
import { carvingKnife } from './hazards.js';
import { drawLogo } from './logo.js';
import { ellipse, glow, inked, INK, line, roundRect } from './paint.js';
import { drawFarmyard } from './scenery.js';
import { drawTurkey } from './turkey.js';

const FONT = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const W = VIEW.width;
const H = VIEW.height;

function label(ctx, value, x, y, size, color, outline = 7) {
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  if (outline > 0) {
    ctx.lineWidth = outline;
    ctx.strokeStyle = INK;
    ctx.strokeText(value, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function key(ctx, x, y, glyph, caption) {
  roundRect(ctx, x - 22, y - 22, 44, 44, 9);
  inked(ctx, '#fff3dc', 3.5);
  ctx.fillStyle = 'rgba(42,26,20,0.18)';
  ctx.fillRect(x - 18, y + 14, 36, 5);
  label(ctx, glyph, x, y - 1, 20, INK, 0);
  label(ctx, caption, x, y + 38, 15, '#fff3dc', 5);
}

function button(ctx, x, y, w, value, t) {
  const pulse = 1 + Math.sin(t * 5) * 0.04;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(42, 26, 20, 0.45)';
  roundRect(ctx, -w / 2 + 4, -26, w, 60, 30);
  ctx.fill();
  roundRect(ctx, -w / 2, -32, w, 60, 30);
  inked(ctx, '#e47a2e', 5);
  ctx.fillStyle = 'rgba(255, 240, 200, 0.35)';
  roundRect(ctx, -w / 2 + 14, -26, w - 28, 16, 8);
  ctx.fill();
  label(ctx, value, 0, -2, 26, '#fff6dc', 6);
  ctx.restore();
}

function farmhouse(ctx, x, t) {
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.lineTo(x, GROUND_Y - 170);
  ctx.lineTo(x + 110, GROUND_Y - 260);
  ctx.lineTo(x + 220, GROUND_Y - 170);
  ctx.lineTo(x + 220, GROUND_Y);
  ctx.closePath();
  inked(ctx, '#e9d4ae', 4);
  ctx.beginPath();
  ctx.moveTo(x - 14, GROUND_Y - 166);
  ctx.lineTo(x + 110, GROUND_Y - 270);
  ctx.lineTo(x + 234, GROUND_Y - 166);
  ctx.lineTo(x + 234, GROUND_Y - 150);
  ctx.lineTo(x + 110, GROUND_Y - 250);
  ctx.lineTo(x - 14, GROUND_Y - 150);
  ctx.closePath();
  inked(ctx, '#6a3a3a', 4);
  // The kitchen window, the oven inside glowing a hungry orange.
  roundRect(ctx, x + 40, GROUND_Y - 130, 80, 70, 4);
  inked(ctx, '#ffb05a', 4);
  glow(ctx, x + 80, GROUND_Y - 95, 120 + Math.sin(t * 5) * 8, 'rgba(255, 140, 40, 0.6)');
  roundRect(ctx, x + 56, GROUND_Y - 110, 48, 50, 4);
  inked(ctx, '#3c3940', 2.5);
  roundRect(ctx, x + 66, GROUND_Y - 98, 28, 22, 4);
  inked(ctx, '#ffcf5a', 2);
  line(ctx, [x + 80, GROUND_Y - 130, x + 80, GROUND_Y - 60], 3, INK);
  roundRect(ctx, x + 150, GROUND_Y - 120, 46, 120, 3);
  inked(ctx, '#8c5632', 3.5);
  roundRect(ctx, x + 150, GROUND_Y - 300, 26, 70, 2);
  inked(ctx, '#8a4a3a', 3);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = `rgba(230, 220, 210, ${0.35 - i * 0.08})`;
    ellipse(ctx, x + 166 + i * 18 + Math.sin(t + i) * 6, GROUND_Y - 320 - i * 30 - (t * 20) % 30, 14 + i * 6, 10 + i * 4);
    ctx.fill();
  }
}

export function drawTitle(ctx, t, best) {
  const cam = t * 60;
  drawFarmyard(ctx, cam, t);
  farmhouse(ctx, 980, t);
  // Soft vignette to settle the eye on the logo and the chase.
  const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 820);
  v.addColorStop(0, 'rgba(20, 10, 20, 0)');
  v.addColorStop(1, 'rgba(20, 10, 20, 0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  drawLogo(ctx, W / 2, 150, 0.92, t);

  const hop = Math.abs(Math.sin(t * 5)) * 34;
  drawFarmer(ctx, 230, GROUND_Y + 4, 1.12, { run: t * 11, lunge: 0.6 + Math.sin(t * 3) * 0.3, t });
  drawTurkey(ctx, 640, GROUND_Y - hop, 1.75, { run: t * 14, air: hop > 8 ? -0.5 : 0, mood: 'scared', t, squash: hop < 4 ? 0.15 : -0.1 });
  // A carving knife stuck in the dirt between them, glinting.
  ctx.save();
  ctx.translate(450, GROUND_Y + 8);
  ctx.rotate(Math.PI / 2 + 0.12);
  carvingKnife(ctx, 96, (t * 0.7) % 1);
  ctx.restore();

  button(ctx, W / 2, 672, 360, 'SPACE OR CLICK TO RUN', t);
  key(ctx, 950, 640, '↑', 'JUMP ×2');
  key(ctx, 1035, 640, '↓', 'DUCK');
  key(ctx, 1120, 640, '→', 'SPRINT');
  key(ctx, 1205, 640, 'M', 'SOUND');
  if (best > 0) label(ctx, `BEST ${best}`, 130, 660, 20, '#ffe27a', 6);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(30, 15, 20, 0.55)';
  ctx.fillRect(0, 0, W, H);
  label(ctx, 'CATCHING HIS BREATH…', W / 2, H / 2 - 20, 44, '#fff3dc', 9);
  label(ctx, 'P or Space to run on', W / 2, H / 2 + 40, 20, '#f6cf6a', 5);
}

function stats(ctx, x, y, run) {
  roundRect(ctx, x - 190, y, 380, 150, 20);
  inked(ctx, 'rgba(255, 243, 220, 0.96)', 5);
  const rows = [
    ['DISTANCE', `${Math.floor(run.metres)} / ${GOAL_M} m`],
    ['CORN', `${run.corn}`],
    ['CLOSE SHAVES', `${run.nearMisses}`],
  ];
  rows.forEach(([name, value], i) => {
    ctx.font = `900 18px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b4482a';
    ctx.fillText(name, x - 160, y + 34 + i * 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.fillText(value, x + 160, y + 34 + i * 30);
  });
  ctx.font = `900 30px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.fillText(`SCORE ${Math.floor(run.score)}`, x, y + 132);
}

function roastingPan(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 130, y - 40);
  ctx.lineTo(x + 130, y - 40);
  ctx.lineTo(x + 110, y);
  ctx.lineTo(x - 110, y);
  ctx.closePath();
  inked(ctx, '#9aa2ae', 5);
  line(ctx, [x - 150, y - 36, x - 130, y - 36], 8, INK);
  line(ctx, [x + 130, y - 36, x + 150, y - 36], 8, INK);
  for (const [dx, c] of [[-80, '#e47a2e'], [-40, '#7aa23a'], [60, '#e47a2e'], [95, '#7aa23a']]) {
    ellipse(ctx, x + dx, y - 44, 18, 10);
    inked(ctx, c, 3);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x - 110, y - 32, 220, 6);
}

export function drawCaught(ctx, t, run) {
  ctx.fillStyle = 'rgba(40, 10, 10, 0.55)';
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 420, 380, 360, 'rgba(255, 170, 80, 0.5)');
  roastingPan(ctx, 470, GROUND_Y + 30);
  const sway = Math.sin(t * 3) * 0.12;
  drawFarmer(ctx, 230, GROUND_Y + 40, 1.45, {
    mood: 'gloat', grab: 1, t, shadow: false,
    carrying: (hx, hy) => {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(Math.PI + sway);
      drawTurkey(ctx, 0, 0, 0.95, { mood: 'sulk', air: 1, t, shadow: false, flip: true });
      ctx.restore();
    },
  });
  // A speech bubble, and the verdict.
  roundRect(ctx, 60, 120, 250, 70, 26);
  inked(ctx, '#fff3dc', 4);
  ctx.beginPath();
  ctx.moveTo(200, 188);
  ctx.lineTo(230, 250);
  ctx.lineTo(250, 188);
  inked(ctx, '#fff3dc', 0);
  label(ctx, 'GOTCHA, TOM!', 185, 155, 24, INK, 0);
  ctx.save();
  ctx.translate(960, 190);
  ctx.rotate(-0.06 + Math.sin(t * 2) * 0.02);
  label(ctx, 'CAUGHT!', 0, 0, 104, '#ff5a3a', 14);
  ctx.restore();
  label(ctx, 'Dinner is served… almost.', 960, 280, 24, '#ffe2a0', 6);
  stats(ctx, 960, 320, run);
  button(ctx, 960, 530, 300, 'RUN AGAIN ↻', t);
}

export function drawEscaped(ctx, t, run) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#141a38');
  sky.addColorStop(0.7, '#3a3f6a');
  sky.addColorStop(1, '#2a2440');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 211) % W;
    const y = (i * 97) % 380;
    ctx.fillStyle = `rgba(255, 250, 220, ${0.3 + ((i * 7) % 10) / 15 + Math.sin(t * 3 + i) * 0.15})`;
    ctx.fillRect(x, y, 2.5, 2.5);
  }
  glow(ctx, 1000, 140, 220, 'rgba(255, 240, 200, 0.5)');
  ellipse(ctx, 1000, 140, 56, 56);
  inked(ctx, '#fff4cf', 0);
  for (let i = 0; i < 14; i += 1) {
    const x = i * 100 - 20;
    ctx.fillStyle = i % 2 ? '#1c2440' : '#222c4c';
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 60, 330 + (i % 3) * 40);
    ctx.lineTo(x + 120, GROUND_Y);
    ctx.fill();
  }
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  const hop = Math.abs(Math.sin(t * 6)) * 40;
  drawTurkey(ctx, 380, GROUND_Y - hop, 2, { mood: 'joy', air: hop > 6 ? -0.3 : 0, flap: hop > 30 ? 0.2 : 0, t });
  // His bindle.
  line(ctx, [440, GROUND_Y - 130 - hop, 520, GROUND_Y - 250 - hop], 7, '#8c5632');
  ellipse(ctx, 528, GROUND_Y - 258 - hop, 30, 24);
  inked(ctx, '#d65a4a', 4);
  drawFarmer(ctx, 120, GROUND_Y + 10, 0.8, { mood: 'gasp', t });
  ctx.save();
  ctx.translate(870, 250);
  ctx.rotate(0.05 + Math.sin(t * 2) * 0.02);
  label(ctx, 'ESCAPED!', 0, 0, 100, '#9cff7a', 14);
  ctx.restore();
  label(ctx, 'Tofu for dinner this year.', 870, 320, 24, '#e6e1ff', 6);
  stats(ctx, 870, 360, run);
  button(ctx, 870, 570, 300, 'RUN AGAIN ↻', t);
}
