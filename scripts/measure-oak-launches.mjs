// Background source QA: no browser/save access and no launch replacement.
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createGroveMap,createV4Revision7GroveMap,createV4Revision9GroveMap} from '../src/grove-map.js';
import {RETURN_CASES,terminalSlowSeconds} from './measure-forest-return.mjs';
import {run,quietMetrics} from './measure-forest-corridors.mjs';
const src=new URL('../src/',import.meta.url),fingerprint=()=>Object.fromEntries(readdirSync(src).filter(f=>f.endsWith('.js')).sort().map(f=>[f,createHash('sha256').update(readFileSync(new URL(f,src))).digest('hex')]));
const beforeSources=fingerprint(),map=createGroveMap(),healthyMap=createV4Revision7GroveMap(),compressed=createV4Revision9GroveMap(),sha=m=>createHash('sha256').update(JSON.stringify(m)).digest('hex');
const cases=RETURN_CASES.map(c=>{
 const healthy=run(healthyMap,c),current=run(map,c,{trackedIds:map.objects.filter(o=>o.id.startsWith('oak-')).map(o=>o.id)}),oldBand=quietMetrics(current),authoredBand=quietMetrics(current,{forestTop:map.tree.height});
 return{...c,phase:current.phase,failure:current.failure,preContacts:current.preContacts,release:current.release,healthyRelease:healthy.release,distance:{healthy:healthy.range,current:current.range},flight:{healthy:healthy.flight,current:current.flight},terminalSlow:{healthy:terminalSlowSeconds(healthy),current:terminalSlowSeconds(current)},metrics:{healthyConservative:quietMetrics(healthy),currentConservative:oldBand,currentAuthored:authoredBand},events:current.events,contactProof:current.physical};
});
const afterSources=fingerprint(),report={status:'Source-controller evidence only; native visual/audio/input acceptance pending',map:{revision:map.starterRevision,tree:map.tree,objects:map.objects.length,sha256:sha(map)},healthyBaseline:{revision:7,sha256:sha(healthyMap)},regressedBaseline:{revision:9,sha256:sha(compressed)},protocol:{step:1/120,cases:RETURN_CASES.length+' supported discrete real-carry draws/actions; current recipe minimums respected. Does not exercise the door entrance animation.',bands:{authoredForestTop:map.tree.height,conservativeForestTop:110,starlight:960,escape:3000},targetSeconds:1,targetComplete:false,nativeAcceptance:false},sourceStable:JSON.stringify(beforeSources)===JSON.stringify(afterSources),sourceFingerprints:afterSources,cases};
const output=resolve(process.argv[2]??'docs/world-scale/oak-launch-comparison.json');writeFileSync(output,JSON.stringify(report,null,2)+'\n');
const failures=cases.filter(c=>c.failure||c.phase!=='finished'||c.preContacts.length),changed=cases.filter(c=>Math.abs(c.distance.current-c.distance.healthy)>.01||Math.abs(c.metrics.currentConservative.forest-c.metrics.healthyConservative.forest)>.01).map(c=>({id:c.id,draw:c.draw,weapon:c.weapon,range:c.distance,flight:c.flight,gaps:{healthy110:c.metrics.healthyConservative.forest,current110:c.metrics.currentConservative.forest,currentAuthored:c.metrics.currentAuthored.forest}}));
console.log(JSON.stringify({output,sourceStable:report.sourceStable,cases:cases.length,failures,changed,worstAuthored:Math.max(...cases.map(c=>c.metrics.currentAuthored.forest)),worstConservative:Math.max(...cases.map(c=>c.metrics.currentConservative.forest))},null,2));
if(failures.length||!report.sourceStable)process.exitCode=1;
