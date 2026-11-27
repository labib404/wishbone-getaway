// Lays the course out ahead of the turkey, one pattern at a time, harder as the run goes on:
// hay bales, fences and washing lines in the farmyard; barrels and lanterns in the barn; stools,
// pumpkins, pot racks and the roaring oven in the kitchen. Corn is strung along the safe line.
import { GOAL_M, GROUND_Y, PX_PER_M, TURKEY } from './config.js';
import { makeBlock, makeDoor, makeLow, makeOven } from './hazards.js';

const SAFE_START_M = 18;

/** About how far a full jump carries the turkey at the current pace (sprinting), so hazards that
 * follow one another always leave room to land and react. */
function reach(state) {
  return state.speed * TURKEY.sprintBoost * 0.95;
}

function cornLine(state, x, count, spacing, heightAt) {
  for (let i = 0; i < count; i += 1) {
    state.pickups.push({ x: x + i * spacing, y: GROUND_Y - heightAt(i / Math.max(1, count - 1)), taken: false, t: i * 0.3 });
  }
}

/** Each pattern places hazards from `x` and returns how many pixels it fills. */
const PATTERNS = {
  single(state, rng, stage, x) {
    const block = makeBlock(x, stage, rng.next() < 0.5 ? 0 : 1);
    state.hazards.push(block);
    cornLine(state, x - 90, 4, 64, (k) => 70 + Math.sin(k * Math.PI) * 150);
    return block.w;
  },
  double(state, rng, stage, x) {
    const a = makeBlock(x, stage, 0);
    const b = makeBlock(x + a.w + reach(state) + rng.range(40, 140), stage, 1);
    state.hazards.push(a, b);
    return b.x + b.w - x;
  },
  duck(state, rng, stage, x) {
    const low = makeLow(x, stage);
    state.hazards.push(low);
    cornLine(state, x - 20, 3, 56, () => 26);
    return low.w;
  },
  duckThenJump(state, rng, stage, x) {
    const low = makeLow(x, stage);
    const block = makeBlock(x + low.w + reach(state) * 0.55 + rng.range(60, 160), stage, 0);
    state.hazards.push(low, block);
    return block.x + block.w - x;
  },
  oven(state, rng, stage, x) {
    const oven = makeOven(x, rng.range(0, 2));
    state.hazards.push(oven);
    cornLine(state, x - 40, 5, 58, (k) => 120 + Math.sin(k * Math.PI) * 110);
    return oven.w + 60;
  },
  ovenThenPots(state, rng, stage, x) {
    const oven = makeOven(x, rng.range(0, 2));
    const low = makeLow(x + oven.w + reach(state) + rng.range(60, 160), stage);
    state.hazards.push(oven, low);
    return low.x + low.w - x;
  },
  /** An open stretch where the farmer will land a thrown carving knife (see world.js chase). */
  knife(state, rng, stage, x) {
    state.course.throwSpots.push(x);
    cornLine(state, x - 140, 3, 70, () => 190);
    return 40;
  },
  knifePair(state, rng, stage, x) {
    state.course.throwSpots.push(x, x + reach(state) + 120);
    return reach(state) + 160;
  },
  cornRun(state, rng, stage, x) {
    cornLine(state, x, 6, 60, (k) => 40 + k * 60);
    return 360;
  },
};

const PLAN = {
  yard: [['single', 4], ['double', 2], ['duck', 3], ['cornRun', 1]],
  barn: [['single', 3], ['double', 2], ['duck', 3], ['duckThenJump', 2], ['knife', 4], ['cornRun', 1]],
  kitchen: [['single', 1], ['duck', 2], ['oven', 4], ['ovenThenPots', 2], ['duckThenJump', 1], ['knife', 3], ['knifePair', 2]],
};

function choose(rng, plan) {
  const total = plan.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [name, weight] of plan) {
    roll -= weight;
    if (roll < 0) return name;
  }
  return plan[0][0];
}

export function createCourse() {
  return { nextX: SAFE_START_M * PX_PER_M + 400, doorPlaced: false, throwSpots: [] };
}

/** Fill the course up to a screen and a half ahead of the turkey. */
export function extendCourse(state, rng, stageId, difficulty) {
  const course = state.course;
  const goalX = GOAL_M * PX_PER_M;
  while (course.nextX < state.x + 1700) {
    if (course.nextX > goalX - 500) {
      if (!course.doorPlaced) {
        state.hazards.push(makeDoor(goalX));
        course.doorPlaced = true;
      }
      course.nextX = Infinity;
      return;
    }
    const used = PATTERNS[choose(rng, PLAN[stageId])](state, rng, stageId, course.nextX);
    const breathing = reach(state) * (1.25 - difficulty * 0.3);
    course.nextX += used + rng.range(breathing, breathing + 240);
  }
}
