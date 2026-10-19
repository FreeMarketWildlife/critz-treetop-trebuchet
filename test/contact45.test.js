import test from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {canExceedContactSpeed,fixtureContactMotion} from '../scripts/contact-onset45.js';
test('conservative motion gate never omits a query trigger across translated, offset and rotating convex fixtures',()=>{
 let seed=45,skips=0,triggers=0;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 for(let i=0;i<2000;i++){
  const w=new P.World(),offset={x:1000*random(),y:300*random()},bodies=[],fixtures=[];
  for(let j=0;j<2;j++){
   const b=w.createDynamicBody({position:{x:offset.x+j*.04,y:offset.y},angle:random()*6,linearVelocity:{x:random()*6-3,y:random()*6-3},angularVelocity:(random()-.5)*(i%3?10:0)});
   const shape=i%2?P.Box(.03+random()*.3,.03+random()*.1,{x:random()*.1,y:random()*.1}):P.Circle({x:random()*.1,y:random()*.1},.05+random()*.2);
   fixtures.push(b.createFixture(shape,1));bodies.push(b);
  }
  const [fa,fb]=fixtures,c={getFixtureA:()=>fa,getFixtureB:()=>fb,getChildIndexA:()=>0,getChildIndexB:()=>0},motion=fixtureContactMotion(fa,fb);
  const trigger=motion.normalAvailable?motion.closing>3:motion.relativeSpeed>3;
  if(trigger)triggers++;
  if(!canExceedContactSpeed(c)){skips++;assert.equal(trigger,false,`omitted trigger at case ${i}`);}
 }
 assert.ok(skips>100);assert.ok(triggers>100);
});
test('low COM speed cannot exclude a rapidly rotating long fixture',()=>{
 const w=new P.World(),a=w.createDynamicBody({angularVelocity:100}),b=w.createBody({position:{x:0,y:2}}),fa=a.createFixture(P.Box(.02,2),1),fb=b.createFixture(P.Circle(.1));
 assert.equal(canExceedContactSpeed({getFixtureA:()=>fa,getFixtureB:()=>fb,getChildIndexA:()=>0,getChildIndexB:()=>0}),true);
});
