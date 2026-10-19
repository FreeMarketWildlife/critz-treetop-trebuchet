import{installStopSolver,installInnerStopSolver}from'../scripts/stop-solver42.js';
import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import * as P from'../node_modules/planck/dist/planck.mjs';import{PhysicalHookScene}from'../src/hook-experiment.js';import{flightStopArrival,installJointPolicy}from'../scripts/joint-policy42.js';
function scene(angle,speed){const world=new P.World(P.Vec2(0,0)),a=world.createDynamicBody(),b=world.createDynamicBody({angle,angularVelocity:speed});for(const body of[a,b]){body.setUserData({role:'part'});body.createFixture(P.Box(.2,.02),1);}world.createJoint(new P.RevoluteJoint({bodyA:a,bodyB:b,localAnchorA:P.Vec2(),localAnchorB:P.Vec2(),referenceAngle:0,enableLimit:true,lowerAngle:-.5,upperAngle:.5,collideConnected:false}));return{world,phase:'flight'};}
test('free angular-stop arrival is selected, while receding and distant rotations are not',()=>{
 assert.equal(flightStopArrival(scene(.48,20),1/600),true);assert.equal(flightStopArrival(scene(.48,-20),1/600),false);assert.equal(flightStopArrival(scene(0,20),1/600),false);
 const loading=scene(.48,20);loading.phase='loading';assert.equal(flightStopArrival(loading,1/600),false);
});
test('joint and contact refinement share one bounded standard-tick budget and do not assign state',()=>{
 const q=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-41/earlier-incoming.json',import.meta.url))),s=new PhysicalHookScene(q.p,q.species,q),before=JSON.stringify(s.snapshot());flightStopArrival(s,1/600);assert.equal(JSON.stringify(s.snapshot()),before);let inner=0;const integrate=s.integrate.bind(s);s.integrate=dt=>{assert.ok(dt>=1/4800-1e-15&&dt<=1/600);inner++;integrate(dt);};installJointPolicy(s,8);for(let i=0;i<600;i++)s.step();assert.ok(inner>600&&inner<=4800);assert.equal(s.assistWork,0);
});

test('targeted iteration overrides restore existing and absent settings after a thrown step',()=>{
 const s=scene(.48,20);s.p={solverPositionIterations:12,marker:'preserve'};s.step=()=>{throw Error('expected test failure');};const before={...s.p};installStopSolver(s,{position:24,velocity:40});assert.throws(()=>s.step(),/expected test failure/);assert.deepEqual(s.p,before);
});
test('inner iteration overrides restore settings after normal and thrown integrations',()=>{
 for(const fail of[false,true]){const s=scene(.48,200);s.p={solverPositionIterations:12};const before={...s.p};let called=false;s.integrate=()=>{called=true;assert.equal(s.p.solverPositionIterations,48);assert.equal(s.p.solverVelocityIterations,40);if(fail)throw Error('expected inner failure');};s.step=dt=>s.integrate(dt);installInnerStopSolver(s,{position:48,velocity:40});if(fail)assert.throws(()=>s.step(),/expected inner failure/);else s.step();assert.ok(called);assert.deepEqual(s.p,before);}
});
