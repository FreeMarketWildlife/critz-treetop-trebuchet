import test from 'node:test';import assert from 'node:assert/strict';
import {groveSetupCamera,groveFlightCamera,groveProject} from '../src/grove-camera.js';
import {STARTER,CRITTERS,scaledPreset} from '../src/build-catalog.js';
test('flight camera hard locks every animal even during high-speed reversals and zoom',()=>{
 for(const [width,height]of [[390,844],[1031,738],[320,667]])for(const animal of CRITTERS){
  let camera={x:0,y:0,scale:1};
  for(let i=0;i<180;i++){
   const payload={x:Math.sin(i)*900,y:Math.cos(i)*300};
   camera=groveFlightCamera(camera,payload,{width,height,animalLength:animal.length});
   assert.deepEqual(groveProject(payload,camera,width,height),{x:width/2,y:height/2});
  }
  assert.ok(Math.abs(camera.scale*animal.length/Math.min(width,height)-.05)<1e-8);
 }
});
test('setup and preview frame physically scaled complete rigs without distorting animals',()=>{
 for(const animal of CRITTERS){const c=scaledPreset(animal.id,'anchored');for(const size of [{width:390,height:844},{width:1031,height:738}]){
 const camera=groveSetupCamera(c,size);assert.ok(camera.scale>0&&Number.isFinite(camera.y));
 const rig=(c.pivotHeight+c.shortArm)*camera.scale;assert.ok(rig<=size.height*.221);
 const preview=groveSetupCamera(c,{...size,preview:true});assert.ok(preview.scale>camera.scale);
 }}
});
test('reduced motion changes scale immediately; invalid payload dimensions are rejected',()=>{
 const c=groveFlightCamera({scale:3},{x:12,y:-50},{width:1000,height:600,animalLength:.2,reducedMotion:true});
 assert.ok(Math.abs(c.scale-150)<1e-9);assert.equal(c.y,-50);
 assert.throws(()=>groveFlightCamera({scale:1},{x:0,y:NaN},{width:1000,height:600,animalLength:.2}));
});
