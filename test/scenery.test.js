import test from 'node:test';
import assert from 'node:assert/strict';
import {drawScenery,drawFace,drawEncounterDetails} from '../src/scenery.js';
function context(){const calls=[];const ctx=new Proxy({}, {get(_,key){if(key==='createLinearGradient')return(...args)=>{calls.push([key,...args]);return {addColorStop(){}};};return(...args)=>calls.push([key,...args]);},set(_,key,value){calls.push(['set',key,typeof value==='object'?'gradient':value]);return true;}});return {ctx,calls};}
test('all scenery biomes are deterministic, bounded and restore context',()=>{
 for(const region of ['Grandfather Tree','open sky','jungle canopy','forest floor']){
  const a=context(),b=context(),options={width:460,height:480,region,camera:{x:100,y:200},scale:24,time:5};drawScenery(a.ctx,options);drawScenery(b.ctx,options);assert.deepEqual(a.calls,b.calls);assert.ok(a.calls.length<350);assert.equal(a.calls[0][0],'save');assert.equal(a.calls.at(-1)[0],'restore');
 }
});
test('reduced-motion scenery does not depend on time',()=>{const a=context(),b=context(),o={width:460,height:480,reducedMotion:true};drawScenery(a.ctx,{...o,time:0});drawScenery(b.ctx,{...o,time:90});assert.deepEqual(a.calls,b.calls);});
test('all eleven original face variants are bounded and guard invalid input',()=>{
 for(const species of ['lizard','salamander','mouse','turtle','snake','chipmunk','flying-squirrel','armadillo','small-marsupial','tiny-primate','frog']){const {ctx,calls}=context();drawFace(ctx,{x:10,y:20,size:8,species});assert.ok(calls.length<65);assert.equal(calls.at(-1)[0],'restore');}
 const {ctx,calls}=context();drawFace(ctx,{x:NaN,y:0});drawScenery(ctx,{width:-1,height:480});assert.equal(calls.length,0);
});

test('encounter shape markings stay bounded and restore canvas state',()=>{
 for(const [shape,kind] of [['wings','puffy moth'],['leaf','leaf hopper'],['cap','round fungus'],['pod','springy pod'],['oval','round bird'],['oval','round beetle'],['oval','vine bug'],['circle','rolling beetle']]){const {ctx,calls}=context();drawEncounterDetails(ctx,{x:5,y:10,size:12,shape,kind});assert.ok(calls.length<100);assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');}
 const {ctx,calls}=context();drawEncounterDetails(ctx,{x:NaN,y:0});assert.equal(calls.length,0);
});

test('wing markings flap inside the same clipped physical circle',()=>{const a=context(),b=context();drawEncounterDetails(a.ctx,{x:0,y:0,shape:'wings',size:12,motion:-1});drawEncounterDetails(b.ctx,{x:0,y:0,shape:'wings',size:12,motion:1});assert.ok(a.calls.some(c=>c[0]==='clip'));assert.deepEqual(a.calls.find(c=>c[0]==='arc'),b.calls.find(c=>c[0]==='arc'));assert.notDeepEqual(a.calls.filter(c=>c[0]==='ellipse'),b.calls.filter(c=>c[0]==='ellipse'));assert.ok(a.calls.length<100&&b.calls.length<100);});
