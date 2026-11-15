// MISSIONVERSE Web Audio API Sound Synthesizer
// Completely self-contained procedural sound effects & space synthesizer
// No external MP3 files or network requests required!

let audioCtx = null;
let masterGain = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientFilter = null;
let ambientGain = null;
let isAudioMuted = false;
let isAmbientPlaying = false;

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isAudioMuted ? 0 : 0.8, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const toggleMute = () => {
  isAudioMuted = !isAudioMuted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isAudioMuted ? 0 : 0.8, audioCtx.currentTime);
  }
  return isAudioMuted;
};

export const getMuteState = () => isAudioMuted;

/**
 * Play procedural UI Click / Telemetry Pulse
 */
export const playClick = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.04);
};

/**
 * Play Countdown Beep
 */
export const playCountdownBeep = (isZero = false) => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = isZero ? 'sawtooth' : 'sine';
  osc.frequency.setValueAtTime(isZero ? 880 : 440, now);

  if (isZero) {
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
  }

  gain.gain.setValueAtTime(isZero ? 0.35 : 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isZero ? 0.45 : 0.15));

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + (isZero ? 0.45 : 0.15));
};

/**
 * Procedural Rocket Engine Rumble with White Noise & Low-Pass Filter
 */
export const playLaunchRumble = (duration = 3.5) => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. White Noise Buffer
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // 2. Lowpass Filter for low-frequency rocket combustion roar
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(180, now);
  filter.frequency.exponentialRampToValueAtTime(650, now + 1.2);
  filter.frequency.exponentialRampToValueAtTime(120, now + duration);

  // 3. Low Sub-bass oscillator
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sawtooth';
  subOsc.frequency.setValueAtTime(45, now);
  subOsc.frequency.linearRampToValueAtTime(75, now + 1.5);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.25, now);
  subGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.01, now);
  noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.5);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterGain);

  subOsc.connect(subGain);
  subGain.connect(masterGain);

  noise.start(now);
  subOsc.start(now);
  noise.stop(now + duration);
  subOsc.stop(now + duration);
};

/**
 * Thruster Burst Sound (RCS pulse)
 */
export const playThrusterBurst = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(450, now);
  filter.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noise.start(now);
  noise.stop(now + 0.25);
};

/**
 * Emergency Anomaly Alarm Klaxon
 */
export const playEmergencyAlarm = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + i * 0.35;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, startTime);
    osc.frequency.exponentialRampToValueAtTime(420, startTime + 0.28);

    gain.gain.setValueAtTime(0.28, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.28);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }
};

/**
 * Telemetry chirp (downlink packet)
 */
export const playTelemetryChirp = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [1046, 1318, 1567];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + i * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.06);
  });
};

/**
 * Success Fanfare
 */
export const playSuccess = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
    { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
    { freq: 783.99, time: 0.3, dur: 0.15 }, // G5
    { freq: 1046.5, time: 0.45, dur: 0.6 } // C6
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + n.time;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + n.dur);
  });
};

/**
 * Achievement / Level-up Fanfare
 */
export const playAchievement = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 440, time: 0.0, dur: 0.12 }, // A4
    { freq: 554.37, time: 0.1, dur: 0.12 }, // C#5
    { freq: 659.25, time: 0.2, dur: 0.12 }, // E5
    { freq: 880, time: 0.3, dur: 0.45 } // A5
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + n.time;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + n.dur);
  });
};

/**
 * Failure / Abort Tone
 */
export const playFailure = () => {
  if (isAudioMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.8);
};

/**
 * Ambient Space Synthesizer Drone (continuous generative cosmic soundscape)
 */
export const startAmbientMusic = () => {
  if (isAmbientPlaying) return;
  const ctx = initAudio();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    ambientFilter = ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(320, now);

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.08, now);

    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = 'sine';
    ambientOsc1.frequency.setValueAtTime(65.41, now); // C2

    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = 'triangle';
    ambientOsc2.frequency.setValueAtTime(98.0, now); // G2

    ambientOsc1.connect(ambientFilter);
    ambientOsc2.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientGain.connect(masterGain);

    ambientOsc1.start(now);
    ambientOsc2.start(now);
    isAmbientPlaying = true;
  } catch (e) {
    console.warn('Could not start ambient music:', e);
  }
};

export const stopAmbientMusic = () => {
  if (!isAmbientPlaying) return;
  try {
    if (ambientOsc1) ambientOsc1.stop();
    if (ambientOsc2) ambientOsc2.stop();
    isAmbientPlaying = false;
  } catch (e) {
    console.warn('Could not stop ambient music:', e);
  }
};
