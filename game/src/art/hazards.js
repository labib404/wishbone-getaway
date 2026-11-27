// The obstacles and the two star hazards, drawn to read at a glance: the cast-iron oven whose
// door glows hotter before it bursts into flame (with heat shimmer), and the farmer's carving
// knife with its glint, its spinning flight and the red target ring telegraphing where it lands.
// Also the corn pickups and the kitchen's back door out to the woods.
import { GROUND_Y, KNIFE, OVEN } from '../config.js';
import { LOW_BOTTOM, knifePosition, ovenState } from '../hazards.js';
import { ellipse, glow, groundShadow, inked, INK, line, rimLight, roundRect } from './paint.js';

function hayBale(ctx, x, w, h) {
  groundShadow(ctx, x + w / 2, GROUND_Y, w * 0.6);
  roundRect(ctx, x, GROUND_Y - h, w, h, 12);
  inked(ctx, '#e3b44c', 4);
  ctx.save();
  roundRect(ctx, x, GROUND_Y - h, w, h, 12);
  ctx.clip();
  for (let i = 0; i < 14; i += 1) {
    const sx = x + ((i * 37) % w);
    line(ctx, [sx, GROUND_Y - h + 6 + (i % 4) * 14, sx + 16, GROUND_Y - h + 10 + (i % 4) * 14], 2, '#b98a2c');
  }
  ctx.fillStyle = 'rgba(255, 240, 190, 0.35)';
  ctx.fillRect(x, GROUND_Y - h, w, 10);
  ctx.restore();
  for (const tx of [0.3, 0.7]) line(ctx, [x + w * tx, GROUND_Y - h, x + w * tx, GROUND_Y], 3.5, '#7a3f22');
}

function fence(ctx, x, w, h) {
  groundShadow(ctx, x + w / 2, GROUND_Y, w * 0.6, 0.2);
  for (const px of [x + 4, x + w - 18]) {
    roundRect(ctx, px, GROUND_Y - h, 14, h, 3);
    inked(ctx, '#8b5a33', 3.5);
  }
  for (const ry of [0.22, 0.55]) {
    roundRect(ctx, x - 6, GROUND_Y - h + h * ry, w + 12, 14, 3);
    inked(ctx, '#a06b3c', 3.5);
  }
  line(ctx, [x + 4, GROUND_Y - h + 10, x + w - 6, GROUND_Y - h * 0.4], 2, 'rgba(42,26,20,0.3)');
}

function barrel(ctx, x, w, h) {
  groundShadow(ctx, x + w / 2, GROUND_Y, w * 0.6);
  ctx.beginPath();
  ctx.moveTo(x + 6, GROUND_Y - h);
  ctx.quadraticCurveTo(x - 6, GROUND_Y - h / 2, x + 6, GROUND_Y);
  ctx.lineTo(x + w - 6, GROUND_Y);
  ctx.quadraticCurveTo(x + w + 6, GROUND_Y - h / 2, x + w - 6, GROUND_Y - h);
  ctx.closePath();
  inked(ctx, '#8a5230', 4);
  for (const k of [0.33, 0.66]) line(ctx, [x + w * k, GROUND_Y - h + 3, x + w * k, GROUND_Y - 3], 1.8, 'rgba(42,26,20,0.45)');
  for (const k of [0.18, 0.82]) line(ctx, [x + 1, GROUND_Y - h * k, x + w - 1, GROUND_Y - h * k], 6, '#3c3a3c');
  rimLight(ctx, x + w * 0.35, GROUND_Y - h + 8, 10, 4, 0.3);
}

function stool(ctx, x, w, h) {
  groundShadow(ctx, x + w / 2, GROUND_Y, w * 0.55, 0.22);
  line(ctx, [x + 10, GROUND_Y - h + 14, x + 2, GROUND_Y], 9, INK);
  line(ctx, [x + w - 10, GROUND_Y - h + 14, x + w - 2, GROUND_Y], 9, INK);
  line(ctx, [x + 10, GROUND_Y - h + 14, x + 2, GROUND_Y], 5, '#b6763f');
  line(ctx, [x + w - 10, GROUND_Y - h + 14, x + w - 2, GROUND_Y], 5, '#b6763f');
  line(ctx, [x + 6, GROUND_Y - 26, x + w - 6, GROUND_Y - 26], 5, '#8c5631');
  ellipse(ctx, x + w / 2, GROUND_Y - h + 10, w / 2 + 4, 11);
  inked(ctx, '#c9874a', 4);
  rimLight(ctx, x + w / 2 - 8, GROUND_Y - h + 6, 16, 3, 0.35);
}

