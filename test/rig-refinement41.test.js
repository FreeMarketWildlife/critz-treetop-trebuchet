import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{PhysicalHookScene}from'../src/hook-experiment.js';import{installRigPolicy,mechanismRegion}from'../scripts/rig-policy41.js';
const snapshot=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-41/earlier-incoming.json',import.meta.url)));
function measure(factor){const scene=new PhysicalHookScene(snapshot.p,snapshot.species,snapshot),initial=JSON.stringify(scene.snapshot());
 mechanismRegion(scene,1/600,true);assert.equal(JSON.stringify(scene.snapshot()),initial,'risk observation must not change state');
 installRigPolicy(scene,factor,true);let anchor=0,rope=0,inner=0;const integrate=scene.integrate.bind(scene);
 scene.integrate=dt=>{assert.ok(dt<=1/600);integrate(dt);inner++;for(let j=scene.world.getJointList();j;j=j.getNext()){const a=j.getAnchorA(),b=j.getAnchorB(),gap=Math.hypot(a.x-b.x,a.y-b.y);if(j.getType()==='revolute-joint')anchor=Math.max(anchor,gap);if(j.getType()==='rope-joint')rope=Math.max(rope,gap-j.getMaxLength());}};
 for(let i=0;i<600;i++)scene.step();return{scene,anchor,rope,inner};}
test('same pre-impact rig state reproduces real separation and bounded contact refinement reduces it',()=>{
 const baseline=measure(1),candidate=measure(8);assert.ok(baseline.anchor>.25&&baseline.rope>.2);
 assert.ok(candidate.anchor<.05&&candidate.rope<.01,JSON.stringify({anchor:candidate.anchor,rope:candidate.rope}));assert.ok(candidate.inner>600&&candidate.inner<=4800);
 assert.equal(candidate.scene.assistWork,0);assert.equal(candidate.scene.p.loadingConstraintSubsteps,true,'snapshot retains explicit experimental provenance');
});
