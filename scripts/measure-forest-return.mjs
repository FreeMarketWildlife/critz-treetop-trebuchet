// Retained revision4→5 map comparison; later canonical worlds need their own acceptance.
// Deterministic source-level map comparison. Never accesses browser storage.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCALE_BUILDS} from '../src/scale-builds.js';
import {createV4Revision5GroveMap,createV4Revision4GroveMap} from '../src/grove-map.js';
import {FOREST_CASES,run,compareMetrics} from './measure-forest-corridors.mjs';
export const RETURN_IDS=Object.freeze(['crown-west','crown-east','middle','lower','exit'].map(id=>'forest-return-'+id));
// Current controller cases respect each recipe's supported draw. Historical
// 84-case results retain their original matrix in the archived JSON evidence.
export const RETURN_CASES=Object.freeze([...FOREST_CASES,...SCALE_BUILDS.flatMap(({id,minimumDraw})=>(id==='elephant'?[.65,.8,.9]:[.5,.625,.875]).filter(draw=>draw>=minimumDraw).flatMap(draw=>['none','air','staff','slingshot'].map(weapon=>({id,draw,weapon}))))]);
// A diagnostic, not the runtime settling criterion: time since the final sample
// faster than3m/s, including any later bounce that recovers that speed.
export function terminalSlowSeconds(r){let lastFast=0;for(const p of r.samples)if(Math.hypot(p.vx,p.vy)>3)lastFast=p.t;return r.flight-lastFast;}
export function comparison(c){const before=run(createV4Revision4GroveMap(),c),after=run(createV4Revision5GroveMap(),c,{trackedIds:RETURN_IDS});return{before,after,metrics:compareMetrics([before],[after])[0],terminalSlow:{before:terminalSlowSeconds(before),after:terminalSlowSeconds(after)}};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const map=createV4Revision5GroveMap(),previous=createV4Revision4GroveMap(),sha=m=>createHash('sha256').update(JSON.stringify(m)).digest('hex');
 const cases=RETURN_CASES.map(c=>{const{before,after,metrics,terminalSlow}=comparison(c);return{...metrics,terminalSlow,beforeRelease:before.release,afterRelease:after.release,beforeContacts:before.events,afterContacts:after.events,contactProof:after.physical};});
 const report={baseline:{revision:4,mapSha256:sha(previous)},current:{revision:map.starterRevision,mapSha256:sha(map),objectCount:map.objects.length},protocol:{step:1/120,cases:'Released36-case matrix plus48 additional intermediate-draw cases. Both sets informed the final design; not independent blind validation.',weapons:'Air at release+1.6s; Staff/Slingshot at+1.6,+2.3,+3.0s.',loading:'Real finite-force Enter carry, observed support, powered winding, observed support and pin release.',terminalSlow:'Seconds since final speed>3m/s sample; diagnostic only.',nativeAcceptance:false,targetGapSeconds:1,targetComplete:false},cases};
 const output=resolve(process.argv[2]??'docs/world-scale/forest-return-comparison.json');writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({output,count:cases.length,regressions:cases.filter(c=>c.forestDelta>.05||c.wholeDelta>.05||c.afterRange<c.beforeRange*.8||c.terminalSlow.after>c.terminalSlow.before+.75),changed:cases.filter(c=>c.hits.length).map(c=>({id:c.id,draw:c.draw,weapon:c.weapon,before:c.before.forest,after:c.after.forest,range:[c.beforeRange,c.afterRange],flight:[c.beforeFlight,c.afterFlight],terminalSlow:c.terminalSlow,hits:c.hits}))},null,2));
}
