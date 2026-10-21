import test from 'node:test';import assert from 'node:assert/strict';
import {landingOpportunity} from '../src/landing-opportunity.js';
const ledge=(id='landing',x0=0,x1=40,y=0)=>({id,type:'polygon',collision:true,material:'wood',points:[{x:x0,y},{x:x1,y},{x:x1,y:y-.3},{x:x0,y:y-.3}]});
function fake({objects=[ledge()],p={x:0,y:3.5,vx:8,vy:-1,angle:0},drag=0,wind=0,local={x:0,y:0},omega=0}={}){return{phase:'flight',release:{time:0},time:2,map:{version:3,launch:{y:600},objects},c:{drag,wind},animal:{id:'mouse',length:.18,width:.055,grams:25},L:1,T:1,shotContacts:new Set(),pendingEncounters:[],shot:{getLocalCenter:()=>local,getAngularVelocity:()=>omega},real:()=>({...p})};}
test('a fresh advisory reaches an unobstructed descending face beyond the old local horizon',()=>{
 const sim=fake(),map=JSON.stringify(sim.map),p=sim.real(),hit=landingOpportunity(sim);
 assert.equal(hit.id,'landing');assert.ok(hit.eta>.7&&hit.eta<.9);assert.ok(hit.etaMax-hit.etaMin<.03);assert.equal(hit.advisory,true);assert.equal(hit.confidence,'advisory');assert.ok(Math.abs(hit.normal.x)<1e-10);assert.equal(hit.normal.y,1);assert.equal(hit.material,'wood');assert.equal(hit.y,0);assert.ok(hit.spread>=.09);assert.equal(JSON.stringify(sim.map),map);assert.deepEqual(sim.real(),p);
 assert.deepEqual(landingOpportunity(sim),hit,'repeated reads do not mutate environment history');
});
test('actual drag and wind alter the predicted region instead of extending a ballistic marker',()=>{
 const plain=landingOpportunity(fake()),dragged=landingOpportunity(fake({drag:1})),windy=landingOpportunity(fake({drag:1,wind:-8}));
 assert.ok(dragged&&windy);assert.ok(dragged.x<plain.x-.3);assert.ok(windy.x<dragged.x-.4);assert.ok(dragged.eta>plain.eta);
});
test('intervening foliage, sap, encounter and side faces suppress a false destination',()=>{
 for(const blocker of[
  {...ledge('leaves',2,3,8),points:[{x:2,y:8},{x:3,y:8},{x:3,y:-3},{x:2,y:-3}],material:'foliage',density:4},
  {...ledge('sap',2,3,8),points:[{x:2,y:8},{x:3,y:8},{x:3,y:-3},{x:2,y:-3}],material:'sap'},
  {id:'enemy',type:'enemy',collision:true,kind:'beetle',x:2,y:2.95,radius:.5},
  {...ledge('wall',2,2.3,8),points:[{x:2,y:8},{x:2.3,y:8},{x:2.3,y:-3},{x:2,y:-3}]}
 ])assert.equal(landingOpportunity(fake({objects:[blocker,ledge()]})),null,blocker.id);
 const backdrop={...ledge('paint',2,3,8),collision:false};assert.equal(landingOpportunity(fake({objects:[backdrop,ledge()]})).id,'landing');
});
test('narrow corners, current contacts, apex and newly boosted states are not promised as landings',()=>{
 const hit=landingOpportunity(fake());assert.ok(hit);
 assert.equal(landingOpportunity(fake({objects:[ledge('edge',hit.x-.02,hit.x+.02)]})),null);
 for(const vy of[0,.3,12])assert.equal(landingOpportunity(fake({p:{x:0,y:3.5,vx:8,vy,angle:0}})),null);
 const s=fake();s.shotContacts.add({});assert.equal(landingOpportunity(s),null);s.shotContacts.clear();s.pendingEncounters.push({id:'boost'});assert.equal(landingOpportunity(s),null);
 const moving={x:0,y:3.5,vx:8,vy:-1,angle:0},boosted=fake({p:moving});assert.ok(landingOpportunity(boosted));moving.vx=40;assert.ok(landingOpportunity(boosted).x>hit.x+15,'a horizontal boost recomputes the offscreen world region immediately');moving.vy=12;assert.equal(landingOpportunity(boosted),null,'old destination never survives a lift boost');
});
test('rotation uses the COM origin offset and uncertainty suppresses oversized actors',()=>{
 const s=fake({local:{x:.04,y:0},omega:14}),first=landingOpportunity(s);assert.ok(first);assert.ok(first.etaMax-first.etaMin<.04);
 const whale=fake();whale.animal={id:'whale',length:24,width:4.5,grams:1e8};assert.equal(landingOpportunity(whale),null);
 assert.equal(landingOpportunity(fake({p:{x:0,y:100,vx:1,vy:-1,angle:0}}),{horizon:4}),null,'the forecast never exceeds .9s');
});
test('index budget suppresses overcrowded corridors and ignores distant map complexity',()=>{
 const crowded=Array.from({length:110},(_,i)=>({...ledge('s'+i),material:'foliage'}));assert.equal(landingOpportunity(fake({objects:crowded})),null);
 const distant=Array.from({length:2000},(_,i)=>ledge('far'+i,1000+i,1000.5+i,-10));assert.equal(landingOpportunity(fake({objects:[...distant,ledge()]})).id,'landing');
 assert.equal(landingOpportunity(fake({objects:[{id:'absurd',type:'circle',collision:true,x:1e100,y:0,radius:1}]})),null,'index loops remain bounded even outside validated authoring coordinates');
});
test('unknown outer-envelope interactions between first and latest support bounds suppress the cue',()=>{
 const base=landingOpportunity(fake()),x=8*base.etaMax+.075;
 // The large envelope first reaches the broad ledge; an inner ray misses this
 // tiny neighbor, but a rotating compound could still hit it before support.
 for(const blocker of[
  {id:'late-enemy',type:'enemy',kind:'beetle',collision:true,x,y:.04,radius:.005},
  {id:'late-leaves',type:'circle',material:'foliage',collision:true,x,y:.04,radius:.005,density:4},
  {id:'late-side',type:'polygon',material:'wood',collision:true,points:[{x,y:.12},{x:x+.003,y:.12},{x:x+.003,y:.02},{x,y:.02}]}
 ])assert.equal(landingOpportunity(fake({objects:[ledge(),blocker]})),null,blocker.id);
 const rig=fake();rig.c={...rig.c,longArm:1,shortArm:.3,pivotHeight:1,baseWidth:1,chassis:'anchored'};rig.pivot=()=>({x:2,y:2});assert.equal(landingOpportunity(rig),null,'unmodeled launcher hardware also suppresses a return path');
});
