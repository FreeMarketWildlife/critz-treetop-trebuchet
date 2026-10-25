// Retained V3 world: these archived art/contact/journey regressions deliberately
// keep their original geometry. V4 coverage lives in grove-proportioned and scale tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createV3GroveMap as createGroveMap,createGroveMap as createCurrentGroveMap,createAncientGroveMap,validateGroveMap,readGroveMap,saveGroveMap,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';

// These are controlled fixture probes, not claims that the new 0.6 m rig
// repeats the archived rig's natural four-skip route.
function dropOn(map,o,collision=true){
 const [a,b]=o.points,x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 const sim=new BuildSimulation({...STARTER,drag:0},{map:{...map,objects:[{...o,collision}]}});
 sim.fire();sim.shot.setTransform({x:x/sim.L,y:(y+1)/sim.L},0);sim.shot.setLinearVelocity({x:0,y:-4*sim.T/sim.L});sim.shot.setAngularVelocity(0);sim.detach('Controlled authored-surface probe');
 let rebound=-Infinity;for(let i=0;i<240;i++){sim.step(1/240);if(sim.contactEvents.length)rebound=Math.max(rebound,sim.real(sim.shot).vy);}
 return{sim,rebound,top:y};
}

const store=()=>({values:new Map(),getItem(k){return this.values.get(k);},setItem(k,v){this.values.set(k,v);}});
function launch(map,animal='mouse'){
 const sim=new BuildSimulation({...STARTER,animal,...(animal==='chipmunk'?{pouchWidth:.19}:{})},{map});sim.setDraw(0);for(let i=0;i<110;i++)sim.wind(1/60);sim.fire();return sim;
}

test('archived V3 spring mats save unchanged and migrate to the current default only on read',()=>{
 const map=validateGroveMap(createGroveMap()),storage=store(),skips=map.objects.filter(o=>o.id.startsWith('opening-skip-'));
 assert.equal(map.starterRevision,7);assert.equal(skips.length,4);assert.equal(map.launch.y,600);assert.equal(map.tree.height,800);
 for(const o of skips){assert.equal(o.type,'polygon');assert.equal(o.material,'leaf');assert.equal(o.bounce,.87);assert.equal(o.collision,true);assert.equal(o.layer,'world');}
 assert.deepEqual(map.objects.find(o=>o.id==='launch-bough'),validateGroveMap(createAncientGroveMap()).objects.find(o=>o.id==='launch-bough'));
 assert.deepEqual(saveGroveMap(storage,map),map);assert.deepEqual(readGroveMap(storage),validateGroveMap(createCurrentGroveMap()));assert.equal(storage.getItem(MAP_KEY),JSON.stringify(map),'read migration preserves the original saved bytes');assert.equal(storage.values.size,1);assert.ok(storage.values.has(MAP_KEY));
});

test('only an exact untouched ancient starter upgrades, preserving every authored edit',()=>{
 const previous=createAncientGroveMap(),storage=store(),raw=JSON.stringify(previous);storage.setItem(MAP_KEY,raw);
 assert.deepEqual(readGroveMap(storage),validateGroveMap(createCurrentGroveMap()));assert.equal(storage.getItem(MAP_KEY),raw,'reading never writes over the old saved file');
 for(const edit of [m=>{m.name='My evening route';},m=>{m.objects.find(o=>o.id==='stepping-bough-0').points[0].x+=.1;},m=>{m.objects.find(o=>o.material==='foliage').density+=1;},m=>{m.objects.find(o=>o.id==='returning-bough').bounce=.79;}]){
  const changed=structuredClone(previous);edit(changed);storage.setItem(MAP_KEY,JSON.stringify(changed));assert.deepEqual(readGroveMap(storage),validateGroveMap(changed));
 }
});

test('all four retained authored mats produce distinct real passive rebounds without rewriting their historical geometry',()=>{
 const map=createGroveMap(),skips=map.objects.filter(o=>o.id.startsWith('opening-skip-')),hits=[];
 for(const o of skips){
  const {sim,rebound}=dropOn(map,o);assert.equal(sim.failure,'');assert.ok(rebound>1,`${o.id}: measured upward rebound ${rebound} m/s`);
  const event=sim.contactEvents.find(e=>e.id===o.id);assert.ok(event&&event.normal.y>0&&event.normalSpeed>0&&event.velocityChange>0);assert.equal(event.power,undefined,'leaf mats do not need an enemy impulse');hits.push(event.id);
 }
 assert.deepEqual(hits,['opening-skip-1','opening-skip-2','opening-skip-3','opening-skip-4']);
});

test('the authored route leaves the gravitational launch and all starter volunteers intact',()=>{
 const old=launch(createAncientGroveMap()),next=launch(createGroveMap());
 for(const sim of[old,next])for(let i=0;i<600&&!sim.release;i++)sim.step(1/120);
 for(const key of['x','y','vx','vy','angle','speed','energy','time'])assert.ok(Math.abs(old.release[key]-next.release[key])<1e-10,`${key} stays unchanged before flight`);
 for(const animal of['frog','chipmunk']){const sim=launch(createGroveMap(),animal);for(let i=0;i<60*60&&sim.phase!=='finished';i++)sim.step(1/60);assert.equal(sim.failure,'');assert.equal(sim.phase,'finished');assert.ok(Object.values(sim.real(sim.shot)).every(Number.isFinite));}
});
