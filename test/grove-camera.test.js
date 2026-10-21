import test from 'node:test';import assert from 'node:assert/strict';
import {groveSetupCamera,groveFlightCamera,groveProject} from '../src/grove-camera.js';
import {STARTER,CRITTERS,scaledPreset} from '../src/build-catalog.js';
test('release keeps its screen position and acquires exact position tracking without velocity input',()=>{
 for(const [width,height]of [[390,844],[1031,738],[320,667]])for(const animal of CRITTERS){
  const size={width,height,animalLength:animal.length};
  const origin={x:2,y:3,scale:Math.min(width,height)*.15/animal.length};
  let payload={x:origin.x-animal.length*.7,y:origin.y+animal.length*.4};
  const releaseScreen=groveProject(payload,origin,width,height);
  let camera=groveFlightCamera(origin,payload,{...size,dt:0});
  assert.ok(Math.abs(groveProject(payload,camera,width,height).x-releaseScreen.x)<1e-9);
  assert.ok(Math.abs(groveProject(payload,camera,width,height).y-releaseScreen.y)<1e-9);
  let distance=Infinity;
  for(let i=1;i<=180;i++){
   // Motion can reverse sharply after an impact; framing must not trail behind.
   payload={x:origin.x+Math.sin(i*.7)*900,y:origin.y+Math.cos(i*.3)*300};
   camera=groveFlightCamera(camera,payload,{...size,dt:1/60});
   const p=groveProject(payload,camera,width,height),next=Math.hypot(p.x-width/2,p.y-height/2);
   assert.ok(next<=distance+1e-7);distance=next;
   if(i>=34)assert.deepEqual(p,{x:width/2,y:height/2});
  }
  assert.ok(Math.abs(camera.scale*animal.length/Math.min(width,height)-.09)<1e-8);
 }
});
test('acquisition follows active time across frame rates and is stable while paused',()=>{
 const size={width:390,height:844,animalLength:.18},payload={x:1,y:2,vx:24,vy:-8},initial={x:0,y:0,scale:160};
 const at=hz=>{let c=groveFlightCamera(initial,payload,{...size,dt:0});for(let i=0;i<hz*.4;i++)c=groveFlightCamera(c,payload,{...size,dt:1/hz});return c;};
 const slow=at(30),fast=at(120);
 for(const key of ['x','y','scale'])assert.ok(Math.abs(slow[key]-fast[key])<1e-9,`${key} differs by frame rate`);
 assert.deepEqual(groveFlightCamera(slow,payload,{...size,dt:0}),slow);
 assert.deepEqual(groveFlightCamera(slow,payload,{...size,dt:NaN}),slow);
 const pause=groveFlightCamera(initial,payload,{...size,dt:0});
 assert.ok(Math.abs(pause.x-initial.x)<1e-12);assert.ok(Math.abs(pause.y-initial.y)<1e-12);assert.equal(pause.scale,initial.scale);
});
test('resizing preserves acquisition progress and normalized framing, then completes without lag',()=>{
 const payload={x:2,y:1},initial={x:0,y:3,scale:90};
 let c=groveFlightCamera(initial,payload,{width:1031,height:738,animalLength:.18,dt:0});
 for(let i=0;i<12;i++)c=groveFlightCamera(c,payload,{width:1031,height:738,animalLength:.18});
 const before=groveProject(payload,c,1031,738),fraction={x:before.x/1031,y:before.y/738};
 c=groveFlightCamera(c,payload,{width:390,height:844,animalLength:.18,dt:0});
 const after=groveProject(payload,c,390,844);
 assert.ok(Math.abs(after.x/390-fraction.x)<1e-9);assert.ok(Math.abs(after.y/844-fraction.y)<1e-9);
 for(let i=0;i<30;i++)c=groveFlightCamera(c,payload,{width:390,height:844,animalLength:.18});
 assert.equal(c.x,payload.x);assert.equal(c.y,payload.y);
});
test('strong flight reveals upcoming terrain while weak flight keeps the critter larger',()=>{
 for(const [width,height]of[[390,844],[1031,738],[320,667]])for(const animalLength of [.18,30]){
  const size={width,height,animalLength},scale=Math.min(width,height)*.07/animalLength;
  const settle=(vx,vy)=>{const p={x:50,y:30,vx,vy};let c=groveFlightCamera({x:50,y:30,scale},p,{...size,dt:0});for(let i=0;i<240;i++)c=groveFlightCamera(c,p,{...size,dt:1/60});return{c,p,screen:groveProject(p,c,width,height)};};
  const weak=settle(0,0),strong=settle(width/scale*8,-height/scale*3);
  assert.ok(Math.abs(weak.c.scale*animalLength/Math.min(width,height)-.09)<1e-9);
  assert.ok(Math.abs(strong.c.scale*animalLength/Math.min(width,height)-.07)<1e-9);
  assert.ok(strong.screen.x>width*.329&&strong.screen.x<width*.34,'forward flight leaves more room ahead');
  assert.ok(strong.screen.y>height*.39&&strong.screen.y<height*.405,'falling flight reveals the next surface below');
  assert.equal(weak.screen.x,width/2);assert.equal(weak.screen.y,height/2);
 }
});
test('rebound reversals ease look-ahead without clipping or positional chase lag',()=>{
 const size={width:390,height:844,animalLength:.18},base=390*.07/.18;
 let p={x:0,y:0,vx:390/base*8,vy:844/base*3},c=groveFlightCamera({x:0,y:0,scale:base},p,{...size,dt:0});
 for(let i=0;i<120;i++){p={...p,x:p.x+p.vx/60,y:p.y+p.vy/60};c=groveFlightCamera(c,p,size);}
 const before=groveProject(p,c,390,844);
 p={...p,vx:-p.vx,vy:-p.vy};p={...p,x:p.x+p.vx/60,y:p.y+p.vy/60};
 c=groveFlightCamera(c,p,size);let point=groveProject(p,c,390,844);
 assert.ok(point.x<390/2,'camera does not instantly flip lead on rebound');
 assert.ok(Math.abs(point.x-before.x)<11);assert.ok(Math.abs(point.y-before.y)<15);
 for(let i=0;i<180;i++){
  p={...p,x:p.x+p.vx/60,y:p.y+p.vy/60};c=groveFlightCamera(c,p,size);point=groveProject(p,c,390,844);
  assert.ok(point.x>=390*.329&&point.x<=390*.671);assert.ok(point.y>=844*.399&&point.y<=844*.601);
 }
 assert.ok(point.x>390*.66,'view settles toward new travel direction');
 // Steady framing depends on the screen offset, never on accumulated world lag.
 const offset={x:c.x-p.x,y:c.y-p.y};p={...p,x:p.x-1000,y:p.y+2000};
 c=groveFlightCamera(c,p,{...size,dt:0});
 assert.ok(Math.abs(c.x-p.x-offset.x)<1e-10);assert.ok(Math.abs(c.y-p.y-offset.y)<1e-10);
});
test('moving framing pauses, resizes and uses reduced-motion centered readability',()=>{
 const size={width:390,height:844,animalLength:.18},p={x:5,y:10,vx:24,vy:-15};
 let c=groveFlightCamera({x:0,y:2,scale:160},p,{...size,dt:0});for(let i=0;i<25;i++)c=groveFlightCamera(c,p,size);
 assert.deepEqual(groveFlightCamera(c,p,{...size,dt:0}),c);
 const before=groveProject(p,c,390,844),resized=groveFlightCamera(c,p,{width:1031,height:738,animalLength:.18,dt:0}),after=groveProject(p,resized,1031,738);
 assert.ok(Math.abs(before.x/390-after.x/1031)<1e-10);assert.ok(Math.abs(before.y/844-after.y/738)<1e-10);
 const calm=groveFlightCamera(c,p,{...size,reducedMotion:true});
 assert.equal(calm.x,p.x);assert.equal(calm.y,p.y);assert.deepEqual(calm.followMotion,{x:0,y:0});assert.equal(calm.scale,390*.07/.18);
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
 assert.ok(Math.abs(c.scale-210)<1e-9);assert.equal(c.y,-50);
 assert.throws(()=>groveFlightCamera({scale:1},{x:0,y:NaN},{width:1000,height:600,animalLength:.2}));
});

test('whole-tree framing preserves physical proportions in portrait and landscape',async()=>{
 const {groveTreeCamera}=await import('../src/grove-camera.js');const {createGroveMap}=await import('../src/grove-map.js');const map=createGroveMap();for(const [width,height]of[[390,844],[1031,738]]){const c=groveTreeCamera(map,{width,height});assert.ok(map.tree.height*c.scale<height*.85);assert.ok(map.tree.crownRadius*2*c.scale<width);assert.equal((map.tree.trunkWidth*c.scale)/(map.tree.height*c.scale),280/800);assert.ok(c.scale<1);}
});

test('compact launcher occupies half the landscape height and over forty percent in portrait',()=>{for(const [width,height]of[[1031,738],[390,844],[320,667]]){const c=groveSetupCamera(STARTER,{width,height}),fraction=(STARTER.pivotHeight+STARTER.longArm*Math.sin(1))*c.scale/height;assert.ok(fraction>=.40&&fraction<=.501,`${width}: ${fraction}`);assert.ok(.18*c.scale>=Math.min(width,height)*.04,'mouse remains at least four percent of the shorter viewport dimension');}});
