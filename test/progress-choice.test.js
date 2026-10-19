import test from 'node:test';import assert from 'node:assert/strict';
import {createEconomyState,economyReducer as reduce,createEconomyPersistence} from '../src/economy.js';
import {inspectProgressChoice,commitProgressChoice,readProgressBackup,swapProgressBackup} from '../src/progress-choice.js';
const earned=(id,n)=>reduce(createEconomyState(),{type:'record-shot',shotId:id,distance:n,impacts:n});
const memory=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
test('conflict inspection never changes earned current or stored previous',()=>{const st=memory(),a=earned('current',4),b=earned('old',2);createEconomyPersistence(st,{enabled:true}).save(b);assert.equal(inspectProgressChoice(st,a).conflict,true);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),b);assert.equal(a.bells,13);assert.equal(inspectProgressChoice(st,createEconomyState()).conflict,false);assert.equal(inspectProgressChoice(st,b).conflict,false);});
test('both explicit choices retain other version and repeated backup swaps preserve exact ledgers',()=>{for(const choice of['current','previous']){const st=memory(),a=earned('current',4),b=earned('old',2),selected=commitProgressChoice(st,a,b,choice),other=choice==='current'?b:a;assert.deepEqual(readProgressBackup(st),other);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),selected);const swapped=swapProgressBackup(st,selected);assert.deepEqual(swapped,other);assert.deepEqual(readProgressBackup(st),selected);assert.deepEqual(swapProgressBackup(st,swapped),selected);assert.equal(reduce(selected,{type:'record-shot',shotId:selected.completedShots[0],distance:999,impacts:50}),selected);}});
test('backup or primary write failure preserves in-memory current and recoverable alternatives',()=>{for(const failAt of[1,2]){const st=memory(),a=earned('current',4),b=earned('old',2);createEconomyPersistence(st,{enabled:true}).save(b);let writes=0;const faulty={getItem:st.getItem,setItem(k,v){if(++writes===failAt)throw Error('quota');st.setItem(k,v);}};const before=structuredClone(a);assert.throws(()=>commitProgressChoice(faulty,a,b,'previous'));assert.deepEqual(a,before);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),b);if(failAt===2){const envelope=JSON.parse(st.map.get('critz-prototype-economy-backup-v1'));assert.deepEqual(envelope.active,b);assert.deepEqual(envelope.backup,a);}}});
test('corrupted saves and backups fail visibly without replacing current',()=>{const st=memory(),a=earned('current',1);st.map.set('critz-prototype-economy-v1','broken');assert.throws(()=>inspectProgressChoice(st,a));st.map.set('critz-prototype-economy-backup-v1','{}');assert.throws(()=>swapProgressBackup(st,a));assert.equal(a.bells,7);});
test('failed primary write remains recoverable through normal backup API after reload',()=>{
 const st=memory(),current=earned('new-session',5),previous=earned('previous-save',2);createEconomyPersistence(st,{enabled:true}).save(previous);
 let writes=0;const quota={getItem:st.getItem,setItem(k,v){if(++writes===2)throw Error('primary quota');st.setItem(k,v);}};
 assert.throws(()=>commitProgressChoice(quota,current,previous,'current'));
 // Simulate startup restore of the still-old primary, then explicit Restore.
 const reloaded=createEconomyPersistence(st,{enabled:true}).load();assert.deepEqual(reloaded,previous);
 assert.deepEqual(readProgressBackup(st),current);const recovered=swapProgressBackup(st,reloaded);assert.deepEqual(recovered,current);
 assert.deepEqual(readProgressBackup(st),previous);assert.deepEqual(swapProgressBackup(st,recovered),previous);
});
test('recovery envelope validates both alternatives/version and null storage fails safely',()=>{
 const st=memory(),a=earned('one',1);for(const envelope of[{version:2,active:a,backup:a},{version:1,active:{},backup:a},{version:1,active:a,backup:{}}]){st.map.set('critz-prototype-economy-backup-v1',JSON.stringify(envelope));assert.throws(()=>readProgressBackup(st));}
 assert.equal(readProgressBackup(null),null);assert.throws(()=>inspectProgressChoice(null,a));assert.throws(()=>commitProgressChoice(null,a,a,'current'));assert.throws(()=>swapProgressBackup(null,a));
});
