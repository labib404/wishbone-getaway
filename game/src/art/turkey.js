// Tom, the hero: a plump, hand-inked turkey with a fanned tail, wobbling snood and a face that
// shows what he feels (determined, scared, dazed, sulking, overjoyed). Drawn from paths each frame
// with squash and stretch; the origin is the point between his feet.
import { ellipse, eye, groundShadow, inked, INK, line, rimLight } from './paint.js';

const TAIL = ['#5b2f17', '#8a4a22', '#b4642c', '#8a4a22', '#5b2f17', '#a35a28', '#6e3a1c'];

function tailFeather(ctx, angle, length, color, wobble) {
  ctx.save();
  ctx.rotate(angle + wobble);
  ellipse(ctx, length * 0.5, 0, length * 0.55, 11);
  inked(ctx, color, 3);
  ctx.fillStyle = '#efd6a6';
  ellipse(ctx, length * 0.72, 0, length * 0.16, 7.5);
  ctx.fill();
  ctx.fillStyle = '#3a1d0e';
  ellipse(ctx, length * 0.92, 0, length * 0.11, 6);
  ctx.fill();
  line(ctx, [length * 0.15, 0, length * 0.98, 0], 1.5, 'rgba(42,26,20,0.55)');
  ctx.restore();
}

function leg(ctx, hipX, hipY, swing, lift, length) {
  const kneeX = hipX + Math.sin(swing) * length * 0.45;
  const kneeY = hipY + length * 0.5 - lift * 0.5;
  const footX = hipX + Math.sin(swing) * length * 0.9;
  const footY = hipY + length - Math.max(0, lift);
  line(ctx, [hipX, hipY, kneeX, kneeY, footX, footY], 6, INK);
  line(ctx, [hipX, hipY, kneeX, kneeY, footX, footY], 3.2, '#f0a23a');
  for (const toe of [-0.5, 0, 0.6]) {
    const tx = footX + Math.cos(toe) * 11;
    const ty = footY + Math.sin(toe) * 5;
    line(ctx, [footX, footY, tx, ty], 5, INK);
    line(ctx, [footX, footY, tx, ty], 2.6, '#f0a23a');
  }
}

/**
 * Draw the turkey.
 * pose: { run (phase), air (-1 rising .. 1 falling, 0 on ground), duck, squash, mood, flap, t, look }
 * mood: 'run' | 'scared' | 'hurt' | 'sulk' | 'joy'
 */
