// Synthetic controller evidence only; never reads or writes browser progress.
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCALE_BUILDS,createScaleBuild,scaleBuildFacts} from '../src/scale-builds.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createGroveMap} from '../src/grove-map.js';
import {part} from '../src/build-catalog.js';
const dt=1/120,map=createGroveMap(),rows=[];
for(const recipe of SCALE_BUILDS)for(const draw of recipe.id==='elephant'?[.6,.75,.9,1]:[.4,.6,.8,1]){
 const c=createScaleBuild(recipe.id),s=new BuildSimulation(c,{map});s.setDraw(0);s.loading=createPayloadLoading(s);
 const settle=()=>{let stable=0,time=0;for(;time<6&&stable<.25;time+=dt){s.loading.step(dt);stable=s.loading.loaded?stable+dt:0;}assert.ok(stable>=.25);return time;};
 assert.equal(s.loading.loadKeyboard(),true);const initialSettle=settle();s.beginWinding();let windSeconds=0;
 for(;windSeconds<30&&s.drawFraction+1e-9<draw;windSeconds+=dt){s.wind(dt);s.loading.step(dt);}
 assert.ok(s.drawFraction+1e-9>=draw);const supportedAfterWind=s.loading.loaded,postWindSettle=settle(),preReleaseContacts=[];
 s.world.on('begin-contact',contact=>{if(s.release)return;for(const[a,b]of[[contact.getFixtureA(),contact.getFixtureB()],[contact.getFixtureB(),contact.getFixtureA()]]){const o=a.getUserData()?.worldObject,role=b.getBody().getUserData()?.role;if(o&&['arm','counter','payload'].includes(role)&&o.id!=='launch-bough')preReleaseContacts.push(role+'/'+o.id);}});
 assert.equal(s.fire(),true);for(let i=0;i<12000&&['swing','flight'].includes(s.phase);i++)s.step(dt);
 assert.equal(s.failure,'');assert.equal(s.phase,'finished');assert.equal(s.release.reason,'Release ring cleared the pin');assert.ok(s.release.vx>0&&s.release.vy>0);assert.deepEqual(preReleaseContacts,[]);
 assert.ok(s.peakTension<part(c.rope).strength);assert.ok(s.peakStress<part(c.arm).strength*2);
 rows.push({id:recipe.id,requestedDraw:draw,actualDraw:s.drawFraction,minimumDraw:recipe.minimumDraw,keyboardDrops:1,initialSettle,windSeconds,supportedAfterWind,postWindSettle,release:s.release,peakTension:s.peakTension,ropeLimit:part(c.rope).strength,peakStress:s.peakStress,beamFailureStress:part(c.arm).strength*2,distance:s.maxX,maxHeightAboveFloor:s.maxY+map.launch.y,completionSeconds:s.time,phase:s.phase,failure:s.failure,preReleaseContacts});
}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),output=resolve(root,process.argv[2]??'docs/world-scale/scale-builds-measurements.json');
const evidence={version:2,status:'Code-level evidence; native browser acceptance pending; see release-readiness.md for release status',map:{version:map.version,starterRevision:map.starterRevision,launch:map.launch,tree:map.tree,canonicalSha256:createHash('sha256').update(JSON.stringify(map)).digest('hex')},protocol:{preparationStep:dt,consecutiveSupportedSeconds:.25,externalFlightStep:dt,keyboardDrops:'One initial physical Enter drop; no re-drop, pose override, forced support or injected launch velocity',playerWeapons:false,authoredMapTargets:true,drawCoverage:'Discrete four-draw samples per recipe; regression additionally covers 20/30/60/120 Hz preparation, not a continuous certification'},recipes:SCALE_BUILDS.map(({id,name,minimumDraw})=>({id,name,minimumDraw,configuration:createScaleBuild(id),facts:scaleBuildFacts(id)})),measurements:rows};
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(rows.map(({id,requestedDraw,windSeconds,release,distance,maxHeightAboveFloor,completionSeconds,peakTension})=>({id,draw:requestedDraw,windSeconds,speed:release.speed,angle:release.angle,distance,maxHeightAboveFloor,completionSeconds,peakTension})),null,2));
