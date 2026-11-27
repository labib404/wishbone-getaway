// The three stages' parallax backdrops and floors, in a warm late-autumn palette:
// the farmyard at sunset (sky, sun, clouds, far and near hills with autumn trees, the red barn
// and silo, a fence row), the old barn inside (plank walls, hay lofts, god rays, lanterns) and the
// farmhouse kitchen at night (wallpaper, moonlit windows, cabinets, lamps, a checker floor).
// Where two stages meet, a doorway frame marks the way in.
import { GROUND_Y, PX_PER_M, STAGES, VIEW } from '../config.js';
import { hash01 } from '../random.js';
import { ellipse, glow, inked, INK, line, roundRect } from './paint.js';

const W = VIEW.width;
const H = VIEW.height;

function tiles(cam, factor, spacing, draw) {
  const offset = cam * factor;
  const first = Math.floor(offset / spacing) - 1;
  for (let i = first; i <= first + Math.ceil(W / spacing) + 2; i += 1) draw(i * spacing - offset, i);
}

function sky(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, '#3b3466');
  g.addColorStop(0.45, '#c8636a');
  g.addColorStop(0.75, '#f2a45a');
  g.addColorStop(1, '#f8d68e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, GROUND_Y);
  glow(ctx, 900, 410, 420, 'rgba(255, 210, 140, 0.55)');
  ellipse(ctx, 900, 410, 62, 62);
  inked(ctx, '#ffe7a8', 0);
  ctx.fillStyle = 'rgba(255, 245, 220, 0.6)';
  ellipse(ctx, 900, 410, 48, 48);
  ctx.fill();
}

