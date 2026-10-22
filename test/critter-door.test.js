import test from 'node:test';import assert from 'node:assert/strict';
import {DOORS,availableCritters,critterHeight,upgradeDoor,doorHeight,doorGeometry} from '../src/critter-door.js';
import {newProgress,validateProgress,bank,canBuild} from '../src/build-progress.js';
import {visitShop,rerollShop,purchaseOffer} from '../src/build-shop.js';
import {CRITTERS} from '../src/build-catalog.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
test('10 cm starter admits all fitting critters; every ordered upgrade retains smaller ones',()=>{
 let s={...newProgress(),bells:10000};assert.equal(doorHeight(s),.1);assert.deepEqual(availableCritters(s),['mouse','frog','chipmunk']);
 for(let i=1;i<DOORS.length;i++){
  const before=availableCritters(s),money=s.bells;s=upgradeDoor(s);assert.equal(s.doorTier,i);assert.equal(s.bells,money-DOORS[i].price);
  assert.ok(before.every(id=>availableCritters(s).includes(id)));assert.throws(()=>upgradeDoor(s),/round|fully/);
  const restored=validateProgress(s);assert.equal(restored.doorUpgradeRound,s.launches);assert.throws(()=>upgradeDoor(restored),/round|fully/);
  s=bank(s,`round-${i}`,{distance:1,height:1,animal:'mouse',grams:25});
 }
 assert.equal(availableCritters(s).length,CRITTERS.length);assert.throws(()=>upgradeDoor(s),/fully/);
});
test('door height gates builds and random stock never sells critters or doors',()=>{
 let s={...newProgress(),bells:10000};assert.throws(()=>canBuild(s,{...s.build,animal:'whale'}),/door/);
 for(let i=0;i<20;i++){s=visitShop({...s,launches:i},i);assert.ok(s.shop.offers.every(o=>o.kind==='part'));s=rerollShop(s);assert.ok(s.shop.offers.every(o=>o.kind==='part'));}
 assert.throws(()=>purchaseOffer(s,{kind:'animal',id:'frog'}),/not for sale/);
 assert.throws(()=>upgradeDoor({...s,bells:0}),/Bells/);
});
test('legacy saves retain access through a suitable door without deleting earnings',()=>{
 const raw={...newProgress(),bells:234,animals:CRITTERS.map(a=>a.id)};delete raw.doorTier;delete raw.doorUpgradeRound;
 const restored=validateProgress(raw);assert.equal(restored.bells,234);assert.equal(availableCritters(restored).length,CRITTERS.length);
 assert.throws(()=>validateProgress({...restored,doorTier:999}),/door/);
});
test('critter walks from door to stand and remains point-draggable during entrance',()=>{
 const sim=new BuildSimulation(newProgress().build),door={x:-2,y:0,width:.072,height:.1};sim.loading=createPayloadLoading(sim,{door});
 assert.ok(Math.abs(sim.loading.position.x-door.x)<1e-9);assert.equal(sim.loading.returning,true);
 for(let i=0;i<120;i++)sim.loading.step(1/60);
 assert.ok(sim.loading.position.x>door.x+.2);assert.ok(sim.loading.begin(sim.loading.position));sim.loading.cancel();
 for(let i=0;i<1800;i++)sim.loading.step(1/60);
 assert.ok(Math.abs(sim.loading.position.x-sim.loading.home().x)<.03);
});
