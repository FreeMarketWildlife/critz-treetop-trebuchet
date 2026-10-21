import test from 'node:test';
import assert from 'node:assert/strict';
import {CRITTERS} from '../src/build-catalog.js';
import {CRITTER_SCALE,critterScale} from '../src/critter-scale.js';

test('all eleven stable IDs expose catalogue geometry and mass without replacing them with biological axes',()=>{
 assert.equal(CRITTER_SCALE.length,11);assert.deepEqual(CRITTER_SCALE.map(x=>x.id),CRITTERS.map(x=>x.id));
 for(const animal of CRITTERS){const record=critterScale(animal.id);
  assert.equal(record.displayName,animal.name);assert.equal(record.length,animal.length);assert.equal(record.height,animal.width);assert.equal(record.grams,animal.grams);
  assert.equal(record.measureLabel,'Game envelope · length × height');assert.ok(record.notes.length>30);assert.ok(record.representativeName);assert.ok(record.sourceScientificName);
  assert.equal(new URL(record.sourceURL).protocol,'https:');
 }
});
test('references preserve measurement axes, units and statistical scope rather than inventing universal size ranges',()=>{
 for(const record of CRITTER_SCALE){
  for(const measure of record.biological.measurements){assert.ok(measure.axis);assert.ok(measure.label);assert.ok(['range','mean','upper-bound','study-mean-sd'].includes(measure.kind));
   for(const key of['minMeters','maxMeters','meanMeters','sdMeters'])if(key in measure)assert.ok(Number.isFinite(measure[key])&&measure[key]>0);
   if(measure.kind==='range')assert.ok(measure.maxMeters>=measure.minMeters);if(measure.sourceURL)assert.equal(new URL(measure.sourceURL).protocol,'https:');
  }
  const mass=record.biological.mass;assert.ok(mass.scope);assert.ok(['range','upper-bound','study-mean-sd'].includes(mass.kind));
  for(const key of['minGrams','maxGrams','meanGrams','sdGrams'])if(key in mass)assert.ok(Number.isFinite(mass[key])&&mass[key]>0);
  if(mass.kind==='range')assert.ok(mass.maxGrams>=mass.minGrams);if(mass.sourceURL)assert.equal(new URL(mass.sourceURL).protocol,'https:');
 }
 const mouse=critterScale('mouse');assert.equal(mouse.length,.18);assert.equal(mouse.biological.measurements[0].axis,'head-body');assert.ok(mouse.biological.measurements[0].maxMeters<mouse.length);
 const frog=critterScale('frog');assert.equal(frog.grams,30);assert.equal(frog.biological.mass.kind,'study-mean-sd');assert.equal(frog.biological.mass.sampleSize,5);assert.ok(!('minGrams' in frog.biological.mass),'SD endpoints must not become a species range');
 const whale=critterScale('whale');assert.equal(whale.biological.mass.kind,'upper-bound');assert.ok(!('minGrams' in whale.biological.mass),'an upper bound cannot invent a lower bound');
});
test('the Asian-elephant reference supports existing geometry and an all-owned lineup retains its full scale ratio',()=>{
 const e=critterScale('elephant');assert.deepEqual([e.length,e.height,e.grams],[6,2.6,5000000]);assert.equal(e.sourceScientificName,'Elephas maximus');
 const body=e.biological.measurements.find(x=>x.axis==='body-length'),height=e.biological.measurements.find(x=>x.axis==='standing-height'),mass=e.biological.mass;
 assert.ok(e.length>=body.minMeters&&e.length<=body.maxMeters);assert.ok(e.height>=height.minMeters&&e.height<=height.maxMeters);assert.ok(e.grams>=mass.minGrams&&e.grams<=mass.maxGrams);
 const sorted=[...CRITTER_SCALE].sort((a,b)=>Math.max(a.length,a.height)-Math.max(b.length,b.height));assert.equal(sorted[0].id,'frog');assert.equal(sorted.at(-1).id,'whale');assert.equal(sorted.at(-1).length/sorted[0].length,300);
 assert.equal(sorted.find(x=>x.id==='mouse').grams,25,'a comparison does not rescale masses to fit its viewport');
});
test('metadata and nested references are immutable, and unknown IDs fail explicitly',()=>{
 assert.ok(Object.isFrozen(CRITTER_SCALE));const original=structuredClone(CRITTERS),e=critterScale('elephant');
 assert.throws(()=>{e.height=3;},TypeError);assert.throws(()=>{e.biological.mass.minGrams=0;},TypeError);assert.throws(()=>{e.biological.measurements.push({});},TypeError);
 assert.throws(()=>critterScale('human'),/Unknown volunteer scale/);assert.deepEqual(CRITTERS,original);
});
