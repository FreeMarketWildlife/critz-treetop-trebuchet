import test from 'node:test';
import assert from 'node:assert/strict';
import {config,initialState,step,energy,geometry,simulate,ballistic,tension,predict} from '../src/physics.js';
test('unreleased conservative mechanism conserves mechanical energy',()=>{
 const p=config();let s=initialState(p),e=energy(s,p),drift=0;
 for(let i=0;i<900;i++){s=step(s,p);drift=Math.max(drift,Math.abs(energy(s,p)-e));}
 assert.ok(drift<1e-5,`energy drift ${drift} J`);
});
test('release inherits mechanism velocity and preserves ballistic continuity',()=>{
 const r=simulate();assert.equal(r.reason,'release pin');assert.ok(r.release.vx>0 && r.release.vy>0);
 assert.deepEqual(r.release,geometry(r.frames.at(-1).state,r.p).projectile);
 assert.deepEqual(ballistic(r.release,0),r.release);
 const t=2,b=ballistic(r.release,t);assert.equal(b.x,r.release.x+r.release.vx*t);
 assert.equal(b.vy,r.release.vy-r.p.gravity*t);
});
test('halving timestep converges release velocity within sampling tolerance',()=>{
 const a=simulate({},.001),b=simulate({},.0005);
 assert.ok(Math.abs(a.time-b.time)<=.001);
 assert.ok(Math.hypot(a.release.vx-b.release.vx,a.release.vy-b.release.vy)<.2);
});
test('sling length and arm lengths remain constrained while tension is positive',()=>{
 const r=simulate();for(const f of r.frames){assert.ok(tension(f.state,r.p)>=0);
 assert.ok(Math.abs(Math.hypot(f.projectile.x-f.tip.x,f.projectile.y-f.tip.y)-r.p.sling)<1e-10);}
});
test('repeat launches deterministic; parameters affect physical outcome',()=>{
 assert.deepEqual(simulate(),simulate());
 assert.notDeepEqual(simulate({counterMass:80}).release,simulate().release);
 assert.throws(()=>config({projectileMass:0}));assert.throws(()=>simulate({},-1));
});
test('gravity scaling gives the expected square-root velocity scaling',()=>{
 const p=config(),s=initialState(p);let a=s,b=s;
 for(let i=0;i<800;i++){a=step(a,p,.001);b=step(b,config({gravity:p.gravity*4}),.0005);}
 assert.ok(Math.abs(a[0]-b[0])<1e-10);assert.ok(Math.abs(a[1]-b[1])<1e-10);
 assert.ok(Math.abs(b[2]-2*a[2])<1e-10);assert.ok(Math.abs(b[3]-2*a[3])<1e-10);
});

test('beam geometry updates mass and inertia, and critter mass changes release',()=>{
 const base=simulate(),long=simulate({longArm:4}),heavy=simulate({projectileMass:2});
 assert.notDeepEqual(base.release,long.release);assert.notDeepEqual(base.release,heavy.release);
 for(const r of [long,heavy]){assert.ok(r.release);assert.ok(r.frames.every(f=>f.state.every(Number.isFinite)));}
});

test('prediction does not mutate parameters or live state; matches equivalent launch',()=>{
 const input={counterMass:130,longArm:3.4},p=config(input),live=initialState(p),before=[...live],copy={...input};
 const hint=predict(input),actual=simulate(input);
 assert.deepEqual(input,copy);assert.deepEqual(live,before);assert.deepEqual(hint.release,actual.release);
 assert.deepEqual(hint.points.at(-1),ballistic(actual.release,.8,p.gravity));
});
