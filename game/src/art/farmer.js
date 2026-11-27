// Farmer Hoskins: big, red-nosed and furious, in a straw hat, plaid flannel and patched overalls,
// swinging a turkey net. He runs, winds up to throw carving knives, lunges when he is close, and
// in the end either grabs Tom by the legs or is left gasping. Origin is between his boots.
import { ellipse, eye, groundShadow, inked, INK, line, rimLight, roundRect } from './paint.js';

function bootLeg(ctx, hipX, hipY, swing, lift) {
  const kneeX = hipX + Math.sin(swing) * 26;
  const kneeY = hipY + 34 - lift * 0.4;
  const footX = hipX + Math.sin(swing) * 46;
  const footY = hipY + 70 - lift;
  line(ctx, [hipX, hipY, kneeX, kneeY, footX, footY], 26, INK);
  line(ctx, [hipX, hipY, kneeX, kneeY, footX, footY], 20, '#3d5f8c');
  roundRect(ctx, footX - 14, footY - 10, 34, 16, 7);
  inked(ctx, '#4a2a17', 3);
}

function arm(ctx, shoulderX, shoulderY, angle, bend, length = 46) {
  const elbowX = shoulderX + Math.cos(angle) * length * 0.55;
  const elbowY = shoulderY + Math.sin(angle) * length * 0.55;
  const handX = elbowX + Math.cos(angle + bend) * length * 0.55;
  const handY = elbowY + Math.sin(angle + bend) * length * 0.55;
  line(ctx, [shoulderX, shoulderY, elbowX, elbowY, handX, handY], 21, INK);
  line(ctx, [shoulderX, shoulderY, elbowX, elbowY, handX, handY], 15, '#c23a2e');
  ellipse(ctx, handX, handY, 9, 9);
  inked(ctx, '#f0b48c', 3);
  return { x: handX, y: handY };
}

function net(ctx, hand, angle) {
  ctx.save();
  ctx.translate(hand.x, hand.y);
  ctx.rotate(angle);
  line(ctx, [-20, 0, 92, 0], 7, INK);
  line(ctx, [-20, 0, 92, 0], 4, '#b07a3e');
  ctx.translate(122, 0);
  ellipse(ctx, 0, 0, 32, 26);
  ctx.fillStyle = 'rgba(240, 230, 210, 0.25)';
  ctx.fill();
  ctx.save();
  ellipse(ctx, 0, 0, 32, 26);
  ctx.clip();
  ctx.strokeStyle = 'rgba(60, 40, 30, 0.6)';
  ctx.lineWidth = 1.4;
  for (let i = -40; i <= 40; i += 9) {
    line(ctx, [i, -30, i + 18, 30], 1.4, 'rgba(60,40,30,0.55)');
    line(ctx, [i, -30, i - 18, 30], 1.4, 'rgba(60,40,30,0.55)');
  }
  ctx.restore();
  ellipse(ctx, 0, 0, 32, 26);
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#8f8a84';
  ctx.stroke();
  ctx.restore();
}

/**
 * pose: { run, throwAnim (0..1), lunge (0..1), grab (0..1), mood: 'chase'|'gloat'|'gasp', t }
 */
