import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,validateGroveMap,saveGroveMap,readGroveMap,MAP_KEY,gravityScaleAt} from '../src/grove-map.js';
import {triangulatePolygon,polygonArea,isSimplePolygon} from '../src/grove-geometry.js';
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER,scaledPreset} from '../src/build-catalog.js';
const mapWith=objects=>({...createGroveMap(),objects});
const shape=(type,values)=>({id:'test-shape',type,collision:true,layer:'world',material:'wood',bounce:0,...values});
function flight(map,x,y,vx=0,vy=0){const s=new BuildSimulation({...STARTER,drag:0},{map});s.fire();s.shot.setPosition({x:x/s.L,y:y/s.L});s.shot.setLinearVelocity({x:vx*s.T/s.L,y:vy*s.T/s.L});s.detach('Test release');return s;}
function advance(s,seconds){for(let i=0;i<seconds*60;i++)s.step(1/60);return s;}

test('map defaults place the launch three quarters up a 400 m tree and retain gaps',()=>{
 const m=validateGroveMap(createGroveMap());assert.equal(m.launch.y/m.tree.height,.75);
 const sim=new BuildSimulation(STARTER,{map:m});assert.equal(sim.groundY,-300);assert.equal(sim.terrainHeight(0,.1),0);assert.ok(sim.terrainHeight(23,.1)<-30);
 assert.equal(m.objects.find(o=>o.id==='far-bough').collision,false);assert.equal(sim.mapBodies.length,m.objects.filter(o=>o.collision).length);
});
test('concave geometry triangulates to exactly its area without filling its notch',()=>{
 const points=[{x:20,y:0},{x:24,y:0},{x:24,y:1},{x:21,y:1},{x:21,y:4},{x:20,y:4}],tris=triangulatePolygon(points);
 assert.equal(tris.length,4);assert.equal(tris.reduce((n,t)=>n+Math.abs(polygonArea(t)),0),7);
 const s=flight(mapWith([shape('polygon',{points})]),23,5,0,-5);advance(s,1);
 assert.ok(s.contactEvents.length);assert.ok(s.contactEvents[0].y<1.15,'payload passes through the open notch');assert.ok(s.real(s.shot).y>.9);
});
test('freehand chains and circle bumpers use their authored collision silhouette',()=>{
 for(const o of [shape('chain',{points:[{x:20,y:1},{x:22,y:2},{x:24,y:1}]}),shape('circle',{x:22,y:1,radius:1})]){
  const s=flight(mapWith([o]),22,5,0,-8);advance(s,.7);assert.ok(s.contactEvents.some(e=>e.id==='test-shape'));assert.ok(s.real(s.shot).y>1.7);
 }
});
test('small authored details never become Planck fallback boxes for giant rigs',()=>{
 const tiny=shape('polygon',{points:[{x:80,y:1},{x:80.01,y:1},{x:80,y:1.01}]}),s=new BuildSimulation(scaledPreset('whale'),{map:mapWith([tiny])});
 for(let f=s.mapBodies[0].getFixtureList();f;f=f.getNext()){const shape=f.getShape();assert.equal(shape.getType(),'edge');assert.ok(shape.m_vertex1.x*s.L>79.9);}
});
test('decorative foreground and background shapes never become hidden collision',()=>{
 const o=shape('circle',{x:22,y:1,radius:2,layer:'front',collision:false}),s=flight(mapWith([o]),22,5,0,-8);advance(s,.7);
 assert.equal(s.contactEvents.length,0);assert.ok(s.real(s.shot).y<0);assert.equal(s.phase,'flight');
});
test('a falling critter continues below launch height and settles only against physical ground',()=>{
 const s=flight(mapWith([]),50,-1,0,-5);advance(s,1);assert.equal(s.phase,'flight');assert.ok(s.real(s.shot).y<-5);
 advance(s,20);assert.equal(s.phase,'finished');assert.ok(s.real(s.shot).y>=-300);assert.ok(s.real(s.shot).y<-299);assert.ok(s.contactEvents.some(e=>e.id==='forest-floor'));
});
test('space only lowers released payload gravity; the launch mechanism keeps Earth gravity',()=>{
 assert.equal(gravityScaleAt(300),1);assert.ok(Math.abs(gravityScaleAt(600)-.14)<1e-10);
 const s=flight(mapWith([]),50,300);advance(s,.1);assert.ok(Math.abs(s.real(s.shot).vy+GRAVITY*.14*.1)<.01);assert.ok(Math.abs(s.gravityFactor-.14)<1e-10);assert.equal(s.arm.getGravityScale(),1);
});
test('the tuned starter has an unchanged physical release and a bounded pinball journey',()=>{
 const s=new BuildSimulation(STARTER,{map:createGroveMap()});s.setDraw(0);for(let i=0;i<110;i++)s.wind(1/60);s.fire();advance(s,40);
 assert.equal(s.failure,'');assert.equal(s.phase,'finished');assert.ok(s.release.angle>38&&s.release.angle<40);assert.ok(s.release.speed>25&&s.release.speed<26);
 assert.ok(s.contactEvents.some(e=>e.id==='first-beetle'));assert.ok(s.contactEvents.some(e=>e.id==='root-bank'));assert.ok(s.real(s.shot).y<-290);
 assert.ok(s.contactEvents.length<=64);assert.equal(new Set(s.contactEvents.map(e=>e.seq)).size,s.contactEvents.length);
});
test('invalid imports reject crossings, duplicates, unknown enemies and excess geometry before replacing a save',()=>{
 const storage={data:new Map(),getItem(k){return this.data.get(k);},setItem(k,v){this.data.set(k,v);}};const original=saveGroveMap(storage,createGroveMap()),raw=storage.getItem(MAP_KEY);
 const crossed=shape('polygon',{points:[{x:0,y:0},{x:4,y:4},{x:0,y:4},{x:4,y:0}]});assert.equal(isSimplePolygon(crossed.points),false);assert.throws(()=>saveGroveMap(storage,mapWith([crossed])));
 assert.throws(()=>validateGroveMap(mapWith([shape('circle',{x:NaN,y:0,radius:1})])));assert.throws(()=>validateGroveMap(mapWith([shape('enemy',{x:3,y:4,radius:1,kind:'unknown'})])));
 assert.throws(()=>validateGroveMap(mapWith([shape('circle',{x:3,y:4,radius:1}),shape('circle',{x:5,y:4,radius:1})])));
 assert.equal(storage.getItem(MAP_KEY),raw);assert.deepEqual(readGroveMap(storage),original);
});
