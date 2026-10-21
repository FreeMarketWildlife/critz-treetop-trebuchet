import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,createOpeningGroveMap,validateGroveMap,readGroveMap,saveGroveMap,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
function flight(map,draw){const s=new BuildSimulation(STARTER,{map});s.setDraw(draw);s.fire();for(let i=0;i<60*50&&s.phase!=='finished';i++)s.step(1/60);return s;}
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} / ${b}`);

test('landing landmarks are small editable backdrop shapes with no hidden contact',()=>{
 const map=validateGroveMap(createGroveMap()),before=validateGroveMap(createOpeningGroveMap()),landmarks=map.objects.filter(o=>o.id.startsWith('opening-landmark-'));
 assert.equal(map.starterRevision,7);assert.equal(landmarks.length,20);assert.equal(map.objects.length,before.objects.length+24);
 for(const o of landmarks){assert.equal(o.collision,false);assert.equal(o.layer,'back');assert.ok(['polygon','circle'].includes(o.type));if(o.type==='circle')assert.ok(o.radius<=.23);}
 for(const id of ['opening-skip-1','opening-skip-2','opening-skip-3','opening-skip-4','launch-bough'])assert.deepEqual(map.objects.find(o=>o.id===id),before.objects.find(o=>o.id===id));
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};saveGroveMap(storage,map);assert.deepEqual(readGroveMap(storage),map);
 const sim=new BuildSimulation(STARTER,{map});assert.equal(sim.mapBodies.length,map.objects.filter(o=>o.collision&&!['foliage','sap'].includes(o.material)).length);assert.equal(sim.worldObjects.filter(o=>o.id.startsWith('opening-landmark-')&&o.collision).length,0);
});

test('only an untouched revision-five opening receives landmarks and the low route',()=>{
 const old=createOpeningGroveMap(),raw=JSON.stringify(old);let value=raw,writes=0;const storage={getItem:()=>value,setItem:()=>writes++};
 assert.deepEqual(readGroveMap(storage),validateGroveMap(createGroveMap()));assert.equal(writes,0);assert.equal(value,raw);
 for(const edit of [m=>{m.name='My sunrise opening';},m=>{m.objects.find(o=>o.id==='opening-skip-1').points[0].y+=.02;},m=>{m.objects.find(o=>o.id==='opening-skip-2').bounce=.8;},m=>{m.objects.find(o=>o.material==='foliage').density+=.1;}]){
  const changed=structuredClone(old);edit(changed);value=JSON.stringify(changed);assert.deepEqual(readGroveMap(storage),validateGroveMap(changed));
 }
});

test('the low route replaces a medium throw’s empty fall with distinct physical rebounds',()=>{
 const before=flight(createOpeningGroveMap(),.75),after=flight(createGroveMap(),.75),events=after.contactEvents;
 assert.equal(after.phase,'finished');assert.equal(after.failure,'');assert.ok(events.some(e=>e.id==='opening-rescue-mat'));assert.ok(events.some(e=>e.id==='opening-rest-terrace'));
 const first=events.find(e=>e.id==='opening-rescue-mat'),terrace=events.find(e=>e.id==='opening-rest-terrace');assert.ok(first.time>5&&first.time<6);assert.ok(terrace.time-first.time<2);assert.ok(after.maxX>before.maxX);assert.ok(after.time<before.time);
 assert.ok(after.time<12,'the alternative route settles instead of adding a long vertical tail');assert.ok(events.every(e=>!e.id.startsWith('opening-landmark-')));
});

test('the landing route leaves weak journeys, four opening rebounds and every release intact',()=>{
 for(const draw of[.5,.75,1]){
  const a=flight(createOpeningGroveMap(),draw),b=flight(createGroveMap(),draw);assert.equal(b.failure,'');assert.equal(b.phase,'finished');
  for(const key of['x','y','vx','vy','angle','speed','time','energy'])near(a.release[key],b.release[key],`${draw} release ${key}`);
  if(draw===.5){near(a.maxX,b.maxX,`${draw} range`);near(a.time,b.time,`${draw} duration`);assert.deepEqual(a.contactEvents.map(e=>e.id),b.contactEvents.map(e=>e.id));}if(draw===1){assert.deepEqual(a.contactEvents.slice(0,4).map(e=>e.id),b.contactEvents.slice(0,4).map(e=>e.id));assert.ok(b.time<25);}
 }
});
