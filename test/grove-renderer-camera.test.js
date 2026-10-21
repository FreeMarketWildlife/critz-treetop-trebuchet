import test from'node:test';import assert from'node:assert/strict';
import{createBuildRenderer}from'../src/build-art.js';import{BuildSimulation}from'../src/build-physics.js';import{STARTER}from'../src/build-catalog.js';import{createGroveMap}from'../src/grove-map.js';
test('renderer resize notifications preserve a released follow camera instead of refitting the launcher',()=>{
 let ms=0,size={width:1031,height:738};const oldTime=Object.getOwnPropertyDescriptor(globalThis,'performance'),oldDpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>ms},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:50})},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 try{
  const canvas={dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>size},renderer=createBuildRenderer(canvas),sim=new BuildSimulation(STARTER,{map:createGroveMap()});renderer.draw(sim,{labels:false});sim.fire();while(!sim.release)sim.step(1/120);
  for(let i=0;i<14;i++){ms+=1000/60;sim.step(1/60);renderer.draw(sim,{labels:false});}
  const before=renderer.camera;assert.ok(before.followAcquisition.age>0&&before.followAcquisition.age<.55);
  size={width:390,height:844};renderer.fit(false);renderer.draw(sim,{labels:false,paused:true});assert.deepEqual(renderer.camera.followAcquisition,before.followAcquisition);assert.deepEqual(renderer.camera.followMotion,before.followMotion);
  for(let i=0;i<40;i++){ms+=1000/60;sim.step(1/60);renderer.draw(sim,{labels:false});}
  const p=sim.real(sim.shot);const camera=renderer.camera,point=JSON.parse(canvas.dataset.animalPoint);assert.ok(Math.abs(camera.x-p.x-camera.followMotion.x*390/camera.scale)<1e-10);assert.ok(Math.abs(camera.y-p.y-camera.followMotion.y*844/camera.scale)<1e-10);assert.ok(point[0]>390*.25&&point[0]<390*.75);assert.ok(point[1]>844*.25&&point[1]<844*.75);
 }finally{Object.defineProperty(globalThis,'performance',oldTime);if(oldDpr)Object.defineProperty(globalThis,'devicePixelRatio',oldDpr);else delete globalThis.devicePixelRatio;}
});


