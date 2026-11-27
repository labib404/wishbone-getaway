// Paints one frame: the stage backdrop, the hazards and corn, the farmer and the turkey with their
// poses taken from the run's state, the particles, then the HUD and whichever menu screen is up.
// The canvas keeps a fixed 1280×720 logical size and is scaled to fit the window.
import { GROUND_Y, PLAYER_X, VIEW } from './config.js';
import { metres, MODE_CAUGHT, MODE_ESCAPED } from './world.js';
import { drawScenery } from './art/scenery.js';
import { drawCorn, drawHazard } from './art/hazards.js';
import { drawTurkey } from './art/turkey.js';
import { drawFarmer } from './art/farmer.js';
import { drawHud, drawPops } from './art/hud.js';
import { drawCaught, drawEscaped, drawPause, drawTitle } from './art/screens.js';
import { ellipse, inked, INK, line } from './art/paint.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function drawParticle(ctx, p, cam) {
  const fade = 1 - p.age / p.life;
  const x = p.x - cam;
  ctx.save();
  ctx.globalAlpha = Math.min(1, fade * 1.5);
  if (p.kind === 'feather' || p.kind === 'leaf') {
    ctx.translate(x, p.y);
    ctx.rotate(p.angle);
    ellipse(ctx, 0, 0, p.size, p.size * 0.34);
    inked(ctx, p.tint, 1.5);
    line(ctx, [-p.size, 0, p.size * 0.8, 0], 1, INK);
  } else if (p.kind === 'dust') {
    ctx.fillStyle = 'rgba(214, 180, 140, 0.6)';
    ellipse(ctx, x, p.y, p.size * (1 + p.age * 2), p.size * (0.8 + p.age * 1.5));
    ctx.fill();
  } else if (p.kind === 'ember') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ffb347';
    ellipse(ctx, x, p.y, p.size, p.size);
    ctx.fill();
  } else {
    line(ctx, [x, p.y, x - p.vx * 0.03, p.y - p.vy * 0.03], 2.5, '#fff4c0');
  }
  ctx.restore();
}

function turkeyMood(state) {
  if (state.mode === MODE_CAUGHT) return 'scared';
  if (state.mode === MODE_ESCAPED) return 'joy';
  if (state.player.hurt > 0) return 'hurt';
  if (state.player.fear > 0.3 || state.slow > 0) return 'scared';
  return 'run';
}

function drawRun(ctx, state, actors = true) {
  const cam = state.x - PLAYER_X;
  const shakeX = state.fx.shake ? Math.sin(state.t * 91) * state.fx.shake : 0;
  const shakeY = state.fx.shake ? Math.cos(state.t * 77) * state.fx.shake * 0.6 : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawScenery(ctx, cam, state.t);

  for (const h of state.hazards) {
    const sx = h.x - cam;
    if (sx > -500 && sx < VIEW.width + 300 && h.kind !== 'knife') drawHazard(ctx, sx, h, state.t);
  }
  for (const c of state.pickups) {
    if (!c.taken && c.x - cam > -40 && c.x - cam < VIEW.width + 40) drawCorn(ctx, c.x - cam, c.y, c.t);
  }

  const f = state.farmer;
  if (actors) drawFarmer(ctx, PLAYER_X - f.gap - 30, GROUND_Y + 2, 1, {
    run: f.run,
    throwAnim: f.throwAnim,
    lunge: f.lunge,
    grab: f.grab,
    mood: state.mode === MODE_ESCAPED ? 'gasp' : 'chase',
    t: state.t,
  });

  const p = state.player;
  const blink = p.invuln > 0 && Math.floor(state.t * 16) % 2 === 0;
  if (actors && !blink) {
    drawTurkey(ctx, PLAYER_X, p.y, 1, {
      run: p.run,
      air: p.ground ? 0 : Math.sign(p.vy) || -1,
      duck: p.duck,
      squash: p.squash,
      mood: turkeyMood(state),
      flap: p.flap,
      t: state.t,
    });
  }
  if (state.sprinting && p.ground) {
    for (let i = 0; i < 3; i += 1) line(ctx, [PLAYER_X - 60 - i * 20, p.y - 30 - i * 16, PLAYER_X - 110 - i * 20, p.y - 30 - i * 16], 3, 'rgba(255,255,255,0.6)');
  }
  // Knives fly in front of everyone.
  for (const h of state.hazards) {
    const sx = h.x - cam;
    if (h.kind === 'knife' && sx > -500 && sx < VIEW.width + 400) drawHazard(ctx, sx, h, state.t);
  }
  for (const part of state.fx.parts) drawParticle(ctx, part, cam);
  drawPops(ctx, state.fx, cam);
  ctx.restore();

  // Slow motion: a cool tint and letterbox bars.
  if (state.timeScale < 0.9) {
    const k = (1 - state.timeScale) / 0.65;
    ctx.fillStyle = `rgba(120, 170, 255, ${0.12 * k})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, VIEW.width, 26 * k);
    ctx.fillRect(0, VIEW.height - 26 * k, VIEW.width, 26 * k);
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const ratio = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(VIEW.width * ratio * dpr);
    canvas.height = Math.round(VIEW.height * ratio * dpr);
    canvas.style.width = `${Math.round(VIEW.width * ratio)}px`;
    canvas.style.height = `${Math.round(VIEW.height * ratio)}px`;
    return ratio * dpr;
  }
  let scale = fit();
  window.addEventListener('resize', () => {
    scale = fit();
  });

  return {
    /** Draw the frame for this screen; `menuT` drives the menus' own animation. */
    draw(state, screen, best, menuT, muted) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      if (screen === SCREEN_TITLE) {
        drawTitle(ctx, menuT, best);
        return;
      }
      if (screen === SCREEN_OVER) {
        const run = { metres: metres(state), corn: state.corn, nearMisses: state.nearMisses, score: state.score };
        if (state.mode === MODE_ESCAPED) drawEscaped(ctx, menuT, run);
        else {
          drawRun(ctx, state, false);
          drawCaught(ctx, menuT, run);
        }
        return;
      }
      drawRun(ctx, state);
      drawHud(ctx, state, metres(state), muted);
      if (screen === SCREEN_PAUSED) drawPause(ctx);
    },
  };
}