function pumpkin(ctx, x, w, h) {
  groundShadow(ctx, x + w / 2, GROUND_Y, w * 0.6);
  for (const [dx, rx] of [[-0.3, 0.3], [0.3, 0.3], [0, 0.32]]) {
    ellipse(ctx, x + w / 2 + dx * w, GROUND_Y - h / 2, w * rx, h / 2);
    inked(ctx, dx === 0 ? '#f08a2c' : '#dc6f22', 4);
  }
  line(ctx, [x + w / 2, GROUND_Y - h + 2, x + w / 2 + 6, GROUND_Y - h - 14], 8, INK);
  line(ctx, [x + w / 2, GROUND_Y - h + 2, x + w / 2 + 6, GROUND_Y - h - 14], 4.5, '#5e7a2c');
  rimLight(ctx, x + w / 2 - 6, GROUND_Y - h + 10, 12, 5, 0.3);
}

function laundry(ctx, x, w, t) {
  const top = LOW_BOTTOM - 190;
  line(ctx, [x - 40, top - 8, x + w / 2, top + 6, x + w + 40, top - 8], 2.5, '#efe3cc');
  for (const [dx, color, len] of [[0, '#f4efe4', 190], [w * 0.55, '#d8504a', 170]]) {
    const sway = Math.sin(t * 2.4 + dx) * 5;
    ctx.beginPath();
    ctx.moveTo(x + dx, top + 2);
    ctx.lineTo(x + dx + w * 0.5, top + 4);
    ctx.lineTo(x + dx + w * 0.5 + sway, top + len);
    ctx.quadraticCurveTo(x + dx + w * 0.25 + sway, top + len - 10, x + dx + sway, top + len);
    ctx.closePath();
    inked(ctx, color, 3.5);
    if (color !== '#f4efe4') for (let i = 1; i < 4; i += 1) line(ctx, [x + dx + 6, top + i * 44, x + dx + w * 0.45, top + i * 44], 3, '#f4efe4');
    for (const px of [x + dx + 6, x + dx + w * 0.44]) {
      roundRect(ctx, px - 3, top - 6, 7, 16, 2);
      inked(ctx, '#c99a5a', 2);
    }
  }
}

function sacks(ctx, x, w, t) {
  const sway = Math.sin(t * 1.8) * 4;
  line(ctx, [x + w / 2, 0, x + w / 2 + sway * 0.4, LOW_BOTTOM - 200], 5, '#b9945a');
  ellipse(ctx, x + w / 2 + sway * 0.4, LOW_BOTTOM - 202, 10, 8);
  inked(ctx, '#7d7d84', 3);
  for (let i = 0; i < 3; i += 1) {
    const cy = LOW_BOTTOM - 160 + i * 52 + 6;
    roundRect(ctx, x + 6 + sway * (0.6 + i * 0.2), cy - 26, w - 12, 56, 20);
    inked(ctx, i === 1 ? '#c9a46b' : '#d8b67c', 3.5);
    line(ctx, [x + 22 + sway, cy - 4, x + w - 22 + sway, cy - 4], 1.5, 'rgba(42,26,20,0.4)');
  }
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillStyle = 'rgba(90, 50, 30, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('FEED', x + w / 2 + sway, LOW_BOTTOM - 98);
}

function pots(ctx, x, w, t) {
  const top = LOW_BOTTOM - 196;
  for (const cx of [x + 10, x + w - 10]) line(ctx, [cx, 0, cx, top], 3, '#6c6a70');
  roundRect(ctx, x - 16, top - 6, w + 32, 12, 5);
  inked(ctx, '#3b3a40', 3);
  const items = [[0.18, 64, 26, '#c8733a'], [0.5, 120, 34, '#d98a46'], [0.82, 88, 28, '#b9622f']];
  for (const [k, drop, r, color] of items) {
    const px = x + w * k + Math.sin(t * 3 + k * 9) * 3;
    line(ctx, [x + w * k, top, px, top + drop - r], 2, '#6c6a70');
    ellipse(ctx, px, top + drop, r, r * 0.9);
    inked(ctx, color, 3.5);
    rimLight(ctx, px - r * 0.3, top + drop - r * 0.4, r * 0.4, r * 0.2, 0.45);
  }
  // The deepest pot hangs to the head-height line.
  const px = x + w / 2;
  roundRect(ctx, px - 30, LOW_BOTTOM - 46, 60, 46, 10);
  inked(ctx, '#a95a2c', 3.5);
  line(ctx, [px, top + 120, px, LOW_BOTTOM - 46], 2, '#6c6a70');
  line(ctx, [px - 40, LOW_BOTTOM - 40, px - 30, LOW_BOTTOM - 40], 5, INK);
  line(ctx, [px + 30, LOW_BOTTOM - 40, px + 40, LOW_BOTTOM - 40], 5, INK);
}

