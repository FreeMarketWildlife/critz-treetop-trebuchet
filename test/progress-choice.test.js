import test from 'node:test';import assert from 'node:assert/strict';
import {createEconomyState,economyReducer as reduce,createEconomyPersistence} from '../src/economy.js';
import {inspectProgressChoice,commitProgressChoice,readProgressBackup,swapProgressBackup} from '../src/progress-choice.js';
const earned=(id,n)=>reduce(createEconomyState(),{type:'record-shot',shotId:id,distance:n,impacts:n});
const memory=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
test('conflict inspection never changes earned current or stored previous',()=>{const st=memory(),a=earned('current',4),b=earned('old',2);createEconomyPersistence(st,{enabled:true}).save(b);assert.equal(inspectProgressChoice(st,a).conflict,true);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),b);assert.equal(a.bells,13);assert.equal(inspectProgressChoice(st,createEconomyState()).conflict,false);assert.equal(inspectProgressChoice(st,b).conflict,false);});
test('both explicit choices retain other version and repeated backup swaps preserve exact ledgers',()=>{for(const choice of['current','previous']){const st=memory(),a=earned('current',4),b=earned('old',2),selected=commitProgressChoice(st,a,b,choice),other=choice==='current'?b:a;assert.deepEqual(readProgressBackup(st),other);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),selected);const swapped=swapProgressBackup(st,selected);assert.deepEqual(swapped,other);assert.deepEqual(readProgressBackup(st),selected);assert.deepEqual(swapProgressBackup(st,swapped),selected);assert.equal(reduce(selected,{type:'record-shot',shotId:selected.completedShots[0],distance:999,impacts:50}),selected);}});
test('backup or primary write failure preserves in-memory current and recoverable alternatives',()=>{for(const failAt of[1,2]){const st=memory(),a=earned('current',4),b=earned('old',2);createEconomyPersistence(st,{enabled:true}).save(b);let writes=0;const faulty={getItem:st.getItem,setItem(k,v){if(++writes===failAt)throw Error('quota');st.setItem(k,v);}};const before=structuredClone(a);assert.throws(()=>commitProgressChoice(faulty,a,b,'previous'));assert.deepEqual(a,before);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),b);if(failAt===2){const envelope=JSON.parse(st.map.get('critz-prototype-economy-backup-v1'));assert.deepEqual(envelope.active,b);assert.deepEqual(envelope.backup,a);}}});
test('corrupted saves and backups fail visibly without replacing current',()=>{const st=memory(),a=earned('current',1);st.map.set('critz-prototype-economy-v1','broken');assert.equal(inspectProgressChoice(st,a).unreadable,true);st.map.set('critz-prototype-economy-backup-v1','{}');assert.throws(()=>swapProgressBackup(st,a));assert.equal(a.bells,7);});
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
test('corrupt/future primary permits valid backup recovery while preserving exact raw bytes and fresh session',()=>{
 for(const raw of['broken',JSON.stringify({...earned('future',8),version:9})]){
 const st=memory(),old=earned('old',3),chosen=earned('backup-active',5),fresh=earned('fresh-off-session',2);
 commitProgressChoice(st,chosen,old,'current');st.setItem('critz-prototype-economy-v1',raw);
 const inspection=inspectProgressChoice(st,fresh);assert.ok(inspection.unreadable&&inspection.conflict);assert.equal(st.getItem('critz-prototype-economy-v1'),raw);
 assert.deepEqual(readProgressBackup(st),chosen);const recovered=swapProgressBackup(st,fresh);assert.deepEqual(recovered,chosen);assert.deepEqual(readProgressBackup(st),fresh);
 assert.ok(JSON.parse(st.getItem('critz-prototype-economy-unreadable-v1')).includes(raw));assert.deepEqual(swapProgressBackup(st,recovered),fresh);
 }
});
test('explicit keep-current quarantines unsupported primary; quarantine write failure cannot overwrite it',()=>{
 const raw=JSON.stringify({...earned('future',8),version:99}),a=earned('fresh',2),st=memory();st.setItem('critz-prototype-economy-v1',raw);
 const blocked={getItem:st.getItem,setItem(){throw Error('quota')}};assert.throws(()=>commitProgressChoice(blocked,a,null,'current'));assert.equal(st.getItem('critz-prototype-economy-v1'),raw);
 assert.deepEqual(commitProgressChoice(st,a,null,'current'),a);assert.equal(JSON.parse(st.getItem('critz-prototype-economy-unreadable-v1'))[0],raw);
});
test('replacing a corrupt or future backup quarantines its exact bytes; failed archive write leaves it intact',()=>{
 for(const raw of['bad-backup',JSON.stringify({version:9,active:earned('future',3)})]){const st=memory(),a=earned('one',1),b=earned('two',2);createEconomyPersistence(st,{enabled:true}).save(b);st.setItem('critz-prototype-economy-backup-v1',raw);
 const failed={getItem:st.getItem,setItem(k,v){if(k==='critz-prototype-economy-unreadable-backup-v1')throw Error('quota');st.setItem(k,v);}};
 assert.throws(()=>commitProgressChoice(failed,a,b,'current'));assert.equal(st.getItem('critz-prototype-economy-backup-v1'),raw);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),b);
 commitProgressChoice(st,a,b,'current');assert.equal(JSON.parse(st.getItem('critz-prototype-economy-unreadable-backup-v1'))[0],raw);assert.deepEqual(readProgressBackup(st),b);
 }
});
test('recovery with three distinct earned versions retains displaced valid envelope before overwrite',()=>{
 const st=memory(),a=earned('active-A',5),b=earned('backup-B',3),c=earned('fresh-C',2);commitProgressChoice(st,a,b,'current');const originalEnvelope=st.getItem('critz-prototype-economy-backup-v1');st.setItem('critz-prototype-economy-v1','corrupt');
 const blocked={getItem:st.getItem,setItem(k,v){if(k==='critz-prototype-economy-displaced-backups-v1')throw Error('quota');st.setItem(k,v);}};assert.throws(()=>swapProgressBackup(blocked,c));assert.equal(st.getItem('critz-prototype-economy-backup-v1'),originalEnvelope);assert.equal(st.getItem('critz-prototype-economy-v1'),'corrupt');
 const restored=swapProgressBackup(st,c);assert.deepEqual(restored,a);assert.deepEqual(readProgressBackup(st),c);assert.deepEqual(swapProgressBackup(st,restored),c);
 const raw=JSON.parse(st.getItem('critz-prototype-economy-displaced-backups-v1'))[0];assert.equal(raw,originalEnvelope);assert.deepEqual(JSON.parse(raw).backup,b);
});
test('automatic save failure preserves banked memory through retry; only a true later write makes it durable',()=>{
 const st=memory(),old=earned('previous',2),shot={type:'record-shot',shotId:'new-earned',distance:30,impacts:4};createEconomyPersistence(st,{enabled:true}).save(old);let unavailable=true;
 const backend={getItem:st.getItem,setItem(k,v){if(unavailable)throw Error('quota');st.setItem(k,v);}},automatic=createEconomyPersistence(backend,{enabled:true});const current=reduce(old,shot);
 assert.throws(()=>automatic.save(current));assert.equal(reduce(current,shot),current);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),old);
 assert.equal(createEconomyPersistence(st,{enabled:false}).save(current),false);assert.deepEqual(createEconomyPersistence(st,{enabled:true}).load(),old);
 unavailable=false;assert.equal(automatic.save(current),true);assert.deepEqual(automatic.load(),current);assert.equal(reduce(automatic.load(),shot).bells,current.bells);
});
test('unrelated valid primary exposes intended active recovery first, then alternate after restore',()=>{
 const st=memory(),a=earned('intended-A',5),b=earned('alternate-B',3),c=earned('fresh-C',2);commitProgressChoice(st,a,b,'current');
 st.setItem('critz-prototype-economy-v1',JSON.stringify(c));assert.deepEqual(readProgressBackup(st),a);
 const restored=swapProgressBackup(st,c);assert.deepEqual(restored,a);assert.deepEqual(readProgressBackup(st),c);assert.deepEqual(swapProgressBackup(st,restored),c);
 const archived=JSON.parse(st.getItem('critz-prototype-economy-displaced-backups-v1'));assert.ok(archived.some(raw=>JSON.parse(raw).backup.completedShots.includes('alternate-B')));
});
