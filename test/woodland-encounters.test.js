import test from 'node:test';
import assert from 'node:assert/strict';
import {WOODLAND_ENEMIES,defaultEncounterSettings,encounterPose} from '../src/woodland-encounters.js';
import {createGroveMap,validateGroveMap} from '../src/grove-map.js';
import {encodeMapLink,decodeMapLink} from '../src/map-link-codec.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
const encounter=(kind='lantern-moth')=>({id:'qa-'+kind,type:'enemy',kind,name:kind,x:10,y:8,radius:WOODLAND_ENEMIES.find(o=>o.kind===kind).radius,collision:true,layer:'world',material:'bumper',bounce:.7,encounter:defaultEncounterSettings(kind)});
const mapWith=objects=>({...createGroveMap(),objects});
test('old maps preserve bytes and new encounter settings round trip JSON and portable links',async()=>{
 const old=createGroveMap(),before=JSON.stringify(old);assert.deepEqual(validateGroveMap(old),old);assert.equal(JSON.stringify(old),before);const m=validateGroveMap(mapWith(WOODLAND_ENEMIES.map(r=>encounter(r.kind))));assert.deepEqual(validateGroveMap(JSON.parse(JSON.stringify(m))),m);assert.deepEqual(await decodeMapLink(await encodeMapLink(m)),m);
 for(const patch of [{speed:Infinity},{speed:6},{dx:31},{height:9},{strength:3},{motion:'unknown'}]){const o=encounter();Object.assign(o.encounter,patch);assert.throws(()=>validateGroveMap(mapWith([o])));}
});
test('shuttles ease at endpoints, walkers stay level, hops are bounded and resets repeat',()=>{
 for(const r of WOODLAND_ENEMIES){const o=encounter(r.kind),s=o.encounter;assert.deepEqual(encounterPose(o,0),{x:o.x,y:o.y,vx:0,vy:0});for(let i=0;i<500;i++){const p=encounterPose(o,i*.037);assert.ok(p.x>=o.x-1e-9&&p.x<=o.x+Math.abs(s.dx)+1e-9);assert.ok(p.y>=o.y-1e-9&&p.y<=o.y+Math.abs(s.dy)+s.height+1e-9);if(s.motion==='walk')assert.equal(p.y,o.y);assert.deepEqual(p,encounterPose(structuredClone(o),i*.037));}}
});
test('actual moving fixtures match painted poses and deterministic reset; old colliders remain static',()=>{
 const o=encounter(),m=mapWith([o]),a=new BuildSimulation(STARTER,{map:m}),b=new BuildSimulation(STARTER,{map:m});a.fire();b.fire();
 for(let i=0;i<90;i++){a.step(1/60);b.step(1/60);}assert.ok(a.time>1);const pos=a.patrolBodies[0].b.getPosition(),p=encounterPose(o,a.time);assert.ok(Math.hypot(pos.x*a.L-p.x,pos.y*a.L-p.y)<1e-8);assert.equal(a.time,b.time);assert.deepEqual(a.patrolBodies[0].b.getPosition(),b.patrolBodies[0].b.getPosition());const frozen=a.patrolBodies[0].b.getPosition().clone();assert.deepEqual(a.patrolBodies[0].b.getPosition(),frozen);
 const old={...o};delete old.encounter;assert.equal(new BuildSimulation(STARTER,{map:mapWith([old])}).patrolBodies.length,0);
});
test('six effects change a released physical body gently and respect strength/direction',()=>{
 for(const r of WOODLAND_ENEMIES){const o=encounter(r.kind),sim=new BuildSimulation(STARTER,{map:mapWith([o])});sim.fire();sim.shot.setLinearVelocity({x:4*sim.T/sim.L,y:-3*sim.T/sim.L});const before=sim.real(sim.shot);sim.pendingEncounters.push(o);sim.applyEncounters();const after=sim.real(sim.shot);assert.ok([after.vx,after.vy].every(Number.isFinite));assert.ok(Math.hypot(after.vx,after.vy)<40);assert.notDeepEqual(before,after);}
 const o=encounter('gust-bloom');o.encounter.strength=-1;const sim=new BuildSimulation(STARTER,{map:mapWith([o])});sim.fire();const vx=sim.real(sim.shot).vx;sim.pendingEncounters.push(o);sim.applyEncounters();assert.ok(sim.real(sim.shot).vx<vx);
});

test('zero power disables bonus impulses and moving encounter count is bounded',()=>{
 const o=encounter('spring-cap');o.encounter.strength=0;const sim=new BuildSimulation(STARTER,{map:mapWith([o])});sim.fire();sim.shot.setLinearVelocity({x:1,y:-2});const before=sim.real(sim.shot);sim.pendingEncounters.push(o);sim.applyEncounters();assert.deepEqual(sim.real(sim.shot),before);
 assert.throws(()=>validateGroveMap(mapWith(Array.from({length:129},(_,i)=>({...encounter(),id:'many-'+i})))),/128/);
});
test('all six illustrated encounters activate from real falling-body contacts',()=>{
 for(const r of WOODLAND_ENEMIES){const o=encounter(r.kind);o.encounter.speed=0;const sim=new BuildSimulation({...STARTER,drag:0},{map:mapWith([o])});sim.fire();sim.shot.setPosition({x:o.x/sim.L,y:(o.y+o.radius+.2)/sim.L});sim.shot.setLinearVelocity({x:0,y:-3*sim.T/sim.L});sim.detach('acceptance fall');for(let i=0;i<24;i++)sim.step(1/120);assert.ok(sim.contactEvents.some(e=>e.kind===o.kind),r.name+' contact missing');assert.equal(sim.failure,'');}
});
