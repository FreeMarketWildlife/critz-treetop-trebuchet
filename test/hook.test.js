import test from 'node:test';import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {makeCLink,PhysicalHookScene} from '../src/hook-experiment.js';
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
