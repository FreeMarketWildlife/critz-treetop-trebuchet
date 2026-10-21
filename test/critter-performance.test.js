import test from 'node:test';import assert from 'node:assert/strict';
import {createCritterPerformance} from '../src/critter-performance.js';
import {drawCritter} from '../src/build-art.js';import {CRITTERS} from '../src/build-catalog.js';
const fake=()=>({time:0,release:null,shot:{},contactEvents:[],real:()=>({x:4,y:8,vx:15,vy:3,angle:2})});
const hit=(seq,time,id='branch',strength=.8)=>({seq,time,id,strength});
test('flight holds a cel, each meaningful hit selects a readable new reaction, then recovers',()=>{
 const sim=fake(),actor=createCritterPerformance();assert.equal(actor.update(sim).pose,'ready');sim.release={};assert.equal(actor.update(sim).pose,'flying');
 sim.time=1;sim.contactEvents=[hit(1,1)];const first=actor.update(sim);assert.equal(first.pose,'bonk-a');assert.equal(first.hits,1);
 sim.time=1.2;assert.equal(actor.update(sim).pose,'bonk-a');sim.time=1.3;assert.equal(actor.update(sim).pose,'stars');sim.time=1.7;assert.equal(actor.update(sim).pose,'flying');
 sim.time=2;sim.contactEvents.push(hit(2,2));assert.equal(actor.update(sim).pose,'bonk-b');
 for(let i=3;i<=5;i++){sim.time=i;sim.contactEvents.push(hit(i,i));actor.update(sim);}sim.time=6;const later=actor.update(sim);assert.equal(later.tier,3);assert.equal(later.pose,'flying');
});
test('resting, duplicate fixture and pre-release contacts cannot stack injuries',()=>{
 const sim=fake(),actor=createCritterPerformance();sim.time=1;sim.contactEvents=[hit(1,1)];assert.equal(actor.update(sim).hits,0);sim.release={};sim.time=2;sim.contactEvents.push(hit(2,2),hit(3,2.01),hit(4,2.1,'branch',.01));assert.equal(actor.update(sim).hits,1);
 assert.equal(actor.update(sim).hits,1);sim.time=2.3;sim.contactEvents.push(hit(5,2.3));assert.equal(actor.update(sim).hits,2);
});
test('pause freezes the pose and a new launch resets every cosmetic injury without touching physics',()=>{
 const sim=fake(),actor=createCritterPerformance();sim.release={};sim.time=1;sim.contactEvents=[hit(1,1)];const before=structuredClone(sim.contactEvents),a=actor.update(sim);assert.deepEqual(actor.update(sim),a);assert.deepEqual(sim.contactEvents,before);assert.equal(sim.real(sim.shot).angle,2);sim.phase='finished';assert.equal(actor.update(sim).pose,'dazed');assert.equal(actor.update(fake()).tier,0);
});
test('all eleven volunteers have distinct finite flying, impact and battered cels at small and large sizes',()=>{
 for(const animal of CRITTERS){const signatures=new Set();for(const [pose,tier]of[['ready',0],['flying',0],['bonk-a',1],['bonk-b',2],['stars',2],['dazed',3]]){for(const size of[18,160,640]){const trace=[];let saves=0;const ctx=new Proxy({},{get:(_,key)=>(...args)=>{if(key==='save')saves++;if(key==='restore')saves--;for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));trace.push([key,...args]);},set:(_,key,value)=>{trace.push([key,value]);return true;}});drawCritter(ctx,animal,0,0,size,0,pose!=='ready',undefined,{pose,tier,frame:0});assert.equal(saves,0);assert.ok(trace.length<450);if(size===160)signatures.add(JSON.stringify(trace));}}assert.equal(signatures.size,6,animal.id);}
});

test('pass-through sap and foliage cannot count as bonk injuries or restart a contact reaction',()=>{
 const s=fake(),actor=createCritterPerformance();s.release={};s.time=1;s.contactEvents=[{...hit(1,1,'sap',1),material:'sap'},{...hit(2,1,'leaves',.8),material:'foliage'}];
 const a=actor.update(s);assert.equal(a.hits,0);assert.equal(a.pose,'flying');assert.equal(a.angle,-2);
 s.time=2;s.contactEvents.push({...hit(3,2,'mat',.8),material:'leaf'});assert.equal(actor.update(s).hits,1);assert.equal(s.real(s.shot).angle,2);
});
