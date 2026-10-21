import test from 'node:test';
import assert from 'node:assert/strict';
import {drawBotanicalBumper} from '../src/grove-botanical-art.js';

const ids=['opening-landmark-1-pod-0','opening-landmark-1-pod-1','opening-landmark-1-pod-2','opening-landmark-2-pod-0','opening-landmark-2-pod-1','opening-landmark-2-pod-2'];
function canvas(){
 const calls=[],paints=[],clips=[],stack=[];let path=[];
 const state={matrix:[1,0,0,1,0,0],clip:null,lineWidth:1},methods=new Set(['save','restore','translate','scale','rotate','beginPath','closePath','arc','ellipse','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','fill','stroke','clip']);
 const point=(x,y)=>{const[a,b,c,d,e,f]=state.matrix;return[a*x+c*y+e,b*x+d*y+f];};
 const ctx=new Proxy(state,{get(target,key){if(!methods.has(key))return target[key];return(...args)=>{
  calls.push([key,...args]);for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${key} must remain finite`);
  if(key==='save')stack.push({...state,matrix:[...state.matrix]});
  else if(key==='restore'){assert.ok(stack.length);Object.assign(state,stack.pop());}
  else if(key==='translate'){const p=point(...args);state.matrix[4]=p[0];state.matrix[5]=p[1];}
  else if(key==='scale'){state.matrix=state.matrix.map((v,i)=>i<2?v*args[0]:i<4?v*args[1]:v);}
  else if(key==='rotate'){const[a,b,c,d,e,f]=state.matrix,co=Math.cos(args[0]),si=Math.sin(args[0]);state.matrix=[a*co+c*si,b*co+d*si,c*co-a*si,d*co-b*si,e,f];}
  else if(key==='beginPath')path=[];
  else if(key==='arc'){const[x,y,r]=args;assert.ok(r>=0);path.push({kind:'circle',p:point(x,y),r:r*Math.hypot(...state.matrix.slice(0,2))});}
  else if(key==='ellipse'){assert.ok(args[2]>=0&&args[3]>=0);path.push({kind:key});}
  else if(key==='clip'){assert.equal(path.length,1);assert.equal(path[0].kind,'circle');state.clip=path[0];clips.push(path[0]);}
  else if(['fill','stroke'].includes(key))paints.push({kind:key,path:[...path],clip:state.clip,width:state.lineWidth*Math.hypot(...state.matrix.slice(0,2))});
  else if(['moveTo','lineTo','bezierCurveTo','quadraticCurveTo'].includes(key))path.push({kind:key});
 };},set(target,key,value){if(['fillStyle','strokeStyle'].includes(key))assert.match(value,/^#[0-9a-f]{6}$/i);if(typeof value==='number')assert.ok(Number.isFinite(value));target[key]=value;calls.push(['set',key,value]);return true;}});
 return{ctx,calls,paints,clips,get depth(){return stack.length;}};
}
function render(id,r,collision=true){const c=canvas(),o={id,collision,type:'circle',radius:100,material:'bumper'},before=JSON.stringify(o);assert.equal(drawBotanicalBumper(c.ctx,o,{x:91,y:67,r,scale:43}),true);assert.equal(JSON.stringify(o),before);return c;}

test('botanical art keeps every visible mark inside the exact supplied collision circle',()=>{
 for(const id of ids)for(const r of[.2,1,3,8,14,26,60,180,320]){
  const c=render(id,r);assert.equal(c.depth,0);assert.equal(c.clips.length,1);assert.deepEqual(c.clips[0],{kind:'circle',p:[91,67],r});
  for(const paint of c.paints){if(paint.clip){assert.deepEqual(paint.clip,c.clips[0]);continue;}assert.equal(paint.path.length,1);const disk=paint.path[0];assert.equal(disk.kind,'circle');assert.deepEqual(disk.p,[91,67]);assert.ok(disk.r+(paint.kind==='stroke'?paint.width/2:0)<=r+1e-8,'unclipped outline stays within physical radius');}
  assert.ok(c.calls.length<230,`${id}/${r}px stays bounded: ${c.calls.length}`);
 }
});

test('IDs give repeatable organic head geometry and both authored families',()=>{
 const signatures=new Set();for(const id of ids){const a=render(id,32),b=render(id,32);assert.deepEqual(a.calls,b.calls);signatures.add(JSON.stringify(a.calls));}
 assert.ok(signatures.size>=4,'several seedheads have distinct stable silhouettes inside the circle');
 const blossom=ids.some(id=>render(id,32).calls.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#65472f'));
 const curl=ids.some(id=>render(id,32).calls.some(c=>c[0]==='set'&&c[1]==='strokeStyle'&&c[2]==='#d3a35b'));
 assert.ok(blossom&&curl,'canonical IDs include blossoms and curled pods');
});

test('phone LOD uses broad shapes and invalid projections draw nothing',()=>{
 for(const id of ids){const small=render(id,12),large=render(id,60);assert.ok(small.calls.length<=large.calls.length);assert.ok(small.calls.length<150,'phone heads have a small bounded path count');}
 for(const projection of[{x:0,y:0,r:0},{x:0,y:0,r:-1},{x:NaN,y:0,r:20},{x:0,y:0,r:20,scale:0}]){const c=canvas();assert.equal(drawBotanicalBumper(c.ctx,{id:'invalid'},projection),false);assert.equal(c.calls.length,0);}
});


test('decorative heads use organic petal and pod silhouettes without a disc or circular rim',()=>{
 for(const id of ids)for(const r of[.2,1,3,8,14,26,60,180]){
  const c=render(id,r,false);assert.equal(c.depth,0);assert.equal(c.clips.length,1);assert.deepEqual(c.clips[0],{kind:'circle',p:[91,67],r});assert.ok(c.paints.length);
  for(const paint of c.paints){assert.deepEqual(paint.clip,c.clips[0],'decorative silhouettes stay within the exact supplied radius');assert.ok(paint.path.every(p=>p.kind!=='circle'),'there is no painted full-circle base or rim');}
  assert.ok(!c.calls.some(p=>p[0]==='set'&&p[1]==='fillStyle'&&p[2]==='#96683d'),'decorative heads have no brown button background');
  assert.ok(c.calls.length<260,`decorative ${id}/${r}px stays bounded: ${c.calls.length}`);
 }
});
