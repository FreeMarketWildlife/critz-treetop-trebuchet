import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,STARTER,scaledPreset} from '../src/build-catalog.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {BEARING_WINDING_SECONDS,windingMinimum} from '../src/winding-comfort.js';
import {preparationSeconds} from '../src/equipment-summary.js';
const bearings=PARTS.filter(p=>p.slot==='bearing');
test('every persisted bearing has a distinct, discernible light-load preparation benefit',()=>{
 assert.deepEqual(Object.keys(BEARING_WINDING_SECONDS),bearings.map(p=>p.id));
 const seconds=[];
 for(const p of bearings){
  const c={...STARTER,bearing:p.id},sim=new BuildSimulation(c);sim.loading=createPayloadLoading(sim);sim.setDraw(0);let t=0;
  while(sim.drawFraction<1&&t<20){sim.wind(1/1000);t+=1/1000;}
  seconds.push(t);assert.ok(Math.abs(t-windingMinimum(c))<.002);
  assert.ok(Math.abs(t-preparationSeconds(c))<.002);
 }
 for(let i=1;i<seconds.length;i++)assert.ok(seconds[i-1]-seconds[i]>.35);
 assert.ok(Math.abs(seconds[1]-3)<.002,'baseline bronze remains three seconds');
 assert.ok(seconds[3]<=seconds[1]*.67+.002,'precision saves a visible third of preparation');
});
test('the old no-loading API and all full-draw physical masses and velocities remain unchanged by comfort',()=>{
 for(const p of bearings){
  const sim=new BuildSimulation({...STARTER,bearing:p.id});sim.setDraw(0);for(let i=0;i<99;i++)sim.wind(1/60);
  assert.ok(Math.abs(sim.drawFraction-1)<1e-12);
  assert.equal(windingMinimum(sim.c,{loaded:false}),1.65);
  const before=sim.snapshot();sim.fire();assert.deepEqual(sim.real(sim.shot),before.payload);assert.equal(sim.arm.getAngularVelocity(),0);
 }
});
test('heavy-load preparation retains the wheel power limit rather than bypassing it',()=>{
 for(const p of bearings){const c={...scaledPreset('whale'),winch:'hand',bearing:p.id};assert.ok(preparationSeconds(c)>10000);const sim=new BuildSimulation(c);sim.loading={};sim.setDraw(0);sim.wind(.1);assert.ok(sim.drawFraction<1e-5);}
});
test('faster bearing preparation preserves a loose supported volunteer through full draw',()=>{
 for(const p of bearings){
  const sim=new BuildSimulation({...STARTER,bearing:p.id});sim.setDraw(0);sim.loading=createPayloadLoading(sim);sim.loading.loadKeyboard();
  for(let i=0;i<720&&!sim.loading.loaded;i++)sim.loading.step(1/120);assert.ok(sim.loading.loaded,p.id+' physical loading');
  while(sim.drawFraction<1){sim.wind(1/120);sim.loading.step(1/120);}
  for(let i=0;i<30;i++)sim.loading.step(1/120);
  assert.ok(sim.loading.loaded,p.id);const before=sim.loading.parts;
  assert.ok(sim.fire(),p.id);assert.deepEqual(sim.loading.parts,before);
 }
});
