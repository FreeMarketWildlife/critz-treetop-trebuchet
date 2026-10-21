import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation,runBuild} from '../src/build-physics.js';
import {STARTER,STARTER_ANIMALS,STARTER_MAX_GRAMS,PARTS,critter,scaledPreset} from '../src/build-catalog.js';
import {crankState,drawCrankWheel} from '../src/crank-wheel.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {newProgress,validateProgress,canBuild} from '../src/build-progress.js';
import {visitShop,purchaseOffer} from '../src/build-shop.js';
import {fitEquipment} from '../src/build-equipment.js';

test('holding winds clockwise; the physical arm drives counterclockwise payout with no release impulse',()=>{
 const s=new BuildSimulation(STARTER);s.setDraw(0);let last=crankState(s).angle;
 assert.equal(last,0);
 for(let i=0;i<110;i++){s.wind(1/60);const a=crankState(s).angle;assert.ok(a>=last);last=a;}
 assert.ok(last>Math.PI*2);const pose=s.snapshot();assert.ok(s.fire());assert.equal(s.arm.getAngle(),pose.armAngle);assert.deepEqual(s.real(s.shot),pose.payload);assert.equal(s.arm.getAngularVelocity(),0);
 let decreasing=0,previous=last;
 for(let i=0;i<1000&&!s.release;i++){s.step(1/600);const a=crankState(s).angle;if(a<previous)decreasing++;previous=a;}
 assert.ok(decreasing>50);assert.ok(s.release);assert.ok(crankState(s).angle<last);assert.equal(s.failure,'');
});
test('drawing a stationary crank cannot advance it or mutate the physical mechanism',()=>{
 const s=new BuildSimulation(STARTER),before=JSON.stringify(s.snapshot()),a=crankState(s).angle;
 const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
 for(let i=0;i<30;i++)drawCrankWheel(ctx,s,p=>[p.x*50,-p.y*50],50);
 assert.equal(crankState(s).angle,a);assert.equal(JSON.stringify(s.snapshot()),before);
});
test('wheel tiers scale, interconnect with every foundation and fit without altering lever geometry',()=>{
 const tiers=PARTS.filter(p=>p.slot==='winch'),radii=[];
 for(const tier of tiers){const c=fitEquipment(STARTER,{kind:'part',id:tier.id});radii.push(crankState(new BuildSimulation(c)).radius);assert.equal(c.longArm,STARTER.longArm);assert.equal(c.pivotHeight,STARTER.pivotHeight);}
 assert.equal(new Set(radii).size,tiers.length);
 for(const chassis of ['anchored','skids','wheels','walking','floating'])for(const tier of tiers){
  const s=new BuildSimulation({...scaledPreset('mouse',chassis),winch:tier.id}),g=crankState(s),f=s.frame.getLocalPoint({x:g.center.x/s.L,y:g.center.y/s.L});
  assert.ok(Math.abs(f.x*s.L-s.c.baseWidth*.44)<1e-9);assert.ok(g.radius<=s.c.baseWidth*.35);assert.ok(g.drumRadius<g.radius);
 }
});
test('empty loading blocks firing and explicit seating never supplies launch velocity',()=>{
 const s=new BuildSimulation(STARTER);s.setDraw(0);s.loading=createPayloadLoading(s);assert.equal(s.fire(),false);assert.equal(s.phase,'ready');s.loading.loadKeyboard();for(let i=0;i<720&&!s.loading.loaded;i++)s.loading.step(1/120);assert.ok(s.loading.loaded);for(let i=0;i<1200&&s.drawFraction<1;i++){s.wind(1/120);s.loading.step(1/120);}for(let i=0;i<120;i++)s.loading.step(1/120);const before=s.snapshot(),motion=s.loading.motion;assert.ok(s.fire());const after=s.real(s.shot);for(const key of ['x','y','vx','vy'])assert.ok(Math.abs(after[key]-before.payload[key])<1e-9,key);assert.ok(Math.abs(Math.atan2(Math.sin(after.angle-before.payload.angle),Math.cos(after.angle-before.payload.angle)))<1e-9);assert.equal(s.arm.getAngularVelocity(),0);assert.ok(Math.abs(after.vx-motion.vx)<1e-9);for(let i=0;i<2400&&['swing','flight'].includes(s.phase);i++)s.step(1/60);assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.release.angle>30);assert.ok(s.maxX>18);
});
test('starter grants only the small roster, all of which fly with the same default kit',()=>{
 const state=newProgress();assert.equal(STARTER_MAX_GRAMS,150);assert.deepEqual(state.animals,STARTER_ANIMALS);assert.deepEqual(state.animals,['mouse','frog','chipmunk']);assert.equal(state.build.winch,'hand');assert.ok(!state.owned.includes('geared'));
 for(const animal of STARTER_ANIMALS){assert.ok(critter(animal).grams<=150);assert.equal(canBuild(state,{...STARTER,animal}),true);const s=runBuild({...STARTER,animal});assert.equal(s.failure,'');assert.ok(s.release.angle>30&&s.release.angle<65);}
});
test('revision 2 saves retain purchased wheels and custom builds while receiving the small roster once',()=>{
 const raw={...newProgress(),starterRevision:2,bells:321,animals:['mouse','squirrel'],owned:[...newProgress().owned,'geared'],build:{...STARTER,winch:'geared',pinAngle:-43}};
 const s=validateProgress(raw);assert.equal(s.build.winch,'geared');assert.equal(s.build.pinAngle,-43);assert.equal(s.bells,321);assert.ok(s.animals.includes('squirrel'));assert.ok(s.animals.includes('chipmunk'));assert.deepEqual(validateProgress(s),s);
});
test('each wheel upgrade is offered, purchased, and fitted through the actual shop',()=>{
 for(const id of ['geared','capstan','engine']){
  let listed;
  for(let seed=0;seed<3000&&!listed;seed++){const s=visitShop({...newProgress(),bells:10000},seed*7001);if(s.shop.offers.some(o=>o.id===id))listed=s;}
  assert.ok(listed,id);const offer={kind:'part',id},purchased=purchaseOffer(listed,offer),build=fitEquipment(purchased.build,offer);
  assert.equal(canBuild(purchased,build),true);assert.equal(build.winch,id);assert.ok(purchased.bells<listed.bells);
 }
});
