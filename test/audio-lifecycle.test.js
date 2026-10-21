import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudio,soundSpec} from '../src/audio.js';
function controlledContext(){
 const calls={resume:0,suspend:0,close:0},pending={resume:[],suspend:[]},delayed={resume:false,suspend:false};
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){},start(){},stop(){}});
 const ctx={state:'suspended',currentTime:0,sampleRate:10,destination:{},calls,delayed,
  createGain:node,createOscillator:node,createBufferSource:node,createBiquadFilter:node,createBuffer:()=>({getChannelData:()=>new Float32Array(10)}),
  resume(){return transition('resume','running');},suspend(){return transition('suspend','suspended');},async close(){calls.close++;ctx.state='closed';}};
 function transition(method,state){calls[method]++;if(!delayed[method]){ctx.state=state;return Promise.resolve();}
  return new Promise((resolve,reject)=>pending[method].push({resolve:()=>{if(ctx.state!=='closed')ctx.state=state;resolve();},reject}));}
 ctx.finish=async(method,error)=>{assert.ok(pending[method].length,`${method} must be pending`);const task=pending[method].shift();error?task.reject(error):task.resolve();for(let i=0;i<6;i++)await Promise.resolve();};
 return ctx;
}
test('unlock during a pending suspend ultimately runs the existing context',async()=>{
 const ctx=controlledContext(),a=createAudio({contextFactory:()=>ctx});await a.unlock();assert.ok(a.play('impact'));
 ctx.delayed.suspend=true;const pause=a.pause();assert.equal(a.getStatus().voices,0);const unlock=a.unlock();
 await ctx.finish('suspend');await pause;assert.equal(await unlock,true);assert.equal(a.getStatus().contextState,'running');assert.ok(a.play('coin'));assert.equal(ctx.calls.resume,2);await a.dispose();
});
test('the final pause wins over a pending gesture resume',async()=>{
 const ctx=controlledContext();ctx.delayed.resume=true;const a=createAudio({contextFactory:()=>ctx}),unlock=a.unlock(),pause=a.pause();
 await ctx.finish('resume');await Promise.all([unlock,pause]);assert.equal(a.getStatus().contextState,'suspended');assert.equal(a.getStatus().voices,0);assert.equal(a.play('coin'),false);assert.equal(ctx.calls.suspend,1);await a.dispose();
});
test('dispose isolates old pending work while a later explicit unlock creates a fresh context',async()=>{
 const old=controlledContext(),fresh=controlledContext();old.delayed.resume=true;let factories=0;const a=createAudio({contextFactory:()=>++factories===1?old:fresh});
 const oldUnlock=a.unlock();await a.dispose();assert.equal(a.getStatus().contextState,'not-started');assert.equal(a.play('coin'),false);
 const newUnlock=a.unlock();await old.finish('resume');assert.equal(await oldUnlock,false);assert.equal(await newUnlock,true);assert.equal(factories,2);assert.equal(old.calls.close,1);
 assert.equal(a.getStatus().contextState,'running');assert.ok(a.play('coin'));assert.equal(old.state,'closed');assert.equal(old.calls.resume,1);await a.dispose();assert.equal(fresh.calls.close,1);
});
test('a rejected resume can be retried and a rejected suspend cannot poison the later unlock',async()=>{
 const ctx=controlledContext();ctx.delayed.resume=true;let factories=0;const a=createAudio({contextFactory:()=>{factories++;return ctx;}}),first=a.unlock();
 await ctx.finish('resume',Error('resume denied'));assert.equal(await first,false);const retry=a.unlock();await ctx.finish('resume');assert.equal(await retry,true);assert.equal(factories,1);
 ctx.delayed.resume=false;ctx.delayed.suspend=true;const pause=a.pause(),unlock=a.unlock();await ctx.finish('suspend',Error('suspend unavailable'));await pause;assert.equal(await unlock,true);assert.equal(a.getStatus().contextState,'running');await a.dispose();
});
test('repeated gesture unlocks share one pending resume and preserve the latest intent',async()=>{
 const ctx=controlledContext();ctx.delayed.resume=true;let factories=0;const a=createAudio({contextFactory:()=>{factories++;return ctx;}});
 const first=a.unlock(),second=a.unlock(),pause=a.pause(),last=a.unlock();assert.equal(factories,1);assert.equal(ctx.calls.resume,1);
 await ctx.finish('resume');assert.deepEqual(await Promise.all([first,second,last]),[true,true,true]);await pause;assert.equal(a.getStatus().contextState,'running');assert.equal(ctx.calls.suspend,0);await a.dispose();
});
test('the emitted stone material uses the existing ground timbre and unchanged envelope',()=>{
 for(const intensity of[0,.4,1])for(const mass of[.15,1,8]){
  const stone=soundSpec('impact',intensity,{material:'stone',mass}),ground=soundSpec('impact',intensity,{material:'ground',mass});
  assert.deepEqual(stone,ground);assert.equal(stone.duration,soundSpec('impact',intensity,{material:'wood',mass}).duration);assert.equal(stone.gain,soundSpec('impact',intensity,{material:'wood',mass}).gain);
 }
 assert.notEqual(soundSpec('impact',1,{material:'stone'}).frequency,soundSpec('impact',1,{material:'wood'}).frequency);
});
test('failed initialization closes its partial context and a later gesture can try a fresh one',async()=>{
 const broken=controlledContext(),fresh=controlledContext();broken.createBuffer=()=>{throw Error('buffer unavailable');};let factories=0;
 const a=createAudio({contextFactory:()=>++factories===1?broken:fresh});assert.equal(await a.unlock(),false);assert.equal(a.getStatus().contextState,'not-started');assert.equal(broken.calls.close,1);
 assert.equal(await a.unlock(),true);assert.equal(factories,2);assert.ok(a.play('coin'));
 fresh.close=async()=>{fresh.calls.close++;fresh.state='closed';throw Error('close unavailable');};await a.dispose();assert.equal(a.getStatus().contextState,'not-started');assert.equal(a.getStatus().voices,0);
});
