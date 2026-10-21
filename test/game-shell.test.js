import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER,scaledPreset,PARTS,CRITTERS} from '../src/build-catalog.js';
import {newProgress,validateProgress,bank} from '../src/build-progress.js';
import {visitShop,rerollShop,rerollPrice,purchaseOffer,priceFor,openPack,choosePack,packPrice,VOUCHERS} from '../src/build-shop.js';
import {createHoldControl} from '../src/hold-control.js';
import {soundSpec} from '../src/audio.js';
const stocked=(bells=200,seed=42)=>visitShop({...newProgress(),bells},seed);

test('holding actually raises ballast; full draw waits for the player and fires with zero injected velocity',()=>{
 const s=new BuildSimulation(STARTER);s.setDraw(0);const y=s.counterPoint().y;
 for(let i=0;i<120;i++)s.wind(1/60);
 assert.equal(s.drawFraction,1);assert.ok(s.counterPoint().y>y+.1);assert.equal(s.phase,'ready');
 const pose=s.snapshot();s.wind(10);assert.equal(s.arm.getAngle(),pose.armAngle);
 s.fire();assert.equal(s.real(s.shot).vx,0);assert.equal(s.real(s.shot).vy,0);assert.equal(s.arm.getAngularVelocity(),0);
 assert.equal(s.arm.getAngle(),pose.armAngle);
});
test('partial draws produce distinct physical throws for all five foundations',()=>{
 for(const chassis of ['anchored','skids','wheels','walking','floating']){
  const distances=[];
  for(const fraction of [.25,1]){const s=new BuildSimulation(scaledPreset('mouse',chassis));s.setDraw(fraction);s.fire();for(let t=0;t<45&&['swing','flight'].includes(s.phase);t+=1/60)s.step(1/60);assert.equal(s.phase,'finished',`${chassis}: ${s.failure}`);assert.ok(s.release);distances.push(s.maxX);}
  assert.ok(Math.abs(distances[1]-distances[0])>1,chassis);
 }
});
test('a heavier counterweight takes longer on the same winch; cancellation restores supported resting pose',()=>{
 const c=scaledPreset('elephant'),a=new BuildSimulation({...c,winch:'hand'}),b=new BuildSimulation({...c,winch:'engine'});
 for(const s of [a,b]){s.setDraw(0);for(let i=0;i<120;i++)s.wind(1/60);}
 assert.ok(a.drawFraction<b.drawFraction*.1);b.setDraw(0);assert.equal(b.phase,'ready');assert.equal(b.drawFraction,0);
});
test('full draw releases preserve the previous tested physical result, including floating rails',()=>{
 for(const chassis of ['anchored','floating']){const c=scaledPreset('mouse',chassis),a=new BuildSimulation(c),b=new BuildSimulation(c);b.setDraw(0);b.setDraw(1);a.fire();b.fire();for(let i=0;i<600;i++){a.step(1/60);b.step(1/60);}assert.ok(Math.abs(a.maxX-b.maxX)<1e-6);}
});
test('one pointer owns hold, secondary fingers cannot release it, interruptions never launch',()=>{
 const calls=[];let enabled=true;const h=createHoldControl({canStart:()=>enabled,onStart:()=>calls.push('start'),onRelease:()=>calls.push('fire'),onCancel:()=>calls.push('cancel')});
 assert.equal(h.begin(1),true);assert.equal(h.begin(2),false);assert.equal(h.end(2),false);assert.equal(h.cancel(2),false);assert.equal(h.active,true);h.end(1);h.end(1);assert.deepEqual(calls,['start','fire']);
 h.begin('space');h.cancel();h.end('space');assert.deepEqual(calls,['start','fire','start','cancel']);enabled=false;assert.equal(h.begin(3),false);
});
test('shop visits persist offers; paid rerolls replace cards and escalate without restocking packs/vouchers',()=>{
 const s=stocked(),again=visitShop(s,333);assert.deepEqual(s,again);
 const next=rerollShop(s);assert.equal(next.bells,195);assert.equal(rerollPrice(next),6);assert.notDeepEqual(next.shop.offers,s.shop.offers);assert.deepEqual(next.shop.pack,s.shop.pack);assert.deepEqual(next.shop.voucher,s.shop.voucher);assert.deepEqual(s,stocked());
 const restored=validateProgress(JSON.parse(JSON.stringify(next)));assert.deepEqual(visitShop(restored,10).shop,next.shop);
});
test('an earned throw refreshes the shop once; reopening does not reset reroll price',()=>{
 const s=rerollShop(stocked()),earned=bank(s,'shot-1',{distance:8,height:2,grams:25,release:true,animal:'mouse'}),next=visitShop(earned,99);
 assert.equal(next.shop.round,1);assert.equal(next.shop.rerolls,0);assert.notDeepEqual(next.shop.offers,s.shop.offers);
 assert.deepEqual(visitShop(bank(next,'shot-1',{},false),99),next);
});
test('shop transactions reject unlisted and duplicate cards and cannot overspend',()=>{
 const s=stocked(20000),offer=s.shop.offers[0],next=purchaseOffer(s,offer);
 assert.equal(next.bells,s.bells-priceFor(s,offer));assert.ok(next.owned.includes(offer.id));assert.throws(()=>purchaseOffer(next,offer),/owned/);
 const absent=PARTS.find(p=>!s.shop.offers.some(o=>o.id===p.id));assert.throws(()=>purchaseOffer(s,{kind:'part',id:absent.id}),/no longer/);
 assert.throws(()=>purchaseOffer({...s,bells:0},offer),/Bells/);assert.throws(()=>rerollShop(stocked(0)),/Bells/);
});
test('packs charge once, survive rerolls and reload, award exactly one permanent choice',()=>{
 const s=stocked(20000),open=openPack(s);assert.equal(open.bells,s.bells-packPrice(s));assert.throws(()=>openPack(open),/already/);
 const rerolled=validateProgress(JSON.parse(JSON.stringify(rerollShop(open)))),id=rerolled.shop.pack[1].id,chosen=choosePack(rerolled,id);
 assert.equal(chosen.owned.length,s.owned.length+1);assert.ok(chosen.owned.includes(id));assert.equal(chosen.shop.packTaken,true);assert.throws(()=>choosePack(chosen,rerolled.shop.pack[0].id),/Choose/);
 assert.throws(()=>choosePack(s,s.shop.pack[0].id),/Choose/);
});
test('vouchers materially change stock size, discount prices and reduce reroll cost',()=>{
 const s=stocked(20000),upgraded=visitShop({...s,launches:1,vouchers:VOUCHERS.map(v=>v.id)},10);
 assert.equal(upgraded.shop.offers.filter(o=>o.kind==='part').length,4);assert.equal(rerollPrice(upgraded),3);assert.equal(upgraded.shop.voucher,null);
 const offer=upgraded.shop.offers[0];assert.ok(priceFor(upgraded,offer)<priceFor(s,offer));
});
test('old saves migrate without losing inventory; malformed offers and prices are rejected',()=>{
 const raw=newProgress();delete raw.vouchers;delete raw.shop;const migrated=validateProgress(raw);assert.deepEqual(migrated.vouchers,[]);assert.equal(migrated.shop,null);assert.deepEqual(migrated.owned,raw.owned);
 const s=stocked();assert.throws(()=>validateProgress({...s,shop:{...s.shop,seed:-1}}));assert.throws(()=>validateProgress({...s,shop:{...s.shop,packCost:1}}));assert.throws(()=>validateProgress({...s,vouchers:['invented']}));
});
test('every unowned item remains reachable and all generated deals contain unique valid cards',()=>{
 const seen=new Set();for(let i=0;i<300;i++){const s=stocked(50000,i*7001);const keys=s.shop.offers.map(o=>`${o.kind}:${o.id}`);assert.equal(keys.length,new Set(keys).size);keys.forEach(k=>seen.add(k));validateProgress(s);}
 for(const p of PARTS.filter(p=>!newProgress().owned.includes(p.id)))assert.ok(seen.has(`part:${p.id}`),p.id);for(const a of CRITTERS.filter(a=>!newProgress().animals.includes(a.id)))assert.ok(seen.has(`animal:${a.id}`),a.id);
});
test('pinball palette has distinct mechanical, release, bounce, deal, and scoring envelopes',()=>{
 const cues=['ratchet','ready','launch','impact','reroll','pack','purchase','score'].map(e=>soundSpec(e));
 assert.equal(new Set(cues.map(c=>`${c.frequency}:${c.duration}`)).size,cues.length);
 assert.ok(soundSpec('ratchet').duration<.08);assert.ok(soundSpec('score').duration>.25);assert.ok(soundSpec('impact',1,{material:'bumper'}).bend>1);
});
