import test from 'node:test';import assert from 'node:assert/strict';
import {biomeAt,createJourneyTracker} from '../src/journey.js';
test('authored flight bands announce first visits once and avoid boundary chatter',()=>{
 const j=createJourneyTracker();assert.equal(j.update('loading',300).changed,false);assert.equal(j.update('flight',300).changed,false);
 assert.equal(j.update('flight',361).changed,false);let sky=j.update('flight',365);assert.equal(sky.biome.label,'Storm sky');assert.equal(sky.firstVisit,true);
 assert.equal(j.update('flight',359).changed,false);j.update('flight',355);assert.equal(j.update('flight',365).firstVisit,false);
 assert.equal(j.update('flight',180).biome.label,'Jungle canopy');assert.equal(j.update('flight',60).biome.label,'Grimroot forest floor');assert.equal(j.update('flight',121).changed,false);
 assert.equal(biomeAt(300).id,'grandfatherTree');assert.throws(()=>j.update('flight',NaN));
});
