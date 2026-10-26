import test from 'node:test';import assert from 'node:assert/strict';
import {newProgress,validateProgress,bank} from '../src/build-progress.js';
import {visitShop,rerollShop,purchaseOffer,priceFor,compatibleStock,shopView} from '../src/build-shop.js';
import {purchaseFit} from '../src/build-equipment.js';import {part,STARTER,buildFacts} from '../src/build-catalog.js';
import {reconcileQueue,eligibleVisitors} from '../src/critter-queue.js';
test('three seeded equipment offers fit the actual build, diversify slots and reserve affordability',()=>{
 const seen=new Set();for(let seed=0;seed<150;seed++){
  const s=visitShop({...newProgress(),bells:120},Math.imul(seed,2654435761)>>>0);assert.equal(s.shop.offers.length,3);assert.equal(new Set(s.shop.offers.map(o=>o.id)).size,3);
  assert.ok(s.shop.offers.every(o=>o.kind==='part'&&purchaseFit(s.build,o).fitted));assert.equal(new Set(s.shop.offers.map(o=>part(o.id).slot)).size,3);
  assert.ok(s.shop.offers.some(o=>priceFor(s,o)<=s.bells));seen.add(s.shop.offers.map(o=>o.id).join(','));
  assert.deepEqual(s,visitShop({...newProgress(),bells:120},Math.imul(seed,2654435761)>>>0));assert.deepEqual(s,visitShop(s,999));
 }assert.ok(seen.size>100);
});
test('rerolls persist RNG, spend once, and all deals remain attachable after buying and save validation',()=>{
 let s=visitShop({...newProgress(),bells:1200},42);const first=s.shop.offers[0];s=purchaseOffer(s,first);assert.throws(()=>purchaseOffer(s,first),/owned/);
 assert.equal(shopView(s).cards.length,3,'sold slot remains visible');const before=s.bells;s=rerollShop(validateProgress(s));assert.equal(s.bells,before-5);assert.equal(s.shop.offers.length,3);assert.ok(s.shop.offers.every(o=>purchaseFit(s.build,o).fitted));
 assert.deepEqual(rerollShop(s),rerollShop(structuredClone(s)));assert.throws(()=>purchaseOffer({...s,bells:0},s.shop.offers[0]),/Bells/);
});
test('paid legacy parcel survives stock migration and fresh stock has no voucher or animal sale',()=>{
 let s=visitShop({...newProgress(),bells:1200},2);s.shop={...s.shop,dealVersion:undefined,pack:[{kind:'part',id:'pouch'}],packCost:48,packOpened:true,packTaken:false};
 s=visitShop(s,3);assert.equal(s.shop.offers.length,3);assert.equal(s.shop.voucher,null);assert.equal(shopView(s).choosing,true);assert.equal(shopView(s).cards[0].id,'pouch');
 assert.throws(()=>purchaseOffer(s,{kind:'animal',id:'mouse'}),/not for sale/);
});
test('current and one next visitor survive save/reopen; collected runs advance the promised next once',()=>{
 let s=reconcileQueue(newProgress(),{seed:42});assert.equal(Object.keys(s.creatureQueue).filter(k=>['current','next'].includes(k)).length,2);
 const preview=s.creatureQueue.next;s=validateProgress(s);assert.equal(s.creatureQueue.next,preview);s=bank(s,'queue-shot',{distance:12,height:3,release:true,animal:s.build.animal});s=reconcileQueue(s,{advance:true});assert.equal(s.creatureQueue.current,preview);assert.equal(s.build.animal,preview);assert.deepEqual(reconcileQueue(s,{advance:true}),s);
});
test('door eligibility also checks real payload capacity/opening/torque and cannot force heavy visitors',()=>{
 const s={...newProgress(),doorTier:7};const pool=eligibleVisitors(s);assert.ok(pool.includes('mouse'));assert.ok(!pool.includes('rabbit'));for(const id of pool)assert.equal(buildFacts({...STARTER,animal:id}).warnings.length,0);
 const unsafe=reconcileQueue({...s,build:{...STARTER,counterGrams:1}});assert.equal(unsafe.creatureQueue,null);
});
test('invalid queue metadata cannot enter a durable progress save',()=>{const s=reconcileQueue(newProgress());for(const patch of [{seed:-1},{round:1},{current:'unknown'},{next:'unknown'}])assert.throws(()=>validateProgress({...s,creatureQueue:{...s.creatureQueue,...patch}}));});
test('crafting reconciles incompatible old offers deterministically without charging or resetting rerolls',()=>{
 let s=visitShop({...newProgress(),bells:1200},42);s=rerollShop(s);const before=structuredClone(s);s={...s,build:{...s.build,longArm:1.5,shortArm:.4,pivotHeight:2,frame:'timber',slingLength:1.3,troughLength:2},owned:[...s.owned,'timber']};
 const next=visitShop(s,999);assert.equal(next.bells,before.bells);assert.equal(next.shop.rerolls,before.shop.rerolls);assert.equal(next.shop.offers.length,3);assert.ok(next.shop.offers.every(o=>purchaseFit(next.build,o).fitted));assert.deepEqual(next,visitShop(s,111));assert.deepEqual(next,visitShop(next,222));
});