function clouds(ctx, cam, t) {
  tiles(cam + t * 12, 0.04, 520, (x, i) => {
    const y = 90 + hash01(i * 7) * 120;
    ctx.fillStyle = 'rgba(255, 220, 200, 0.55)';
    for (let k = 0; k < 4; k += 1) {
      ellipse(ctx, x + k * 46, y - Math.sin(k * 1.3) * 16, 52, 24);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(180, 90, 110, 0.25)';
    ellipse(ctx, x + 70, y + 18, 110, 10);
    ctx.fill();
  });
}

function hills(ctx, cam, factor, baseY, amp, color, seed) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  const offset = cam * factor;
  for (let x = 0; x <= W + 40; x += 40) {
    const wx = (x + offset) / 300;
    const y = baseY - Math.sin(wx + seed) * amp - Math.sin(wx * 2.3 + seed * 2) * amp * 0.4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function autumnTree(ctx, x, y, size, seed) {
  line(ctx, [x, y, x, y - size * 1.2], size * 0.18, '#4a2a1c');
  const colors = ['#d4602a', '#e9a23b', '#b8391f', '#c97b2b'];
  for (let k = 0; k < 4; k += 1) {
    ctx.fillStyle = colors[(seed + k) % colors.length];
    ellipse(ctx, x + Math.cos(k * 1.7) * size * 0.45, y - size * 1.3 - Math.sin(k * 2.1) * size * 0.35, size * 0.6, size * 0.52);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 230, 170, 0.25)';
  ellipse(ctx, x - size * 0.2, y - size * 1.65, size * 0.4, size * 0.2);
  ctx.fill();
}

function barnBuilding(ctx, x, y) {
  // Silo.
  roundRect(ctx, x + 250, y - 250, 80, 250, 6);
  inked(ctx, '#9aa2a8', 4);
  ctx.beginPath();
  ctx.arc(x + 290, y - 250, 40, Math.PI, 0);
  inked(ctx, '#6f7b85', 4);
  for (let k = 1; k < 6; k += 1) line(ctx, [x + 252, y - 250 + k * 40, x + 328, y - 250 + k * 40], 1.5, 'rgba(42,26,20,0.3)');
  // Barn body and roof.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 150);
  ctx.lineTo(x + 40, y - 215);
  ctx.lineTo(x + 120, y - 250);
  ctx.lineTo(x + 200, y - 215);
  ctx.lineTo(x + 240, y - 150);
  ctx.lineTo(x + 240, y);
  ctx.closePath();
  inked(ctx, '#a3332c', 4);
  ctx.save();
  ctx.clip();
  for (let k = 0; k < 240; k += 16) line(ctx, [x + k, y - 260, x + k, y], 1.5, 'rgba(60, 10, 10, 0.3)');
  ctx.restore();
  line(ctx, [x - 6, y - 148, x + 40, y - 218, x + 120, y - 254, x + 200, y - 218, x + 246, y - 148], 9, '#f3e7d3');
  roundRect(ctx, x + 70, y - 110, 100, 110, 4);
  inked(ctx, '#7a2420', 3.5);
  line(ctx, [x + 72, y - 108, x + 168, y - 2], 5, '#f3e7d3');
  line(ctx, [x + 168, y - 108, x + 72, y - 2], 5, '#f3e7d3');
  ctx.strokeStyle = '#f3e7d3';
  ctx.lineWidth = 5;
  ctx.strokeRect(x + 70, y - 110, 100, 110);
  roundRect(ctx, x + 100, y - 200, 40, 34, 3);
  inked(ctx, '#f6c36a', 3);
  glow(ctx, x + 120, y - 183, 50, 'rgba(255, 200, 100, 0.5)');
}

function farmyard(ctx, cam, t) {
  sky(ctx, t);
  clouds(ctx, cam, t);
  hills(ctx, cam, 0.08, 430, 30, '#8a5a7c', 1);
  hills(ctx, cam, 0.16, 470, 26, '#a5605c', 3);
  tiles(cam, 0.22, 180, (x, i) => autumnTree(ctx, x + hash01(i) * 90, 500 + hash01(i * 3) * 20, 34 + hash01(i * 5) * 20, i & 3));
  hills(ctx, cam, 0.3, 520, 18, '#b57a45', 5);
  tiles(cam, 0.42, 1500, (x, i) => {
    barnBuilding(ctx, x + 300, 556);
    autumnTree(ctx, x + 820, 560, 60, i & 3);
    autumnTree(ctx, x + 1240, 560, 48, (i + 1) & 3);
  });
  // Field strip and the near fence row.
  const field = ctx.createLinearGradient(0, 540, 0, GROUND_Y);
  field.addColorStop(0, '#9c8a3c');
  field.addColorStop(1, '#7a6a2a');
  ctx.fillStyle = field;
  ctx.fillRect(0, 548, W, GROUND_Y - 548);
  tiles(cam, 0.75, 90, (x) => {
    roundRect(ctx, x, 528, 10, 64, 2);
    inked(ctx, '#7a4e2c', 2.5);
  });
  tiles(cam, 0.75, 360, (x) => {
    line(ctx, [x, 544, x + 360, 544], 6, '#8d5c34');
    line(ctx, [x, 568, x + 360, 568], 6, '#8d5c34');
  });
  // Warm sun haze over the far scenery.
  const haze = ctx.createLinearGradient(0, 380, 0, GROUND_Y);
  haze.addColorStop(0, 'rgba(255, 200, 140, 0)');
  haze.addColorStop(1, 'rgba(255, 190, 120, 0.25)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 380, W, GROUND_Y - 380);
}

function farmyardFloor(ctx, cam) {
  const dirt = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  dirt.addColorStop(0, '#9a6236');
  dirt.addColorStop(1, '#6a3e22');
  ctx.fillStyle = dirt;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = '#6f7a31';
  ctx.fillRect(0, GROUND_Y - 4, W, 10);
  tiles(cam, 1, 70, (x, i) => {
    const h = 8 + hash01(i) * 12;
    line(ctx, [x, GROUND_Y + 2, x - 4, GROUND_Y - h], 3, '#7f8c38');
    line(ctx, [x + 6, GROUND_Y + 2, x + 10, GROUND_Y - h * 0.8], 3, '#5f6a26');
    if (hash01(i * 11) > 0.6) {
      ctx.fillStyle = 'rgba(60, 30, 15, 0.35)';
      ellipse(ctx, x + 20, GROUND_Y + 40 + hash01(i * 13) * 50, 14, 4);
      ctx.fill();
    }
  });
}

function barnInside(ctx, cam, t) {
  ctx.fillStyle = '#3a2216';
  ctx.fillRect(0, 0, W, GROUND_Y);
  tiles(cam, 0.5, 46, (x, i) => {
    ctx.fillStyle = i % 3 === 0 ? '#5a3522' : i % 3 === 1 ? '#633b25' : '#55321f';
    ctx.fillRect(x, 0, 44, GROUND_Y);
    ctx.fillStyle = 'rgba(30, 15, 8, 0.5)';
    ellipse(ctx, x + 22, 200 + hash01(i) * 300, 3, 5);
    ctx.fill();
  });
  // High windows letting in the last of the sun, with dusty god rays.
  tiles(cam, 0.5, 620, (x) => {
    roundRect(ctx, x + 200, 70, 90, 80, 4);
    inked(ctx, '#f8c873', 5, '#2a170e');
    line(ctx, [x + 245, 70, x + 245, 150], 4, '#2a170e');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ray = ctx.createLinearGradient(x + 245, 150, x + 160, GROUND_Y);
    ray.addColorStop(0, 'rgba(255, 200, 110, 0.35)');
    ray.addColorStop(1, 'rgba(255, 200, 110, 0)');
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(x + 200, 150);
    ctx.lineTo(x + 290, 150);
    ctx.lineTo(x + 200, GROUND_Y);
    ctx.lineTo(x + 40, GROUND_Y);
    ctx.fill();
    ctx.restore();
  });
  // Hay loft and stalls.
  tiles(cam, 0.7, 900, (x, i) => {
    ctx.fillStyle = '#2c190f';
    ctx.fillRect(x, 250, 900, 26);
    ctx.fillStyle = '#d9a845';
    ctx.beginPath();
    ctx.moveTo(x + 40, 250);
    for (let k = 0; k <= 10; k += 1) ctx.lineTo(x + 40 + k * 50, 250 - 50 - Math.sin(k * 1.4 + i) * 18);
    ctx.lineTo(x + 540, 250);
    ctx.fill();
    for (let s = 0; s < 3; s += 1) {
      const sx = x + 80 + s * 260;
      roundRect(ctx, sx, 430, 200, 182, 4);
      inked(ctx, '#6b3f24', 4, '#2a170e');
      line(ctx, [sx, 470, sx + 200, 470], 8, '#4e2d1a');
      line(ctx, [sx + 6, 436, sx + 194, 606], 6, '#4e2d1a');
    }
  });
  tiles(cam, 0.85, 520, (x) => {
    line(ctx, [x + 120, 0, x + 120, 120], 3, '#2a170e');
    roundRect(ctx, x + 104, 120, 32, 40, 6);
    inked(ctx, '#f6c36a', 3, '#2a170e');
    glow(ctx, x + 120, 140, 160 + Math.sin(t * 7 + x) * 6, 'rgba(255, 180, 80, 0.45)');
  });
  ctx.fillStyle = '#2a170e';
  ctx.fillRect(0, 20, W, 22);
}

function barnFloor(ctx, cam) {
  ctx.fillStyle = '#5c3a20';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = '#d4a548';
  ctx.fillRect(0, GROUND_Y - 4, W, 8);
  tiles(cam, 1, 54, (x, i) => {
    line(ctx, [x, GROUND_Y + 4, x + 22, GROUND_Y - 6 - hash01(i) * 6], 2.5, '#e2b85a');
    line(ctx, [x + 30, GROUND_Y + 30 + hash01(i * 3) * 60, x + 52, GROUND_Y + 26 + hash01(i * 3) * 60], 2, 'rgba(226, 184, 90, 0.6)');
  });
}

function kitchenInside(ctx, cam, t) {
  const wall = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  wall.addColorStop(0, '#e9cf9e');
  wall.addColorStop(1, '#f3dfb8');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, GROUND_Y);
  tiles(cam, 0.5, 60, (x, i) => {
    ctx.fillStyle = 'rgba(190, 120, 80, 0.22)';
    ctx.fillRect(x, 0, 22, 380);
    ctx.fillStyle = 'rgba(200, 80, 60, 0.35)';
    ellipse(ctx, x + 41, 60 + (i % 2) * 60, 4, 4);
    ctx.fill();
    ellipse(ctx, x + 41, 180 + (i % 2) * 60, 4, 4);
    ctx.fill();
  });
  // Night windows with the moon and gingham curtains.
  tiles(cam, 0.5, 700, (x) => {
    roundRect(ctx, x + 180, 80, 170, 150, 6);
    inked(ctx, '#22355a', 8, '#7a4a2a');
    ellipse(ctx, x + 300, 120, 16, 16);
    inked(ctx, '#fff4cf', 0);
    for (let k = 0; k < 5; k += 1) {
      ctx.fillStyle = '#1a2944';
      ctx.beginPath();
      ctx.moveTo(x + 184 + k * 34, 230);
      ctx.lineTo(x + 200 + k * 34, 170 + (k % 2) * 20);
      ctx.lineTo(x + 216 + k * 34, 230);
      ctx.fill();
    }
    line(ctx, [x + 265, 80, x + 265, 230], 5, '#7a4a2a');
    for (const [cx, dir] of [[x + 176, 1], [x + 354, -1]]) {
      ctx.beginPath();
      ctx.moveTo(cx, 70);
      ctx.lineTo(cx + dir * 40, 70);
      ctx.quadraticCurveTo(cx + dir * 14, 150, cx + dir * 30, 240);
      ctx.lineTo(cx, 240);
      ctx.closePath();
      inked(ctx, '#d65a4a', 3);
    }
    line(ctx, [x + 160, 70, x + 370, 70], 6, '#7a4a2a');
  });
  // Counters, cabinets, the tiled backsplash and hanging lamps.
  tiles(cam, 0.75, 820, (x, i) => {
    ctx.fillStyle = '#f7f1e6';
    ctx.fillRect(x, 380, 820, 60);
    ctx.strokeStyle = 'rgba(120, 140, 160, 0.35)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 820; k += 24) line(ctx, [x + k, 380, x + k, 440], 1.2, 'rgba(120,140,160,0.35)');
    line(ctx, [x, 410, x + 820, 410], 1.2, 'rgba(120,140,160,0.35)');
    roundRect(ctx, x, 440, 820, 172, 4);
    inked(ctx, '#3f6f6a', 4);
    for (let d = 0; d < 5; d += 1) {
      roundRect(ctx, x + 20 + d * 160, 462, 140, 128, 8);
      inked(ctx, '#4b807a', 3);
      ellipse(ctx, x + 90 + d * 160, 486, 6, 6);
      inked(ctx, '#e3c17a', 2);
    }
    roundRect(ctx, x - 6, 428, 832, 16, 4);
    inked(ctx, '#c58b55', 3.5);
    // A pie cooling on the counter, a jar of utensils.
    ellipse(ctx, x + 520, 420, 50, 12);
    inked(ctx, '#d99a4e', 3);
    roundRect(ctx, x + 180, 372, 40, 56, 8);
    inked(ctx, 'rgba(200, 230, 240, 0.7)', 3);
    line(ctx, [x + 192, 372, x + 186, 340], 4, '#9a9aa2');
    line(ctx, [x + 206, 372, x + 214, 336], 4, '#b7763f');
    roundRect(ctx, x + 40, 120, 220, 110, 6);
    inked(ctx, '#3f6f6a', 4);
    roundRect(ctx, x + 560, 120, 220, 110, 6);
    inked(ctx, '#3f6f6a', 4);
    line(ctx, [x + 150, 130, x + 150, 220], 3, INK);
    line(ctx, [x + 670, 130, x + 670, 220], 3, INK);
  });
  tiles(cam, 0.85, 560, (x) => {
    line(ctx, [x + 300, 0, x + 300, 70], 3, INK);
    ctx.beginPath();
    ctx.moveTo(x + 270, 100);
    ctx.lineTo(x + 286, 70);
    ctx.lineTo(x + 314, 70);
    ctx.lineTo(x + 330, 100);
    ctx.closePath();
    inked(ctx, '#b8392f', 3);
    glow(ctx, x + 300, 120, 220, 'rgba(255, 200, 120, 0.4)');
  });
  const warm = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  warm.addColorStop(0, 'rgba(60, 30, 50, 0.25)');
  warm.addColorStop(1, 'rgba(60, 30, 50, 0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function kitchenFloor(ctx, cam) {
  ctx.fillStyle = '#e8dcc6';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  const rows = 4;
  for (let r = 0; r < rows; r += 1) {
    const y0 = GROUND_Y + r * 27;
    tiles(cam, 1, 54, (x, i) => {
      if ((i + r) % 2 === 0) {
        ctx.fillStyle = '#b24a3a';
        ctx.fillRect(x + r * 10, y0, 54, 27);
      }
    });
  }
  ctx.fillStyle = 'rgba(40, 20, 10, 0.25)';
  ctx.fillRect(0, GROUND_Y, W, 6);
}

function doorway(ctx, sx, from) {
  const top = 120;
  ctx.fillStyle = from === 'barn' ? '#4a2715' : '#5a3a28';
  ctx.fillRect(sx - 40, 0, 80, GROUND_Y);
  roundRect(ctx, sx - 52, top - 20, 104, 30, 4);
  inked(ctx, '#2a170e', 3);
  ctx.font = '900 20px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe2a0';
  ctx.fillText(from === 'barn' ? 'BARN' : 'KITCHEN', sx, top + 2);
  line(ctx, [sx - 40, 0, sx - 40, GROUND_Y], 6, INK);
  line(ctx, [sx + 40, 0, sx + 40, GROUND_Y], 6, INK);
}

const BACKDROPS = {
  yard: [farmyard, farmyardFloor],
  barn: [barnInside, barnFloor],
  kitchen: [kitchenInside, kitchenFloor],
};

/** Paint the backdrop behind world x `cam`, splitting the screen where one stage hands over to the next. */
export function drawScenery(ctx, cam, t) {
  for (let i = 0; i < STAGES.length; i += 1) {
    const start = STAGES[i].from * PX_PER_M - cam;
    const end = i + 1 < STAGES.length ? STAGES[i + 1].from * PX_PER_M - cam : Infinity;
    if (end < 0 || start > W) continue;
    const [back, floor] = BACKDROPS[STAGES[i].id];
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.max(0, start), 0, Math.min(W, end) - Math.max(0, start), H);
    ctx.clip();
    back(ctx, cam, t);
    floor(ctx, cam);
    ctx.restore();
    if (i > 0 && start > -60 && start < W + 60) doorway(ctx, start, STAGES[i].id);
  }
}

/** The farmyard alone, for the title screen's slow drift. */
export function drawFarmyard(ctx, cam, t) {
  farmyard(ctx, cam, t);
  farmyardFloor(ctx, cam);
}
