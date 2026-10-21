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
  const p=sim.real(sim.shot);const camera=renderer.camera,point=JSON.parse(canvas.dataset.animalPoint);assert.ok(Math.abs(camera.x-p.x-camera.followMotion.x*390/camera.scale)<1e-10);assert.ok(Math.abs(camera.y-p.y-camera.followMotion.y*844/camera.scale)<1e-10);assert.ok(point[0]>390*.3&&point[0]<390*.7);assert.ok(point[1]>844*.3&&point[1]<844*.7);
 }finally{Object.defineProperty(globalThis,'performance',oldTime);if(oldDpr)Object.defineProperty(globalThis,'devicePixelRatio',oldDpr);else delete globalThis.devicePixelRatio;}
});
