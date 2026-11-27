// The run itself: the turkey's running, jumping, flapping and ducking; the farmer closing the gap
// and throwing carving knives; hits, near misses (with slow motion), corn, score, stages, and the
// two endings: caught by the farmer, or out through the kitchen's back door.
import { FARMER, GOAL_M, GROUND_Y, KNIFE, LIVES, NEAR_MISS, PX_PER_M, SCORE, STAGES, STAMINA, TURKEY } from './config.js';
import { hazardBoxes, hazardRight, knifePosition, makeKnife, overlaps, updateHazard, verticalClearance } from './hazards.js';
import { createCourse, extendCourse } from './spawner.js';
import { burstFeathers, createEffects, dropLeaf, popText, puffDust, shake, sprayEmbers, strikeSparks, updateEffects } from './effects.js';

export const EVENT_JUMP = 1;
export const EVENT_FLAP = 2;
export const EVENT_LAND = 4;
export const EVENT_CORN = 8;
export const EVENT_HIT = 16;
export const EVENT_THROW = 32;
export const EVENT_STICK = 64;
export const EVENT_FIRE = 128;
export const EVENT_NEAR = 256;
export const EVENT_CAUGHT = 512;
export const EVENT_ESCAPED = 1024;
export const EVENT_STAGE = 2048;
export const EVENT_OVER = 4096;

export const MODE_RUN = 'run';
export const MODE_CAUGHT = 'caught';
export const MODE_ESCAPED = 'escaped';

/** How long the caught or escaped moment plays before the end screen. */
const ENDING_SECONDS = 1.7;

export function stageAt(metres) {
  let index = 0;
  for (let i = 0; i < STAGES.length; i += 1) if (metres >= STAGES[i].from) index = i;
  return index;
}

function freshState() {
  return {
    t: 0,
    mode: MODE_RUN,
    endTimer: 0,
    x: 0,
    speed: TURKEY.baseSpeed,
    score: 0,
    corn: 0,
    nearMisses: 0,
    lives: LIVES,
    stamina: STAMINA.max,
    sprinting: false,
    stage: 0,
    stageBanner: 2.2,
    slow: 0,
    timeScale: 1,
    player: { y: GROUND_Y, vy: 0, ground: true, duck: false, jumps: 0, invuln: 0, squash: 0, run: 0, hurt: 0, flap: 0, fear: 0 },
    farmer: { gap: FARMER.startGap, run: 0, throwIn: 3.5, throwAnim: 0, lunge: 0, grab: 0 },
    hazards: [],
    pickups: [],
    course: createCourse(),
    fx: createEffects(),
  };
}

export function metres(state) {
  return Math.min(GOAL_M, state.x / PX_PER_M);
}

export function playerBox(state) {
  const p = state.player;
  const h = p.duck ? TURKEY.duckHeight : TURKEY.height;
  return { x: state.x - TURKEY.width / 2, y: p.y - h, w: TURKEY.width, h };
}

