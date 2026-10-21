import test from 'node:test';import assert from 'node:assert/strict';
import {createGroveMap,createCrownGroveMap,readGroveMap,validateGroveMap,enemyRecipe} from '../src/grove-map.js';
import {JUNGLE_LAYERS} from '../src/grove-jungle.js';
import {BuildSimulation} from '../src/build-physics.js';import {STARTER,CRITTERS} from '../src/build-catalog.js';
import {ORDINARY_LEAF_LENGTH,ordinaryLeafHalfLength} from '../src/grove-nature.js';
test('individual foliage has a fixed mouse-scale length, independent of zoom and animal',()=>{
 assert.equal(ORDINARY_LEAF_LENGTH,CRITTERS.find(a=>a.id==='mouse').length);
 for(const seed of[-100,-1,-.5,0,.5,1,100]){const length=ordinaryLeafHalfLength(seed)*2;assert.ok(length>=.1&&length<=.1800001);}
});
test('each botanical stratum has editable solid spring routes and a real collision bounce',()=>{
 const map=validateGroveMap(createGroveMap());assert.equal(map.starterRevision,7);
 for(const band of JUNGLE_LAYERS){const routes=map.objects.filter(o=>o.id.startsWith(`jungle-${band.id}-bough-`));assert.equal(routes.length,18);const o=routes[6],a=o.points[0],b=o.points[1],x=(a.x+b.x)/2,y=(a.y+b.y)/2,s=new BuildSimulation({...STARTER,drag:0},{map:{...map,objects:[o]}});s.fire();s.shot.setPosition({x:x/s.L,y:(y+1)/s.L});s.shot.setLinearVelocity({x:0,y:-5*s.T/s.L});s.detach('Layer bounce test');let hit=false,upward=false;for(let i=0;i<120;i++){s.step(1/240);hit||=s.contactEvents.some(e=>e.id===o.id);upward||=hit&&s.real(s.shot).vy>1;}assert.ok(hit,band.id);assert.ok(upward,`${band.id}: physical restitution sends the critter up`);}
 assert.ok(map.objects.filter(o=>o.id.includes('-vine-')&&o.collision&&o.type==='chain').length>=20);
 for(const o of map.objects.filter(o=>o.type==='enemy'))assert.equal(o.radius,enemyRecipe(o.kind).radius);
});
test('untouched crown layouts upgrade, while edited geometry, names and bounce settings survive',()=>{
 const previous=createCrownGroveMap(),read=value=>readGroveMap({getItem:()=>JSON.stringify(value)});assert.deepEqual(read(previous),validateGroveMap(createGroveMap()));
 for(const edit of[m=>m.objects[0].points[0].x-=.25,m=>m.name='My tree',m=>m.objects[0].bounce=.91]){const custom=structuredClone(previous);edit(custom);assert.deepEqual(read(custom),validateGroveMap(custom));}
});
