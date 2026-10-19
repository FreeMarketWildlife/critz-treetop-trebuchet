import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import * as P from '../node_modules/planck/dist/planck.mjs';import{PhysicalHookScene}from'../src/hook-experiment.js';
import{mechanismRegion}from'../scripts/rig-policy41.js';import{mechanismArrival}from'../scripts/rig-policy42.js';
function world(){return{phase:'flight',world:new P.World(P.Vec2(0,0))};}
function body(s,role,x,y,shape,{angle=0,spin=0,velocity={x:0,y:0},dynamic=true}={}){
 const b=dynamic?s.world.createDynamicBody({position:P.Vec2(x,y),angle,angularVelocity:spin,linearVelocity:velocity}):s.world.createBody({position:P.Vec2(x,y),angle});b.setUserData({role});b.createFixture(shape,{density:1});return b;
}
test('both fixture angular sweeps cover two rods closing without COM translation',()=>{
 const s=world();body(s,'frame',0,0,P.Box(2,.03),{angle:Math.PI/2,spin:-100});body(s,'arm',.7,0,P.Box(2,.03),{angle:Math.PI/2,spin:100});
 assert.equal(mechanismRegion(s,1/600,true),false,'one angular sweep misses the combined arrival');assert.equal(mechanismArrival(s,1/600),true);
});
test('a fast rotating animal approaching a stationary mechanism is an arrival',()=>{
 const s=world();body(s,'frame',0,0,P.Circle(.05));body(s,'part',.3,0,P.Box(2,.03),{angle:Math.PI/2,spin:100});
 assert.equal(mechanismRegion(s,1/600,true),false);assert.equal(mechanismArrival(s,1/600),true);
 assert.equal(mechanismArrival(s,1/600,null,{selectedMotionOnly:true}),false,'matched old motion coverage remains separately measurable');
});
test('common translation alone does not close an isolated physical gap',()=>{
 const s=world(),a=body(s,'frame',0,0,P.Circle(.05),{velocity:{x:80,y:0}}),b=body(s,'arm',.4,0,P.Circle(.05),{velocity:{x:80,y:0}});
 assert.equal(mechanismRegion(s,1/600,true),true);assert.equal(mechanismArrival(s,1/600),false);const gap=b.getPosition().x-a.getPosition().x;s.world.step(1/600);assert.ok(Math.abs(b.getPosition().x-a.getPosition().x-gap)<1e-12);
});
test('overlapping diagonal AABBs do not imply an imminent fixture contact',()=>{
 const s=world();body(s,'frame',0,0,P.Box(3,.03),{angle:Math.PI/4,velocity:{x:3,y:0}});body(s,'static',0,1,P.Box(3,.03),{angle:Math.PI/4,dynamic:false});
 assert.equal(mechanismRegion(s,1/600,true),true);assert.equal(mechanismArrival(s,1/600),false);
});
test('actual retained scene is unchanged by shape-distance and motion observation',()=>{
 const q=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-41/earlier-incoming.json',import.meta.url))),s=new PhysicalHookScene(q.p,q.species,q),before=JSON.stringify(s.snapshot());assert.equal(typeof mechanismArrival(s,1/600),'boolean');assert.equal(JSON.stringify(s.snapshot()),before);
});
