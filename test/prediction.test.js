import test from 'node:test';import assert from 'node:assert/strict';
import {PhysicalHookScene} from '../src/hook-experiment.js';import {createPredictionJob} from '../src/prediction.js';
import {load,waitForContact} from '../scripts/measure-hook.js';
function ready(){const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5});assert.ok(load(s));waitForContact(s);return s;}
test('budgeted prediction preserves source and matches canonical physical release',()=>{
 const s=ready(),before=s.snapshot(),expected=s.predict(),job=createPredictionJob(s);let slices=0;
 while(!job.done){job.advance({maxSteps:37,budgetMs:1000});slices++;assert.ok(slices<200);}
 assert.ok(slices>1);assert.deepEqual(s.snapshot(),before);assert.deepEqual(job.result.release,expected.release);assert.ok(job.result.points.length<=17);assert.ok(job.stats.flightTicks<=480);
});
test('prediction budget/cancellation is bounded and grips never start a job',()=>{
 const s=ready(),job=createPredictionJob(s,{now:()=>0});job.advance({maxSteps:1,budgetMs:1});assert.equal(job.stats.launchTicks,1);job.cancel();assert.equal(job.result,null);job.advance();assert.equal(job.stats.launchTicks,1);
 const root=s.parts.find(b=>b.getUserData().id==='torso');s.grab(root.getWorldCenter());assert.equal(createPredictionJob(s),null);s.drop();s.phase='winding';assert.equal(createPredictionJob(s),null);
 assert.throws(()=>createPredictionJob(ready()).advance({maxSteps:Infinity}));
});