async function withCameraHarness({width=390,height=844,reducedMotion=false}={},run){
 let ms=0,size={width,height};const oldTime=Object.getOwnPropertyDescriptor(globalThis,'performance'),oldDpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio'),oldMotion=Object.getOwnPropertyDescriptor(globalThis,'matchMedia');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>ms},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});Object.defineProperty(globalThis,'matchMedia',{value:()=>({matches:reducedMotion}),configurable:true});
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:50})},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const canvas={dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>size},renderer=createBuildRenderer(canvas);
 try{return await run({canvas,renderer,frame:()=>{ms+=1000/60;},resize:(width,height)=>{size={width,height};renderer.fit(false);}});}
 finally{Object.defineProperty(globalThis,'performance',oldTime);if(oldDpr)Object.defineProperty(globalThis,'devicePixelRatio',oldDpr);else delete globalThis.devicePixelRatio;if(oldMotion)Object.defineProperty(globalThis,'matchMedia',oldMotion);else delete globalThis.matchMedia;}
}
test('real starter and scaled sling arcs stay visible and already track the payload before pin release',async()=>{
 const {SCALE_BUILDS}=await import('../src/scale-builds.js'),{createLaunchFeel}=await import('../src/launch-feel.js');
 for(const {id,build}of SCALE_BUILDS)for(const [width,height]of[[390,844],[1031,738]])await withCameraHarness({width,height},({canvas,renderer,frame})=>{
  const sim=new BuildSimulation(build,{map:createGroveMap()}),silent=new BuildSimulation(build,{map:createGroveMap()}),feel=createLaunchFeel(),silentFeel=createLaunchFeel();renderer.draw(sim,{labels:false});const setup=renderer.camera;sim.fire();silent.fire();let tracked=0,released=false;
  for(let i=0;i<400;i++){
   frame();const state=feel.advance(sim,1/60);silentFeel.advance(silent,1/60);renderer.draw(sim,{labels:false,feel:state});
   assert.deepEqual(sim.snapshot(),silent.snapshot(),'render tracking never changes the physical solver');
   const c=renderer.camera,p=sim.real(sim.shot),point=JSON.parse(canvas.dataset.animalPoint);
   if(sim.phase==='swing'){
    assert.equal(canvas.dataset.cameraMode,'sling');assert.equal(c.scale,setup.scale,'the complete rig and payload retain one fixed swing lens');
    assert.ok(point[0]>0&&point[0]<width&&point[1]>height*.12&&point[1]<height*.88,`${id}: sling payload remains visible`);
    if(c.swingAcquisition.age>=.55){tracked++;assert.ok(Math.abs(c.x-p.x)<1e-10);assert.ok(Math.abs(c.y-p.y)<1e-10);}
   }else if(sim.release){
    const previousPoint=renderer.project(p);assert.equal(canvas.dataset.cameraMode,'payload');assert.equal(c.followAcquisition.age,0);assert.ok(Math.abs(previousPoint[0]-point[0])<=2.4&&Math.abs(previousPoint[1]-point[1])<=1.6,'only independent release shake changes the steady projection');
    assert.ok(Math.abs(c.x-p.x)<1e-10&&Math.abs(c.y-p.y)<1e-10,'release continues this frame’s real payload motion without a one-frame camera stall');
    assert.ok(Math.abs(previousPoint[0]-width/2)<1e-8&&Math.abs(previousPoint[1]-height/2)<1e-8);released=true;break;
   }
  }
  assert.ok(tracked>15,`${id}: actual pre-release follow exercised`);assert.ok(released,`${id}: real pin release exercised`);
 });
});
test('swing camera pauses, resizes, retries and respects follow, preview and overview controls',async()=>{
 const {createLaunchFeel}=await import('../src/launch-feel.js');await withCameraHarness({},({canvas,renderer,frame,resize})=>{
  const sim=new BuildSimulation(STARTER,{map:createGroveMap()}),feel=createLaunchFeel();renderer.draw(sim,{labels:false});sim.fire();
  for(let i=0;i<15;i++){frame();renderer.draw(sim,{labels:false,feel:feel.advance(sim,1/60)});}
  const before=renderer.camera,p=sim.real(sim.shot),screen=renderer.project(p);frame();renderer.draw(sim,{labels:false,paused:true,feel:feel.state()});assert.deepEqual(renderer.camera,before);
  resize(1031,738);renderer.draw(sim,{labels:false,paused:true,feel:feel.state()});const after=renderer.project(p);assert.deepEqual(renderer.camera.swingAcquisition,before.swingAcquisition);assert.ok(Math.abs(screen[0]/390-after[0]/1031)<1e-10);assert.ok(Math.abs(screen[1]/844-after[1]/738)<1e-10);
  renderer.overview();frame();renderer.draw(sim,{labels:false,paused:true});assert.equal(canvas.dataset.cameraMode,'tree');renderer.overview();renderer.draw(sim,{labels:false,paused:true});assert.equal(canvas.dataset.cameraMode,'sling');
  const retry=new BuildSimulation(STARTER,{map:createGroveMap()});renderer.draw(retry,{labels:false});assert.equal(canvas.dataset.cameraMode,'rig');assert.equal(renderer.camera.swingAcquisition,undefined);
  retry.fire();const setup=renderer.camera;retry.step(.05);frame();renderer.draw(retry,{labels:false,follow:false});assert.deepEqual(renderer.camera,setup);assert.equal(canvas.dataset.cameraMode,'rig');
  renderer.draw(retry,{preview:true});assert.equal(renderer.camera.swingAcquisition,undefined);assert.equal(canvas.dataset.cameraMode,'rig');
 });
});
test('reduced-motion sling tracking stays centered without zoom or acquisition animation',async()=>{
 const {createLaunchFeel}=await import('../src/launch-feel.js');await withCameraHarness({reducedMotion:true},({renderer,frame})=>{
  const sim=new BuildSimulation(STARTER,{map:createGroveMap()}),feel=createLaunchFeel();renderer.draw(sim);const scale=renderer.camera.scale;sim.fire();for(let i=0;i<30;i++){frame();renderer.draw(sim,{labels:false,feel:feel.advance(sim,1/60)});const p=sim.real(sim.shot);assert.equal(renderer.camera.x,p.x);assert.equal(renderer.camera.y,p.y);assert.equal(renderer.camera.scale,scale);}
 });
});

test('assisted-loaded starter and large recipes keep actual partial and full slings in frame',async()=>{
 const {createScaleBuild}=await import('../src/scale-builds.js'),{createPayloadLoading}=await import('../src/payload-loading.js'),{createLaunchFeel}=await import('../src/launch-feel.js');
 for(const id of['small','large'])for(const draw of[.4,1])await withCameraHarness({},({canvas,renderer,frame})=>{
  const sim=new BuildSimulation(createScaleBuild(id),{map:createGroveMap()}),dt=1/120;sim.setDraw(0);const loading=sim.loading=createPayloadLoading(sim);assert.equal(loading.loadKeyboard(),true);
  let stable=0;for(let i=0;i<480&&stable<.25;i++){loading.step(dt);stable=loading.loaded?stable+dt:0;}assert.ok(stable>=.25);
  for(let i=0;i<3600&&sim.drawFraction+1e-9<draw;i++){sim.wind(dt);loading.step(dt);}
  stable=0;for(let i=0;i<480&&stable<.25;i++){loading.step(dt);stable=loading.loaded?stable+dt:0;}assert.ok(stable>=.25);assert.ok(sim.drawFraction+1e-9>=draw);
  renderer.draw(sim,{labels:false});const scale=renderer.camera.scale;assert.equal(sim.fire(),true);const feel=createLaunchFeel();
  for(let i=0;i<480&&!sim.release;i++){frame();renderer.draw(sim,{labels:false,feel:feel.advance(sim,1/60)});const point=JSON.parse(canvas.dataset.animalPoint);assert.ok(point[0]>0&&point[0]<390&&point[1]>844*.12&&point[1]<844*.88,`${id}/${draw}: actual loaded payload stays in frame`);if(!sim.release)assert.equal(renderer.camera.scale,scale);}
  assert.ok(sim.release,`${id}/${draw}: current assisted loading reaches a real release`);assert.equal(sim.failure,'');assert.equal(renderer.camera.followAcquisition.age,0);
 });
});
