// The screenshot scenes behind ?shot=NAME. Each one sets up a real run with the game's own rules
// (warping to a metre mark and placing the hazards that make the moment), plays it forward a few
// fixed steps with scripted input, and returns the screen to paint. Same name, same frame.
import { KNIFE, OVEN, STEP } from './config.js';
import { makeBlock, makeKnife, makeLow, makeOven } from './hazards.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { MODE_CAUGHT, MODE_ESCAPED } from './world.js';

function play(world, seconds, script) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) world.step(STEP, script(i * STEP));
}

const idle = () => ({ jumpPressed: false, jumpHeld: false, duck: false, sprint: false });

/** The kitchen: the oven bursting into flame under Tom's leap, a knife spinning in, the farmer at his tail. */
function kitchenLeap(world) {
  world.warpTo(938);
  const s = world.state;
  Object.assign(s, { lives: 2, corn: 17, nearMisses: 3, stamina: 38 });
  s.farmer.gap = 140;
  s.farmer.throwIn = 99;
  const lift = 0.5;
  const ahead = s.speed * lift + 600 * lift;
  s.hazards.push(makeOven(s.x + 360 + ahead * 0.1, OVEN.cycle - OVEN.open + 0.3 - lift));
  const knife = makeKnife(s.x - s.farmer.gap + 30, 462, s.x + 820);
  knife.t = KNIFE.flight * 0.75 - lift;
  s.hazards.push(knife, makeLow(s.x + 1250, 'kitchen'));
  for (let i = 0; i < 4; i += 1) s.pickups.push({ x: s.x + 760 + i * 58, y: 380 - Math.sin((i / 3) * Math.PI) * 60, taken: false, t: i });
  play(world, lift, (t) => ({ ...idle(), jumpPressed: t === 0, jumpHeld: t < 0.25 }));
  s.farmer.throwAnim = 0.3;
}

/** The barn doorway: the farmyard behind, the barn ahead, a knife quivering in the boards, sacks to duck. */
function barnDoorway(world) {
  world.warpTo(366);
  const s = world.state;
  Object.assign(s, { lives: 3, corn: 8, nearMisses: 1, stamina: 82 });
  s.farmer.gap = 230;
  s.farmer.throwIn = 99;
  const stuck = makeKnife(s.x, 460, s.x + 650);
  stuck.phase = 'stuck';
  stuck.t = KNIFE.flight + 0.1;
  s.hazards.push(makeBlock(s.x + 180, 'yard', 1), stuck, makeLow(s.x + 1040, 'barn'), makeBlock(s.x + 1400, 'barn', 1));
  for (let i = 0; i < 5; i += 1) s.pickups.push({ x: s.x + 560 + i * 56, y: 470 - Math.sin(i / 4 * Math.PI) * 120, taken: false, t: i });
  play(world, 0.3, (t) => ({ ...idle(), jumpPressed: t === 0, jumpHeld: true, sprint: true }));
  play(world, 0.25, (t) => ({ ...idle(), jumpPressed: t === 0, jumpHeld: true, sprint: true }));
}

/** Caught in the kitchen, just short of the door. */
function caughtEnding(world) {
  world.warpTo(1061);
  const s = world.state;
  Object.assign(s, { lives: 0, corn: 23, nearMisses: 5, score: 13240 });
  s.hazards.push(makeOven(s.x - 200, 0.5));
  s.mode = MODE_CAUGHT;
  s.farmer.grab = 1;
  s.farmer.gap = 20;
  s.endTimer = 0;
}

/** Out of the back door and into the moonlit woods. */
function escapedEnding(world) {
  world.warpTo(1200);
  Object.assign(world.state, { lives: 2, corn: 31, nearMisses: 7, score: 16880, mode: MODE_ESCAPED });
}

export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    kitchenLeap(world);
    return { screen: SCREEN_PLAY, best: 0, menuT: 0 };
  }
  if (name === 'barn') {
    barnDoorway(world);
    return { screen: SCREEN_PLAY, best: 0, menuT: 0 };
  }
  if (name === 'end') {
    caughtEnding(world);
    return { screen: SCREEN_OVER, best: 13240, menuT: 1.1 };
  }
  if (name === 'escaped') {
    escapedEnding(world);
    return { screen: SCREEN_OVER, best: 16880, menuT: 0.9 };
  }
  return { screen: SCREEN_TITLE, best: 0, menuT: 0.55 };
}
