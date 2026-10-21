import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,SLOTS,STARTER,part} from '../src/build-catalog.js';
import {runCatalogueAudit} from '../scripts/audit-catalogue.mjs';
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
test('capacity upgrades preserve intentional geometry and fill; IDs alone do not promise extra energy',async()=>{const a=await auditPromise;for(const r of a.rows.filter(r=>['frame','ballast'].includes(r.slot)&&r.id!=='pebble'))assert.deepEqual(r.baseline,a.baseline,r.id);for(const r of a.rows.filter(r=>r.slot==='winch'))assert.deepEqual(r.baseline,a.baseline,r.id);});
test('all crank tiers have distinct increasing power-limited performance under the same heavy load',async()=>{const r=(await auditPromise).rows.filter(r=>r.slot==='winch');for(let i=1;i<r.length;i++)assert.ok(r[i].wind.heavy.drawAfterOneSecond>r[i-1].wind.heavy.drawAfterOneSecond);for(const row of r)assert.ok(Math.abs(row.wind.light.drawAfterOneSecond-1/3)<1e-9,'light-load governor remains three seconds');});
test('every bearing tier lowers friction torque and has a measured effect at three fixed scales',async()=>{const a=await auditPromise;for(const animal of ['mouse','bear','whale']){const rows=a.bearings.filter(r=>r.animal===animal);assert.equal(rows.length,PARTS.filter(p=>p.slot==='bearing').length);for(let i=1;i<rows.length;i++){assert.ok(part(rows[i].id).friction<part(rows[i-1].id).friction);assert.ok(rows[i].release.speed>rows[i-1].release.speed);}}});
test('larger cloth/cord is a moving mass tradeoff, not an unconditional distance bonus',async()=>{const a=await auditPromise;for(const slot of ['sling','rope']){const rows=a.rows.filter(r=>r.slot===slot);for(let i=1;i<rows.length;i++)assert.ok(rows[i].baseline.pouchGrams>rows[i-1].baseline.pouchGrams);assert.ok(rows.some(r=>r.baseline.failure));assert.ok(rows.every(r=>r.intended.result.release));}});
