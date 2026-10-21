import test from 'node:test';
import assert from 'node:assert/strict';
import {drawGroveEnemyContactBody,drawGroveWorld} from '../src/grove-art.js';
import {createGroveMap,ENEMIES} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';

function canvas(){
 const paints=[],stack=[];let shape=null;
 const state={lineWidth:1,fillStyle:'#000000',strokeStyle:'#000000'};
 const ctx=new Proxy(state,{get(target,key){if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});if(key in target)return target[key];return(...args)=>{
  for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v),`${key} stays finite`);
  if(key==='save')stack.push({...state});else if(key==='restore'){assert.ok(stack.length);Object.assign(state,stack.pop());}
  else if(key==='beginPath')shape=null;
  else if(key==='ellipse')shape={x:args[0],y:args[1],rx:args[2],ry:args[3]};
  else if(key==='arc')shape={x:args[0],y:args[1],rx:args[2],ry:args[2]};
  else if(key==='moveTo'||key==='lineTo'||key==='bezierCurveTo'||key==='quadraticCurveTo')shape=null;
  else if((key==='fill'||key==='stroke')&&shape)paints.push({...shape,kind:key,width:key==='stroke'?state.lineWidth:0,color:key==='fill'?state.fillStyle:state.strokeStyle});
 };},set(target,key,value){target[key]=value;return true;}});
 return{ctx,paints,get depth(){return stack.length;}};
}
const fullBody=(paints,x,y,r)=>paints.some(p=>p.kind==='fill'&&p.x===x&&p.y===y&&Math.abs(p.rx-p.ry)<1e-10&&paints.some(q=>q.x===x&&q.y===y&&Math.abs(q.rx+q.width/2-r)<1e-8&&Math.abs(q.ry+q.width/2-r)<1e-8));

test('every canonical enemy contact body paints its full physical radius at tiny, phone and close-up scales',()=>{
 for(const recipe of ENEMIES)for(const scale of [.001,.3,4,43,151.6666667,210,360]){
  const r=recipe.radius*scale,c=canvas();assert.equal(drawGroveEnemyContactBody(c.ctx,recipe.kind,91,67,r),true);
  assert.equal(c.depth,0);assert.ok(fullBody(c.paints,91,67,r),`${recipe.kind}/${scale}: no invisible annulus`);
  for(const p of c.paints){assert.equal(p.x,91);assert.equal(p.y,67);assert.ok(p.rx+p.width/2<=r+1e-8);assert.ok(p.ry+p.width/2<=r+1e-8);}
  assert.ok(c.paints.length<=2,'a quiet fill and at most one contour, without glow or extra rings');
 }
});

test('shared runtime and editor enemy rendering uses the actual fixture size and omits bodies for decoration',()=>{
 for(const recipe of ENEMIES)for(const scale of [.3,43,151.6666667])for(const editor of [false,true]){
  const o={id:'contact-probe',type:'enemy',kind:recipe.kind,name:recipe.name,x:20,y:0,radius:recipe.radius,collision:true,layer:'front',material:'bumper',bounce:.5};
  const map={...createGroveMap(),objects:[o]},before=JSON.stringify(map),sim=new BuildSimulation(STARTER,{map});
  const r=sim.mapBodies[0].getFixtureList().getShape().getRadius()*sim.L*scale,c=canvas();
  drawGroveWorld(c.ctx,{camera:{x:20,y:0,scale},width:1000,height:600,map,foreground:true,editor});
  assert.ok(fullBody(c.paints,500,300,r),`${recipe.kind}/${scale}/${editor}: show the real fixture`);assert.equal(c.depth,0);
  const decorative=canvas();drawGroveWorld(decorative.ctx,{camera:{x:20,y:0,scale},width:1000,height:600,map:{...map,objects:[{...o,collision:false}]},foreground:true,editor});
  assert.equal(fullBody(decorative.paints,500,300,r),false,'off-plane silhouettes do not acquire a contact body');assert.equal(decorative.depth,0);
  assert.equal(JSON.stringify(map),before,'rendering never rewrites editor geometry or collision settings');
 }
});

test('the reproduced ancient-fungus impact lies on its now-painted contact body without changing the bounce',()=>{
 const map=createGroveMap(),o=map.objects.find(o=>o.id==='floor-fungus'),s=new BuildSimulation({...STARTER,drag:0},{map:{...map,objects:[o]}});
 s.fire();s.shot.setPosition({x:o.x/s.L,y:(o.y+o.radius+.25)/s.L});s.shot.setAngle(0);s.shot.setLinearVelocity({x:0,y:-3*s.T/s.L});s.shot.setAngularVelocity(0);s.detach('Contact visibility regression');
 for(let i=0;i<240&&!s.contactEvents.length;i++)s.step(1/240);
 const hit=s.contactEvents.find(e=>e.id===o.id);assert.ok(hit);assert.ok(Math.abs(hit.y+590.8002919650105)<1e-8);assert.ok(Math.abs(hit.velocityChange-6.0252853024664175)<1e-8);
 const scale=151.6666667,c=canvas(),r=o.radius*scale;drawGroveEnemyContactBody(c.ctx,o.kind,0,0,r);
 assert.ok(fullBody(c.paints,0,0,r));assert.ok(Math.hypot(hit.x-o.x,hit.y-o.y)*scale<=r+.01,'actual contact no longer sits above all painted body');
});
