import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createGroveMap} from '../src/grove-map.js';

// Bounded reproduction of the observed immediate partial-draw refusal. This
// covers explicit keyboard drops on the canonical starter, not arbitrary drag
// poses or a guarantee that an unsupported critter can launch.
test('first-support and settled starter drops preserve pose, refuse unarmed weak draws and accept supported ordinary draws',()=>{
 for(const dt of [1/120,1/60,1/30])for(const wait of [0,.1,.5,1])for(const wind of [.6,1.5,2.25,3]){
  const label=`dt=${dt}, settle wait=${wait}, wind=${wind}`;
  const sim=new BuildSimulation(STARTER,{map:createGroveMap()});sim.setDraw(0);
  const loading=sim.loading=createPayloadLoading(sim);assert.equal(loading.loadKeyboard(),true,label);
  let age=0;while(!loading.loaded&&age<3){loading.step(dt);age+=dt;}
  for(let i=0;i<Math.round(wait/dt);i++)loading.step(dt);
  assert.equal(loading.loaded,true,label);
  // Match the app's order: wind the mechanism, then step the loose ragdoll.
  for(let i=0;i<Math.round(wind/dt);i++){sim.wind(dt);loading.step(dt);}
  const parts=loading.parts,position=loading.position,angle=loading.angle,motion=loading.motion;
  assert.equal(sim.phase,'ready',label);assert.equal(loading.loaded,true,label);
  assert.ok(Math.abs(sim.drawFraction-Math.min(1,Math.round(wind/dt)*dt/3))<1e-10,label);
  if(sim.drawFraction<.4){assert.equal(sim.fire(),false,label);assert.equal(sim.preparationStatus().code,'draw');assert.equal(sim.phase,'ready');assert.equal(sim.release,null);assert.deepEqual(loading.parts,parts);continue;}
  assert.equal(sim.fire(),true,label);assert.equal(sim.phase,'swing',label);
  assert.deepEqual(loading.parts,parts,`${label}: retain loose joint poses`);
  const shot=sim.real(sim.shot);
  for(const [value,expected]of [[shot.x,position.x],[shot.y,position.y],[Math.atan2(Math.sin(shot.angle-angle),Math.cos(shot.angle-angle)),0],[shot.vx,motion.vx],[shot.vy,motion.vy],[sim.shot.getAngularVelocity()/sim.T,motion.omega]])assert.ok(Math.abs(value-expected)<1e-10,`${label}: transfer current pose and motion`);
 }
});

test('repeated assisted drops and interrupted point drags stay in preparation until a fresh supported release',()=>{
 const sim=new BuildSimulation(STARTER,{map:createGroveMap()});sim.setDraw(0);
 const loading=sim.loading=createPayloadLoading(sim),dt=1/60;
 for(let attempt=0;attempt<6;attempt++){
  assert.equal(loading.loadKeyboard(),true);
  // Repeating the explicit assist before its previous drop lands is allowed,
  // but must not leave a launchable or already released body behind.
  for(let i=0;i<3;i++)loading.step(dt);
  assert.equal(loading.loaded,false);assert.equal(sim.phase,'ready');assert.equal(sim.release,null);
 }
 for(let i=0;i<360;i++)loading.step(dt);
 assert.equal(loading.loaded,true);
 for(let attempt=0;attempt<3;attempt++){
  const head=loading.parts.find(p=>p.id==='head');assert.equal(loading.begin(head),true);
  loading.move({x:head.x+.1,y:head.y+.2});loading.step(dt);
  assert.equal(loading.loadKeyboard(),false,'an active drag owns the loading gesture');
  loading.cancel();assert.equal(loading.dragging,false);assert.equal(loading.grip,null);
  assert.equal(sim.phase,'ready');assert.equal(sim.release,null);
  assert.equal(loading.loadKeyboard(),true);for(let i=0;i<360;i++)loading.step(dt);
  assert.equal(loading.loaded,true);
 }
 for(let i=0;i<90;i++){sim.wind(dt);loading.step(dt);}
 assert.equal(sim.fire(),true);assert.equal(sim.phase,'swing');
});
