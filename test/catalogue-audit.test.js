import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,SLOTS,STARTER,part} from '../src/build-catalog.js';
import {runCatalogueAudit} from '../scripts/audit-catalogue.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {windingMinimum,BEARING_WINDING_SECONDS} from '../src/winding-comfort.js';
const auditPromise=runCatalogueAudit();
test('catalogue audit covers every real persisted part and all equipment slots',async()=>{const a=await auditPromise;assert.equal(a.rows.length,PARTS.length);assert.deepEqual(a.rows.map(r=>r.id),PARTS.map(p=>p.id));assert.equal(new Set(a.rows.map(r=>r.id)).size,PARTS.length);assert.deepEqual(new Set(a.rows.map(r=>r.slot)),new Set(SLOTS.map(([s])=>s)));});
for(const p of PARTS)test(`catalogue ${p.id}: purchase, equip, persistence and intended physical effect`,async()=>{
 const a=await auditPromise,r=a.rows.find(r=>r.id===p.id);
 for(const [name,ok]of Object.entries(r.purchase))assert.equal(ok,true,`${p.id} ${name}`);
 assert.ok(r.intended.result.release,`${p.id}: ${r.intended.result.failure}`);assert.equal(r.intended.result.failure,'',`${p.id} intended recipe must release without overload`);
 assert.ok(Number.isFinite(r.intended.result.release.speed));assert.ok(Number.isFinite(r.intended.result.distanceAtCutoff));assert.notEqual(r.intended.result.phase,'invalid');
 if(!['frame','ballast','winch'].includes(p.slot)&&p.id!==STARTER[p.slot])assert.ok(r.changedBaselineFields.length>0,`${p.id} disconnected baseline effect`);
 if(r.capacity){assert.ok(Object.values(r.capacity.physical).every(Number.isFinite));if(r.capacity.previousPart)assert.equal(r.capacity.previousRejectsExpanded,true);}
 if(p.slot==='frame'){assert.ok(Math.abs(r.capacity.physical.pivotHeight-p.maxHeight*.8)<1e-8);assert.ok(Math.abs(r.capacity.physical.frameGrams/(p.maxMass*.8)-1)<1e-8);}
 if(p.slot==='ballast')assert.ok(Math.abs(r.capacity.physical.counterGrams/(p.maxMass*.8)-1)<1e-8);
 if(p.slot==='sling')assert.ok(Math.abs(r.capacity.physical.ropeMaxLength-p.maxLength*.8)<1e-8);
 if(p.slot==='winch'){assert.ok(r.wind.light.drawAfterOneSecond>0);assert.ok(r.wind.heavy.drawAfterOneSecond>0);assert.equal(r.wind.heavy.power,p.power);}
});
test('capacity upgrades preserve intentional geometry and fill; IDs alone do not promise extra energy',async()=>{const a=await auditPromise;for(const r of a.rows.filter(r=>['frame','ballast'].includes(r.slot)&&!['pebble','guillotine'].includes(r.id)))assert.deepEqual(r.baseline,a.baseline,r.id);for(const r of a.rows.filter(r=>r.slot==='winch'))assert.deepEqual(r.baseline,a.baseline,r.id);});
test('all crank tiers have distinct increasing power-limited performance under the same heavy load',async()=>{const r=(await auditPromise).rows.filter(r=>r.slot==='winch');for(let i=1;i<r.length;i++)assert.ok(r[i].wind.heavy.drawAfterOneSecond>r[i-1].wind.heavy.drawAfterOneSecond);for(const row of r)assert.ok(Math.abs(row.wind.light.drawAfterOneSecond-1/3)<1e-9,'light-load governor remains three seconds');});
test('every bearing tier lowers friction torque and has a measured effect at three fixed scales',async()=>{const a=await auditPromise;for(const animal of ['mouse','bear','whale']){const rows=a.bearings.filter(r=>r.animal===animal);assert.equal(rows.length,PARTS.filter(p=>p.slot==='bearing').length);for(let i=1;i<rows.length;i++){assert.ok(part(rows[i].id).friction<part(rows[i-1].id).friction);assert.ok(rows[i].release.speed>rows[i-1].release.speed);}}});
test('larger cloth/cord is a moving mass tradeoff, not an unconditional distance bonus',async()=>{const a=await auditPromise;for(const slot of ['sling','rope']){const rows=a.rows.filter(r=>r.slot===slot);for(let i=1;i<rows.length;i++)assert.ok(rows[i].baseline.pouchGrams>rows[i-1].baseline.pouchGrams);assert.ok(rows.some(r=>r.baseline.failure));assert.ok(rows.every(r=>r.intended.result.release));}});

