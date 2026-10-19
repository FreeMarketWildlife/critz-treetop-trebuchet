import test from 'node:test';
import assert from 'node:assert/strict';
import {createEncounterDirector,encounterPools} from '../src/encounters.js';
test('seeded active schedule is reproducible and independent of update history',()=>{
 const a=createEncounterDirector('abc'),b=createEncounterDirector('abc'),p={x:30,y:200};
 a.update(1,p);a.update(40,p);assert.deepEqual(a.update(8,p).active,b.update(8,p).active);
 assert.notDeepEqual(a.update(8,p).active,createEncounterDirector('other').update(8,p).active);
});
test('all four biome pools yield passive harmless bounded descriptors',()=>{
 for(const biome of Object.keys(encounterPools))for(let t=0;t<100;t+=.37){
  const {active}=createEncounterDirector(4).update(t,{x:20,y:200},biome);assert.ok(active.length<=8);
  assert.equal(new Set(active.map(e=>e.id)).size,active.length);
  for(const e of active){assert.equal(e.biome,biome);assert.ok(e.harmless);assert.ok(e.mass>0&&e.radius>0);assert.ok(e.material.restitution>=0&&e.material.restitution<=1);assert.ok(e.material.friction>=0);assert.ok([e.x,e.y,e.vx,e.vy].every(Number.isFinite));assert.ok(encounterPools[biome].some(r=>r.kind===e.kind));}
 }
});
test('analytic descriptor velocities match motion and spatial continuity',()=>{
 const d=createEncounterDirector(9),p={x:30,y:80},a=d.update(8,p).active,b=d.update(8.00001,p).active;
 for(const e of a){const n=b.find(x=>x.id===e.id);if(n){assert.ok(Math.abs((n.x-e.x)/.00001-e.vx)<.0001);assert.ok(Math.abs((n.y-e.y)/.00001-e.vy)<.0001);}}
});
test('visibility events occur once, snapshots do not leak mutable state, reset re-enters',()=>{
 const d=createEncounterDirector(1),p={x:0,y:280},first=d.update(8,p);assert.ok(first.active.length>0);assert.equal(first.events.length,first.active.length);
 first.active[0].material.restitution=9;assert.equal(d.update(8,p).events.length,0);assert.ok(d.update(8,p).active.every(e=>e.material.restitution<=1));
 d.reset();assert.ok(d.update(8,p).events.length>0);assert.ok(d.update(30,p).events.some(e=>e.type==='encounter-exit'));
});
test('invalid input is rejected and region inference covers fixed height bands',()=>{
 assert.throws(()=>createEncounterDirector(NaN));const d=createEncounterDirector(0);
 for(const t of [NaN,-1,Infinity])assert.throws(()=>d.update(t,{x:0,y:0}));assert.throws(()=>d.update(0,{x:NaN,y:0}));
 for(const [y,biome] of [[300,'grandfatherTree'],[200,'openSky'],[80,'jungleCanopy'],[0,'forestFloor']])assert.ok(d.update(8,{x:0,y}).active.every(e=>e.biome===biome));
});