/** The carving knife: steel blade with a travelling glint, riveted walnut handle. Tip at (0, 0) pointing +x. */
export function carvingKnife(ctx, length, glint) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-length * 0.35, -12, -length * 0.62, -11);
  ctx.lineTo(-length * 0.62, 4);
  ctx.quadraticCurveTo(-length * 0.3, 4, 0, 0);
  ctx.closePath();
  const steel = ctx.createLinearGradient(0, -12, 0, 5);
  steel.addColorStop(0, '#ffffff');
  steel.addColorStop(0.5, '#c9d2dc');
  steel.addColorStop(1, '#8b96a4');
  inked(ctx, steel, 3);
  if (glint >= 0) {
    ctx.save();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const gx = -length * 0.62 * (1 - glint);
    const g = ctx.createLinearGradient(gx - 12, 0, gx + 12, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(gx - 12, -14, 24, 20);
    ctx.restore();
  }
  roundRect(ctx, -length * 0.66, -9, 8, 16, 2);
  inked(ctx, '#d8c08a', 2.5);
  roundRect(ctx, -length, -7, length * 0.36, 14, 6);
  inked(ctx, '#6a3a20', 3);
  for (const k of [0.75, 0.88]) {
    ellipse(ctx, -length * k, 0, 2.2, 2.2);
    ctx.fillStyle = '#e6d3a0';
    ctx.fill();
  }
}

function star(ctx, x, y, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.18;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
  ctx.restore();
}

function knife(ctx, sx, h, t) {
  const cx = sx + KNIFE.width / 2;
  if (h.phase === 'fly') {
    // Telegraph: a pulsing red target where it will land, tightening as it falls.
    const k = Math.min(1, h.t / KNIFE.flight);
    const pulse = 0.6 + Math.sin(t * 22) * 0.4;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ff3b2b';
    ctx.lineWidth = 6;
    ellipse(ctx, cx, GROUND_Y - 2, 48 - k * 20, 12 - k * 4);
    ctx.stroke();
    ctx.globalAlpha = 0.35 + pulse * 0.3;
    ctx.fillStyle = '#ff3b2b';
    ctx.fill();
    ctx.globalAlpha = 0.5 * pulse;
    ctx.setLineDash([10, 10]);
    line(ctx, [cx, GROUND_Y - 6, cx, GROUND_Y - 220], 3, '#ff6a4a');
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.font = '900 34px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.strokeText('!', cx, GROUND_Y - 30 - pulse * 6);
    ctx.fillStyle = '#ffd34a';
    ctx.fillText('!', cx, GROUND_Y - 30 - pulse * 6);
    ctx.restore();
    const p = knifePosition(h);
    const screenX = p.x - (h.x - sx);
    ctx.save();
    ctx.translate(screenX, p.y);
    ctx.rotate(h.t * 16);
    carvingKnife(ctx, 78, (t * 2) % 1);
    ctx.restore();
    line(ctx, [screenX - 30, p.y + 10, screenX - 70, p.y + 22], 3, 'rgba(255,255,255,0.35)');
    return;
  }
  // Stuck in the floorboards, quivering, catching the light.
  const quiver = Math.max(0, 0.4 - (h.t - KNIFE.flight)) * Math.sin(h.t * 60) * 0.25;
  ctx.save();
  ctx.translate(cx, GROUND_Y + 6);
  ctx.rotate(Math.PI / 2 + quiver);
  ctx.translate(0, 0);
  carvingKnife(ctx, 86, ((t * 0.8) % 1.6) / 1.6);
  ctx.restore();
  star(ctx, cx - 6, GROUND_Y - 44, 10 + Math.sin(t * 7) * 3, 0.5 + Math.sin(t * 7) * 0.4);
}

