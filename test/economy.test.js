import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,createEconomyState,economyReducer as reduce,derivePhysicalConfig,shotReward,createEconomyPersistence} from '../src/economy.js';
const funded=()=>reduce(createEconomyState(),{type:'record-shot',shotId:'first',distance:20,impacts:30});
test('points and bells reward separately, bounded and idempotent',()=>{
 const s=createEconomyState(),action={type:'record-shot',shotId:'one',distance:12.3,impacts:2},next=reduce(s,action);
 assert.equal(s.points,0);assert.deepEqual(shotReward(action),{points:173,bells:9});assert.equal(next.points,173);assert.equal(next.bells,9);assert.equal(reduce(next,action),next);
 assert.throws(()=>shotReward({distance:Infinity,impacts:0}));
});
test('invalid rewards cannot mint currency',()=>{for(const patch of [{distance:-1},{distance:NaN},{impacts:-1},{impacts:1.5}])assert.throws(()=>shotReward({distance:1,impacts:0,...patch}));assert.throws(()=>reduce(createEconomyState(),{type:'record-shot',shotId:'',distance:1,impacts:0}));});
test('purchases require funds and ownership; equip replaces slot without mutating previous state',()=>{
 assert.throws(()=>reduce(createEconomyState(),{type:'purchase',id:'beam-long'}));let s=funded();const before=structuredClone(s);let bought=reduce(s,{type:'purchase',id:'beam-long'});assert.deepEqual(s,before);assert.equal(bought.bells,s.bells-45);assert.throws(()=>reduce(bought,{type:'purchase',id:'beam-long'}));assert.throws(()=>reduce(s,{type:'equip',id:'beam-long'}));const equipped=reduce(bought,{type:'equip',id:'beam-long'});assert.deepEqual(bought.equipped,{});assert.equal(equipped.equipped.beam,'beam-long');assert.deepEqual(reduce(equipped,{type:'unequip',slot:'beam'}).equipped,{});
});
test('equipment exposes physical parameters and no velocity modifiers',()=>{
 for(const item of catalog){assert.ok(item.price>0);assert.ok(Object.values(item.effects).every(v=>v>0));assert.ok(Object.keys(item.effects).every(k=>!(/velocity|speed|boost/i.test(k))));}
 let s=funded();s=reduce(s,{type:'purchase',id:'frame-heavy'});s=reduce(s,{type:'equip',id:'frame-heavy'});const base={projectileMass:2,frameMass:30};assert.deepEqual(derivePhysicalConfig(s,base),{projectileMass:2,frameMass:50,frameFriction:.65});assert.equal(base.frameMass,30);
 assert.throws(()=>{catalog[0].effects.counterMass=999;});
});
test('opt-in persistence validates saves and performs no work while disabled',()=>{
 const map=new Map(),storage={setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)??null,removeItem:k=>map.delete(k)};
 const disabled=createEconomyPersistence(null);assert.equal(disabled.save(funded()),false);assert.equal(disabled.load(),null);disabled.clear();const p=createEconomyPersistence(storage,{enabled:true});assert.equal(p.load(),null);p.save(funded());assert.deepEqual(p.load(),funded());map.set('critz-prototype-economy-v1',JSON.stringify({...funded(),bells:-1}));assert.throws(()=>p.load());p.clear();assert.equal(p.load(),null);
});
