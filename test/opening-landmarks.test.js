// Retained V3 world: these archived art/contact/journey regressions deliberately
// keep their original geometry. V4 coverage lives in grove-proportioned and scale tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createV3GroveMap as createGroveMap,createGroveMap as createCurrentGroveMap,createOpeningGroveMap,validateGroveMap,readGroveMap,saveGroveMap,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
function flight(map,draw){const s=new BuildSimulation(STARTER,{map});s.setDraw(draw);s.fire();for(let i=0;i<60*50&&s.phase!=='finished';i++)s.step(1/60);return s;}

// These are controlled fixture probes, not claims that the new 0.6 m rig
// repeats the archived rig's natural four-skip route.
function dropOn(map,o,collision=true){
 const [a,b]=o.points,x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 const sim=new BuildSimulation({...STARTER,drag:0},{map:{...map,objects:[{...o,collision}]}});
 sim.fire();sim.shot.setTransform({x:x/sim.L,y:(y+1)/sim.L},0);sim.shot.setLinearVelocity({x:0,y:-4*sim.T/sim.L});sim.shot.setAngularVelocity(0);sim.detach('Controlled authored-surface probe');
 let rebound=-Infinity;for(let i=0;i<240;i++){sim.step(1/240);if(sim.contactEvents.length)rebound=Math.max(rebound,sim.real(sim.shot).vy);}
 return{sim,rebound,top:y};
}

const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} / ${b}`);

test('landing landmarks are small editable backdrop shapes with no hidden contact',()=>{
 const map=validateGroveMap(createGroveMap()),before=validateGroveMap(createOpeningGroveMap()),landmarks=map.objects.filter(o=>o.id.startsWith('opening-landmark-'));
 assert.equal(map.starterRevision,7);assert.equal(landmarks.length,20);assert.equal(map.objects.length,before.objects.length+24);
 for(const o of landmarks){assert.equal(o.collision,false);assert.equal(o.layer,'back');assert.ok(['polygon','circle'].includes(o.type));if(o.type==='circle')assert.ok(o.radius<=.23);}
 for(const id of ['opening-skip-1','opening-skip-2','opening-skip-3','opening-skip-4','launch-bough'])assert.deepEqual(map.objects.find(o=>o.id===id),before.objects.find(o=>o.id===id));
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};saveGroveMap(storage,map);assert.deepEqual(readGroveMap(storage),validateGroveMap(createCurrentGroveMap()));assert.equal(storage.getItem(MAP_KEY),JSON.stringify(map),'read migration preserves the original saved bytes');
 const sim=new BuildSimulation(STARTER,{map});assert.equal(sim.mapBodies.length,map.objects.filter(o=>o.collision&&!['foliage','sap'].includes(o.material)).length);assert.equal(sim.worldObjects.filter(o=>o.id.startsWith('opening-landmark-')&&o.collision).length,0);
});

test('only an untouched revision-five opening receives landmarks and the low route',()=>{
 const old=createOpeningGroveMap(),raw=JSON.stringify(old);let value=raw,writes=0;const storage={getItem:()=>value,setItem:()=>writes++};
 assert.deepEqual(readGroveMap(storage),validateGroveMap(createCurrentGroveMap()));assert.equal(writes,0);assert.equal(value,raw);
 for(const edit of [m=>{m.name='My sunrise opening';},m=>{m.objects.find(o=>o.id==='opening-skip-1').points[0].y+=.02;},m=>{m.objects.find(o=>o.id==='opening-skip-2').bounce=.8;},m=>{m.objects.find(o=>o.material==='foliage').density+=.1;}]){
  const changed=structuredClone(old);edit(changed);value=JSON.stringify(changed);assert.deepEqual(readGroveMap(storage),validateGroveMap(changed));
 }
});

test('the archived low-route mat and landing terrace retain honest passive contact for the current mouse',()=>{
 const map=createGroveMap();for(const id of['opening-rescue-mat','opening-rest-terrace']){
  const o=map.objects.find(o=>o.id===id),hit=dropOn(map,o),decorative=dropOn(map,o,false);
  assert.equal(o.collision,true);assert.ok(hit.sim.contactEvents.some(e=>e.id===id&&e.normal.y>0&&e.velocityChange>0));assert.ok(hit.rebound>1,`${id} has a real upward rebound`);
  assert.ok(hit.sim.contactEvents.every(e=>!e.id.startsWith('opening-landmark-')));assert.equal(decorative.sim.contactEvents.length,0);assert.ok(decorative.sim.real(decorative.sim.shot).y<decorative.top-1);
  assert.deepEqual(hit.sim.release,decorative.sim.release,'changing the landing fixture cannot alter the controlled incoming release');
 }
});

test('the archived landing route preserves current-rig releases and unchanged paths that do not reach its new surfaces',()=>{
 for(const draw of[.5,.75,1]){
  const a=flight(createOpeningGroveMap(),draw),b=flight(createGroveMap(),draw);assert.equal(b.failure,'');assert.equal(b.phase,'finished');
  for(const key of['x','y','vx','vy','angle','speed','time','energy'])near(a.release[key],b.release[key],`${draw} release ${key}`);
  assert.equal(b.contactEvents.some(e=>['opening-rescue-mat','opening-rest-terrace'].includes(e.id)),false);
  near(a.maxX,b.maxX,`${draw} range`);near(a.time,b.time,`${draw} duration`);assert.deepEqual(a.contactEvents,b.contactEvents);
 }
});
