// The juice layer: loose feathers, dust puffs, knife sparks, oven embers, falling leaves and the
// floating score pop-ups, plus screen shake. Particles live in world coordinates so they scroll
// with the scene; all of them are driven by the world's seeded random source.

export function createEffects() {
  return { parts: [], pops: [], shake: 0 };
}

function add(fx, part) {
  if (fx.parts.length < 400) fx.parts.push(part);
}

export function burstFeathers(fx, rng, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    add(fx, {
      kind: 'feather', x, y,
      vx: rng.range(-260, 220), vy: rng.range(-520, -120),
      spin: rng.range(-7, 7), angle: rng.range(0, Math.PI * 2),
      life: rng.range(1.1, 1.9), age: 0, size: rng.range(10, 18),
      tint: rng.pick(['#7a4424', '#b66a35', '#e6c79a', '#5b2f17', '#d9893d']),
    });
  }
}

export function puffDust(fx, rng, x, y, count, push = -1) {
  for (let i = 0; i < count; i += 1) {
    add(fx, {
      kind: 'dust', x: x + rng.range(-14, 14), y: y - rng.range(0, 6),
      vx: push * rng.range(40, 160), vy: rng.range(-90, -20),
      life: rng.range(0.35, 0.7), age: 0, size: rng.range(6, 14),
    });
  }
}

export function sprayEmbers(fx, rng, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    add(fx, {
      kind: 'ember', x: x + rng.range(-20, 20), y,
      vx: rng.range(-140, 30), vy: rng.range(-260, -60),
      life: rng.range(0.4, 1.0), age: 0, size: rng.range(2, 4.5),
    });
  }
}

export function strikeSparks(fx, rng, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const a = rng.range(Math.PI * 1.05, Math.PI * 1.95);
    const s = rng.range(180, 420);
    add(fx, { kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rng.range(0.2, 0.4), age: 0, size: 2 });
  }
}

export function dropLeaf(fx, rng, x, y) {
  add(fx, {
    kind: 'leaf', x, y, vx: rng.range(-60, -20), vy: rng.range(30, 70),
    spin: rng.range(-3, 3), angle: rng.range(0, 6.28), life: 6, age: 0,
    size: rng.range(7, 12), tint: rng.pick(['#d4602a', '#e9a23b', '#b8391f', '#c97b2b']),
  });
}

export function popText(fx, x, y, text, color) {
  fx.pops.push({ x, y, text, color, age: 0, life: 1.1 });
}

export function shake(fx, amount) {
  fx.shake = Math.max(fx.shake, amount);
}

export function updateEffects(fx, dt, groundY) {
  fx.shake = Math.max(0, fx.shake - dt * 40);
  for (let i = fx.parts.length - 1; i >= 0; i -= 1) {
    const p = fx.parts[i];
    p.age += dt;
    if (p.age >= p.life) {
      fx.parts.splice(i, 1);
      continue;
    }
    if (p.kind === 'feather' || p.kind === 'leaf') {
      p.vy = Math.min(p.vy + 700 * dt, 90);
      p.vx *= 1 - 1.6 * dt;
      p.angle += p.spin * dt;
      p.x += (p.vx + Math.sin(p.age * 5 + p.size) * 40) * dt;
      p.y = Math.min(p.y + p.vy * dt, groundY - 2);
    } else if (p.kind === 'ember') {
      p.vy -= 60 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    } else {
      if (p.kind === 'spark') p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 3 * dt;
    }
  }
  for (let i = fx.pops.length - 1; i >= 0; i -= 1) {
    const pop = fx.pops[i];
    pop.age += dt;
    pop.y -= 50 * dt;
    if (pop.age >= pop.life) fx.pops.splice(i, 1);
  }
}
