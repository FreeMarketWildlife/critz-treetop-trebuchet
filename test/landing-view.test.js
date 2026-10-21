import test from 'node:test';import assert from 'node:assert/strict';
import {imminentLanding} from '../src/landing-view.js';
import {groveFlightCamera,groveProject} from '../src/grove-camera.js';
const ledge=(id,y=0,extra={})=>({id,type:'polygon',material:'wood',collision:true,points:[{x:2,y},{x:8,y},{x:8,y:y-.3},{x:2,y:y-.3}],...extra});
const map=objects=>({launch:{y:600},objects});
test('short landing forecast selects the approached solid face and ignores back art and drag fields',()=>{
 const scene=map([ledge('back',1,{collision:false}),ledge('leaves',1,{material:'foliage'}),ledge('sap',1,{material:'sap'}),ledge('landing',-1)]),before=JSON.stringify(scene);
 const hit=imminentLanding(scene,{x:0,y:2,vx:8,vy:-2},{radius:.05,gravity:8});
 assert.equal(hit.id,'landing');assert.ok(hit.eta>.63&&hit.eta<.65);assert.ok(Math.abs(hit.y+1)<1e-10);assert.ok(hit.x>5&&hit.x<5.2);assert.equal(JSON.stringify(scene),before);
 assert.equal(imminentLanding(scene,{x:0,y:2,vx:8,vy:12}),null,'rising flight does not reveal a future descent');
});
test('reverse landings, sloped faces, ground and circles stay bounded to the immediate path',()=>{
 assert.equal(imminentLanding(map([ledge('reverse')]),{x:7,y:1,vx:-6,vy:-3}).id,'reverse');
 const slope={...ledge('slope'),points:[{x:2,y:1},{x:8,y:-2},{x:8,y:-2.3},{x:2,y:.7}]};
 const hit=imminentLanding(map([slope]),{x:0,y:1.5,vx:9,vy:-1});assert.equal(hit.id,'slope');assert.ok(hit.eta<.65);
 assert.equal(imminentLanding(null,{x:0,y:.4,vx:4,vy:-1}).id,'ground');
 assert.equal(imminentLanding(null,{x:0,y:40,vx:4,vy:-1}),null);
 assert.equal(imminentLanding(map([{id:'round',type:'circle',material:'bumper',collision:true,x:3,y:0,radius:1}]),{x:3,y:2,vx:0,vy:-4}).id,'round');
 assert.equal(imminentLanding(map([]),{x:0,y:0,vx:NaN,vy:0}),null);
});
test('imminent landing context includes the critter and nearby ground while preserving scale and paused framing',()=>{
 const size={width:390,height:844,animalLength:.18},p={x:10,y:2,vx:16,vy:-10},landing={x:12,y:-1,eta:.3};
 let c={x:10,y:2,scale:151.6666666667};for(let i=0;i<150;i++)c=groveFlightCamera(c,p,{...size,landing});
 const animal=groveProject(p,c,390,844),ground=groveProject(landing,c,390,844);
 assert.ok(c.scale*.18>=20.27&&c.scale*.18<21,'the brief context lens keeps a readable physical body');
 assert.ok(animal.x>70&&animal.x<170);assert.ok(animal.y>140&&animal.y<600);
 assert.ok(ground.x>30&&ground.x<370);assert.ok(ground.y>150&&ground.y<760);
 assert.deepEqual(groveFlightCamera(c,p,{...size,landing,dt:0}),c);
 const old=groveProject(p,c,390,844);c=groveFlightCamera(c,p,{...size,landing:null});const next=groveProject(p,c,390,844);
 assert.ok(Math.hypot(next.x-old.x,next.y-old.y)<14,'leaving the context view eases back to travel framing');
});
