import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER,part,REST_ARM_ANGLE} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createGroveMap} from '../src/grove-map.js';
import {SCALE_BUILDS,createScaleBuild,recipeDrawMinimum} from '../src/scale-builds.js';
import {windingMotion,windingMinimum,LOADED_DESCENT_SPEED,LOADING_LINEAR_DAMPING} from '../src/winding-comfort.js';
import {preparationSeconds} from '../src/equipment-summary.js';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}`);
function make(id){const s=new BuildSimulation(createScaleBuild(id),{map:createGroveMap()});s.setDraw(0);s.loading=createPayloadLoading(s);return s;}
function settle(s,dt,max=6){let stable=0,time=0;for(;time<max&&stable<.25;time+=dt){s.loading.step(dt);stable=s.loading.loaded?stable+dt:0;assert.equal(s.phase,'ready','support changes never fire');}assert.ok(stable>=.25,`${s.c.name} settles without another Enter in${max}s`);return time;}
function prepare(s,dt){assert.equal(s.loading.loadKeyboard(),true);settle(s,dt);}
function windTo(s,target,dt){s.beginWinding();let time=0,last=s.drawFraction;while(s.drawFraction+1e-9<target&&time<30){s.wind(dt);s.loading.step(dt);assert.ok(s.drawFraction>=last);last=s.drawFraction;time+=dt;assert.equal(s.phase,'ready');}assert.ok(s.drawFraction+1e-9>=target);return time;}
const state=s=>({parts:s.loading.parts,position:s.loading.position,angle:s.loading.angle,motion:s.loading.motion,draw:s.drawFraction});
for(const{id,minimumDraw}of SCALE_BUILDS)for(const dt of[1/120,1/60,1/30,.05])test(`${id} at${Math.round(1/dt)}Hz: one drop, partial stops and full release stay physical and forward`,()=>{
 for(const draw of id==='elephant'?[.6,.75,.9,1]:id==='small'?[minimumDraw,.8,.9,1]:[.4,.6,.8,1]){
  const s=make(id);assert.equal(s.fire(),false);assert.equal(s.preparationStatus().code,'loading');prepare(s,dt);windTo(s,draw,dt);settle(s,dt);
  const held=s.snapshot();for(let i=0;i<Math.ceil(.2/dt);i++){s.loading.step(dt);assert.equal(s.phase,'ready');}assert.equal(s.loading.loaded,true,'a supported hold survives after the stop');
  const before=state(s),pivot=s.pivot(),counter=s.counterPoint(),arm=s.arm.getAngle();assert.equal(s.preparationStatus().ready,true);assert.equal(s.preparationStatus().minimumDraw,minimumDraw);assert.equal(s.fire(),true);
  assert.deepEqual(s.loading.parts,before.parts);assert.deepEqual(s.pivot(),pivot);assert.deepEqual(s.counterPoint(),counter);assert.equal(s.arm.getAngle(),arm);assert.equal(s.arm.getAngularVelocity(),0);
  const actual=s.real(s.shot);for(const[k,v]of Object.entries({x:before.position.x,y:before.position.y,angle:before.angle,vx:before.motion.vx,vy:before.motion.vy}))near(k==='angle'?Math.atan2(Math.sin(actual[k]-v),Math.cos(actual[k]-v)):actual[k],k==='angle'?0:v);near(s.shot.getAngularVelocity()/s.T,before.motion.omega);
  const blocked=[];s.world.on('begin-contact',contact=>{if(s.release)return;for(const[a,b]of[[contact.getFixtureA(),contact.getFixtureB()],[contact.getFixtureB(),contact.getFixtureA()]]){const o=a.getUserData()?.worldObject,role=b.getBody().getUserData()?.role;if(o&&['arm','counter','payload'].includes(role)&&o.id!=='launch-bough')blocked.push(`${role}/${o.id}`);}});
  for(let i=0;i<12000&&['swing','flight'].includes(s.phase);i++)s.step(1/120);
  assert.equal(s.failure,'',`${id}/${draw}/${dt}`);assert.equal(s.phase,'finished');assert.equal(s.release.reason,'Release ring cleared the pin');assert.ok(s.release.vx>0&&s.release.vy>0,`${id}/${draw}/${dt}: ${s.release.angle}°`);assert.ok(s.release.speed>2);assert.deepEqual(blocked,[]);
  assert.ok(s.peakTension<part(s.c.rope).strength);assert.ok(s.peakStress<part(s.c.arm).strength*2);assert.ok([s.maxX,s.maxY,s.time,...Object.values(s.real(s.shot))].every(Number.isFinite));assert.ok(s.maxX>5);assert.ok(held.time===0,'winding is preparation, not flight time');
 }
});
test('known recipes keep the ratchet below their calibrated minimum and resume from retained draw without another load',()=>{
 for(const{id,minimumDraw}of SCALE_BUILDS){const s=make(id);prepare(s,1/120);windTo(s,minimumDraw-.1,1/120);settle(s,1/120);const before=state(s),snapshot=s.snapshot();
  assert.equal(s.preparationStatus().code,'draw');assert.match(s.preparationStatus().message,new RegExp(Math.round(minimumDraw*100)+'%'));assert.equal(s.fire(),false);assert.deepEqual(state(s),before);assert.deepEqual(s.snapshot(),snapshot);for(const b of s.moving)assert.equal(b.getType(),'static');
  windTo(s,minimumDraw+.05,1/120);settle(s,1/120);assert.equal(s.fire(),true);assert.equal(s.phase,'swing');
 }
});
test('invalid draw and non-finite wind input cannot release or corrupt a supported experiment',()=>{
 const s=make('small');prepare(s,1/120);windTo(s,.5,1/120);settle(s,1/120);const before=state(s),snapshot=s.snapshot();
 for(const dt of[NaN,Infinity,-Infinity,-1,0]){s.wind(dt);assert.deepEqual(state(s),before);assert.deepEqual(s.snapshot(),snapshot);}
 for(const fraction of[NaN,Infinity,-Infinity]){s.setDraw(fraction);assert.deepEqual(state(s),before);assert.deepEqual(s.snapshot(),snapshot);}
 for(const fraction of[NaN,Infinity,-.01,1.01]){s.drawFraction=fraction;assert.equal(s.preparationStatus().code,'draw-invalid');assert.equal(s.fire(),false);assert.equal(s.phase,'ready');assert.equal(s.release,null);assert.deepEqual(s.loading.parts,before.parts);}
});
test('custom saved configurations remain unchanged and do not silently inherit a recipe calibration',()=>{
 for(const{id,minimumDraw}of SCALE_BUILDS){const original=createScaleBuild(id),renamed={...original,name:'My preserved name'};assert.equal(recipeDrawMinimum(renamed),minimumDraw);const edited={...original,pinAngle:original.pinAngle+.01};const before=JSON.stringify(edited);assert.equal(recipeDrawMinimum(edited),null);assert.deepEqual(new BuildSimulation(edited).c,edited);assert.equal(JSON.stringify(edited),before);}
 assert.deepEqual(createScaleBuild('small'),STARTER);
});
test('large loaded winding is governed by real distance and starts gently; starter and raw laboratory cadence remain unchanged',()=>{
 assert.equal(windingMinimum(STARTER),3);assert.equal(windingMotion(STARTER).rampSeconds,0);assert.ok(LOADED_DESCENT_SPEED<GRAVITY/LOADING_LINEAR_DAMPING);
 for(const id of['large','elephant']){const s=make(id);prepare(s,1/120);let last=s.loading.target(),lastVy=0,minVy=0,minNormal=Infinity,duration=0;
  while(s.drawFraction<1){s.wind(1/120);const next=s.loading.target(),vy=(next.y-last.y)*120,ay=(vy-lastVy)*120;minVy=Math.min(minVy,vy);minNormal=Math.min(minNormal,ay+GRAVITY+LOADING_LINEAR_DAMPING*vy);s.loading.step(1/120);last=next;lastVy=vy;duration+=1/120;}
  assert.ok(minVy>=-LOADED_DESCENT_SPEED-.01,`${id} bowl descent ${minVy}`);assert.ok(minNormal>0,`${id} vertical contact budget ${minNormal}`);assert.equal(s.loading.loaded,true);settle(s,1/120);assert.ok(Math.abs(duration-preparationSeconds(s.c))<.03);
 }
 for(const{id}of SCALE_BUILDS){
  const s=new BuildSimulation(createScaleBuild(id));assert.equal(windingMotion(s.c,{loaded:false}).minimumSeconds,1.65);s.setDraw(0);let expected=0;
  for(let i=0;i<99;i++){
   // Compare the previous raw laboratory rule, including the real power limit.
   const c=s.c,span=s.initialAngle-REST_ARM_ANGLE,angle=REST_ARM_ANGLE+span*expected;
   const joules=c.counterGrams/1000*GRAVITY*c.shortArm*Math.max(.01,-Math.cos(angle))*span;
   expected=Math.min(1,expected+1/60*Math.min(1/1.65,part(c.winch).power/Math.max(.01,joules)));
   s.wind(1/60);near(s.drawFraction,expected);
  }
 }
});
