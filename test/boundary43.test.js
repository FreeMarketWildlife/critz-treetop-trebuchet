import{installBoundaryUnion}from'../scripts/boundary-union43.js';
import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{PhysicalHookScene}from'../src/hook-experiment.js';import{advanceBoundaryInterval,jointByTags}from'../scripts/boundary-policy43.js';
const cases=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-43/crossings.json',import.meta.url))).cases;
function restore(id){const entry=cases.find(r=>r.id===id),q=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-43/'+entry.file,import.meta.url))),scene=new PhysicalHookScene(q.p,q.species,q);return{entry,scene,joint:jointByTags(scene,entry.tags)};}
const error=j=>Math.max(0,j.getJointAngle()-j.getUpperLimit(),j.getLowerLimit()-j.getJointAngle());
function model(scene){const bodies=[],joints=[];for(let b=scene.world.getBodyList();b;b=b.getNext()){const shapes=[];for(let f=b.getFixtureList();f;f=f.getNext()){const s=f.getShape();shapes.push({type:s.getType(),vertices:s.m_vertices,center:s.m_p,radius:s.m_radius});}bodies.push({tag:b.getUserData(),mass:b.getMass(),inertia:b.getInertia(),shapes});}for(let j=scene.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint')joints.push({a:j.getBodyA().getUserData(),b:j.getBodyB().getUserData(),enabled:j.isLimitEnabled(),lower:j.getLowerLimit(),upper:j.getUpperLimit()});return JSON.stringify({bodies,joints});}
for(const id of['default-beam-long-frog-0.6','default-stock-snake-0.75','candidate-sling-long-frog-0.6','candidate-stock-snake-0.45'])test(`same real interval resolves anticipated stop without changing model: ${id}`,()=>{
 const a=restore(id),b=restore(id),before=model(b.scene),energy=b.scene.energy(),work=b.scene.dampingWork+b.scene.dragWork+b.scene.assistWork;
 assert.equal(JSON.stringify(a.scene.snapshot()),JSON.stringify(b.scene.snapshot()));a.scene.integrate(a.entry.dt);let allPeak=0;const integrate=b.scene.integrate.bind(b.scene);b.scene.integrate=dt=>{integrate(dt);for(let j=b.scene.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&j.isLimitEnabled())allPeak=Math.max(allPeak,error(j));};const schedule=advanceBoundaryInterval(b.scene,b.entry.dt);
 assert.ok(error(a.joint)>.06);assert.ok(error(b.joint)<.01);assert.equal(schedule.steps.length,2);assert.equal(schedule.budgetFallback,false);assert.ok(allPeak<.05);assert.ok(Math.abs(b.scene.elapsed-a.scene.elapsed)<1e-12);assert.ok(Math.abs(schedule.steps.reduce((n,r)=>n+r.dt,0)-b.entry.dt)<1e-15);assert.equal(model(b.scene),before);assert.ok(b.scene.energy()-energy-((b.scene.dampingWork+b.scene.dragWork+b.scene.assistWork)-work)<=1e-7);assert.equal(b.scene.assistWork,0);
});
test('tiny margin budget exhaustion remains visible; tolerance-scaled event placement avoids it',()=>{
 const tiny=restore('candidate-stock-snake-0.45'),normal=restore('candidate-stock-snake-0.45');const failed=advanceBoundaryInterval(tiny.scene,tiny.entry.dt,{margin:1e-6,target:tiny.joint}),good=advanceBoundaryInterval(normal.scene,normal.entry.dt);
 assert.equal(failed.steps.length,8);assert.equal(failed.budgetFallback,true);assert.ok(error(tiny.joint)>.08);assert.equal(good.budgetFallback,false);assert.equal(good.steps.length,2);assert.ok(error(normal.joint)<.01);
});
test('already outside stop is left to the physical solver, never snapped into bounds',()=>{
 const a=restore('default-sling-long-frog-0.75'),b=restore('default-sling-long-frog-0.75');a.scene.integrate(a.entry.dt);let allPeak=0;const integrate=b.scene.integrate.bind(b.scene);b.scene.integrate=dt=>{integrate(dt);for(let j=b.scene.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&j.isLimitEnabled())allPeak=Math.max(allPeak,error(j));};const schedule=advanceBoundaryInterval(b.scene,b.entry.dt);assert.equal(schedule.steps.length,1);assert.equal(error(b.joint),error(a.joint));assert.ok(error(b.joint)>.035);
});
test('local research domain rejects zero duration and unbounded budgets',()=>{
 const {scene}=restore('candidate-sling-long-frog-0.6'),before=JSON.stringify(scene.snapshot());assert.throws(()=>advanceBoundaryInterval(scene,0));assert.throws(()=>advanceBoundaryInterval(scene,1/600,{budget:9}));assert.throws(()=>advanceBoundaryInterval(scene,1/600,{margin:0}));assert.equal(JSON.stringify(scene.snapshot()),before);
});

test('post-stop resolution preserves coupled limb motion near the fine local reference',()=>{
 const id='candidate-sling-long-frog-0.6',reference=restore(id),short=restore(id),settled=restore(id);for(let i=0;i<64;i++)reference.scene.integrate(reference.entry.dt/64);advanceBoundaryInterval(short.scene,short.entry.dt);const schedule=advanceBoundaryInterval(settled.scene,settled.entry.dt,{settle:2});assert.equal(schedule.steps.length,3);assert.equal(schedule.budgetFallback,false);
 for(const item of[reference,short,settled])for(let i=0;i<96;i++)item.scene.integrate(1/4800);
 function positions(scene){const m=new Map();for(let b=scene.world.getBodyList();b;b=b.getNext())if(b.isDynamic())m.set(JSON.stringify(b.getUserData()),{...b.getWorldCenter()});return m;}
 const ref=positions(reference.scene),delta=scene=>Math.max(...[...positions(scene)].map(([key,p])=>Math.hypot(p.x-ref.get(key).x,p.y-ref.get(key).y)));assert.ok(delta(short.scene)>.02);assert.ok(delta(settled.scene)<.001);
});
test('a work budget too small for the post-stop phase is reported explicitly',()=>{
 const item=restore('candidate-sling-long-frog-0.6'),schedule=advanceBoundaryInterval(item.scene,item.entry.dt,{settle:2,budget:2});assert.equal(schedule.steps.length,2);assert.equal(schedule.budgetFallback,true);assert.ok(Math.abs(schedule.steps.reduce((n,r)=>n+r.dt,0)-item.entry.dt)<1e-15);
});

test('whole-step composition observes every actual integration within time and work caps',()=>{
 const item=restore('candidate-sling-long-frog-0.6'),before=item.scene.elapsed,shape=model(item.scene),dts=[],raw=item.scene.integrate.bind(item.scene);item.scene.integrate=dt=>{dts.push(dt);raw(dt);};const stats=installBoundaryUnion(item.scene,{leadIn:true});item.scene.step(1/600);assert.ok(dts.length<=16);assert.equal(stats.maxOuterActual,dts.length);assert.ok(stats.extraIntegrations<=8);assert.ok(Math.abs(dts.reduce((n,dt)=>n+dt,0)-1/600)<1e-15);assert.ok(Math.abs(item.scene.elapsed-before-1/600)<1e-12);assert.equal(model(item.scene),shape);
});
test('zero extra-work budget preserves original physics and exposes a rejected refinement',()=>{
 const a=restore('candidate-sling-long-frog-0.6'),b=restore('candidate-sling-long-frog-0.6');const stats=installBoundaryUnion(b.scene,{leadIn:true,composeUnion:false,extraBudget:0});a.scene.step(1/600);b.scene.step(1/600);assert.equal(JSON.stringify(a.scene.snapshot()),JSON.stringify(b.scene.snapshot()));assert.equal(stats.extraIntegrations,0);assert.ok(stats.budgetFallbacks>0);
});
