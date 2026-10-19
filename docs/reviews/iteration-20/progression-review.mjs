import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {catalog,createEconomyState,economyReducer as reduce,derivePhysicalConfig,createEconomyPersistence} from '../../../src/economy.js';
import {STARTER_HARDWARE} from '../../../src/starter.js';
const ledgerPath=new URL('../iteration-19/soak-shelf-only.json',import.meta.url),ledger=JSON.parse(readFileSync(ledgerPath));
let state=createEconomyState();const purchases=[],rows=[];let duplicateChecks=0,saveChecks=0,alternativeChecks=0;
const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},persistence=createEconomyPersistence(storage,{enabled:true});
for(const row of ledger.rows){const item=catalog[Math.floor(row.i/3)%catalog.length],before=state.bells;
 if(!state.owned.includes(item.id)&&state.bells>=item.price){state=reduce(state,{type:'purchase',id:item.id});purchases.push({beforeLaunch:row.i+1,id:item.id,price:item.price,earnedWalletBefore:before,walletAfter:state.bells});}
 if(state.owned.includes(item.id))state=reduce(state,{type:'equip',id:item.id});
 if(row.i%7===0)state=reduce(state,{type:'unequip',slot:item.slot});
 assert.deepEqual(state.equipped,row.equipment);
 const physical=derivePhysicalConfig(state,STARTER_HARDWARE);assert.ok(!Object.keys(physical).some(k=>/velocity|boost/i.test(k)));
 if(row.outcome==='released'){const action={type:'record-shot',shotId:`soak:${row.i}`,distance:row.distance,impacts:row.impacts};state=reduce(state,action);assert.equal(reduce(state,{...action,distance:10000,impacts:50}),state);duplicateChecks++;}
 persistence.save(state);state=persistence.load();saveChecks++;
 // Retry/reset changes no economy state. Every owned slot can be removed and
 // re-equipped without spending, including mutually exclusive alternatives.
 const stable=JSON.stringify(state);for(const owned of state.owned){const c=catalog.find(c=>c.id===owned);let trial=reduce(state,{type:'equip',id:owned});trial=reduce(trial,{type:'unequip',slot:c.slot});assert.equal(trial.bells,state.bells);assert.deepEqual(trial.owned,state.owned);alternativeChecks++;}assert.equal(JSON.stringify(state),stable);
 rows.push({i:row.i,released:row.outcome==='released',bells:state.bells,points:state.points,owned:[...state.owned],equipped:{...state.equipped}});
}
assert.deepEqual({points:state.points,bells:state.bells,owned:state.owned,completedShots:state.completedShots.length},ledger.economy);
const out={protocol:'Replay recorded earned rewards through current reducers and original purchase schedule; no physics rerun, no wallet grants, no browser or user storage access.',ledger:'iteration-19/soak-shelf-only.json',ledgerSHA256:createHash('sha256').update(readFileSync(ledgerPath)).digest('hex'),economySHA256:createHash('sha256').update(readFileSync(new URL('../../../src/economy.js',import.meta.url))).digest('hex'),purchases,duplicateChecks,saveChecks,alternativeChecks,final:{points:state.points,bells:state.bells,owned:state.owned,completedShots:state.completedShots.length},firstAllOwnedLaunch:rows.find(r=>r.owned.length===catalog.length).i+1,rows};
writeFileSync(new URL('progression-review.json',import.meta.url),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,rows:undefined},null,2));
