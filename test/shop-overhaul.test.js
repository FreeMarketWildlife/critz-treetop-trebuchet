import test from 'node:test';import assert from 'node:assert/strict';
import {STARTER,SIXTY_CM_STARTER,scaledPreset,buildFacts} from '../src/build-catalog.js';
import {newProgress,validateProgress} from '../src/build-progress.js';
import {rigStats,shopComparison} from '../src/shop-comparison.js';
import {capacityAdjustedBuild} from '../src/capacity-controls.js';
test('starter shrinking changes world geometry, body-to-opening ratio, torque and inertia',()=>{
 const old=rigStats(SIXTY_CM_STARTER),now=rigStats(STARTER);assert.equal(now.height,.48);assert.equal(now.opening,.14);assert.ok(.09/now.opening>.09/old.opening);assert.ok(now.torque<old.torque);assert.ok(now.inertia<old.inertia);assert.ok(now.potential<old.potential);
});
test('large sling preview exposes capacity and moving mass while purchase policy retains the working rig',()=>{
 const before=structuredClone(STARTER),preview=shopComparison(STARTER,{kind:'part',id:'hammock'});assert.equal(preview.fit.fitted,false);assert.equal(preview.candidate.sling,'hammock');assert.ok(preview.rows.find(r=>r.label==='Cargo capacity').changed);assert.ok(preview.rows.find(r=>r.label==='Payload + pouch + cords').changed);assert.deepEqual(STARTER,before);assert.deepEqual(preview.fit.build,before);
});
test('an old exact default migrates once; its named custom geometry, earned progress and blueprint survive',()=>{
 const raw={...newProgress(),starterRevision:6,bells:321,build:{...SIXTY_CM_STARTER},blueprints:[{...SIXTY_CM_STARTER,name:'Keep this rig'}]};const next=validateProgress(raw);assert.equal(next.build.pivotHeight,.48);assert.equal(next.bells,321);assert.equal(next.blueprints[0].pivotHeight,.6);assert.deepEqual(validateProgress(next),next);const custom=validateProgress({...raw,build:{...SIXTY_CM_STARTER,pouchWidth:.21}});assert.equal(custom.build.pivotHeight,.6);assert.equal(custom.build.pouchWidth,.21);
});
test('chipmunk widening is explicit, reversible and bounded by the fitted sling; heavier presets have growing SI dimensions',()=>{
 const base={...STARTER,animal:'chipmunk'};assert.ok(buildFacts(base).warnings.some(w=>w.includes('too small')));const widened=capacityAdjustedBuild(base,'sling',{pouchWidth:.19,slingLength:base.slingLength});assert.ok(!buildFacts(widened).warnings.some(w=>w.includes('too small')));assert.equal(base.pouchWidth,.14);assert.throws(()=>capacityAdjustedBuild(base,'sling',{pouchWidth:100,slingLength:base.slingLength}));const rabbit=scaledPreset('rabbit'),elephant=scaledPreset('elephant');assert.ok(rabbit.pivotHeight>STARTER.pivotHeight);assert.ok(elephant.pivotHeight>rabbit.pivotHeight);assert.ok(rigStats(elephant).inertia>rigStats(rabbit).inertia);
});
