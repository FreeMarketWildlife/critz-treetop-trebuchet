import test from 'node:test';import assert from 'node:assert/strict';
import {loadProgressConsent,saveProgressConsent} from '../src/progress-preferences.js';
import {createEconomyState,createEconomyPersistence,economyReducer} from '../src/economy.js';
test('explicit save consent restores a run without duplicating banking across repeated reloads',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};assert.equal(loadProgressConsent(storage),false);
 const shot={type:'record-shot',shotId:'saved-run-1',distance:40,impacts:3};let state=economyReducer(createEconomyState(),shot);
 assert.ok(saveProgressConsent(storage,true));createEconomyPersistence(storage,{enabled:true}).save(state);
 for(let reload=0;reload<5;reload++){assert.equal(loadProgressConsent(storage),true);const p=createEconomyPersistence(storage,{enabled:loadProgressConsent(storage)});state=p.load();const original=state;state=economyReducer(state,shot);assert.equal(state,original);assert.equal(state.bells,11);p.save(state);}
 saveProgressConsent(storage,false);assert.equal(loadProgressConsent(storage),false);assert.equal(createEconomyPersistence(storage,{enabled:false}).load(),null);assert.ok(map.has('critz-prototype-economy-v1'));
 const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};assert.equal(loadProgressConsent(blocked),false);assert.equal(saveProgressConsent(blocked,true),false);
});
