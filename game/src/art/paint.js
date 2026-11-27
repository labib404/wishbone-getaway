// Small drawing helpers the art modules share: ink outlines, soft shadows, rounded shapes,
// wobbly hand-drawn lines and the warm glow used for lamps, the sun and the oven.

export const INK = '#2a1a14';

export function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rotation, 0, Math.PI * 2);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Fill the current path and give it the hand-inked outline every character wears. */
export function inked(ctx, fill, width = 3.5, stroke = INK) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (width > 0) {
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function line(ctx, points, width, color) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function groundShadow(ctx, x, y, w, alpha = 0.28) {
  ctx.save();
  ctx.fillStyle = `rgba(40, 20, 10, ${alpha})`;
  ellipse(ctx, x, y, w, w * 0.18);
  ctx.fill();
  ctx.restore();
}

export function glow(ctx, x, y, radius, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** A soft highlight across the top of a shape, the "late sun" rim light. */
export function rimLight(ctx, x, y, rx, ry, alpha = 0.25) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff2c8';
  ellipse(ctx, x, y, rx, ry);
  ctx.fill();
  ctx.restore();
}

/** An eye with a white, a pupil looking toward (lx, ly), a shine and an optional lid. */
export function eye(ctx, x, y, r, lx, ly, lid = 0, pupil = 0.55) {
  ellipse(ctx, x, y, r, r * 1.08);
  inked(ctx, '#ffffff', 2.5);
  ctx.fillStyle = INK;
  ellipse(ctx, x + lx * r * 0.35, y + ly * r * 0.35, r * pupil, r * pupil * 1.1);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x + lx * r * 0.35 - r * 0.2, y + ly * r * 0.35 - r * 0.25, r * 0.18, r * 0.18);
  ctx.fill();
  if (lid > 0) {
    ctx.save();
    ellipse(ctx, x, y, r, r * 1.08);
    ctx.clip();
    ctx.fillStyle = '#e9b08c';
    ctx.fillRect(x - r - 2, y - r * 1.2, r * 2 + 4, r * 2.2 * lid);
    ctx.restore();
    line(ctx, [x - r, y - r * 1.1 + r * 2.2 * lid, x + r, y - r * 1.1 + r * 2.2 * lid], 2.5, INK);
  }
}
