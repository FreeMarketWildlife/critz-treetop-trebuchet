import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';
import {scaledPreset} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';

function restingScene(animal='mouse',{height,up=0,spin=0}={}){
 const s=new BuildSimulation({...scaledPreset(animal),drag:0},{map:{...createGroveMap(),objects:[]}});s.fire();
 let bottom=Infinity;for(let f=s.shot.getFixtureList();f;f=f.getNext())for(const p of f.getShape().m_vertices)bottom=Math.min(bottom,p.y*s.L);
 s.shot.setPosition({x:100/s.L,y:(s.groundY+(height??-bottom+.01))/s.L});
 s.shot.setLinearVelocity({x:0,y:up*s.T/s.L});s.shot.setAngularVelocity(spin*s.T);s.detach('Settling regression');return s;
}
const speed=s=>{const v=s.shot.getLinearVelocity();return Math.hypot(v.x,v.y)*s.L/s.T;};

test('tiny ground contact chatter naturally settles without a prolonged inactive tail',()=>{
 const s=restingScene('mouse',{up:-.3,spin:3});let lastMoving=0;
 for(let i=0;i<3*240&&s.phase==='flight';i++){s.step(1/240);if(speed(s)>.16)lastMoving=s.time;}
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time<2);assert.ok(s.time-lastMoving<1.1);
 assert.ok(Math.abs(s.shot.getAngularVelocity()/s.T)<.01);assert.ok(s.contactEvents.length<3,'quiet support is not a bounce chain');
});
test('a recoverable low-altitude hop stays live through its apex and return to ground',()=>{
 const s=restingScene('mouse',{height:.05,up:3});let peak=0,firstLanding=null;
 for(let i=0;i<.7*240;i++){
  s.step(1/240);peak=Math.max(peak,s.real(s.shot).y-s.groundY);
  if(s.contactEvents.length)firstLanding??=s.time;
  assert.equal(s.phase,'flight','the recoverable hop must not end because its apex briefly has low speed');
 }
 assert.ok(peak>.5);assert.ok(firstLanding>.6,'the first recovery is a real airborne arc');
});
test('a large spinning body can recover from low translation before settling',()=>{
 const s=restingScene('whale',{spin:.5});let slowSpinning=false;
 for(let i=0;i<5*240&&s.phase==='flight';i++){
  s.step(1/240);const rim=Math.abs(s.shot.getAngularVelocity()/s.T)*s.animal.length*.5;
  if(speed(s)<.16&&rim>.5){slowSpinning=true;assert.equal(s.phase,'flight','angular motion still has a meaningful contact path');}
 }
 assert.ok(slowSpinning,'fixture actually exercises slow translation with recoverable rotation');
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time<4);assert.ok(Math.abs(s.shot.getAngularVelocity()/s.T)<.01);
});
test('the long 600 m fall preserves substantial decaying rebounds and ends shortly after rest',()=>{
 const s=restingScene('mouse',{height:599,up:-5});let firstContact=null,firstReboundPeak=0,lastAboveOne=0;
 for(let i=0;i<50*240&&s.phase==='flight';i++){
  s.step(1/240);if(s.contactEvents.length)firstContact??=s.contactEvents[0].time;
  if(s.contactEvents.length===1)firstReboundPeak=Math.max(firstReboundPeak,s.real(s.shot).y-s.groundY);
  if(speed(s)>1)lastAboveOne=s.time;
 }
 assert.ok(firstContact>10&&firstContact<12);assert.ok(firstReboundPeak>180,'the first genuine rebound must not be culled');
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time>40&&s.time<46);
 assert.ok(s.time-lastAboveOne<1.5,'the long duration comes from real rebounds, not idle chatter');
});
