import test from 'node:test';import assert from 'node:assert/strict';import {createFlightCamera} from '../src/camera.js';
test('look-ahead camera keeps fast/reversing flight visible across responsive sizes without changing state',()=>{
 const camera=createFlightCamera();
 for(const [width,height]of [[960,480],[480,600],[960,480]])for(const [vx,vy]of [[300,-150],[-300,150],[0,-100],[0,0]]){
  const c=Object.freeze({x:30,y:150,vx,vy}),p=camera.update(c,{width,height,scale:42,dt:.016});
  const x=width/2+(c.x-p.x)*42,y=height/2-(c.y-p.y)*42;assert.ok(x>=width*.33&&x<=width*.67);assert.ok(y>=height*.31&&y<=height*.69);
 }
});
test('ground framing leaves visible floor and reduced motion removes look-ahead offset',()=>{
 const camera=createFlightCamera(),p=camera.update({x:20,y:.2,vx:10,vy:-40},{width:960,height:480,scale:42,reducedMotion:true});assert.equal(p.x,20);assert.ok(Math.abs((480/2+p.y*42)-480*.75)<1e-10);
 const air=camera.update({x:25,y:100,vx:-100,vy:-100},{width:960,height:480,scale:42,reducedMotion:true});assert.deepEqual(air,{x:25,y:100});
 assert.throws(()=>camera.update({x:0,y:NaN},{width:480,height:600,scale:42}));
});
