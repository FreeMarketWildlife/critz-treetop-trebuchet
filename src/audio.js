/** Original synthesized cues. No assets, autoplay, persistent loops, or physics side effects. */
export const AUDIO_EVENTS = Object.freeze(['launch', 'impact', 'coin', 'shop', 'enemy', 'wind']);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
export function soundSpec(event, intensity = 1) {
  const strength = clamp(intensity, 0, 1);
  const cues = {
    launch: { frequency: 150, endFrequency: 420, duration: .28, gain: .15, type: 'triangle', noise: .35 },
    impact: { frequency: 95 + strength * 120, endFrequency: 48, duration: .09 + strength * .12, gain: .18, type: 'sine', noise: .25 },
    coin: { frequency: 880, endFrequency: 1320, duration: .19, gain: .09, type: 'sine', harmony: 1.5 },
    shop: { frequency: 440, endFrequency: 660, duration: .3, gain: .08, type: 'triangle', harmony: 1.25 },
    enemy: { frequency: 280, endFrequency: 110, duration: .23, gain: .11, type: 'triangle', harmony: 1.03 },
    wind: { frequency: 350, endFrequency: 800, duration: .45, gain: .035, type: 'sine', noise: 1 },
  };
  const cue = cues[event];
  return cue ? { ...cue, gain: cue.gain * Math.sqrt(strength) } : null;
}

/** Call unlock directly from a click/touch/key gesture. Unsupported/blocked audio fails silently. */
export function createAudio({ contextFactory, maxVoices = 10 } = {}) {
  let context, master, noiseBuffer, muted = false, volume = .55, pendingUnlock;
  const voices = new Set(), lastPlayed = new Map();
  const limit = Math.round(clamp(maxVoices, 1, 16));
  function stopVoice(voice) {
    if (!voices.delete(voice)) return;
    for (const source of voice.sources) { try { source.stop(); } catch {} }
    for (const node of voice.nodes) { try { node.disconnect(); } catch {} }
  }
  function hush() { for (const voice of [...voices]) stopVoice(voice); }
  async function unlock() {
    if (pendingUnlock) return pendingUnlock;
    pendingUnlock = (async () => {
      try {
        if (!context) {
          const Factory = globalThis.AudioContext || globalThis.webkitAudioContext;
          if (!contextFactory && !Factory) return false;
          context = contextFactory ? contextFactory() : new Factory({ latencyHint: 'interactive' });
          master = context.createGain(); master.gain.value = muted ? 0 : volume;
          // Headroom limits summed cue amplitude even at maximum voice count.
          master.gain.value /= Math.sqrt(limit);
          master.connect(context.destination);
          noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
          const data = noiseBuffer.getChannelData(0); let seed = 271828;
          for (let i = 0; i < data.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; data[i] = seed / 2147483648 - 1; }
        }
        if (context.state === 'suspended') await context.resume();
        return context.state === 'running';
      } catch { return false; }
    })();
    try { return await pendingUnlock; } finally { pendingUnlock = null; }
  }
  function updateGain() {
    if (master) master.gain.setTargetAtTime((muted ? 0 : volume) / Math.sqrt(limit), context.currentTime, .015);
  }
  function play(event, { intensity = 1 } = {}) {
    const cue = soundSpec(event, intensity);
    if (!cue || cue.gain === 0 || muted || volume === 0 || !context || context.state !== 'running') return false;
    const now = context.currentTime;
    // Contact chatter cannot fill the voice pool or create hundreds of nodes per frame.
    if (now - (lastPlayed.get(event) ?? -Infinity) < (event === 'wind' ? .35 : .035)) return false;
    lastPlayed.set(event, now);
    while (voices.size >= limit) stopVoice(voices.values().next().value);
    const voice = { sources: [], nodes: [] }; voices.add(voice);
    const envelope = context.createGain(); voice.nodes.push(envelope);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(cue.gain, now + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + cue.duration);
    envelope.gain.linearRampToValueAtTime(0, now + cue.duration + .012);
    envelope.connect(master);
    function tone(ratio, level) {
      const osc = context.createOscillator(), gain = context.createGain();
      voice.sources.push(osc); voice.nodes.push(osc, gain);
      osc.type = cue.type; osc.frequency.setValueAtTime(cue.frequency * ratio, now);
      osc.frequency.exponentialRampToValueAtTime(cue.endFrequency * ratio, now + cue.duration);
      gain.gain.value = level; osc.connect(gain); gain.connect(envelope);
      osc.start(now); osc.stop(now + cue.duration + .02);
      return osc;
    }
    const primary = tone(1, event === 'wind' ? .04 : .7);
    if (cue.harmony) tone(cue.harmony, .25);
    if (cue.noise) {
      const noise = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
      voice.sources.push(noise); voice.nodes.push(noise, filter, gain);
      noise.buffer = noiseBuffer; filter.type = 'bandpass'; filter.Q.value = .6;
      filter.frequency.setValueAtTime(event === 'wind' ? 500 : 1100, now);
      gain.gain.value = cue.noise; noise.connect(filter); filter.connect(gain); gain.connect(envelope);
      noise.start(now); noise.stop(now + cue.duration + .02);
    }
    primary.onended = () => stopVoice(voice);
    return true;
  }
  return {
    unlock, play,
    setMuted(value) { muted = Boolean(value); updateGain(); if (muted) hush(); },
    setVolume(value) { volume = clamp(value, 0, 1); updateGain(); if (!volume) hush(); },
    // Optional lifecycle hook for a disposed game; re-unlock can recreate its context.
    dispose() { hush(); const old = context; context = master = noiseBuffer = undefined; lastPlayed.clear(); if (old) return old.close().catch(() => {}); },
  };
}
