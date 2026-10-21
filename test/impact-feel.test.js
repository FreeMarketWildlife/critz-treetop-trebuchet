import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';

const bough={id:'bounce-bough',name:'Bounce bough',type:'polygon',points:[{x:15,y:0},{x:160,y:0},{x:160,y:-.5},{x:15,y:-.5}],material:'leaf',layer:'world',collision:true,bounce:.8};
function flying({x=30,y=2,vx=10,vy=-7,objects=[bough]}={}){
 const s=new BuildSimulation({...STARTER,drag:0},{map:{...createGroveMap(),objects}});s.fire();
 s.shot.setPosition({x:x/s.L,y:y/s.L});s.shot.setLinearVelocity({x:vx*s.T/s.L,y:vy*s.T/s.L});s.detach('impact fixture');return s;
}
function advance(s,seconds){for(let i=0;i<seconds*600;i++)s.step(1/600);return s;}

test('a compound-body bounce emits one cue at the resolved surface with real normal speed',()=>{
 const s=advance(flying(),.65),hits=s.contactEvents.filter(e=>e.id===bough.id);
 assert.equal(hits.length,1);assert.equal(s.contacts,1);assert.ok(s.real(s.shot).vy>3,'the authored elastic bough produces a genuine rebound');
 const hit=hits[0];assert.ok(Math.abs(hit.y)<.01,'feedback sits at the branch surface, not the body center');
 assert.ok(Math.abs(hit.normal.x)<1e-12&&Math.abs(hit.normal.y-1)<1e-12);assert.ok(hit.normalSpeed>8&&hit.normalSpeed<11);assert.ok(hit.velocityChange>7);assert.ok(hit.strength>.6&&hit.strength<1);
});
test('fast sliding and resting support cannot count fixture seams as new bounce chains',()=>{
 const s=advance(flying({y:.043,vx:18,vy:0}),.65);
 assert.ok(s.real(s.shot).x>40,'the body really slid at speed along the branch');assert.ok(s.shotContacts.size>0);
 assert.equal(s.contacts??0,0);assert.equal(s.contactEvents.length,0);
 advance(s,5);assert.equal(s.contactEvents.length,0,'quiet support remains quiet after long sliding');
});
test('impact observation leaves physical motion, angular momentum and energy unchanged',()=>{
 const observed=flying(),silent=flying();silent.observeImpact=()=>{};silent.resolveImpact=()=>{};
 for(let i=0;i<600;i++){
  observed.step(1/600);silent.step(1/600);
  assert.deepEqual(observed.snapshot(),silent.snapshot());
  assert.equal(observed.shot.getAngularVelocity(),silent.shot.getAngularVelocity());
 }
 assert.ok(observed.contactEvents.length>0);assert.equal(silent.contactEvents.length,0);
});
test('pre-release mechanism and exact measured release do not depend on impact observation',()=>{
 const a=new BuildSimulation(STARTER,{map:createGroveMap()}),b=new BuildSimulation(STARTER,{map:createGroveMap()});
 b.observeImpact=()=>{};b.resolveImpact=()=>{};a.setDraw(1);b.setDraw(1);a.fire();b.fire();
 for(let i=0;i<2400&&!a.release;i++){a.step(1/600);b.step(1/600);assert.deepEqual(a.snapshot(),b.snapshot());}
 assert.ok(a.release);assert.deepEqual(a.release,b.release);assert.equal(a.contactEvents.length,0);assert.equal(b.contactEvents.length,0);
});

test('a gentle encounter touch still punctuates its explicit arcade power exactly once',()=>{
 const hopper={id:'hopper',name:'Leaf hopper',type:'enemy',kind:'hopper',x:30,y:0,radius:.07,material:'bumper',layer:'world',collision:true,bounce:.88};
 const s=advance(flying({y:.105,vx:0,vy:-.1,objects:[hopper]}),.15);
 assert.ok(s.real(s.shot).vy>7,'the established encounter power still fires');
 assert.equal(s.contactEvents.length,1);assert.equal(s.contacts,1);assert.equal(s.contactEvents[0].kind,'hopper');
 assert.equal(s.contactEvents[0].power,true);assert.ok(s.contactEvents[0].velocityChange>8);assert.ok(s.contactEvents[0].strength>.6);
});
