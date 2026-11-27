// The in-run HUD: a score plaque with corn count, a route bar from farmyard to kitchen door with
// the turkey and farmer markers, the lives as little drumstick-free feathers, a sprint stamina
// gauge, the stage title card, the red danger vignette when the farmer is close, and pop-ups.
import { FARMER, GOAL_M, PX_PER_M, STAGES, STAMINA, VIEW } from '../config.js';
import { ellipse, inked, INK, line, roundRect } from './paint.js';
import { drawTurkey } from './turkey.js';

const FONT = '"Arial Black", "Segoe UI Black", Impact, sans-serif';

function plaque(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(30, 10, 5, 0.4)';
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 8;
  roundRect(ctx, x, y, w, h, 16);
  inked(ctx, 'rgba(255, 243, 220, 0.94)', 4);
  ctx.restore();
}

function text(ctx, value, x, y, size, color, align = 'left', outline = 0) {
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (outline) {
    ctx.lineWidth = outline;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.strokeText(value, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function lifeFeather(ctx, x, y, full) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.6);
  ellipse(ctx, 0, 0, 20, 9);
  inked(ctx, full ? '#b4482a' : 'rgba(120, 90, 70, 0.35)', 3);
  if (full) {
    ellipse(ctx, 9, 0, 6, 5);
    ctx.fillStyle = '#f6cf6a';
    ctx.fill();
  }
  line(ctx, [-24, 0, 18, 0], 2, full ? INK : 'rgba(42,26,20,0.4)');
  ctx.restore();
}

function routeBar(ctx, state, metres) {
  const x = 420;
  const y = 34;
  const w = 440;
  plaque(ctx, x - 20, y - 22, w + 40, 64);
  const colors = ['#7f8c38', '#b8742f', '#3f6f6a'];
  for (let i = 0; i < STAGES.length; i += 1) {
    const from = STAGES[i].from / GOAL_M;
    const to = i + 1 < STAGES.length ? STAGES[i + 1].from / GOAL_M : 1;
    roundRect(ctx, x + w * from, y, w * (to - from), 14, i === 0 ? [7, 0, 0, 7] : i === STAGES.length - 1 ? [0, 7, 7, 0] : 0);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
  roundRect(ctx, x, y, w, 14, 7);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  const k = Math.min(1, metres / GOAL_M);
  const farmerK = Math.max(0, (state.x - state.farmer.gap) / PX_PER_M / GOAL_M);
  ellipse(ctx, x + w * farmerK, y + 7, 9, 9);
  inked(ctx, '#c23a2e', 3);
  drawTurkey(ctx, x + w * k, y + 16, 0.32, { run: state.player.run, t: state.t, shadow: false });
  // The door at the end.
  roundRect(ctx, x + w + 4, y - 12, 18, 30, 3);
  inked(ctx, '#9cff7a', 3);
  ctx.font = `900 15px ${FONT}`;
  text(ctx, `${Math.floor(metres)} m`, x + w / 2 - 40, y + 30, 15, INK, 'center');
  text(ctx, `/ ${GOAL_M} m`, x + w / 2 + 34, y + 30, 13, 'rgba(42,26,20,0.6)', 'center');
}

export function drawHud(ctx, state, metres, muted) {
  // Score plaque.
  plaque(ctx, 22, 16, 250, 92);
  text(ctx, 'SCORE', 42, 38, 14, '#b4482a');
  text(ctx, String(Math.floor(state.score)).padStart(6, '0'), 42, 70, 34, INK);
  ctx.save();
  ctx.translate(222, 44);
  ctx.rotate(0.4);
  ellipse(ctx, 0, 0, 8, 15);
  inked(ctx, '#ffd34a', 2.5);
  ctx.restore();
  text(ctx, `×${state.corn}`, 222, 80, 18, INK, 'center');

  routeBar(ctx, state, metres);

  // Lives.
  plaque(ctx, VIEW.width - 232, 16, 210, 64);
  text(ctx, 'LIVES', VIEW.width - 214, 48, 14, '#b4482a');
  for (let i = 0; i < 3; i += 1) lifeFeather(ctx, VIEW.width - 140 + i * 46, 48, i < state.lives);

  // Sprint gauge.
  const sx = 22;
  const sy = 118;
  roundRect(ctx, sx, sy, 250, 22, 11);
  inked(ctx, 'rgba(42, 26, 20, 0.55)', 3);
  const k = state.stamina / STAMINA.max;
  if (k > 0.01) {
    roundRect(ctx, sx + 3, sy + 3, 244 * k, 16, 8);
    ctx.fillStyle = state.sprinting ? '#ffe27a' : '#7fd36b';
    ctx.fill();
  }
  text(ctx, state.sprinting ? 'SPRINT!' : 'SPRINT →', sx + 125, sy + 12, 12, '#fff', 'center', 3);
  if (muted) text(ctx, 'MUTED (M)', VIEW.width - 120, 98, 13, '#fff3dc', 'center', 4);

  // The farmer is close: a red edge pulses and a warning flashes.
  const danger = Math.max(0, Math.min(1, (FARMER.lungeGap + 70 - state.farmer.gap) / 120));
  if (danger > 0) {
    const pulse = 0.6 + Math.sin(state.t * 14) * 0.4;
    const g = ctx.createRadialGradient(VIEW.width / 2, VIEW.height / 2, 300, VIEW.width / 2, VIEW.height / 2, 760);
    g.addColorStop(0, 'rgba(200, 20, 10, 0)');
    g.addColorStop(1, `rgba(200, 20, 10, ${0.5 * danger * pulse})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    if (danger > 0.5) text(ctx, 'SPRINT! HE\'S RIGHT BEHIND YOU!', VIEW.width / 2, 150, 26, '#ffdf6a', 'center', 7);
  }

  if (state.stageBanner > 0) {
    const a = Math.min(1, state.stageBanner * 2, (2.2 - state.stageBanner) * 4);
    ctx.save();
    ctx.globalAlpha = a;
    const stage = STAGES[state.stage];
    roundRect(ctx, VIEW.width / 2 - 200, 200, 400, 70, 35);
    inked(ctx, 'rgba(42, 26, 20, 0.75)', 0);
    text(ctx, `STAGE ${state.stage + 1}`, VIEW.width / 2, 220, 14, '#f6cf6a', 'center');
    text(ctx, stage.name.toUpperCase(), VIEW.width / 2, 248, 28, '#fff3dc', 'center');
    ctx.restore();
  }
}

export function drawPops(ctx, fx, cam) {
  for (const pop of fx.pops) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (pop.life - pop.age) * 3);
    const s = 1 + Math.max(0, 0.2 - pop.age) * 2;
    ctx.translate(pop.x - cam, pop.y);
    ctx.scale(s, s);
    text(ctx, pop.text, 0, 0, 24, pop.color, 'center', 6);
    ctx.restore();
  }
}
