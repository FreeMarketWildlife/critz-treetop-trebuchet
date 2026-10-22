import {critterHitboxBounds} from '../src/critter-body.js';
import test from'node:test';import assert from'node:assert/strict';
import{drawCritter}from'../src/build-art.js';import{CRITTERS}from'../src/build-catalog.js';
function recordedCanvas(){
 let matrix=[1,0,0,1,0,0],clip=null,path=[],box=null,width=1,commands=0;const stack=[],geometry=[],styles=[];
 const point=(x,y)=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]],bounds=pts=>[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];
 const merge=(a,b)=>a?[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])]:b;
 function paint(stroke=false){if(!path.length)return;let b=bounds(path);if(stroke){const r=width*Math.max(Math.hypot(matrix[0],matrix[1]),Math.hypot(matrix[2],matrix[3]))/2;b=[b[0]-r,b[1]-r,b[2]+r,b[3]+r];}if(clip)b=[Math.max(b[0],clip[0]),Math.max(b[1],clip[1]),Math.min(b[2],clip[2]),Math.min(b[3],clip[3])];if(b[0]<=b[2]&&b[1]<=b[3])box=merge(box,b);}
 const api={save(){stack.push({matrix:[...matrix],clip:clip&&[...clip],width});},restore(){assert.ok(stack.length);({matrix,clip,width}=stack.pop());},translate(x,y){matrix[4]+=matrix[0]*x+matrix[2]*y;matrix[5]+=matrix[1]*x+matrix[3]*y;},scale(x,y){matrix[0]*=x;matrix[1]*=x;matrix[2]*=y;matrix[3]*=y;},rotate(a){const [a0,b,c,d]=matrix,cos=Math.cos(a),sin=Math.sin(a);matrix[0]=a0*cos+c*sin;matrix[1]=b*cos+d*sin;matrix[2]=c*cos-a0*sin;matrix[3]=d*cos-b*sin;},beginPath(){path=[];},moveTo(x,y){path.push(point(x,y));},lineTo(x,y){path.push(point(x,y));},closePath(){},ellipse(x,y,rx,ry,angle=0,start=0,end=Math.PI*2){for(let i=0;i<=32;i++){const a=start+(end-start)*i/32,xx=rx*Math.cos(a),yy=ry*Math.sin(a);path.push(point(x+xx*Math.cos(angle)-yy*Math.sin(angle),y+xx*Math.sin(angle)+yy*Math.cos(angle)));}},quadraticCurveTo(x,y,xx,yy){const p=path.at(-1),q=point(x,y),z=point(xx,yy);for(let i=1;i<=16;i++){const t=i/16,u=1-t;path.push([u*u*p[0]+2*u*t*q[0]+t*t*z[0],u*u*p[1]+2*u*t*q[1]+t*t*z[1]]);}},bezierCurveTo(x1,y1,x2,y2,x3,y3){const p=path.at(-1),q=point(x1,y1),r=point(x2,y2),z=point(x3,y3);for(let i=1;i<=16;i++){const t=i/16,u=1-t;path.push([u*u*u*p[0]+3*u*u*t*q[0]+3*u*t*t*r[0]+t*t*t*z[0],u*u*u*p[1]+3*u*u*t*q[1]+3*u*t*t*r[1]+t*t*t*z[1]]);}},clip(){const b=bounds(path);clip=clip?[Math.max(clip[0],b[0]),Math.max(clip[1],b[1]),Math.min(clip[2],b[2]),Math.min(clip[3],b[3])]:b;},fill(){paint();},stroke(){paint(true);},roundRect(x,y,w,h){path.push(point(x,y),point(x+w,y+h));},fillRect(x,y,w,h){const old=path;path=[point(x,y),point(x+w,y+h)];paint();path=old;}};
 const ctx=new Proxy(api,{get(target,key){if(key==='lineWidth')return width;if(key in target)return(...args)=>{commands++;assert.ok(args.filter(x=>typeof x==='number').every(Number.isFinite),`${String(key)} has finite geometry`);geometry.push([key,...args]);return target[key](...args);};return undefined;},set(_,key,v){if(key==='lineWidth')width=v;if(['fillStyle','strokeStyle','lineWidth'].includes(key))styles.push([key,v]);return true;}});
 return{ctx,get box(){return box;},get commands(){return commands;},get balance(){return stack.length;},geometry,styles};
}
test('all eleven build volunteers preserve physical-angle transforms, finite silhouettes and bounded draw cost',()=>{
 for(const animal of CRITTERS)for(const pose of['ready','walking','flying','bonk-a','bonk-b','stars','dazed']){
  const c=recordedCanvas(),performance={pose,tier:pose==='stars'?3:0,frame:1.4,airPose:'dive',flex:{head:.08,tail:-.1}},before=structuredClone(performance);
  drawCritter(c.ctx,animal,50,50,40,.73,true,40*animal.width/animal.length,performance);
  assert.equal(c.geometry.find(g=>g[0]==='rotate')[1],.73,animal.id);assert.equal(c.balance,0);assert.ok(c.commands<550,`${animal.id}/${pose}: ${c.commands}`);assert.ok(c.box.every(Number.isFinite));assert.deepEqual(performance,before);
 }
});
test('ready species fit the existing display bounds and have distinct geometry without relying on colour',()=>{
 const signatures=new Set();
 for(const animal of CRITTERS){const c=recordedCanvas(),size=100,h=size*animal.width/animal.length;drawCritter(c.ctx,animal,0,0,size,0,false,h,{pose:'ready'});
  const bounds=critterHitboxBounds(animal),minX=animal.id==='mouse'?bounds.minX/animal.length-.03:-.56,maxX=animal.id==='mouse'?bounds.maxX/animal.length+.03:.56;assert.ok(c.box[0]>=size*minX&&c.box[2]<=size*maxX,`${animal.id} horizontal silhouette ${c.box}`);assert.ok(c.box[1]>=-h*.64&&c.box[3]<=h*.64,`${animal.id} vertical silhouette ${c.box}`);
  signatures.add(JSON.stringify(c.geometry));
 }
 assert.equal(signatures.size,11);
});

