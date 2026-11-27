// Every sound in the game is synthesised with WebAudio at the moment it plays: no sound files.
// A little banjo-like plucked tune loops under the run, and each event has its own voice
// (the turkey's gobble, the knife's whoosh and thunk, the oven's whoomp, the farmer's shout).

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16];
const TUNE = [0, 2, 4, 2, 5, 4, 2, 0, 3, 4, 5, 7, 5, 4, 2, 1];
const BASS = [0, 0, 5, 5, 3, 3, 4, 4];

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let muted = false;
  let noiseBuffer = null;
  let nextBeat = 0;
  let beat = 0;
  let musicOn = false;

  function ensure() {
    if (ctx) return ctx.state === 'suspended' ? (ctx.resume(), ctx) : ctx;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    ctx = new Context();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(master);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function envelope(gain, at, attack, hold, release, peak) {
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + attack);
    gain.gain.setValueAtTime(peak, at + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  }

  function tone({ type = 'sine', from, to = from, length = 0.2, peak = 0.3, at = 0, out = master }) {
    if (!ensure() || muted) return;
    const start = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + length);
    envelope(gain, start, 0.005, length * 0.2, length * 0.8, peak);
    osc.connect(gain).connect(out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  function noise({ length = 0.3, peak = 0.3, filter = 'lowpass', from = 2000, to = from, q = 1, at = 0 }) {
    if (!ensure() || muted) return;
    const start = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const biquad = ctx.createBiquadFilter();
    biquad.type = filter;
    biquad.Q.value = q;
    biquad.frequency.setValueAtTime(from, start);
    biquad.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + length);
    const gain = ctx.createGain();
    envelope(gain, start, 0.01, length * 0.15, length * 0.85, peak);
    src.connect(biquad).connect(gain).connect(master);
    src.start(start);
    src.stop(start + length + 0.05);
  }

  function pluck(freq, at, peak = 0.5, length = 0.32) {
    const start = at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 8, start);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, start + length);
    envelope(gain, start, 0.003, 0.01, length, peak);
    osc.connect(filter).connect(gain).connect(musicGain);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  /** Queue the tune a little ahead of the clock; called every frame while music is on. */
  function tick(intensity) {
    if (!ctx || !musicOn || muted) return;
    const beatLength = 0.2 - Math.min(0.05, intensity * 0.05);
    if (nextBeat < ctx.currentTime) nextBeat = ctx.currentTime + 0.05;
    while (nextBeat < ctx.currentTime + 0.25) {
      const root = 196;
      const note = PENTATONIC[TUNE[beat % TUNE.length] % PENTATONIC.length];
      if (beat % 2 === 0 || beat % 16 > 11) pluck(root * 2 ** (note / 12) * 2, nextBeat, 0.45);
      if (beat % 2 === 0) pluck(root * 2 ** (PENTATONIC[BASS[(beat >> 1) % BASS.length]] / 12) / 2, nextBeat, 0.6, 0.4);
      beat += 1;
      nextBeat += beatLength;
    }
  }

  return {
    unlock: ensure,
    tick,
    setMusic(on) {
      musicOn = on;
      if (on) ensure();
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.55;
      return muted;
    },
    get muted() {
      return muted;
    },
    jump: () => tone({ type: 'square', from: 320, to: 620, length: 0.12, peak: 0.12 }),
    flap: () => {
      noise({ length: 0.12, peak: 0.25, filter: 'bandpass', from: 900, to: 2400, q: 2 });
      tone({ type: 'triangle', from: 520, to: 900, length: 0.1, peak: 0.1 });
    },
    land: () => noise({ length: 0.12, peak: 0.25, from: 500, to: 120 }),
    corn: () => {
      tone({ type: 'triangle', from: 880, length: 0.08, peak: 0.2 });
      tone({ type: 'triangle', from: 1320, length: 0.14, peak: 0.2, at: 0.07 });
    },
    gobble: () => {
      for (let i = 0; i < 5; i += 1) tone({ type: 'sawtooth', from: 420 + (i % 2) * 140, to: 300, length: 0.06, peak: 0.12, at: i * 0.055 });
    },
    hit: () => {
      noise({ length: 0.35, peak: 0.5, from: 1600, to: 200 });
      tone({ type: 'sawtooth', from: 220, to: 70, length: 0.35, peak: 0.25 });
    },
    whoosh: () => noise({ length: 0.4, peak: 0.25, filter: 'bandpass', from: 600, to: 3200, q: 3 }),
    thunk: () => {
      tone({ type: 'square', from: 180, to: 60, length: 0.1, peak: 0.25 });
      tone({ type: 'sine', from: 2400, to: 2200, length: 0.25, peak: 0.06, at: 0.02 });
    },
    oven: () => noise({ length: 0.7, peak: 0.45, from: 300, to: 1400, q: 0.7 }),
    nearMiss: () => noise({ length: 0.45, peak: 0.2, filter: 'bandpass', from: 3000, to: 400, q: 4 }),
    shout: () => {
      tone({ type: 'sawtooth', from: 140, to: 190, length: 0.25, peak: 0.18 });
      tone({ type: 'sawtooth', from: 190, to: 120, length: 0.3, peak: 0.18, at: 0.22 });
    },
    caught: () => {
      tone({ type: 'square', from: 400, to: 100, length: 0.8, peak: 0.18 });
      noise({ length: 0.3, peak: 0.3, from: 800, to: 200, at: 0.1 });
    },
    escaped: () => [0, 4, 7, 12].forEach((n, i) => tone({ type: 'triangle', from: 392 * 2 ** (n / 12), length: 0.25, peak: 0.22, at: i * 0.11 })),
  };
}
