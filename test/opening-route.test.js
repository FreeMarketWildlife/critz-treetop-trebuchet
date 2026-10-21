import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,createAncientGroveMap,validateGroveMap,readGroveMap,saveGroveMap,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
const store=()=>({values:new Map(),getItem(k){return this.values.get(k);},setItem(k,v){this.values.set(k,v);}});
function launch(map,animal='mouse'){
 const sim=new BuildSimulation({...STARTER,animal},{map});sim.setDraw(0);for(let i=0;i<110;i++)sim.wind(1/60);sim.fire();return sim;
}

test('fresh default and editor save share the same four authored spring mats',()=>{
 const map=validateGroveMap(createGroveMap()),storage=store(),skips=map.objects.filter(o=>o.id.startsWith('opening-skip-'));
 assert.equal(map.starterRevision,6);assert.equal(skips.length,4);assert.equal(map.launch.y,600);assert.equal(map.tree.height,800);
 for(const o of skips){assert.equal(o.type,'polygon');assert.equal(o.material,'leaf');assert.equal(o.bounce,.87);assert.equal(o.collision,true);assert.equal(o.layer,'world');}
 assert.deepEqual(map.objects.find(o=>o.id==='launch-bough'),validateGroveMap(createAncientGroveMap()).objects.find(o=>o.id==='launch-bough'));
 assert.deepEqual(saveGroveMap(storage,map),map);assert.deepEqual(readGroveMap(storage),map);assert.equal(storage.values.size,1);assert.ok(storage.values.has(MAP_KEY));
});

test('only an exact untouched ancient starter upgrades, preserving every authored edit',()=>{
 const previous=createAncientGroveMap(),storage=store(),raw=JSON.stringify(previous);storage.setItem(MAP_KEY,raw);
 assert.deepEqual(readGroveMap(storage),validateGroveMap(createGroveMap()));assert.equal(storage.getItem(MAP_KEY),raw,'reading never writes over the old saved file');
 for(const edit of [m=>{m.name='My evening route';},m=>{m.objects.find(o=>o.id==='stepping-bough-0').points[0].x+=.1;},m=>{m.objects.find(o=>o.material==='foliage').density+=1;},m=>{m.objects.find(o=>o.id==='returning-bough').bounce=.79;}]){
  const changed=structuredClone(previous);edit(changed);storage.setItem(MAP_KEY,JSON.stringify(changed));assert.deepEqual(readGroveMap(storage),validateGroveMap(changed));
 }
});

test('the natural starter mouse makes four distinct passive skips before ten seconds',()=>{
 const sim=launch(createGroveMap()),hits=new Map(),upward=new Map();
 for(let i=0;i<60*40&&sim.phase!=='finished';i++){
  sim.step(1/60);for(const e of sim.contactEvents)if(e.id.startsWith('opening-skip-')&&!hits.has(e.id))hits.set(e.id,e);
  for(const[id,e]of hits)if(sim.time-e.time<.6)upward.set(id,Math.max(upward.get(id)??-Infinity,sim.real(sim.shot).vy));
 }
 assert.equal(sim.failure,'');assert.equal(sim.phase,'finished');assert.equal(hits.size,4);assert.ok(hits.get('opening-skip-1').time<4);assert.ok(hits.get('opening-skip-4').time<10);assert.ok(sim.real(sim.shot).x>60);
 for(const[id,vy]of upward)assert.ok(vy>1,`${id} has a visible upward physical rebound (${vy} m/s)`);
 assert.ok(sim.contactEvents.length<=64);
});

test('the authored route leaves the gravitational launch and all starter volunteers intact',()=>{
 const old=launch(createAncientGroveMap()),next=launch(createGroveMap());
 for(const sim of[old,next])for(let i=0;i<600&&!sim.release;i++)sim.step(1/120);
 for(const key of['x','y','vx','vy','angle','speed','energy','time'])assert.ok(Math.abs(old.release[key]-next.release[key])<1e-10,`${key} stays unchanged before flight`);
 for(const animal of['frog','chipmunk']){const sim=launch(createGroveMap(),animal);for(let i=0;i<60*60&&sim.phase!=='finished';i++)sim.step(1/60);assert.equal(sim.failure,'');assert.equal(sim.phase,'finished');assert.ok(Object.values(sim.real(sim.shot)).every(Number.isFinite));}
});
