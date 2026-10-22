// Revision3→4 archive; current return measurements are measure-forest-return.mjs.
// Source-level physical controllers; never reads browser saves or injects a launch.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGroveMap,createV4Revision3GroveMap,createV4Revision4GroveMap} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createScaleBuild,SCALE_BUILDS} from '../src/scale-builds.js';
import {createFlightWeapons} from '../src/flight-weapons.js';
import {quietMetrics,compareMetrics} from './forest-corridor-metrics.mjs';
export {quietMetrics,compareMetrics};
export const FOREST_CASES=SCALE_BUILDS.flatMap(({id,minimumDraw})=>[minimumDraw,.75,1].flatMap(draw=>(draw===minimumDraw?['none']:['none','air','staff','slingshot']).map(weapon=>({id,draw,weapon}))));
export function run(map,{id,draw,weapon},{trackedIds}={}){
 const s=new BuildSimulation(createScaleBuild(id),{map}),newIds=new Set(trackedIds??map.objects.filter(o=>o.id.startsWith('corridor-bird-')).map(o=>o.id)),preContacts=[],newPhysical=[],events=[],seen=new WeakSet();let stepFrom=null,lastSeq=0;
 s.world.on('begin-contact',c=>{if(s.release)return;for(const[a,b]of[[c.getFixtureA(),c.getFixtureB()],[c.getFixtureB(),c.getFixtureA()]]){const o=a.getUserData()?.worldObject,role=b.getBody().getUserData()?.role;if(o&&['arm','counter','payload'].includes(role)&&o.id!=='launch-bough')preContacts.push({role,id:o.id,t:s.time});}});
 s.world.on('pre-solve',c=>{if(!s.release||seen.has(c))return;for(const[a,b]of[[c.getFixtureA(),c.getFixtureB()],[c.getFixtureB(),c.getFixtureA()]]){const o=a.getUserData()?.worldObject;if(!o||!newIds.has(o.id)||b.getBody()!==s.shot)continue;const m=c.getWorldManifold();if(!m||!c.getManifold().pointCount)continue;seen.add(c);const n={x:m.normal.x*(c.getFixtureA()===a?1:-1),y:m.normal.y*(c.getFixtureA()===a?1:-1)},p=m.points[0],v=s.shot.getLinearVelocityFromWorldPoint(p),w=a.getBody().getLinearVelocityFromWorldPoint(p);newPhysical.push({id:o.id,t:s.time-s.release.time,part:b.getUserData()?.critterPart,point:{x:p.x*s.L,y:p.y*s.L},normal:n,closingNormalSpeed:Math.max(0,-((v.x-w.x)*n.x+(v.y-w.y)*n.y))*s.L/s.T,bodyAtContact:s.real(s.shot),segmentFrom:stepFrom,segmentTo:null});}});
 s.setDraw(0);s.loading=createPayloadLoading(s);const support=()=>{let stable=0;for(let i=0;i<720&&stable<30;i++){s.loading.step(1/120);stable=s.loading.loaded?stable+1:0;}assert.equal(stable,30,`${id}/${draw}/${weapon}: payload did not settle on actual basket contacts`);};
 assert.equal(s.loading.loadKeyboard(),true);support();let winds=0;while(s.drawFraction<draw&&winds++<36000){s.wind(1/120);s.loading.step(1/120);}assert.ok(s.drawFraction>=draw,`${id}/${draw}: requested draw was not reached`);support();assert.equal(s.fire(),true,`${id}/${draw}: supported payload could not start the throw`);
 const weapons=createFlightWeapons();if(weapon!=='none')weapons.select(weapon);let shots=0;const samples=[];
 for(let i=0;i<14400&&['swing','flight'].includes(s.phase);i++){
  stepFrom={t:s.release?s.time-s.release.time:null,...s.real(s.shot)};s.step(1/120);weapons.update(1/120);
  for(const p of newPhysical)if(s.release&&!p.segmentTo)p.segmentTo={t:s.time-s.release.time,...s.real(s.shot)};
  const fresh=s.contactEvents.filter(e=>e.seq>lastSeq);if(fresh.length){assert.equal(fresh[0].seq,lastSeq+1,'No skipped impact events');events.push(...structuredClone(fresh));lastSeq=fresh.at(-1).seq;}
  if(s.release)samples.push({t:s.time-s.release.time,...s.real(s.shot),supported:s.shotContacts.size>0,settled:s.elapsedSettled});
  if(weapon!=='none'&&s.release&&shots<(weapon==='air'?1:3)&&s.time>=s.release.time+1.6+shots*.7&&weapons.fire(s,[0,0],[0,0]))shots++;
 }
 assert.equal(lastSeq,s.contactSequence);
 // A blocked physical swing is a result to diagnose, not a null-release crash.
 if(!s.release)return{id,draw,weapon,phase:s.phase,failure:s.failure||'No physical pin release',release:null,flight:0,range:s.maxX,maxY:s.maxY,end:s.real(s.shot),shots,preContacts,eventSequence:s.contactSequence,events,physical:newPhysical,samples,gaps:[],newHits:[]};
 const contacts=events.filter(e=>s.release&&e.time>=s.release.time),times=[{id:'release',time:s.release.time,x:s.release.x,y:s.release.y},...contacts,{id:'finished',time:s.time,...s.real(s.shot)}],gaps=times.slice(1).map((e,i)=>({from:times[i].id,to:e.id,seconds:e.time-times[i].time,fromT:times[i].time-s.release.time,toT:e.time-s.release.time,fromX:times[i].x,fromY:times[i].y,toX:e.x,toY:e.y})).sort((a,b)=>b.seconds-a.seconds);
 return{id,draw,weapon,phase:s.phase,failure:s.failure,release:s.release,flight:s.time-s.release.time,range:s.maxX,maxY:s.maxY,end:s.real(s.shot),shots,preContacts,eventSequence:s.contactSequence,events,physical:newPhysical,samples,gaps,newHits:[...new Set(events.filter(e=>newIds.has(e.id)).map(e=>e.id))]};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const baseline=createV4Revision3GroveMap(),current=createV4Revision4GroveMap(),before=FOREST_CASES.map(c=>run(baseline,c)),after=FOREST_CASES.map(c=>run(current,c,{trackedIds:['corridor-return-fork']})),comparison=compareMetrics(before,after);
 const sha=map=>createHash('sha256').update(JSON.stringify(map)).digest('hex');
 const report={baseline:{revision:baseline.starterRevision,mapSha256:sha(baseline)},current:{revision:current.starterRevision,mapSha256:sha(current),objectCount:current.objects.length},protocol:{step:1/120,loading:'One real finite-force Enter carry, .25s observed support, powered winding, .25s support and actual pin release.',weapons:'At release+1.6s, then .7s apart: Air once; Staff/Slingshot three times. Heat updates by actual external step.',forestBand:{x:[-46,733],altitude:[0,110]},targetGapSeconds:1,targetComplete:false,nativeAcceptance:false},cases:comparison.map((c,i)=>({...c,beforeRelease:before[i].release,afterRelease:after[i].release,beforeContacts:before[i].events,afterContacts:after[i].events,contactProof:after[i].physical})),rejected:'Bird variants were rejected for excessive range loss or prolonged aftermath; see interaction-criteria.md.'};
 const output=resolve(process.argv[2]??'docs/world-scale/forest-corridor-comparison.json');writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({output,count:comparison.length,regressions:comparison.filter(c=>c.forestDelta>.05||c.wholeDelta>.05),changed:comparison.filter(c=>Math.abs(c.forestDelta)>.001).map(c=>({id:c.id,draw:c.draw,weapon:c.weapon,before:c.before.forest,after:c.after.forest,beforeRange:c.beforeRange,afterRange:c.afterRange,beforeFlight:c.beforeFlight,afterFlight:c.afterFlight}))},null,2));
}
