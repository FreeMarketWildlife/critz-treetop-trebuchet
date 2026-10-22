import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,STARTER,part} from '../src/build-catalog.js';
import {purchaseFit,fitEquipment} from '../src/build-equipment.js';
import {newProgress} from '../src/build-progress.js';
import {visitShop,purchaseOffer} from '../src/build-shop.js';
import {runBuild} from '../src/build-physics.js';
import {createScaleBuild} from '../src/scale-builds.js';

test('purchasing oversized moving hardware preserves the working starter and grants ownership',()=>{
 for(const id of ['cradle','hammock','elephant','whale','titanCable']){
  assert.ok(part(id));const state=visitShop({...newProgress(),bells:10000},37),offer={kind:'part',id};state.shop={...state.shop,offers:[offer]};
  const bought=purchaseOffer(state,offer),fit=purchaseFit(state.build,offer);
  assert.ok(bought.owned.includes(id));assert.equal(bought.bells,state.bells-part(id).price);assert.equal(fit.fitted,false,id);assert.deepEqual(fit.build,STARTER);assert.match(fit.reason,/Owned: fit it from Build/);assert.deepEqual(state.build,STARTER);
 }
});
test('the conservative purchase check does not forbid explicit fitting of usable heavier hardware',()=>{
 for(const id of ['pouch','hemp','cable']){
  const offer={kind:'part',id},fit=purchaseFit(STARTER,offer);assert.equal(fit.fitted,false,id);
  const explicit=fitEquipment(STARTER,offer),sim=runBuild(explicit);assert.equal(explicit[part(id).slot],id);assert.equal(sim.failure,'',id);assert.ok(sim.release?.vx>0,id);
 }
});
test('compatible large machines can still auto-fit proportionate moving hardware',()=>{
 for(const [recipe,id]of [['medium','pouch'],['large','elephant'],['elephant','whale']]){
  const build=createScaleBuild(recipe),fit=purchaseFit(build,{kind:'part',id});assert.equal(fit.fitted,true,recipe+'/'+id);assert.equal(fit.build[part(id).slot],id);assert.equal(fit.build.counterGrams,build.counterGrams);assert.equal(fit.build.pivotHeight,build.pivotHeight);
 }
});
test('every automatically fitted starter part retains a clean physical pin release',()=>{
 for(const p of PARTS){const fit=purchaseFit(STARTER,{kind:'part',id:p.id});if(!fit.fitted)continue;const sim=runBuild(fit.build);assert.equal(sim.failure,'',p.id);assert.ok(sim.release,p.id);assert.ok(sim.release.vx>0,p.id);}
});
