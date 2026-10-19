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
  assert.equal(audio.play('coin'),true);assert.equal(audio.getStatus().lastCue,'coin');assert.equal(audio.getStatus().contextState,'running'); assert.equal(audio.play('coin'),false);
  context.currentTime += .1; audio.play('coin'); context.currentTime += .1; audio.play('coin');
  assert.equal(starts,6); assert.ok(stops>=8); // eviction stops both oscillators as well as scheduled stops
  audio.setMuted(true); assert.equal(audio.play('impact'),false);
  audio.setMuted(false); audio.setVolume(0); assert.equal(audio.play('impact'),false);
  await audio.dispose();
});
test('harmless impact materials and gameplay mass are bounded original timbre variations',()=>{
 const signatures=new Set();
 for(const material of ['wood','ground','leaf','shell','bumper']){
  const cue=soundSpec('impact',.8,{material,mass:1});
  signatures.add(`${cue.frequency}/${cue.harmony}/${cue.noise}`);
  assert.ok(cue.frequency>=20&&cue.frequency<1000);assert.ok(cue.endFrequency>=20);
  assert.ok(cue.duration<=.3);assert.ok(cue.noise>=0&&cue.noise<=1);assert.ok(cue.gain<=.2);
 }
 assert.equal(signatures.size,5);
 assert.ok(soundSpec('impact',1,{mass:8}).frequency<soundSpec('impact',1,{mass:.15}).frequency);
 assert.deepEqual(soundSpec('impact',1,{material:'unknown'}),soundSpec('impact'));
 assert.equal(soundSpec('__proto__'),null);assert.equal(soundSpec('toString'),null);
});
test('impact WebAudio scheduling has bounded nodes, positive ramps and quiet-tail envelope',async()=>{
 const traces=[],gains=[];let factories=0,starts=0,disconnected=0;
 const param=kind=>({value:0,setValueAtTime(v,t){traces.push([kind,'set',v,t]);},linearRampToValueAtTime(v,t){traces.push([kind,'linear',v,t]);},exponentialRampToValueAtTime(v,t){assert.ok(v>0);traces.push([kind,'exp',v,t]);},setTargetAtTime(v,t,c){traces.push([kind,'target',v,t,c]);}});
 const node=()=>({gain:param('gain'),frequency:param('frequency'),Q:param('q'),connect(){},disconnect(){disconnected++;},start(){starts++;},stop(){}});
 const context={state:'suspended',currentTime:4,sampleRate:100,destination:{},createGain(){const n=node();gains.push(n);return n;},createOscillator:node,createBufferSource:node,createBiquadFilter:node,createBuffer:()=>({getChannelData:()=>new Float32Array(100)}),async resume(){this.state='running';},async close(){this.state='closed';}};
 const audio=createAudio({contextFactory:()=>{factories++;return context;},maxVoices:2});
 audio.setVolume(10);assert.equal(factories,0);assert.equal(audio.play('impact'),false);
 assert.equal(await audio.unlock(),true);assert.equal(starts,0);assert.ok(Math.abs(gains[0].gain.value-1/Math.sqrt(2))<1e-12);
 assert.ok(audio.play('impact',{intensity:1e-8,material:'bumper'}));
 const ramps=traces.filter(t=>t[0]==='gain'&&t[1]==='exp');assert.ok(ramps[0][2]<soundSpec('impact',1e-8,{material:'bumper'}).gain);
 for(let i=0;i<100;i++)audio.play('impact');assert.equal(starts,3); // chatter rejected
 for(let i=0;i<8;i++){context.currentTime+=.04;audio.play('impact',{material:'shell'});}
 assert.ok(disconnected>0);assert.ok(starts<=27);
 assert.ok(traces.every(t=>Number.isFinite(t[2])&&Number.isFinite(t[3])&&t[3]>=4));
 audio.setMuted(true);assert.equal(audio.play('impact'),false);
 const last=traces.at(-1);assert.equal(last[0],'gain');assert.equal(last[1],'target');assert.equal(last[2],0);
 audio.setMuted(false);audio.setVolume(-1);assert.equal(audio.play('impact'),false);
 await audio.dispose();
});
test('original biome cues and bounded repeated-impact variation stay finite',()=>{
 const frequencies=new Set();for(const biome of ['grandfatherTree','openSky','jungleCanopy','forestFloor','__proto__']){const cue=soundSpec('zone',1,{biome});assert.ok(Number.isFinite(cue.frequency));assert.ok(cue.gain<=.05);if(biome!=='__proto__')frequencies.add(cue.frequency);}assert.equal(frequencies.size,4);
 const variants=[0,1,2,3].map(variant=>soundSpec('impact',.5,{material:'wood',variant}));assert.equal(new Set(variants.map(v=>v.frequency)).size,4);assert.equal(new Set(variants.map(v=>v.gain)).size,1);
 const audio=createAudio();assert.deepEqual(audio.getStatus(),{muted:false,volume:.55,contextState:'not-started',voices:0,lastCue:null});audio.setMuted(true);audio.setVolume(.15);assert.equal(audio.getStatus().muted,true);assert.equal(audio.getStatus().volume,.15);
});