export function drawFarmer(ctx, x, y, scale, pose) {
  const { run = 0, throwAnim = 0, lunge = 0, grab = 0, mood = 'chase', t = 0, carrying = null, shadow = true } = pose;
  if (shadow) groundShadow(ctx, x, y, 58 * scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const lean = 0.12 + lunge * 0.2 - grab * 0.1;
  const bob = mood === 'gasp' ? Math.sin(t * 6) * 3 : Math.abs(Math.sin(run)) * -6;
  ctx.translate(0, bob);

  const standing = mood !== 'chase' || grab > 0.5;
  const swing = standing ? 0.15 : Math.sin(run) * 0.75;
  bootLeg(ctx, -12, -78, -swing, standing ? 0 : Math.max(0, Math.cos(run)) * 14);
  ctx.save();
  ctx.rotate(lean);
  // Back arm pumps; drawn before the body.
  const back = arm(ctx, -16, -150, Math.PI * 0.55 - swing * 0.8 + (mood === 'gasp' ? 0.4 : 0), 0.4);
  ctx.restore();
  bootLeg(ctx, 12, -78, swing, standing ? 0 : Math.max(0, -Math.cos(run)) * 14);

  ctx.save();
  ctx.rotate(lean);
  // Shirt and overalls.
  roundRect(ctx, -38, -172, 76, 100, 30);
  inked(ctx, '#c23a2e', 4);
  ctx.save();
  roundRect(ctx, -38, -172, 76, 100, 30);
  ctx.clip();
  for (let i = -40; i < 44; i += 14) {
    ctx.fillStyle = 'rgba(80, 20, 15, 0.35)';
    ctx.fillRect(i, -172, 5, 100);
    ctx.fillRect(-38, -172 + (i + 40), 76, 5);
  }
  ctx.restore();
  roundRect(ctx, -32, -132, 64, 66, 14);
  inked(ctx, '#4c74a8', 4);
  roundRect(ctx, -16, -124, 32, 22, 5);
  inked(ctx, '#5f86b8', 2.5);
  line(ctx, [-24, -134, -18, -168], 6, '#4c74a8');
  line(ctx, [24, -134, 18, -168], 6, '#4c74a8');
  for (const bx of [-22, 22]) {
    ellipse(ctx, bx, -130, 4, 4);
    inked(ctx, '#f2c14e', 2);
  }
  ctx.fillStyle = '#8f5a3a';
  roundRect(ctx, 6, -96, 18, 16, 3);
  ctx.fill();
  rimLight(ctx, -6, -165, 26, 6, 0.18);

  // Head: hat, ruddy face, mustache and a temper.
  ctx.save();
  ctx.translate(6, -196);
  ellipse(ctx, 0, 0, 30, 30);
  inked(ctx, '#f0b48c', 4);
  ctx.fillStyle = 'rgba(214, 110, 90, 0.45)';
  ellipse(ctx, 16, 8, 8, 6);
  ctx.fill();
  ellipse(ctx, 26, 2, 11, 9);
  inked(ctx, '#d9725a', 3);
  if (mood === 'gasp') {
    eye(ctx, 4, -6, 7, 0.4, 0.3, 0.55);
    eye(ctx, 20, -8, 6, 0.4, 0.3, 0.55);
  } else {
    eye(ctx, 6, -7, 6.5, 1, 0, mood === 'gloat' ? 0.25 : 0.15);
    eye(ctx, 21, -9, 5.8, 1, 0, mood === 'gloat' ? 0.25 : 0.15);
  }
  const brow = mood === 'gloat' ? -2 : mood === 'gasp' ? -6 : 3;
  line(ctx, [-3, -18, 12, -14 + brow], 5, '#6b4a36');
  line(ctx, [15, -16 + brow, 28, -20], 5, '#6b4a36');
  // Mustache.
  ctx.beginPath();
  ctx.moveTo(8, 12);
  ctx.quadraticCurveTo(18, 4, 30, 12);
  ctx.quadraticCurveTo(38, 20, 42, 14);
  ctx.quadraticCurveTo(36, 28, 24, 20);
  ctx.quadraticCurveTo(14, 26, 2, 22);
  ctx.quadraticCurveTo(-4, 18, 8, 12);
  inked(ctx, '#8c6a52', 3);
  // Mouth: shouting when close, a grin when gloating, panting when beaten.
  const mouth = mood === 'gloat' ? 0 : mood === 'gasp' ? 8 + Math.sin(t * 6) * 3 : 4 + lunge * 9;
  if (mouth > 0.5) {
    ellipse(ctx, 18, 27, 9, mouth);
    inked(ctx, '#5a1a1a', 3);
  } else {
    ctx.beginPath();
    ctx.arc(18, 22, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
  // Straw hat with a red band.
  ctx.save();
  ctx.rotate(-0.12);
  ellipse(ctx, 2, -22, 52, 11);
  inked(ctx, '#e6c46a', 4);
  ctx.beginPath();
  ctx.moveTo(-26, -22);
  ctx.quadraticCurveTo(-24, -58, 2, -58);
  ctx.quadraticCurveTo(28, -58, 30, -22);
  ctx.closePath();
  inked(ctx, '#e9c972', 4);
  ctx.fillStyle = '#b8362c';
  ctx.fillRect(-26, -32, 56, 8);
  ctx.strokeStyle = 'rgba(150, 110, 40, 0.6)';
  ctx.lineWidth = 1.5;
  for (let i = -20; i < 28; i += 7) line(ctx, [i, -54, i + 2, -34], 1.2, 'rgba(150,110,40,0.6)');
  ctx.restore();
  if (mood === 'gasp') {
    ctx.fillStyle = '#bfe3ff';
    ctx.beginPath();
    ctx.moveTo(-26, -6);
    ctx.quadraticCurveTo(-33, 6, -26, 9);
    ctx.quadraticCurveTo(-19, 6, -26, -6);
    inked(ctx, '#bfe3ff', 2);
  }
  ctx.restore();

  // Front arm: the net, a knife throw wind-up, or the grab.
  if (grab > 0) {
    const hand = arm(ctx, 22, -150, -0.25 * grab, 0.05, 96);
    if (carrying) carrying(hand.x, hand.y);
  } else if (throwAnim > 0) {
    const k = throwAnim / 0.45;
    arm(ctx, 22, -150, -Math.PI * 0.9 * k + 0.1, -0.5 * k);
    net(ctx, back, Math.PI * 1.25);
  } else {
    const hand = arm(ctx, 22, -150, -0.6 - lunge * 0.4 + Math.sin(run) * 0.15, -0.3);
    net(ctx, hand, -0.9 - lunge * 0.5 + Math.sin(run) * 0.1);
  }
  ctx.restore();
  ctx.restore();
}
