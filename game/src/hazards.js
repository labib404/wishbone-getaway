// What each hazard is in play: its collision boxes, how it moves or cycles (the oven's door, the
// farmer's thrown carving knife) and the near-miss bookkeeping. Boxes are in world pixels.
import { GROUND_Y, KNIFE, OVEN } from './config.js';

export const BLOCK_LOOKS = {
  yard: [{ look: 'hay', w: 92, h: 66 }, { look: 'fence', w: 70, h: 92 }],
  barn: [{ look: 'hay', w: 92, h: 66 }, { look: 'barrel', w: 64, h: 84 }],
  kitchen: [{ look: 'stool', w: 66, h: 78 }, { look: 'pumpkin', w: 84, h: 70 }],
};
export const LOW_LOOKS = { yard: 'laundry', barn: 'sacks', kitchen: 'pots' };
/** The bottom edge of a hanging hazard: a standing turkey's head hits it, a ducking one passes. */
export const LOW_BOTTOM = GROUND_Y - 60;

export function makeBlock(x, stage, variant) {
  const spec = BLOCK_LOOKS[stage][variant];
  return { kind: 'block', look: spec.look, x, w: spec.w, h: spec.h, t: 0, minClear: Infinity, hit: false };
}

export function makeLow(x, stage) {
  return { kind: 'low', look: LOW_LOOKS[stage], x, w: 96, t: 0, minClear: Infinity, hit: false };
}

export function makeOven(x, phase) {
  return { kind: 'oven', x, w: OVEN.width, h: OVEN.height, t: phase, flame: 0, minClear: Infinity, hit: false };
}

export function makeKnife(fromX, fromY, toX) {
  return { kind: 'knife', phase: 'fly', fromX, fromY, x: toX, w: KNIFE.width, t: 0, spin: 0, minClear: Infinity, hit: false };
}

export function makeDoor(x) {
  return { kind: 'door', x, w: 120, t: 0, minClear: Infinity, hit: true };
}

/** Oven cycle: 0 shut, rising toward 1 as the door is about to burst open; `open` while the flame is out. */
export function ovenState(oven) {
  const phase = oven.t % OVEN.cycle;
  const shutFor = OVEN.cycle - OVEN.open;
  if (phase >= shutFor) return { open: true, warn: 1, phase: (phase - shutFor) / OVEN.open };
  return { open: false, warn: Math.max(0, (phase - (shutFor - OVEN.warn)) / OVEN.warn), phase: 0 };
}

/** Where a flying knife is now: an arc from the farmer's hand to the spot it will stick in. */
export function knifePosition(knife) {
  const k = Math.min(1, knife.t / KNIFE.flight);
  const x = knife.fromX + (knife.x + KNIFE.width / 2 - knife.fromX) * k;
  const baseY = knife.fromY + (GROUND_Y - 30 - knife.fromY) * k;
  return { x, y: baseY - Math.sin(k * Math.PI) * 230, k };
}

/** Advance a hazard by dt; returns a string naming what it just did ('fire', 'stick'), or ''. */
export function updateHazard(h, dt) {
  const before = h.t;
  h.t += dt;
  if (h.kind === 'oven') {
    const state = ovenState(h);
    h.flame += ((state.open ? 1 : 0) - h.flame) * Math.min(1, dt * (state.open ? 14 : 8));
    const shutFor = OVEN.cycle - OVEN.open;
    if (before % OVEN.cycle < shutFor && h.t % OVEN.cycle >= shutFor) return 'fire';
  }
  if (h.kind === 'knife' && h.phase === 'fly' && h.t >= KNIFE.flight) {
    h.phase = 'stuck';
    return 'stick';
  }
  return '';
}

/** The boxes that hurt, in world pixels. */
export function hazardBoxes(h) {
  switch (h.kind) {
    case 'block':
      return [{ x: h.x + 6, y: GROUND_Y - h.h + 6, w: h.w - 12, h: h.h - 6 }];
    case 'low':
      return [{ x: h.x + 8, y: 0, w: h.w - 16, h: LOW_BOTTOM }];
    case 'oven': {
      const boxes = [{ x: h.x + 8, y: GROUND_Y - h.h + 8, w: h.w - 16, h: h.h - 8 }];
      if (h.flame > 0.35) {
        const length = OVEN.flame * h.flame;
        boxes.push({ x: h.x - length, y: GROUND_Y - 76, w: length, h: 52 });
      }
      return boxes;
    }
    case 'knife':
      if (h.phase === 'stuck') return [{ x: h.x + 4, y: GROUND_Y - KNIFE.height, w: h.w - 8, h: KNIFE.height }];
      if (h.t > KNIFE.flight * 0.7) {
        const p = knifePosition(h);
        return [{ x: p.x - 14, y: p.y - 14, w: 28, h: 28 }];
      }
      return [];
    default:
      return [];
  }
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** The gap in pixels between two boxes that overlap in x but not y (or Infinity when they do not share x). */
export function verticalClearance(a, b) {
  if (a.x >= b.x + b.w || a.x + a.w <= b.x) return Infinity;
  if (a.y + a.h <= b.y) return b.y - (a.y + a.h);
  if (b.y + b.h <= a.y) return a.y - (b.y + b.h);
  return 0;
}

/** The right-most world x a hazard still reaches (its flame included). */
export function hazardRight(h) {
  return h.x + h.w;
}
