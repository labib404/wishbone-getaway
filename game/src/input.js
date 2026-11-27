// Keyboard and mouse, turned into what the game asks each frame: is jump held, is duck held, is
// sprint held, and which one-shot actions (jump press, confirm, pause, mute) happened since last asked.
// Mouse: left button jumps (and confirms on menus), right button ducks, both together sprint.

export const ACTION_JUMP = 1;
export const ACTION_CONFIRM = 2;
export const ACTION_PAUSE = 4;
export const ACTION_MUTE = 8;

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW', 'KeyZ']);
const DUCK_KEYS = new Set(['ArrowDown', 'KeyS', 'KeyX']);
const SPRINT_KEYS = new Set(['ArrowRight', 'KeyD', 'ShiftLeft', 'ShiftRight']);

export function createInput(target) {
  const held = new Set();
  let mouseJump = false;
  let mouseDuck = false;
  let actions = 0;

  window.addEventListener('keydown', (event) => {
    if (JUMP_KEYS.has(event.code) || DUCK_KEYS.has(event.code) || SPRINT_KEYS.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    held.add(event.code);
    if (JUMP_KEYS.has(event.code)) actions |= ACTION_JUMP;
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    if (event.code === 'KeyM') actions |= ACTION_MUTE;
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => {
    held.clear();
    mouseJump = false;
    mouseDuck = false;
  });
  target.addEventListener('contextmenu', (event) => event.preventDefault());
  target.addEventListener('pointerdown', (event) => {
    if (event.button === 2) mouseDuck = true;
    else {
      mouseJump = true;
      actions |= ACTION_JUMP | ACTION_CONFIRM;
    }
  });
  window.addEventListener('pointerup', (event) => {
    if (event.button === 2) mouseDuck = false;
    else mouseJump = false;
  });

  const any = (keys) => [...keys].some((code) => held.has(code));

  return {
    jumpHeld: () => mouseJump || any(JUMP_KEYS),
    duckHeld: () => mouseDuck || any(DUCK_KEYS),
    sprintHeld: () => (mouseJump && mouseDuck) || any(SPRINT_KEYS),
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
