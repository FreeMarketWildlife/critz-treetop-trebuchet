import test from 'node:test';
import assert from 'node:assert/strict';
import {createBuildRenderer} from '../src/build-art.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER,scaledPreset,critter} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
import {spaceWorldDescriptor,escapeAltitude} from '../src/space-policy.js';

const map=createGroveMap();
function completed(animal='mouse'){
 const a=critter(animal),threshold=escapeAltitude(map),release={x:0,y:2,vx:10,vy:15,time:1,speed:Math.hypot(10,15),angle:Math.atan2(15,10)*180/Math.PI,energy:.5*a.grams/1000*325,reason:'Release ring cleared the pin'};
 const sim=new BuildSimulation(animal==='mouse'?STARTER:scaledPreset(animal),{map});
 sim.restoreSpaceEscape({version:1,world:spaceWorldDescriptor(map),threshold,altitude:threshold,time:100,payload:{x:500,y:threshold-map.launch.y,vx:10,vy:20,angle:.7,omega:2},distance:500,height:threshold-map.launch.y,release,failure:'',grams:a.grams,animal});
 return sim;
}
function canvasAt(size){
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:30})},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 return{dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>size};
}
function clock(run){
 let ms=100;const beforeTime=Object.getOwnPropertyDescriptor(globalThis,'performance'),beforeDpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>ms},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});
 try{run(delta=>ms+=delta);}finally{Object.defineProperty(globalThis,'performance',beforeTime);if(beforeDpr)Object.defineProperty(globalThis,'devicePixelRatio',beforeDpr);else delete globalThis.devicePixelRatio;}
}
function onScreen(canvas,size){const[x,y]=JSON.parse(canvas.dataset.animalPoint);assert.ok(x>size.width*.3&&x<size.width*.7,`horizontal ${x}/${size.width}`);assert.ok(y>size.height*.3&&y<size.height*.7,`vertical ${y}/${size.height}`);}

test('restored mouse and giant completion are visible on their first desktop and phone frame, including paused',()=>clock(()=>{
 for(const size of[{width:1726,height:819},{width:390,height:844},{width:320,height:667},{width:844,height:390}])for(const animal of['mouse','elephant'])for(const paused of[false,true]){
  const canvas=canvasAt(size),renderer=createBuildRenderer(canvas),sim=completed(animal),before=sim.snapshot();renderer.draw(sim,{labels:false,paused});
  onScreen(canvas,size);assert.equal(renderer.camera.followAcquisition.age,.55,'a completed run starts already acquired');assert.equal(canvas.dataset.cameraMode,'payload');assert.equal(canvas.dataset.landingVisible,'false');assert.equal(canvas.dataset.flightCue,'');
  assert.deepEqual(sim.snapshot(),before,'framing cannot move or advance the restored body');
 }
}));
test('restored drift remains visible through pause, resize, manual fit and retry',()=>clock(tick=>{
 const size={width:390,height:844},canvas=canvasAt(size),renderer=createBuildRenderer(canvas),sim=completed();renderer.draw(sim,{labels:false});
 for(let i=0;i<60;i++){tick(1000/60);sim.step(1/60);renderer.draw(sim,{labels:false});onScreen(canvas,size);}
 const camera=renderer.camera;tick(30000);renderer.draw(sim,{labels:false,paused:true});assert.deepEqual(renderer.camera,camera);
 size.width=1726;size.height=819;renderer.fit(false);renderer.draw(sim,{labels:false,paused:true});onScreen(canvas,size);
 renderer.fit();renderer.draw(sim,{labels:false,paused:true});onScreen(canvas,size);assert.equal(renderer.camera.followAcquisition.age,.55);
 const retry=new BuildSimulation(STARTER,{map});tick(1000/60);renderer.draw(retry,{labels:false});assert.equal(canvas.dataset.cameraMode,'rig');assert.equal(canvas.dataset.cameraAcquire,'0');
}));