export function drawTurkey(ctx, x, y, scale, pose) {
  const { run = 0, air = 0, duck = false, squash = 0, mood = 'run', flap = 0, t = 0, shadow = true, flip = false } = pose;
  if (shadow) groundShadow(ctx, x, y, 36 * scale * (1 - Math.min(0.5, Math.abs(air) * 0.3)));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (flip ? -1 : 1), scale);
  const sx = 1 + squash * 0.55 + (duck ? 0.18 : 0);
  const sy = 1 - squash * 0.75 - (duck ? 0.3 : 0);
  ctx.scale(sx, sy);
  const bob = air === 0 && !duck ? Math.abs(Math.sin(run)) * -4 : 0;
  ctx.translate(0, bob);

  // Tail fan, behind everything; it ruffles while running and spreads in the air.
  const spread = air !== 0 ? 1.15 : 1;
  ctx.save();
  ctx.translate(-22, -52);
  for (let i = 0; i < TAIL.length; i += 1) {
    const a = -Math.PI * (0.5 + (i / (TAIL.length - 1)) * 0.62 * spread) + 0.08;
    tailFeather(ctx, a, 66, TAIL[i], Math.sin(t * 9 + i) * 0.035);
  }
  ctx.restore();

  // Legs: a running cycle on the ground, tucked in the air.
  const tuck = air !== 0 ? 10 : 0;
  if (duck) {
    leg(ctx, -6, -24, -0.9, 0, 24);
    leg(ctx, 8, -24, 0.9, 0, 24);
  } else {
    const swing = air !== 0 ? 0.5 : Math.sin(run) * 0.9;
    leg(ctx, -6, -28, swing, tuck + Math.max(0, Math.cos(run)) * 8, 28);
    leg(ctx, 8, -28, -swing, tuck + Math.max(0, -Math.cos(run)) * 8, 28);
  }

  // Body: a round, warm-brown barrel with a pale bib and scalloped feathers.
  const body = ctx.createRadialGradient(-6, -62, 6, 0, -46, 42);
  body.addColorStop(0, '#a5602f');
  body.addColorStop(1, '#6a3819');
  ellipse(ctx, 0, -48, 36, 30);
  inked(ctx, body, 4);
  ctx.save();
  ellipse(ctx, 0, -48, 36, 30);
  ctx.clip();
  ctx.fillStyle = '#d8a56b';
  ellipse(ctx, 26, -40, 20, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(42,26,20,0.35)';
  ctx.lineWidth = 1.6;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      ctx.beginPath();
      ctx.arc(-26 + col * 12 + (row % 2) * 6, -66 + row * 11, 6, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
  }
  ctx.restore();
  rimLight(ctx, -4, -70, 20, 6, 0.22);

  // Wing: flaps hard on the double jump, held up while falling, pumping while running.
  const wingAngle = flap > 0 ? -1.1 + Math.sin(flap * 40) * 0.5 : air < 0 ? -0.6 : air > 0 ? -0.9 : Math.sin(run) * 0.18;
  ctx.save();
  ctx.translate(-6, -54);
  ctx.rotate(wingAngle);
  ellipse(ctx, -6, 6, 24, 14, 0.3);
  inked(ctx, '#7c4321', 3.5);
  line(ctx, [-20, 6, 4, 10], 1.5, 'rgba(42,26,20,0.5)');
  line(ctx, [-18, 12, 2, 15], 1.5, 'rgba(42,26,20,0.5)');
  ctx.restore();

  // Neck and head: stretched forward when ducking, craned back when caught.
  const headX = duck ? 50 : 30;
  const headY = duck ? -50 : -90;
  line(ctx, [16, -62, headX - 6, headY + 10], 15, INK);
  line(ctx, [16, -62, headX - 6, headY + 10], 9.5, '#b9c9dc');
  ctx.save();
  ctx.translate(headX, headY);
  const tilt = mood === 'scared' ? -0.15 : mood === 'sulk' ? 0.25 : mood === 'joy' ? -0.2 : 0;
  ctx.rotate(tilt);
  ellipse(ctx, 0, 0, 16, 15);
  inked(ctx, '#c7d6e6', 3.5);
  ctx.fillStyle = '#e9a0a0';
  ellipse(ctx, 4, 7, 7, 4);
  ctx.fill();

  // Beak (open when scared or cheering), snood and wattle.
  const open = mood === 'scared' || mood === 'joy' ? 5 : mood === 'hurt' ? 3 : 0.5;
  ctx.beginPath();
  ctx.moveTo(12, -4);
  ctx.lineTo(27, 0 - open * 0.3);
  ctx.lineTo(12, 3);
  ctx.closePath();
  inked(ctx, '#f5b43d', 2.5);
  ctx.beginPath();
  ctx.moveTo(12, 4);
  ctx.lineTo(24, 4 + open);
  ctx.lineTo(12, 7 + open * 0.4);
  ctx.closePath();
  inked(ctx, '#e39a2c', 2.5);
  const swing = Math.sin(t * 10 + run) * 0.25 + (air < 0 ? 0.4 : air > 0 ? -0.4 : 0);
  ctx.save();
  ctx.translate(15, -6);
  ctx.rotate(0.3 + swing);
  ellipse(ctx, 3, 9, 4.5, 11);
  inked(ctx, '#d8352d', 2.5);
  ctx.restore();
  ctx.save();
  ctx.translate(8, 10);
  ctx.rotate(-swing * 0.6);
  ellipse(ctx, 0, 8, 6, 10);
  inked(ctx, '#c92f2a', 2.5);
  ctx.restore();

  // Eyes and brows tell the mood.
  if (mood === 'hurt') {
    for (const ex of [2, -9]) {
      line(ctx, [ex - 4, -9, ex + 4, -1], 2.8, INK);
      line(ctx, [ex + 4, -9, ex - 4, -1], 2.8, INK);
    }
  } else if (mood === 'joy') {
    for (const ex of [3, -8]) {
      ctx.beginPath();
      ctx.arc(ex, -3, 5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
  } else {
    const big = mood === 'scared' ? 7.8 : 6.4;
    const pupil = mood === 'scared' ? 0.32 : 0.55;
    const lid = mood === 'sulk' ? 0.45 : mood === 'run' ? 0.12 : 0;
    eye(ctx, -8, -5, big * 0.85, mood === 'scared' ? -1 : 0.8, -0.1, lid, pupil);
    eye(ctx, 3, -5, big, mood === 'scared' ? -1 : 0.9, -0.1, lid, pupil);
    if (mood === 'run') {
      line(ctx, [-14, -14, -2, -12], 2.8, INK);
      line(ctx, [-1, -12, 10, -15], 2.8, INK);
    } else if (mood === 'scared') {
      line(ctx, [-14, -16, -3, -19], 2.5, INK);
      line(ctx, [-1, -19, 10, -16], 2.5, INK);
      ctx.fillStyle = '#9fd3ff';
      ctx.beginPath();
      ctx.moveTo(-17, -16);
      ctx.quadraticCurveTo(-23, -6, -17, -4);
      ctx.quadraticCurveTo(-12, -6, -17, -16);
      inked(ctx, '#bfe3ff', 1.8);
    } else if (mood === 'sulk') {
      line(ctx, [-14, -10, -2, -13], 3, INK);
      line(ctx, [-1, -13, 10, -10], 3, INK);
    }
  }
  // A little crest of head feathers.
  line(ctx, [-6, -14, -10, -24], 3, INK);
  line(ctx, [-1, -15, 0, -25], 3, INK);
  ctx.restore();
  ctx.restore();
}
