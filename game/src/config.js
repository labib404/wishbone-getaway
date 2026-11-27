// Every tuning number of Wishbone Getaway in one place: the stage plan, the physics of the turkey,
// how the farmer chases, the hazards' timings and the late-autumn palette the art paints with.

/** The fixed logical canvas; the page scales it to fit the window. */
export const VIEW = { width: 1280, height: 720 };
/** One simulation step, in seconds. */
export const STEP = 1 / 60;
/** The floor line every runner and obstacle stands on. */
export const GROUND_Y = 612;
/** Where the turkey stays on screen while the world scrolls past. */
export const PLAYER_X = 470;
/** World pixels per metre shown on the HUD. */
export const PX_PER_M = 40;
/** Metres to the kitchen's back door: reach it and the turkey has escaped. */
export const GOAL_M = 1200;
export const LIVES = 3;
export const BEST_KEY = 'wishbone-getaway.best';

/** The three stages, by the metre each one starts at. */
export const STAGES = [
  { id: 'yard', name: 'The Farmyard', from: 0 },
  { id: 'barn', name: 'The Old Barn', from: 380 },
  { id: 'kitchen', name: 'The Kitchen', from: 800 },
];

export const TURKEY = {
  width: 58,
  height: 82,
  duckHeight: 44,
  gravity: 2700,
  floatGravity: 1700,
  jumpSpeed: 1000,
  flapSpeed: 780,
  fastFall: 1900,
  baseSpeed: 430,
  topSpeed: 690,
  sprintBoost: 1.22,
  invulnerable: 1.4,
};

export const STAMINA = { max: 100, drain: 34, regen: 9, corn: 18 };

export const FARMER = {
  startGap: 250,
  maxGap: 360,
  catchGap: 34,
  drift: -6,
  sprintGain: 46,
  hitLoss: 115,
  lungeGap: 120,
  /** Extra closing speed per stage: the farmer gets angrier the closer Tom gets to the kitchen. */
  stageDrift: -4,
};

export const OVEN = { width: 150, height: 138, cycle: 2.6, open: 0.85, warn: 0.6, flame: 190 };
export const KNIFE = { flight: 0.95, width: 24, height: 58 };

export const NEAR_MISS = { margin: 22, slow: 0.38, scale: 0.35 };

export const SCORE = { perMetre: 10, corn: 50, nearMiss: 100 };

/** Warm late-autumn colours shared by all the art. */
export const PALETTE = {
  ink: '#2a1a14',
  cream: '#fff3dc',
  paper: '#f7e6c4',
  rust: '#b4482a',
  pumpkin: '#e47a2e',
  amber: '#f2a93b',
  gold: '#f6cf6a',
  plum: '#5b3550',
  dusk: '#2e2a52',
  barn: '#a3332c',
  wood: '#7a4a2a',
  woodDark: '#4e2d1a',
  leaf: '#c95c2a',
  moss: '#6f7a31',
  danger: '#e8392b',
  steel: '#d9dee6',
};
