import test from 'node:test';import assert from 'node:assert/strict';
import {PhysicalHookScene} from '../src/hook-experiment.js';import {createPredictionJob,capturePredictionPose,predictionPoseIsCurrent,predictionAdvice} from '../src/prediction.js';
import {load,waitForContact} from '../scripts/measure-hook.js';
function ready(){const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,collisionSubsteps:true,collisionStepHz:2400});assert.ok(load(s));waitForContact(s);return s;}
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

test('displayed prediction expires against its original moving pose, not the next job capture',()=>{
 let elapsed=4,x=0,angle=0;
 const body={getUserData:()=>({id:'torso'}),getPosition:()=>({x,y:0}),getAngle:()=>angle},scene={get elapsed(){return elapsed;},parts:[body]};
 const first=capturePredictionPose(scene);assert.equal(predictionPoseIsCurrent(scene,first),true);
 x=.19;const next=capturePredictionPose(scene);assert.equal(predictionPoseIsCurrent(scene,first),true);
 x=.21;assert.equal(predictionPoseIsCurrent(scene,first),false);assert.equal(predictionPoseIsCurrent(scene,next),true);
 x=0;angle=.41;assert.equal(predictionPoseIsCurrent(scene,first),false);angle=0;elapsed=5.01;assert.equal(predictionPoseIsCurrent(scene,first),false);
 elapsed=3;assert.equal(predictionPoseIsCurrent(scene,first),false);assert.equal(predictionPoseIsCurrent(scene,null),false);
});

test('mechanical advice uses observed release and names only the clipped obstacle',()=>{
 assert.equal(predictionAdvice(null),'');assert.equal(predictionAdvice({release:{center:{vx:NaN,vy:0}}}), '');
 assert.match(predictionAdvice({release:{center:{vx:-2,vy:4}}}), /2.0 m\/s backward/);
 assert.match(predictionAdvice({release:{center:{vx:2,vy:4}},obstacle:'launch branch'}), /before the launch branch/);
 assert.doesNotMatch(predictionAdvice({release:{center:{vx:8,vy:12}}}), /bells|points|bounce|range/i);
});
