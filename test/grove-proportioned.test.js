import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGroveMap,createProportionedGroveMap,createV4Revision1GroveMap,createV3GroveMap,createLegacyGroveMap,createCrownGroveMap,createAncientGroveMap,createOpeningGroveMap,createLandmarkedGroveMap,validateGroveMap,readGroveMap,saveGroveMap,MAP_KEY,enemyRecipe,objectBounds,mapLevels} from '../src/grove-map.js';
import {PROPORTIONED_TREE,PROPORTIONED_LAUNCH_Y} from '../src/grove-proportioned.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
const generators=[createLegacyGroveMap,createCrownGroveMap,createAncientGroveMap,createOpeningGroveMap,createLandmarkedGroveMap,createV3GroveMap];
const hashes=['fe02893b8c360795163adc8c0199422c5ff22635659da83f8455593ff6513f1f','cb48bb94bd21893cf65ed25d3c4298c1e3a4e1da608f020e84b752b1dddde64e','9638335a15c1bd887f45e60c87d884728cccecc6eb78d7f90c1e727e477f2d5a','fe7a0ca61a634b0a8faa802fc8bd0bd13401f156dd86e1f7817bfbca23761ddd','34c907806c91f7a9091f57703e67ddd78ec8a6b63c8d88ce4c0c08323446f988','9701b3107734d3023129705e1c90358a52f3128af86e61875a61b1e7333d98e7'];
const store=raw=>({raw,writes:0,getItem(k){assert.equal(k,MAP_KEY);return this.raw??null;},setItem(k,v){assert.equal(k,MAP_KEY);this.raw=v;this.writes++;}});
const canonical=()=>validateGroveMap(createGroveMap());

test('V4 default has a proportioned oak, rooted forest trees and thin editable landing faces',()=>{
 const m=canonical();assert.equal(m.version,4);assert.equal(m.height,3000);assert.equal(m.width,20000);assert.equal(m.launch.y,32);assert.equal(PROPORTIONED_LAUNCH_Y,32);assert.deepEqual(m.tree,PROPORTIONED_TREE);assert.deepEqual(m,createProportionedGroveMap());
 assert.equal(readGroveMap(store()),null);assert.deepEqual(readGroveMap(store())??createGroveMap(),m);
 assert.deepEqual(mapLevels(m).map(l=>[l.low,l.high]),[[0,8],[8,45],[45,110],[110,960],[960,3000]]);
 for(const o of m.objects){const b=objectBounds(o);assert.ok(b.minY>=-32-1e-9,`${o.id} stays above the floor`);if(o.type==='enemy')assert.equal(o.radius,enemyRecipe(o.kind).radius);}
 for(const o of m.objects.filter(o=>o.id.startsWith('opening-skip-'))){const[a,b,c,d]=o.points;assert.ok(b.x-a.x<=8);assert.ok(Math.abs(a.y-d.y-.18)<1e-9);assert.ok(Math.abs(b.y-c.y-.18)<1e-9);assert.equal(o.collision,true);assert.equal(o.layer,'world');}
 for(const i of[0,1,2,3]){const trunk=m.objects.find(o=>o.id===`amazon-tree-${i}-trunk`),crown=m.objects.find(o=>o.id===`amazon-tree-${i}-crown`),b=objectBounds(trunk);assert.equal(b.minY,-32);assert.equal(b.maxY+32,[40,35,45,60][i]);assert.equal(trunk.collision,false);assert.equal(crown.collision,false);assert.equal(crown.layer,'back');}
});

test('every prior starter generator stays byte-identical and only untouched defaults migrate on read',()=>{
 for(const[i,make]of generators.entries()){
  const original=make(),raw=JSON.stringify(original),s=store(raw);assert.equal(createHash('sha256').update(raw).digest('hex'),hashes[i]);assert.deepEqual(readGroveMap(s),canonical());assert.equal(s.raw,raw);assert.equal(s.writes,0);
  const edits=[m=>{m.name='My authored grove';},m=>{m.objects.find(o=>o.points).points[0].x-=.01;},m=>{m.objects[0].bounce=.41;},m=>{m.objects[0].collision=false;},m=>{m.objects[0].layer='back';},m=>{m.tree.trunkX-=.01;},m=>{m.objects.find(o=>o.type==='enemy').kind='bird';},m=>{m.objects.pop();}];
  for(const edit of edits){const changed=structuredClone(original);edit(changed);const raw=JSON.stringify(changed),s=store(raw);assert.deepEqual(readGroveMap(s),validateGroveMap(changed));assert.equal(s.raw,raw);assert.equal(s.writes,0);}
 }
});

test('edited V4 maps round-trip without startup writes and malformed bytes remain recoverable',()=>{
 const custom=createGroveMap();custom.name='My oak path';custom.tree.height=105;custom.objects[0].points[0].x-=.25;const s=store();assert.deepEqual(saveGroveMap(s,custom),validateGroveMap(custom));const raw=s.raw,writes=s.writes;assert.deepEqual(readGroveMap(s),validateGroveMap(custom));assert.equal(s.raw,raw);assert.equal(s.writes,writes);
 for(const raw of['{broken','{}',JSON.stringify({...custom,version:5}),JSON.stringify({...custom,launch:{x:0,y:600}}),JSON.stringify({...custom,tree:{...custom.tree,height:800}}),JSON.stringify({...custom,height:1500})]){const s=store(raw);assert.equal(readGroveMap(s),null);assert.equal(s.raw,raw);assert.equal(s.writes,0);}
});

function fire(map,animal,draw){const s=new BuildSimulation({...STARTER,animal},{map});s.setDraw(draw);assert.equal(s.fire(),true);for(let i=0;i<1200&&!s.release&&s.phase==='swing';i++)s.step(1/240);assert.ok(s.release);return s;}
test('proportioned scenery preserves the existing launcher release for all starter species',()=>{
 for(const animal of['mouse','frog','chipmunk'])for(const draw of[.5,.75,1]){const before=fire(createV3GroveMap(),animal,draw),after=fire(createGroveMap(),animal,draw);for(const k of['x','y','vx','vy','angle','time','speed','energy'])assert.ok(Math.abs(before.release[k]-after.release[k])<1e-9,`${animal}/${draw}/${k}`);assert.equal(after.release.reason,before.release.reason);}
});

test('the retained first proportioned revision keeps its original raw opening route',()=>{
 for(const draw of[.5,.75,1]){const s=fire(createV4Revision1GroveMap(),'mouse',draw);for(let i=0;i<3600&&s.phase==='flight';i++)s.step(1/120);assert.equal(s.failure,'');assert.equal(s.phase,'finished');assert.ok(s.time<20);assert.ok(s.real(s.shot).y>=-32);if(draw===1){assert.equal(new Set(s.contactEvents.filter(e=>e.id.startsWith('opening-skip-')).map(e=>e.id)).size,4);assert.ok(s.real(s.shot).x>60);}}
});
