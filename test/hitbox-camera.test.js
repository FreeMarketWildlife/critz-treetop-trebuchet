import test from 'node:test';
import assert from 'node:assert/strict';
import {critterHitboxBounds,addCritterFixtures} from '../src/critter-body.js';
import {groveFlightCamera} from '../src/grove-camera.js';
import {CRITTERS} from '../src/build-catalog.js';
import {World} from '../vendor/planck/planck.mjs';

test('camera bounds match actual fixture vertices for every species and tall proportions',()=>{
 for(const animal of [...CRITTERS,{...CRITTERS[0],length:.1,width:2}]){
  const body=new World().createDynamicBody();addCritterFixtures(body,animal);
  const points=[];for(let f=body.getFixtureList();f;f=f.getNext())points.push(...f.getShape().m_vertices);
  const longest=Math.max(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)));
  assert.ok(Math.abs(critterHitboxBounds(animal).longestSide-longest)<1e-12);
 }
});
test('hitbox framing settles at twelve percent independently of species, speed and landing',()=>{
 for(const [width,height]of [[1612,1006],[390,844]])for(const animal of [...CRITTERS,{...CRITTERS[0],length:.1,width:2}]){
  const longest=critterHitboxBounds(animal).longestSide;
  for(const vx of [0,100]){
   const options={width,height,hitboxLongestSide:longest},payload={x:10,y:20,vx,vy:-30};
   let camera={x:0,y:0,scale:20};
   for(let i=0;i<1200;i++)camera=groveFlightCamera(camera,payload,{...options,landing:{id:'ground',x:15,y:0,eta:.2}});
   assert.ok(Math.abs(camera.scale*longest/Math.min(width,height)-.12)<1e-8);
   assert.deepEqual(groveFlightCamera(camera,payload,{...options,dt:0}),camera);
   const calm=groveFlightCamera(camera,payload,{...options,reducedMotion:true});
   assert.ok(Math.abs(calm.scale*longest/Math.min(width,height)-.12)<1e-12);
  }
 }
});


test('settled hitbox lens stays fixed through speed reversals and entering or leaving landing context',()=>{
 const options={width:390,height:844,hitboxLongestSide:.18},scale=390*.12/.18;
 let camera={x:10,y:2,scale},payload={x:10,y:2,vx:0,vy:0};
 const landings=[null,{id:'near',x:10.1,y:1.9,eta:.1},{id:'far',x:1000,y:-1000,eta:.65},null];
 for(let i=0;i<360;i++){
  payload={x:payload.x+(i%2?1:-1),y:payload.y+.1,vx:i%2?100:-100,vy:i%3?30:-30};
  const landing=landings[Math.floor(i/30)%landings.length];camera=groveFlightCamera(camera,payload,{...options,landing});
  assert.ok(Math.abs(camera.scale-scale)<1e-10,'speed and local contact framing cannot pump the fixed lens');
  const snapshot=structuredClone(camera);assert.deepEqual(groveFlightCamera(camera,payload,{...options,landing,dt:0}),snapshot);
 }
});
test('hitbox dimensions are validated even if a legacy animal length is also supplied',()=>{
 for(const hitboxLongestSide of[0,-1,NaN,Infinity,null])assert.throws(()=>groveFlightCamera({x:0,y:0,scale:10},{x:1,y:2},{width:390,height:844,animalLength:.18,hitboxLongestSide}));
});
