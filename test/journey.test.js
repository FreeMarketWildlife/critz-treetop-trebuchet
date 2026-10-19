import test from 'node:test';import assert from 'node:assert/strict';
import {biomeAt,createJourneyTracker} from '../src/journey.js';
test('authored flight bands announce first visits once and avoid boundary chatter',()=>{
 const j=createJourneyTracker();assert.equal(j.update('loading',300).changed,false);assert.equal(j.update('flight',300).changed,false);
 assert.equal(j.update('flight',244).changed,false);let sky=j.update('flight',240);assert.equal(sky.biome.label,'Open sky');assert.equal(sky.firstVisit,true);
 assert.equal(j.update('flight',246).changed,false);j.update('flight',250);assert.equal(j.update('flight',240).firstVisit,false);
 assert.equal(j.update('flight',110).biome.label,'Jungle canopy');assert.equal(j.update('flight',2).biome.label,'Forest floor');assert.equal(j.update('flight',6).changed,false);
 assert.equal(biomeAt(300).id,'grandfatherTree');assert.throws(()=>j.update('flight',NaN));
});
