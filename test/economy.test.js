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

test('physical winding/loading/launch bank and purchase cycle remains reproducible after local save',async()=>{
 const {PhysicalHookScene}=await import('../src/hook-experiment.js');
 const {load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js');
 let state=createEconomyState(),purchasedAt=null;const observations=[];
 const map=new Map(),storage={setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)??null,removeItem:k=>map.delete(k)},save=createEconomyPersistence(storage,{enabled:true});
 for(let shot=0;shot<6;shot++){
  const p=derivePhysicalConfig(state,{mechanicalWinding:true,initialArm:-3,releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,collisionSubsteps:true});
  const scene=new PhysicalHookScene(p,'lizard');scene.startWinding(.6);
  for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();
  assert.equal(scene.phase,'loading');assert.ok(load(scene));assert.ok(waitForContact(scene).quiet>=.1);
  const result=measureSnapshot(scene.snapshot(),scene.p,'lizard',1/600);
  assert.ok(result.released);assert.equal(result.firstWorldImpact?.surface,'ground');
  const distance=Math.max(0,result.firstWorldImpact.x),impacts=1;
  // Stop at first measured world impact: intentionally excludes later bounce rewards.
  const action={type:'record-shot',shotId:`physical-cycle-${shot}`,distance,impacts};
  const before=state;state=reduce(state,action);assert.equal(reduce(state,action),state);assert.equal(state.bells-before.bells,7);
  if(!purchasedAt&&state.bells>=30){state=reduce(state,{type:'purchase',id:'counterweight-heavy'});state=reduce(state,{type:'equip',id:'counterweight-heavy'});purchasedAt=shot+1;}
  save.save(state);state=save.load();assert.equal(reduce(state,action),state);observations.push({mass:scene.p.counterMass,distance});
 }
 assert.equal(purchasedAt,5);assert.equal(state.bells,12);assert.equal(state.completedShots.length,6);
 assert.equal(observations[0].mass,100);assert.equal(observations.at(-1).mass,140);
 assert.notEqual(observations[0].distance,observations.at(-1).distance);
});

test('long beam plus long sling uses reachable winding and retains physical contact launch',async()=>{
 const {PhysicalHookScene}=await import('../src/hook-experiment.js');const {load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js');
 let state=createEconomyState();for(let n=0;n<12;n++)state=reduce(state,{type:'record-shot',shotId:`fund-${n}`,distance:0,impacts:1});
 for(const id of['beam-long','sling-long']){state=reduce(state,{type:'purchase',id});state=reduce(state,{type:'equip',id});}
 const p=derivePhysicalConfig(state,{mechanicalWinding:true,initialArm:-3,releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,collisionSubsteps:true});const scene=new PhysicalHookScene(p);
 scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();assert.equal(scene.phase,'loading');assert.ok(load(scene));assert.ok(waitForContact(scene).quiet>=.1);
 const result=measureSnapshot(scene.snapshot(),scene.p,'lizard',1/600);assert.ok(result.released);assert.equal(result.firstWorldImpact.surface,'ground');assert.ok(result.center.vx>0);assert.ok(result.center.vy>0);
});

test('save validation rejects duplicate shot ids, unowned equipment, overflow and corrupted JSON',()=>{
 const storage={setItem(){},removeItem(){},getItem(){return '{broken';}};assert.throws(()=>createEconomyPersistence(storage,{enabled:true}).load());
 for(const patch of[{completedShots:['same','same']},{equipped:{beam:'beam-long'}},{owned:['beam-long','beam-long']},{bells:1.5}])assert.throws(()=>derivePhysicalConfig({...createEconomyState(),...patch}));
 assert.throws(()=>reduce({...createEconomyState(),bells:Number.MAX_SAFE_INTEGER},{type:'record-shot',shotId:'overflow',distance:0,impacts:0}));
});
