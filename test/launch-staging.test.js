import test from 'node:test';import assert from 'node:assert/strict';
import {STARTER,critter,buildFacts} from '../src/build-catalog.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createGroveMap} from '../src/grove-map.js';
import {doorGeometry} from '../src/critter-door.js';
import {loadingStand,launchFootprint,rigOriginForDoor} from '../src/launch-staging.js';
import {groveSetupCamera,groveProject} from '../src/grove-camera.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {SCALE_BUILDS} from '../src/scale-builds.js';
const map=createGroveMap(),door=doorGeometry(map),animal=critter('mouse');
test('the compact rig and real loading stand are placed beside the unchanged 10 cm tree door',()=>{
 for(const chassis of['anchored','wheels','walking','floating']){
  const c={...STARTER,chassis},before=structuredClone(c),origin=rigOriginForDoor(c,animal,door),span=launchFootprint(c,animal),stand=loadingStand(c,animal,origin);
  assert.ok(origin< -5,'moves the compact machine toward the tree');
  const gap=origin+span.minX-(door.x+door.width/2);assert.ok(gap>=.12&&gap<=.3);
  assert.ok(stand.x>door.x&&stand.x<door.x+1);assert.deepEqual(c,before);assert.equal(door.height,.1);
 }
 for(const {build}of SCALE_BUILDS.filter(b=>b.id!=='small'))assert.equal(rigOriginForDoor(build,critter(build.animal),door),0,'large launch corridors retain their positions');
});
test('the door and rig form a visible left-hand group on wide desktop and portrait views',()=>{
 for(const [width,height]of[[3438,1732],[2048,1032],[1280,720],[390,844],[320,667]]){
  const c={...STARTER,chassis:'wheels'},originX=rigOriginForDoor(c,animal,door),camera=groveSetupCamera(c,{width,height,door,originX,counterRadius:buildFacts(c).counterRadius});
  const entrance=groveProject(door,camera,width,height),rig=groveProject({x:originX,y:0},camera,width,height);
  assert.ok(entrance.x>width*.09&&entrance.x<width*.23,`${width}: door on left`);
  assert.ok(rig.x>entrance.x&&rig.x<width*.75);assert.ok(rig.x-entrance.x<width*.55,'no empty gap between door and machine');
  assert.ok(door.height*camera.scale>=Math.min(width,height)*.035,`${width}: noticeable door`);
  assert.ok(entrance.y>height*.7&&entrance.y<height*.81);assert.equal(door.height,.1);
 }
});
test('all hardware and winding joints share the translated world origin, including wheels and floating axles',()=>{
 for(const chassis of['anchored','wheels','walking','floating']){
  const c={...STARTER,chassis},a=new BuildSimulation(c),b=new BuildSimulation(c,{originX:-5.3});
  for(const draw of[0,.4,1]){
   a.setDraw(draw);b.setDraw(draw);
   for(const key of['frame','arm','counter','shot',...(chassis==='floating'?['carriage']:[])]){
    const p=a.real(a[key]),q=b.real(b[key]);assert.ok(Math.abs(q.x-p.x+5.3)<1e-9,key);assert.ok(Math.abs(q.y-p.y)<1e-9,key);assert.ok(Math.abs(q.angle-p.angle)<1e-9,key);
   }
   for(let i=0;i<a.wheels.length;i++)assert.ok(Math.abs(b.real(b.wheels[i]).x-a.real(a.wheels[i]).x+5.3)<1e-9);
   for(const key of['axle','hinge','track','guide'])if(a[key])for(const anchor of['getAnchorA','getAnchorB']){
    const p=a[key][anchor](),q=b[key][anchor]();assert.ok(Math.abs((q.x-p.x)*a.L+5.3)<1e-8,key+'/'+anchor);assert.ok(Math.abs(q.y-p.y)<1e-8);
   }
  }
 }
});
test('the nearby mouse entrance remains draggable and loads, winds and releases through actual physics',()=>{
 for(const chassis of['anchored','wheels']){
  const c={...STARTER,chassis},originX=rigOriginForDoor(c,animal,door),sim=new BuildSimulation(c,{map,originX});sim.setDraw(0);sim.critterDoor=door;
  const loading=sim.loading=createPayloadLoading(sim,{door});assert.equal(loading.position.x,door.x);assert.ok(loading.begin(loading.position));loading.cancel();
  assert.ok(loading.loadKeyboard());for(let i=0;i<1400&&!loading.loaded;i++)loading.step(1/120);assert.ok(loading.loaded,chassis+' supported');
  for(let i=0;i<500&&sim.drawFraction<.8;i++){sim.wind(1/120);loading.step(1/120);}assert.ok(sim.drawFraction>=.7);assert.ok(sim.fire());
  for(let i=0;i<2200&&!sim.release;i++)sim.step(1/120);assert.ok(sim.release);assert.equal(sim.failure,'');assert.ok(sim.release.vx>0&&sim.release.vy>0);
 }
});