test('waxed rail meaningfully reduces actual sliding contact loss in a supported ground-loaded rig',async()=>{const rows=(await auditPromise).relevantMechanics.trough.filter(r=>r.profile==='ground-loaded'),wood=rows.find(r=>r.id==='runway'),wax=rows.find(r=>r.id==='waxedRunway');for(const r of rows){assert.equal(r.failure,'');assert.ok(r.release);assert.ok(r.rail.postSolveCalls>100);assert.ok(r.rail.slidingContactSeconds>1);}assert.ok(wax.rail.estimatedWorkJ<wood.rail.estimatedWorkJ*.6);assert.ok(wax.rail.tangentialImpulseNs<wood.rail.tangentialImpulseNs*.6);assert.ok(wax.release.speed>wood.release.speed);});
test('release fingers affect timing and arc on current starter and supported fixed-geometry rigs',async()=>{
 const all=(await auditPromise).relevantMechanics.release;
 for(const profile of['starter','ground-loaded','rabbit']){
  const rows=all.filter(r=>r.profile===profile);assert.equal(rows.length,3);
  for(const r of rows){assert.equal(r.failure,'',profile+'/'+r.id);assert.ok(r.release);}
  for(let i=1;i<rows.length;i++){assert.ok(part(rows[i].id).friction<part(rows[i-1].id).friction);assert.ok(rows[i].release.time<rows[i-1].release.time,profile+' earlier ring release');assert.ok(Math.abs(rows[i].release.angle-rows[i-1].release.angle)>1e-6,profile+' distinct arc');}
 }
});
test('ballast materials change physical fixture bulk and inertia at the identical fill mass',async()=>{const rows=(await auditPromise).relevantMechanics.material,stone=rows.find(r=>r.id==='stone'),sand=rows.find(r=>r.id==='sand'),steel=rows.find(r=>r.id==='steel');for(const r of rows){assert.equal(r.failure,'');assert.equal(r.build.counterGrams,STARTER.counterGrams);}assert.ok(steel.counter.fixtureRadius<stone.counter.fixtureRadius*.72);assert.ok(steel.counter.inertiaKgM2<stone.counter.inertiaKgM2*.72);assert.ok(sand.counter.fixtureRadius>stone.counter.fixtureRadius*1.18);assert.ok(sand.counter.inertiaKgM2>stone.counter.inertiaKgM2*1.3);});

test('bearing comfort gives every higher tier a player-relevant preparation benefit while preserving bronze',async()=>{const rows=(await auditPromise).rows.filter(r=>r.slot==='bearing');assert.equal(windingMinimum(STARTER),3);for(let i=0;i<rows.length;i++){const r=rows[i],minimum=BEARING_WINDING_SECONDS[r.id];assert.equal(r.wind.light.minimumSeconds,minimum);assert.ok(Math.abs(r.wind.light.drawAfterOneSecond-1/minimum)<1e-9,r.id);if(i)assert.ok(r.wind.light.drawAfterOneSecond>rows[i-1].wind.light.drawAfterOneSecond);assert.equal(windingMinimum({...STARTER,bearing:r.id},{loaded:false}),1.65);}assert.ok(rows.find(r=>r.id==='precision').wind.light.drawAfterOneSecond>=rows.find(r=>r.id==='bronze').wind.light.drawAfterOneSecond*1.49);});
test('current geometry and source fingerprints define this audit; archived trajectories retain their original provenance',async()=>{
 const a=await auditPromise;assert.deepEqual(a.method.baselineBuild,STARTER);assert.equal(a.method.sourceStable,true,'do not certify measurements across concurrent source edits');
 const expected={'upgrade-audit':'9a86d653e9fb391354f5919e16f688d8e28e1a6696e55de1cc51e526ea932868','upgrade-usefulness':'6c1b71b712b58e494ab5a2f37120ccf0ae02512377828b02790a61cda3074468'};
 for(const[folder,sha256]of Object.entries(expected)){
  const bytes=await readFile(new URL('../docs/'+folder+'/catalogue-measurements.json',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),sha256,'preserve historical '+folder+' evidence');
  const old=JSON.parse(bytes);assert.deepEqual(old.rows.map(r=>r.id),PARTS.filter(p=>p.ideaSource!=='user').map(p=>p.id));assert.equal(a.method.archives.find(r=>r.path==='docs/'+folder+'/catalogue-measurements.json').sha256,sha256);
 }
});
test('every current part reaches a distinct non-colour mechanism variant at desktop and phone dimensions',async()=>{
 const a=await auditPromise;assert.equal(a.visuals.length,PARTS.length);
 for(const viewport of['phone','desktop'])for(const[slot]of SLOTS){const rows=a.visuals.filter(r=>r.slot===slot);assert.equal(new Set(rows.map(r=>r.views[viewport].geometrySha256)).size,rows.length,slot+'/'+viewport);for(const row of rows){const v=row.views[viewport];assert.equal(v.finite,true);assert.equal(v.balanced,true);assert.equal(v.simulationUnchanged,true);assert.ok(v.commandCount<6500);}}
});
test('moving hardware tradeoffs are distinguished from missing mechanical connections and unsafe automatic fitting',async()=>{
 const a=await auditPromise;assert.deepEqual(a.findings,[],'known failing direct starter hardware must remain inventory-only on purchase');for(const row of a.rows){assert.equal(row.starterCompatibility.needsLargerRig,!!row.baseline.failure);assert.equal(row.intended.result.failure,'');if(row.starterCompatibility.needsLargerRig)assert.equal(row.starterCompatibility.autoFits,false,row.id+' unsafe automatic fit');}
 for(const issue of a.findings){const row=a.rows.find(r=>r.id===issue.id);assert.equal(row.starterCompatibility.autoFits,true);assert.equal(row.starterCompatibility.needsLargerRig,true);assert.equal(issue.kind,'unsafe-starter-auto-fit');}
});
