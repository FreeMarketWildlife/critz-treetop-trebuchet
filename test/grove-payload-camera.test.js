import test from 'node:test';
import assert from 'node:assert/strict';
import {createBuildRenderer} from '../src/build-art.js';
import {BuildSimulation} from '../src/build-physics.js';
import {scaledPreset} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';

function longestFixtureSide(sim){
 const points=[];for(let fixture=sim.shot.getFixtureList();fixture;fixture=fixture.getNext()){
  const shape=fixture.getShape();for(const point of shape.m_vertices.slice(0,shape.m_count))points.push({x:point.x*sim.L,y:point.y*sim.L});
 }
 return Math.max(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)));
}
function harness(width,height,run){
 let ms=0;const oldTime=Object.getOwnPropertyDescriptor(globalThis,'performance'),oldDpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio'),oldMotion=Object.getOwnPropertyDescriptor(globalThis,'matchMedia');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>ms},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});Object.defineProperty(globalThis,'matchMedia',{value:()=>({matches:false}),configurable:true});
 const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:50})},{get:(target,key)=>target[key]??(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
 const canvas={dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width,height})},renderer=createBuildRenderer(canvas);
 try{return run({canvas,renderer,frame:sim=>{ms+=1000/30;const before=sim.snapshot();renderer.draw(sim,{labels:false,pixelRatio:1});assert.deepEqual(sim.snapshot(),before,'camera/rendering cannot change the physical fixture state');}});}
 finally{Object.defineProperty(globalThis,'performance',oldTime);if(oldDpr)Object.defineProperty(globalThis,'devicePixelRatio',oldDpr);else delete globalThis.devicePixelRatio;if(oldMotion)Object.defineProperty(globalThis,'matchMedia',oldMotion);else delete globalThis.matchMedia;}
}

test('shared runtime flight camera uses twelve percent of the actual compound fixture side on phone and desktop',()=>{
 for(const [width,height]of[[390,844],[1612,1006]])for(const animal of['mouse','elephant'])harness(width,height,({canvas,renderer,frame})=>{
  // Controlled free-flight fixture: this isolates lens behavior from whether a
  // particular authored route or optional launch recipe successfully releases.
  const sim=new BuildSimulation(scaledPreset(animal),{map:createGroveMap()});assert.equal(sim.fire(),true);sim.detach('controlled flight camera fixture');
  const longest=longestFixtureSide(sim),expected=Math.min(width,height)*.12/longest;
  for(let i=0;i<600;i++)frame(sim);
  assert.ok(Math.abs(renderer.camera.scale-expected)<1e-8,`${animal}: actual runtime reaches the hitbox-derived physical scale`);
  for(let i=0;i<120;i++){
   sim.shot.setLinearVelocity({x:(i%2?100:-100)*sim.T/sim.L,y:(i%3?-30:30)*sim.T/sim.L});
   sim.shot.setTransform(sim.shot.getPosition(),i*.27);frame(sim);
   assert.ok(Math.abs(renderer.camera.scale*longest/Math.min(width,height)-.12)<1e-10,'speed, reversal and physical rotation retain one screen footprint');
   const [x,y]=JSON.parse(canvas.dataset.animalPoint);assert.ok(x>=width*.25&&x<=width*.75&&y>=height*.25&&y<=height*.75);
  }
  assert.equal(canvas.dataset.cameraMode,'payload');
 });
});