export function createWorld(rng) {
  let state = freshState();

  function hurt(events) {
    const p = state.player;
    state.lives -= 1;
    p.invuln = TURKEY.invulnerable;
    p.hurt = 0.6;
    state.farmer.gap -= FARMER.hitLoss;
    burstFeathers(state.fx, rng, state.x, p.y - 50, 22);
    shake(state.fx, 16);
    state.slow = 0.25;
    events.value |= EVENT_HIT;
    if (state.lives <= 0 || state.farmer.gap <= FARMER.catchGap) beginCaught(events);
  }

  function beginCaught(events) {
    if (state.mode !== MODE_RUN) return;
    state.mode = MODE_CAUGHT;
    state.endTimer = ENDING_SECONDS;
    state.lives = Math.max(0, state.lives);
    state.farmer.grab = 0;
    events.value |= EVENT_CAUGHT;
  }

  function movePlayer(dt, input, events) {
    const p = state.player;
    if (input.jumpPressed) {
      if (p.ground) {
        p.vy = -TURKEY.jumpSpeed;
        p.ground = false;
        p.jumps = 1;
        p.squash = -0.35;
        puffDust(state.fx, rng, state.x, GROUND_Y, 6);
        events.value |= EVENT_JUMP;
      } else if (p.jumps < 2) {
        p.vy = -TURKEY.flapSpeed;
        p.jumps = 2;
        p.flap = 0.35;
        burstFeathers(state.fx, rng, state.x - 20, p.y - 40, 3);
        events.value |= EVENT_FLAP;
      }
    }
    p.duck = input.duck && p.ground;
    const rising = p.vy < 0;
    let gravity = rising && input.jumpHeld ? TURKEY.floatGravity : TURKEY.gravity;
    if (!p.ground && input.duck) gravity += TURKEY.fastFall;
    if (!p.ground) {
      p.vy += gravity * dt;
      p.y += p.vy * dt;
      if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        p.squash = Math.min(0.45, p.vy / 2400);
        p.vy = 0;
        p.ground = true;
        p.jumps = 0;
        puffDust(state.fx, rng, state.x, GROUND_Y, 8);
        events.value |= EVENT_LAND;
      }
    }
    p.squash += (0 - p.squash) * Math.min(1, dt * 10);
    p.run += dt * state.speed / 38;
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurt = Math.max(0, p.hurt - dt);
    p.flap = Math.max(0, p.flap - dt);
    if (p.ground && rng.next() < dt * 8) puffDust(state.fx, rng, state.x - 18, GROUND_Y, 1);
  }

  function chase(dt, input, events) {
    const f = state.farmer;
    const wantsSprint = input.sprint && state.stamina > 1;
    state.sprinting = wantsSprint;
    state.stamina = wantsSprint
      ? Math.max(0, state.stamina - STAMINA.drain * dt)
      : Math.min(STAMINA.max, state.stamina + STAMINA.regen * dt);
    f.gap = Math.min(FARMER.maxGap, f.gap + (wantsSprint ? FARMER.sprintGain : FARMER.drift + FARMER.stageDrift * state.stage) * dt);
    f.run += dt * state.speed / 46;
    f.throwAnim = Math.max(0, f.throwAnim - dt);
    f.lunge = f.gap < FARMER.lungeGap ? Math.min(1, f.lunge + dt * 3) : Math.max(0, f.lunge - dt * 3);
    state.player.fear = Math.max(0, Math.min(1, (FARMER.lungeGap + 60 - f.gap) / 120));
    if (f.gap <= FARMER.catchGap) beginCaught(events);

    // Knife throws: the course marks open spots; the farmer hurls a knife to land on each one just
    // before the turkey gets there, the red target ring telegraphing it all the way down.
    const spots = state.course.throwSpots;
    f.throwIn -= dt;
    while (spots.length && spots[0] < state.x + state.speed * KNIFE.flight + 120) spots.shift();
    if (spots.length && state.mode === MODE_RUN && f.throwIn <= 0 && spots[0] < state.x + state.speed * KNIFE.flight + 520) {
      state.hazards.push(makeKnife(state.x - f.gap + 30, GROUND_Y - 150, spots.shift()));
      f.throwAnim = 0.45;
      f.throwIn = 0.5;
      events.value |= EVENT_THROW;
    }
  }

  function touchHazards(dt, events) {
    const box = playerBox(state);
    for (let i = state.hazards.length - 1; i >= 0; i -= 1) {
      const h = state.hazards[i];
      const did = updateHazard(h, dt);
      if (did === 'fire') {
        events.value |= EVENT_FIRE;
        if (Math.abs(h.x - state.x) < 900) shake(state.fx, 5);
      }
      if (did === 'stick') {
        events.value |= EVENT_STICK;
        strikeSparks(state.fx, rng, h.x + KNIFE.width / 2, GROUND_Y - 2, 10);
        puffDust(state.fx, rng, h.x + KNIFE.width / 2, GROUND_Y, 5, 0.5);
        shake(state.fx, 6);
      }
      if (h.kind === 'oven' && h.flame > 0.4 && rng.next() < dt * 30) sprayEmbers(state.fx, rng, h.x - 40, GROUND_Y - 50, 1);
      if (h.kind === 'door') {
        if (state.mode === MODE_RUN && state.x > h.x + 50) {
          state.mode = MODE_ESCAPED;
          state.endTimer = ENDING_SECONDS;
          events.value |= EVENT_ESCAPED;
        }
        continue;
      }
      if (hazardRight(h) < state.x - 1400) {
        state.hazards.splice(i, 1);
        continue;
      }
      if (h.hit || state.mode !== MODE_RUN) continue;
      for (const hb of hazardBoxes(h)) {
        if (overlaps(box, hb)) {
          if (state.player.invuln <= 0) {
            h.hit = true;
            hurt(events);
          }
          break;
        }
        h.minClear = Math.min(h.minClear, verticalClearance(box, hb));
      }
      if (!h.hit && !h.missed && h.x + h.w < box.x && (h.kind !== 'knife' || h.phase === 'stuck')) {
        h.missed = true;
        if (h.minClear < NEAR_MISS.margin && state.player.invuln <= 0) {
          state.nearMisses += 1;
          state.score += SCORE.nearMiss;
          state.slow = NEAR_MISS.slow;
          popText(state.fx, state.x, box.y - 20, 'CLOSE SHAVE! +100', '#ffd36b');
          events.value |= EVENT_NEAR;
        }
      }
    }
    for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
      const c = state.pickups[i];
      c.t += dt;
      if (c.x < state.x - 1400) {
        state.pickups.splice(i, 1);
        continue;
      }
      if (!c.taken && Math.abs(c.x - state.x) < 40 && c.y > box.y - 26 && c.y < box.y + box.h + 20) {
        c.taken = true;
        state.corn += 1;
        state.score += SCORE.corn;
        state.stamina = Math.min(STAMINA.max, state.stamina + STAMINA.corn);
        popText(state.fx, c.x, c.y - 20, '+50', '#ffe27a');
        events.value |= EVENT_CORN;
      }
    }
  }

  function ending(dt, events) {
    const f = state.farmer;
    state.endTimer -= dt;
    if (state.mode === MODE_CAUGHT) {
      f.grab = Math.min(1, f.grab + dt * 2.4);
      f.gap += (10 - f.gap) * Math.min(1, dt * 6);
      state.speed *= 1 - Math.min(1, dt * 3);
      if (state.player.ground === false) movePlayer(dt, { duck: false, jumpHeld: false, jumpPressed: false }, events);
    } else {
      f.gap = Math.min(900, f.gap + dt * 420);
      movePlayer(dt, { duck: false, jumpHeld: false, jumpPressed: false }, events);
    }
    state.x += state.speed * dt;
    if (state.endTimer <= 0) events.value |= EVENT_OVER;
  }

  return {
    get state() {
      return state;
    },
    reset() {
      state = freshState();
    },
    /** Advance by dt seconds of real time with this frame's input; returns the events as bit flags. */
    step(realDt, input) {
      const events = { value: 0 };
      state.slow = Math.max(0, state.slow - realDt);
      const targetScale = state.slow > 0 ? NEAR_MISS.scale : 1;
      state.timeScale += (targetScale - state.timeScale) * Math.min(1, realDt * 12);
      const dt = realDt * state.timeScale;
      state.t += dt;
      state.stageBanner = Math.max(0, state.stageBanner - dt);
      updateEffects(state.fx, dt, GROUND_Y);
      if (state.stage === 0 && rng.next() < dt * 2.5) dropLeaf(state.fx, rng, state.x + rng.range(-300, 1100), rng.range(-20, 200));

      if (state.mode !== MODE_RUN) {
        ending(dt, events);
        return events.value;
      }
      const progress = Math.min(1, metres(state) / GOAL_M);
      state.speed = (TURKEY.baseSpeed + (TURKEY.topSpeed - TURKEY.baseSpeed) * progress) * (state.sprinting ? TURKEY.sprintBoost : 1);
      movePlayer(dt, input, events);
      chase(dt, input, events);
      state.x += state.speed * dt;
      state.score += (state.speed * dt / PX_PER_M) * SCORE.perMetre;
      const stage = stageAt(metres(state));
      if (stage !== state.stage) {
        state.stage = stage;
        state.stageBanner = 2.2;
        events.value |= EVENT_STAGE;
      }
      extendCourse(state, rng, STAGES[state.stage].id, progress);
      touchHazards(dt, events);
      return events.value;
    },
    /** For the screenshot scenes: jump the run forward to a metre mark with a clean course ahead. */
    warpTo(metresMark) {
      state.x = metresMark * PX_PER_M;
      state.stage = stageAt(metresMark);
      state.course.nextX = state.x + 900;
      state.hazards.length = 0;
      state.pickups.length = 0;
      state.stageBanner = 0;
      state.score = Math.round(metresMark * SCORE.perMetre);
    },
    knifePosition,
  };
}
