// The Wishbone Getaway logo: bouncing, tilted cartoon letters with a thick ink outline and a
// sunset fill, over a ribbon banner, with a hand-drawn wishbone and two loose feathers.
import { ellipse, inked, INK, line } from './paint.js';

const FONT = '"Arial Black", "Segoe UI Black", Impact, sans-serif';

function letters(ctx, text, cx, y, size, t, fillTop, fillBottom, wave) {
  ctx.font = `900 ${size}px ${FONT}`;
  const widths = [...text].map((ch) => ctx.measureText(ch).width * 0.92);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  [...text].forEach((ch, i) => {
    const w = widths[i];
    const bounce = Math.sin(t * 3 + i * 0.7) * wave;
    ctx.save();
    ctx.translate(x + w / 2, y + bounce);
    ctx.rotate(Math.sin(i * 1.9) * 0.07);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(42, 26, 20, 0.55)';
    ctx.fillText(ch, 5, 8);
    ctx.lineWidth = size * 0.2;
    ctx.strokeStyle = INK;
    ctx.strokeText(ch, 0, 0);
    const g = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
    g.addColorStop(0, fillTop);
    g.addColorStop(1, fillBottom);
    ctx.fillStyle = g;
    ctx.fillText(ch, 0, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-w * 0.32, -size * 0.66, w * 0.2, size * 0.12);
    ctx.restore();
    x += w;
  });
}

function wishbone(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(-10, 0, -34, -38);
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(10, 0, 34, -38);
  ctx.lineWidth = 16;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#fff1d2';
  ctx.stroke();
  ellipse(ctx, 0, 44, 10, 8);
  inked(ctx, '#fff1d2', 4);
  ctx.restore();
}

function feather(ctx, x, y, angle, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  ellipse(ctx, 0, 0, 40, 11);
  inked(ctx, color, 3);
  ellipse(ctx, 22, 0, 10, 7);
  ctx.fillStyle = '#efd6a6';
  ctx.fill();
  line(ctx, [-44, 0, 36, 0], 2, INK);
  ctx.restore();
}

export function drawLogo(ctx, cx, cy, scale, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // Ribbon banner behind GETAWAY.
  ctx.beginPath();
  ctx.moveTo(-300, 40);
  ctx.lineTo(300, 40);
  ctx.lineTo(330, 75);
  ctx.lineTo(300, 110);
  ctx.lineTo(-300, 110);
  ctx.lineTo(-330, 75);
  ctx.closePath();
  inked(ctx, '#b4482a', 6);
  line(ctx, [-290, 50, 290, 50], 2, 'rgba(255, 220, 180, 0.4)');
  feather(ctx, -330, -40, -0.6, 1.2, '#8a4a22');
  feather(ctx, 340, -30, 0.5 + Math.PI, 1.1, '#b4642c');
  letters(ctx, 'WISHBONE', 0, 20, 104, t, '#fff6dc', '#f2a93b', 4);
  letters(ctx, 'GETAWAY', 0, 104, 62, t + 1, '#fff6dc', '#ffd06a', 2);
  wishbone(ctx, 0, -110, 0.9 + Math.sin(t * 4) * 0.04);
  ctx.restore();
}
