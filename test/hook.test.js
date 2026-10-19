import test from 'node:test';import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {makeCLink,PhysicalHookScene} from '../src/hook-experiment.js';
import {CritterScene} from '../src/articulated.js';
function contactTrial(direction,dt){const w=new P.World({x:0,y:0}),peg=w.createBody();peg.createFixture(P.Circle(.025),{filterCategoryBits:64,filterMaskBits:128});const link=makeCLink(w,P.Vec2(),0);
 for(let i=0;i<1/dt;i++){link.applyForceToCenter({x:direction*.02,y:0},true);w.step(dt,20,12);}return link.getPosition();}
test('open planar C-link retains inward load and releases through real mouth',()=>{
 const retained=contactTrial(-1,1/600),open=contactTrial(1,1/600);assert.ok(Math.hypot(retained.x,retained.y)<.12);assert.ok(open.x>.2);
 const finer=contactTrial(1,1/1200);assert.ok(Math.abs(finer.x-open.x)<.01);
});
test('physical-hook scene preserves contact fixtures and straps while stepping',()=>{
 const s=new PhysicalHookScene();for(let i=0;i<1200;i++)s.step();assert.equal(s.ropes.length,2);for(let f=s.pouch.getFixtureList();f;f=f.getNext())assert.notEqual(f.getFilterMaskBits(),0);assert.ok(Number.isFinite(s.link.getPosition().y));
 const c=s.clone();assert.equal(c.releaseMode,'physical-hook');assert.equal(c.ropes.length,2);
});

test('hook preview excludes winding and retention state clears after recontact',()=>{
 const s=new PhysicalHookScene({mechanicalWinding:true,initialArm:-3});assert.equal(s.predict(),null);
 s.hookOpen=true;s.freeDuration=.009;const peg=s.arm.getWorldPoint(s.link.getUserData().pegLocal);
 s.link.setPosition(peg);s.step();assert.equal(s.hookOpen,false);assert.equal(s.freeDuration,0);
});

function forceLoad(scene){
 for(let i=0;i<600;i++)scene.step();const torso=scene.parts.find(b=>b.getUserData().id==='torso')??scene.parts[0];
 assert.ok(scene.grab(torso.getWorldCenter()));
 for(let i=0;i<600;i++){scene.move({x:-4.3,y:297});scene.step();}
 for(let i=0;i<1200;i++){const cup=scene.pouch.getPosition();scene.move({x:cup.x,y:cup.y+.85});scene.step();}
 scene.drop();for(let i=0;i<300;i++)scene.step();assert.ok(scene.isLoaded());return scene;
}
test('C-link geometry has overlapping solid beads, initial peg clearance and a real open mouth',()=>{
 const w=new P.World();const link=makeCLink(w,P.Vec2());const beads=[];
 for(let f=link.getFixtureList();f;f=f.getNext()){const shape=f.getShape();beads.push(shape);assert.ok(Math.hypot(shape.m_p.x,shape.m_p.y)-shape.m_radius-.025>.02);}
 beads.sort((a,b)=>Math.atan2(a.m_p.y,a.m_p.x)-Math.atan2(b.m_p.y,b.m_p.x));
 for(let i=1;i<beads.length;i++)assert.ok(Math.hypot(beads[i].m_p.x-beads[i-1].m_p.x,beads[i].m_p.y-beads[i-1].m_p.y)<beads[i].m_radius+beads[i-1].m_radius);
 const first=beads[0],last=beads.at(-1);assert.ok(Math.hypot(first.m_p.x-last.m_p.x,first.m_p.y-last.m_p.y)-first.m_radius-last.m_radius>.06);
 assert.throws(()=>makeCLink(w,P.Vec2(),0,{span:140}),/mouth/);assert.throws(()=>new PhysicalHookScene({hookAngle:NaN}),/hook angle/);
 assert.throws(()=>new PhysicalHookScene({hookAttachmentAngle:180}),/solid C-link/);
});
test('contact release tagging preserves solver velocities and all physical fixtures',()=>{
 const scene=forceLoad(new PhysicalHookScene());scene.unlatch();let previous=null;
 for(let i=0;i<3000&&!scene.release;i++){previous=scene.snapshot();scene.step();}
 assert.ok(scene.release);const reference=new PhysicalHookScene(scene.p,scene.rig.id,previous);
 // Run identical dynamics with only the observational release detector omitted.
 CritterScene.prototype.step.call(reference);
 for(const key of Object.keys(scene.center()))assert.ok(Math.abs(scene.center()[key]-reference.center()[key])<1e-9);assert.equal(scene.ropes.length,2);
 for(let i=0;i<scene.parts.length;i++){const a=scene.parts[i].getLinearVelocity(),b=reference.parts[i].getLinearVelocity();assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-9);assert.ok(Math.abs(scene.parts[i].getAngularVelocity()-reference.parts[i].getAngularVelocity())<1e-9);}
 for(let f=scene.pouch.getFixtureList();f;f=f.getNext())assert.notEqual(f.getFilterMaskBits(),0);
});
test('contact hook prediction clones the complete loaded state and matches equivalent launch',()=>{
 const live=forceLoad(new PhysicalHookScene()),before=live.snapshot(),hint=live.predict();assert.deepEqual(live.snapshot(),before);assert.ok(hint.release);assert.ok(hint.points.length>1);
 const actual=live.clone();actual.unlatch();for(let i=0;i<3000&&!actual.release;i++)actual.step();assert.deepEqual(actual.release,hint.release);
});
