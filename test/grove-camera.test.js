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
 const rig=(c.pivotHeight+c.shortArm)*camera.scale;assert.ok(rig<=size.height*.501);
 const preview=groveSetupCamera(c,{...size,preview:true});assert.ok(preview.scale>0);
 }}
});
test('reduced motion changes scale immediately; invalid payload dimensions are rejected',()=>{
 const c=groveFlightCamera({scale:3},{x:12,y:-50},{width:1000,height:600,animalLength:.2,reducedMotion:true});
 assert.ok(Math.abs(c.scale-150)<1e-9);assert.equal(c.y,-50);
 assert.throws(()=>groveFlightCamera({scale:1},{x:0,y:NaN},{width:1000,height:600,animalLength:.2}));
});

test('whole-tree framing preserves physical proportions in portrait and landscape',async()=>{
 const {groveTreeCamera}=await import('../src/grove-camera.js');const {createGroveMap}=await import('../src/grove-map.js');const map=createGroveMap();for(const [width,height]of[[390,844],[1031,738]]){const c=groveTreeCamera(map,{width,height});assert.ok(map.tree.height*c.scale<height*.85);assert.ok(map.tree.crownRadius*2*c.scale<width);assert.equal((map.tree.trunkWidth*c.scale)/(map.tree.height*c.scale),280/800);assert.ok(c.scale<1);}
});

test('compact launcher occupies half the landscape height and over forty percent in portrait',()=>{for(const [width,height]of[[1031,738],[390,844],[320,667]]){const c=groveSetupCamera(STARTER,{width,height}),fraction=(STARTER.pivotHeight+STARTER.longArm*Math.sin(1))*c.scale/height;assert.ok(fraction>=.40&&fraction<=.501,`${width}: ${fraction}`);assert.ok(.18*c.scale>=Math.min(width,height)*.04,'mouse remains at least four percent of the shorter viewport dimension');}});