test('phone starters keep their physical size and angle while using crisp low-detail species cues',()=>{
 const signatures=new Set();
 for(const id of ['mouse','frog','chipmunk'])for(const size of [20.28,26.13,33.15]){
  const animal=CRITTERS.find(a=>a.id===id),h=size*animal.width/animal.length,c=recordedCanvas(),state={pose:'flying',airPose:'dive',flex:{head:.08,tail:-.1},tier:0};
  drawCritter(c.ctx,animal,0,0,size,0,true,h,state);
  assert.equal(c.balance,0);assert.ok(c.commands<230,`${id}: simplified phone drawing stays inexpensive`);
  assert.ok(c.box[0]>=-size*(id==='mouse'?.71:.56)-1&&c.box[2]<=size*(id==='mouse'?.35:.56)+1,'an outline does not independently enlarge the body');
  assert.ok(c.box[1]>=-h*.65-1&&c.box[3]<=h*.65+1,'height continues to match the physical width');
  if(id==='mouse'){assert.ok(c.styles.some(([k,v])=>k==='strokeStyle'&&v==='#332c2b'));}
  else{
  assert.ok(c.styles.some(([k,v])=>k==='strokeStyle'&&v==='#fff2d1'),'pale contour separates the body from dark timber');
  assert.ok(c.styles.some(([k,v])=>k==='strokeStyle'&&v==='#252a26'),'dark contour survives light fog');
  assert.ok(c.styles.some(([k,v])=>k==='lineWidth'&&v===.8),'thin-body outlines use a uniform legible pixel width');
  }
  if(size===26.13)signatures.add(JSON.stringify(c.geometry));
  const rotated=recordedCanvas();drawCritter(rotated.ctx,animal,0,0,size,1.37,true,h,state);assert.equal(rotated.geometry.find(g=>g[0]==='rotate')[1],1.37);
  const impact=recordedCanvas();drawCritter(impact.ctx,animal,0,0,size,1.37,true,h,{...state,pose:'bonk-a',tier:2});assert.notDeepEqual(impact.geometry,rotated.geometry,'eyes and mouth react without replacing physical rotation');
 }
 assert.equal(signatures.size,3,'mouse ear/tail, frog eyes/haunch and chipmunk tail/stripe stay distinct');
});
