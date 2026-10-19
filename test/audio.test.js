import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_EVENTS, soundSpec, createAudio } from '../src/audio.js';
test('all original cues have bounded envelopes and audible positive frequencies', () => {
  for (const event of AUDIO_EVENTS) {
    const s = soundSpec(event, 1);
    assert.ok(s.duration > 0 && s.duration <= .5);
    assert.ok(s.frequency >= 20 && s.endFrequency >= 20);
    assert.ok(s.gain > 0 && s.gain <= .2);
    assert.equal(soundSpec(event, 0).gain, 0);
    assert.deepEqual(soundSpec(event, 50), s);
    assert.equal(soundSpec(event, NaN).gain, 0);
  }
  assert.equal(soundSpec('unknown'), null);
});
test('Node/no audio context is safe and never starts audio before gesture', async () => {
  const audio = createAudio();
  assert.equal(audio.play('launch'), false);
  assert.equal(await audio.unlock(), false);
  audio.setMuted(true); audio.setVolume(.7); audio.dispose();
});
test('voices, chatter, mute, and gesture resume are bounded with a WebAudio double', async () => {
  let starts = 0, stops = 0, factories = 0;
  const param = () => ({ value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, setTargetAtTime(){} });
  const node = () => ({ gain:param(), frequency:param(), Q:param(), connect(){}, disconnect(){}, start(){ starts++; }, stop(){ stops++; } });
  const context = { state:'suspended', currentTime:0, sampleRate:100, destination:{}, createGain:node, createOscillator:node, createBufferSource:node, createBiquadFilter:node, createBuffer:()=>({getChannelData:()=>new Float32Array(100)}), async resume(){this.state='running';}, async close(){this.state='closed';} };
  const audio = createAudio({ contextFactory:()=>{ factories++; return context; }, maxVoices:2 });
  assert.equal(factories,0); assert.equal(await audio.unlock(),true);
  assert.equal(audio.play('coin'),true); assert.equal(audio.play('coin'),false);
  context.currentTime += .1; audio.play('coin'); context.currentTime += .1; audio.play('coin');
  assert.equal(starts,6); assert.ok(stops>=8); // eviction stops both oscillators as well as scheduled stops
  audio.setMuted(true); assert.equal(audio.play('impact'),false);
  audio.setMuted(false); audio.setVolume(0); assert.equal(audio.play('impact'),false);
  await audio.dispose();
});