function heatShimmer(ctx, x, y, w, t, strength) {
  ctx.save();
  ctx.globalAlpha = 0.18 * strength;
  ctx.strokeStyle = '#fff0d0';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    const bx = x + 14 + i * (w - 28) / 4;
    for (let k = 0; k <= 12; k += 1) {
      const yy = y - k * 10;
      const xx = bx + Math.sin(t * 6 + k * 0.9 + i) * (3 + k * 0.6);
      if (k === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function flameJet(ctx, x, length, t) {
  const y = GROUND_Y - 50;
  for (const [color, scale] of [['#c9361f', 1], ['#f07a22', 0.78], ['#ffd34a', 0.5], ['#fff6c8', 0.25]]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 10; i += 1) {
      const k = i / 10;
      const r = (14 + k * 26) * scale + Math.sin(t * 30 + i * 2) * 4 * scale;
      ctx.moveTo(x - k * length + r, y - k * 4);
      ctx.arc(x - k * length, y - k * 4, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

function oven(ctx, sx, h, t) {
  const state = ovenState(h);
  const w = OVEN.width;
  const top = GROUND_Y - OVEN.height;
  const heat = Math.max(state.warn, h.flame);
  glow(ctx, sx + w / 2, GROUND_Y - 40, 260, `rgba(255, 120, 30, ${0.25 + heat * 0.45})`);
  heatShimmer(ctx, sx, top - 10, w, t, 0.6 + heat);
  // Stove pipe to the ceiling.
  roundRect(ctx, sx + w - 44, 0, 26, top + 4, 3);
  inked(ctx, '#2c2a30', 3.5);
  for (const yy of [top - 60, top - 170]) line(ctx, [sx + w - 48, yy, sx + w - 14, yy], 5, '#4a4850');
  groundShadow(ctx, sx + w / 2, GROUND_Y, w * 0.6, 0.35);
  // Legs and body.
  for (const lx of [sx + 10, sx + w - 22]) {
    roundRect(ctx, lx, GROUND_Y - 18, 12, 18, 3);
    inked(ctx, '#1f1d22', 3);
  }
  const rattle = state.warn > 0.5 && !state.open ? Math.sin(t * 70) * 2 : 0;
  ctx.save();
  ctx.translate(rattle, 0);
  roundRect(ctx, sx, top, w, OVEN.height - 14, 14);
  const iron = ctx.createLinearGradient(sx, top, sx + w, top);
  iron.addColorStop(0, '#3c3940');
  iron.addColorStop(0.5, '#56525b');
  iron.addColorStop(1, '#2e2b32');
  inked(ctx, iron, 4);
  roundRect(ctx, sx - 8, top - 10, w + 16, 16, 6);
  inked(ctx, '#2a282d', 3.5);
  for (let i = 0; i < 3; i += 1) {
    ellipse(ctx, sx + 26 + i * 30, top + 20, 7, 7);
    inked(ctx, '#d8b66a', 2.5);
    line(ctx, [sx + 26 + i * 30, top + 20, sx + 26 + i * 30 + 4, top + 15], 2, INK);
  }
  // The door: its window glows hotter as the burst nears; it drops open while the flame is out.
  const doorY = top + 36;
  const doorH = OVEN.height - 60;
  if (h.flame > 0.15) {
    ctx.fillStyle = '#1a0d08';
    roundRect(ctx, sx + 14, doorY, w - 28, doorH, 8);
    ctx.fill();
    glow(ctx, sx + w / 2, doorY + doorH / 2, 90, 'rgba(255, 200, 80, 0.9)');
    roundRect(ctx, sx + 10, doorY + doorH - 4, w - 20, 12, 4);
    inked(ctx, '#2a282d', 3);
  } else {
    roundRect(ctx, sx + 14, doorY, w - 28, doorH, 8);
    inked(ctx, '#3a373e', 3.5);
    const win = ctx.createRadialGradient(sx + w / 2, doorY + doorH / 2, 4, sx + w / 2, doorY + doorH / 2, 46);
    win.addColorStop(0, `rgba(255, ${210 - heat * 60}, 90, 1)`);
    win.addColorStop(1, `rgba(${170 + heat * 80}, 50, 20, 1)`);
    roundRect(ctx, sx + 32, doorY + 14, w - 64, doorH - 28, 10);
    inked(ctx, win, 3);
    glow(ctx, sx + w / 2, doorY + doorH / 2, 60 + heat * 40, `rgba(255, 150, 40, ${0.3 + heat * 0.6})`);
    line(ctx, [sx + 30, doorY - 6, sx + w - 30, doorY - 6], 6, '#cfb26c');
  }
  ctx.restore();
  if (h.flame > 0.05) {
    flameJet(ctx, sx + 20, OVEN.flame * h.flame, t);
    glow(ctx, sx - 60, GROUND_Y - 50, 200, `rgba(255, 160, 50, ${0.5 * h.flame})`);
  }
  if (state.warn > 0.3 && !state.open) {
    ctx.save();
    ctx.globalAlpha = state.warn;
    ctx.font = '900 30px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.strokeText('HOT!', sx + w / 2, top - 26 - Math.sin(t * 20) * 3);
    ctx.fillStyle = '#ff7a2a';
    ctx.fillText('HOT!', sx + w / 2, top - 26 - Math.sin(t * 20) * 3);
    ctx.restore();
  }
}

function backDoor(ctx, sx, t) {
  const top = GROUND_Y - 250;
  ctx.fillStyle = '#16243a';
  ctx.fillRect(sx, top, 140, 250);
  const sky = ctx.createLinearGradient(0, top, 0, GROUND_Y);
  sky.addColorStop(0, '#1b2a4a');
  sky.addColorStop(1, '#3d4a6a');
  ctx.fillStyle = sky;
  ctx.fillRect(sx + 8, top + 8, 124, 242);
  ellipse(ctx, sx + 96, top + 50, 18, 18);
  inked(ctx, '#fff4cf', 0);
  glow(ctx, sx + 96, top + 50, 60, 'rgba(255,240,200,0.6)');
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = '#122033';
    ctx.beginPath();
    ctx.moveTo(sx + 8 + i * 34, GROUND_Y);
    ctx.lineTo(sx + 26 + i * 34, top + 120 + (i % 2) * 30);
    ctx.lineTo(sx + 44 + i * 34, GROUND_Y);
    ctx.fill();
  }
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#6b3e22';
  ctx.strokeRect(sx, top, 140, 250);
  ctx.save();
  ctx.translate(sx + 140, top);
  ctx.transform(1, -0.12, 0, 1, 0, 0);
  roundRect(ctx, 0, 0, 52, 250, 4);
  inked(ctx, '#8c5632', 4);
  ctx.restore();
  ctx.save();
  ctx.font = '900 26px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  const bounce = Math.sin(t * 6) * 4;
  ctx.strokeText('FREEDOM ➜', sx + 70, top - 20 + bounce);
  ctx.fillStyle = '#9cff7a';
  ctx.fillText('FREEDOM ➜', sx + 70, top - 20 + bounce);
  ctx.restore();
}

export function drawCorn(ctx, sx, y, t) {
  const bob = Math.sin(t * 4) * 5;
  glow(ctx, sx, y + bob, 34, 'rgba(255, 220, 90, 0.5)');
  ctx.save();
  ctx.translate(sx, y + bob);
  ctx.rotate(0.5 + Math.sin(t * 3) * 0.15);
  ellipse(ctx, 0, 0, 8, 17);
  inked(ctx, '#ffd34a', 2.5);
  ctx.fillStyle = 'rgba(200, 130, 20, 0.6)';
  for (let r = -12; r <= 12; r += 5) for (const c of [-3, 3]) {
    ellipse(ctx, c, r, 1.6, 1.6);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(-14, 6, -8, -12);
  ctx.quadraticCurveTo(-4, 4, 0, 16);
  inked(ctx, '#7aa23a', 2);
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(14, 6, 9, -10);
  ctx.quadraticCurveTo(4, 4, 0, 16);
  inked(ctx, '#5f8a2c', 2);
  ctx.restore();
}

/** Draw one hazard at screen x `sx` (its world x minus the camera). */
export function drawHazard(ctx, sx, h, t) {
  switch (h.kind) {
    case 'block':
      if (h.look === 'hay') hayBale(ctx, sx, h.w, h.h);
      else if (h.look === 'fence') fence(ctx, sx, h.w, h.h);
      else if (h.look === 'barrel') barrel(ctx, sx, h.w, h.h);
      else if (h.look === 'stool') stool(ctx, sx, h.w, h.h);
      else pumpkin(ctx, sx, h.w, h.h);
      break;
    case 'low':
      if (h.look === 'laundry') laundry(ctx, sx, h.w, t);
      else if (h.look === 'sacks') sacks(ctx, sx, h.w, t);
      else pots(ctx, sx, h.w, t);
      break;
    case 'oven':
      oven(ctx, sx, h, t);
      break;
    case 'knife':
      knife(ctx, sx, h, t);
      break;
    case 'door':
      backDoor(ctx, sx, t);
      break;
    default:
      break;
  }
}
