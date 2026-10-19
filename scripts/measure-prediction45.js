import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PhysicalHookScene} from '../src/hook-experiment.js';
import {createPredictionJob} from '../src/prediction.js';
import {prepared} from './crossing-input43.js';
import {installContactBoundary} from './contact-boundary44.js';
const read=p=>JSON.parse(readFileSync(p)),hash=s=>createHash('sha256').update(JSON.stringify(s.snapshot())).digest('hex');
const entries=[0,1,2].flatMap(g=>read(`docs/reviews/iteration-38/regression-group${g}.json`).rows).filter(r=>r.hardware==='stock');
const rows=[];
for(const candidate of [false,true])for(const entry of entries){
 const row={id:entry.id,candidate};rows.push(row);let loaded;
 try{loaded=prepared(entry,candidate).s;}catch(e){row.outcome='preparation_rejected';row.reason=e.message;continue;}
 const snapshot=loaded.snapshot(),unchanged=hash(loaded),traces=[];
 loaded.clone=()=>{const s=new PhysicalHookScene(loaded.p,entry.species,snapshot),trace=[],stats=installContactBoundary(s,{reserveContact:1}),step=s.step.bind(s);s.step=(...args)=>{step(...args);trace.push(hash(s));};traces.push({trace,stats});return s;};
 const sync=loaded.predict();assert.equal(hash(loaded),unchanged);
 const job=createPredictionJob(loaded);assert.ok(job);let slices=0;while(!job.done){job.advance({maxSteps:17,budgetMs:1});slices++;}assert.equal(hash(loaded),unchanged);
 assert.deepEqual(sync.release,job.result.release);
 const live=new PhysicalHookScene(loaded.p,entry.species,snapshot),stats=installContactBoundary(live,{reserveContact:1});live.unlatch();
 for(let i=0;i<Math.max(...traces.map(t=>t.trace.length));i++){live.step();const actual=hash(live);for(const t of traces)if(i<t.trace.length)assert.equal(actual,t.trace[i],`${entry.id}/${candidate} step${i}`);}
 assert.deepEqual(live.release,sync.release);
 row.outcome='exact_research_prediction_parity';row.syncSteps=traces[0].trace.length;row.budgetedSteps=traces[1].trace.length;row.slices=slices;row.reason=job.result.reason;row.release=sync.release;row.maxOuterActual=Math.max(stats.maxOuterActual,...traces.map(t=>t.stats.maxOuterActual));row.contactSplits=stats.contactSplits;row.sourceUnchanged=hash(loaded)===unchanged;
 console.log(entry.id,candidate,row.outcome,row.syncSteps,row.budgetedSteps);
}
mkdirSync('docs/reviews/iteration-45',{recursive:true});writeFileSync('docs/reviews/iteration-45/prediction-parity.json',JSON.stringify({protocol:'33 stock species/winding cases x2 loading modes; physically loaded fresh, explicit research clone override only. Production synchronous and budgeted prediction algorithms use the same disabled reserve1 kernel as canonical live. Every common outer snapshot SHA exact, full releases exact, live loaded source unchanged. Different clipping rules retain different trace lengths; no timing comparison under concurrent catalog job. Production clone implementation unchanged.',rows},null,2)+'\n',{flag:'wx'});
