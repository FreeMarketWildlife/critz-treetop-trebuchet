import test from 'node:test';import assert from 'node:assert/strict';
import {createEnvironmentIndex,coveredDistance,leafRetention,sapRetention} from '../src/grove-environment.js';
import {branchPolygon,slopedPlatform,branchTip} from '../src/grove-branches.js';
import {isSimplePolygon,polygonArea} from '../src/grove-geometry.js';
import {createGroveMap,validateGroveMap,saveGroveMap,readGroveMap,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';import{STARTER}from'../src/build-catalog.js';
const circle=(id,material,x=0,radius=1,density=1)=>({id,name:id,type:'circle',x,y:0,radius,material,density,collision:true,layer:'world',bounce:0});
test('one small leaf is barely noticeable; a dense path compounds substantial drag',()=>{
 assert.ok(leafRetention(1,.2)>.996);assert.ok(leafRetention(100,1)<.17);assert.equal(leafRetention(100,1,1),1);assert.ok(Math.abs(leafRetention(12,2)-leafRetention(12,.5)**4)<1e-12);assert.equal(sapRetention(),.01);assert.equal(sapRetention(1),1);
});
test('swept foliage catches thin regions, respects concave gaps, and is step independent',()=>{
 const o=circle('leaf','foliage',0,.1,40),a={x:-10,y:0},b={x:10,y:0},index=createEnvironmentIndex([o]);assert.ok(Math.abs(coveredDistance(o,a,b)-.2)<1e-9);const one=index.step(a,b).retention;
 const split=createEnvironmentIndex([o]);let many=1;for(let i=0;i<100;i++)many*=split.step({x:-10+i*.2,y:0},{x:-10+(i+1)*.2,y:0}).retention;assert.ok(Math.abs(one-many)<1e-9);
 const concave={...o,type:'polygon',points:[{x:0,y:0},{x:4,y:0},{x:4,y:1},{x:1,y:1},{x:1,y:4},{x:0,y:4}]};assert.equal(coveredDistance(concave,{x:2,y:2},{x:3,y:3}),0);assert.ok(Math.abs(coveredDistance(concave,{x:-1,y:.5},{x:5,y:.5})-4)<1e-9);
});
test('sap removes 99 percent once on entry, allows falling out and works on re-entry',()=>{
 const index=createEnvironmentIndex([circle('sap','sap')]);assert.equal(index.step({x:-2,y:0},{x:0,y:0}).retention,.01);assert.equal(index.step({x:0,y:0},{x:.2,y:0}).retention,1);index.step({x:.2,y:0},{x:2,y:0});assert.equal(index.step({x:2,y:0},{x:0,y:0}).retention,.01);
 const fast=createEnvironmentIndex([circle('thin-sap','sap',0,.03)]).step({x:-10,y:0},{x:10,y:0});assert.equal(fast.sapHits,1);assert.equal(fast.retention,.01);
});
test('overlapping clusters accumulate but decorative leaves are excluded, with local spatial queries',()=>{
 const objects=Array.from({length:1800},(_,i)=>circle(`l-${i}`,'foliage',i*40,1,10));const index=createEnvironmentIndex(objects),r=index.step({x:-2,y:0},{x:2,y:0});assert.ok(r.checks<5);assert.ok(r.retention<1);
 const x=circle('a','foliage'),double=createEnvironmentIndex([x,{...x,id:'b'},{...x,id:'decorative',collision:false}]).step({x:-2,y:0},{x:2,y:0});assert.ok(Math.abs(double.retention-leafRetention(2,2))<1e-12);
});
test('dense leaves are not solid ground and a slowed critter eventually falls through',()=>{
 const leaf={...circle('dense','foliage',50,10,60),y:50},map={...createGroveMap(),objects:[leaf]},s=new BuildSimulation({...STARTER,drag:0},{map});s.fire();s.shot.setPosition({x:50/s.L,y:65/s.L});s.shot.setLinearVelocity({x:0,y:-20*s.T/s.L});s.detach('test');let slowest=Infinity;
 for(let i=0;i<1800;i++){s.step(1/60);const p=s.real(s.shot);if(p.y<58&&p.y>42)slowest=Math.min(slowest,Math.abs(p.vy));}assert.ok(slowest<5);assert.ok(s.real(s.shot).y<35);assert.equal(s.mapBodies.length,0);assert.equal(s.failure,'');
});
test('branch and slope tools produce real sloped polygons and extend either tapered tip',()=>{
 for(const b of [{x:10,y:3},{x:-10,y:5},{x:1,y:10}]){const a={x:0,y:0},points=branchPolygon(a,b,2,.6);assert.ok(isSimplePolygon(points));const tip=branchTip({points});assert.ok(Math.hypot(tip.point.x-b.x,tip.point.y-b.y)<1e-9);assert.ok(Math.abs(tip.width-.6)<1e-9);}
 for(const b of[{x:5,y:3},{x:-5,y:-3},{x:5,y:0}])assert.ok(isSimplePolygon(slopedPlatform({x:0,y:0},b)));assert.throws(()=>branchPolygon({x:0,y:0},{x:0,y:0}));assert.throws(()=>slopedPlatform({x:0,y:0},{x:0,y:1}));
});
test('leaf density and sap survive validated save and portable geometry without altering old data',()=>{
 const map=validateGroveMap(createGroveMap()),values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};saveGroveMap(storage,map);assert.deepEqual(readGroveMap(storage),map);const before=values.get(MAP_KEY);assert.throws(()=>saveGroveMap(storage,{...map,objects:[circle('bad','foliage',0,1,900)]}));assert.equal(values.get(MAP_KEY),before);
});
test('the live solver applies a swept sap hit once and exposes future resistance without hidden forces',()=>{
 for(const resistance of[0,1]){const patch=circle('sap','sap',50,.03),map={...createGroveMap(),objects:[patch]},s=new BuildSimulation({...STARTER,drag:0},{map});s.animal={...s.animal,sapResistance:resistance};s.fire();s.shot.setPosition({x:49/s.L,y:0});s.shot.setLinearVelocity({x:60*s.T/s.L,y:0});s.detach('test');for(let i=0;i<8;i++)s.step(1/120);assert.ok(Math.abs(s.real(s.shot).vx-(resistance?60:.6))<1e-9);assert.equal(s.contactEvents.filter(e=>e.material==='sap').length,1);assert.equal(s.shotContacts.size,0);}
});
