import {biomeAt} from './journey.js';
import {createFlightCamera} from './camera.js';
import {world as layout} from './world.js';
import {drawScenery,drawFace,drawEncounterDetails} from './scenery.js';
export function viewportFor(width,height=Infinity){return width<=650&&height>=width?{width:480,height:600,portrait:true,originX:240,originY:560}:{width:960,height:480,portrait:false,originX:260,originY:440};}
export function pointerWorld(point,bounds,viewport){
 if(![point.clientX,point.clientY,bounds.left,bounds.top,bounds.width,bounds.height].every(Number.isFinite)||bounds.width<=0||bounds.height<=0)return null;
 const x=(point.clientX-bounds.left)*viewport.width/bounds.width,y=(point.clientY-bounds.top)*viewport.height/bounds.height;
 return {x:(x-viewport.originX)/45,y:294+(viewport.originY-y)/45};}
export function createRenderer(canvas){const ctx=canvas.getContext('2d');let viewport=viewportFor(1000),camera=createFlightCamera(),cameraScene=null,lastTime=0,wasFlying=false;
 const line=(a,b,color,width=3)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();};
 const dot=(p,r,color)=>{ctx.beginPath();ctx.fillStyle=color;ctx.arc(...p,r,0,Math.PI*2);ctx.fill();};
 function body(scene,b,transform,scale){const role=b.getUserData()?.role;if(role==='static')return;
  for(let f=b.getFixtureList();f;f=f.getNext()){const s=f.getShape(),color=role==='part'?scene.rig.color:['pouch','pouchflap'].includes(role)?'#71988b':role==='frame'?'#92724a':role==='hooklink'?'#d0b35e':role==='enemy'?b.getUserData().color:'#594936';ctx.fillStyle=color;
   if(s.getType()==='circle'){dot(transform(b.getWorldPoint(s.getCenter())),s.getRadius()*scale,color);if(role==='part'){ctx.strokeStyle='#344b38';ctx.lineWidth=1.1;ctx.stroke();}}
   else if(s.getType()==='polygon'){const points=s.m_vertices.map(v=>transform(b.getWorldPoint(v)));ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.strokeStyle='#344b38';ctx.lineWidth=1.1;ctx.stroke();}
  }
  if(role==='enemy'){const p=transform(b.getWorldCenter()),f=b.getFixtureList();drawEncounterDetails(ctx,{x:p[0],y:p[1],size:f.getShape().getRadius()*scale,shape:b.getUserData().shape,kind:b.getUserData().kind,color:b.getUserData().color,angle:-b.getAngle()});}
  if(role==='part'&&b.getUserData().id==='head'){const p=transform(b.getPosition()),profile=scene.rig.bodies.find(p=>p.id==='head');drawFace(ctx,{x:p[0],y:p[1],angle:-b.getAngle(),size:Math.max(3,(profile.shape.radius??.1)*scale),species:scene.rig.id,color:scene.rig.color});}
 }
 function drawFlightHud(scene,c,panel,biome){
  ctx.save();ctx.fillStyle='rgba(250,245,219,.88)';ctx.fillRect(panel.x+8,panel.y+8,Math.min(panel.w-16,360),52);
  drawFace(ctx,{x:panel.x+27,y:panel.y+28,size:11,species:scene.rig?.id,color:scene.rig?.color});
  ctx.fillStyle='#273f35';ctx.font='bold 15px system-ui';ctx.fillText(`${scene.rig?.label??'Volunteer'} • ${biome.label}`,panel.x+47,panel.y+29);
  ctx.font='12px system-ui';ctx.fillText(`${Math.max(0,c.x-(scene.release?.center.x??0)).toFixed(0)} m forward • ${Math.max(0,c.y).toFixed(0)} m high`,panel.x+16,panel.y+49);
  if(panel.w>=800){const x=panel.x+panel.w-14,top=panel.y+70,h=panel.h-92,level=y=>top+(1-Math.max(0,Math.min(320,y))/320)*h;ctx.globalAlpha=.85;
   for(const [high,low,color]of [[320,245,'#52795d'],[245,120,'#7eb6d3'],[120,5,'#4f8b5b'],[5,0,'#9c7852']]){ctx.fillStyle=color;ctx.fillRect(x,level(high),6,Math.max(2,level(low)-level(high)));}
   dot([x+3,level(c.y)],5,'#fff7d7');ctx.globalAlpha=1;ctx.font='11px system-ui';for(const [y,label]of [[300,'Tree'],[185,'Sky'],[65,'Canopy'],[0,'Floor']])ctx.fillText(label,x-48,level(y)+4);
  }ctx.restore();
 }
 return {get viewport(){return viewport;},point(e){return pointerWorld(e,canvas.getBoundingClientRect(),viewport);},
 draw(scene,preview,effects,time,reduced,width,height=globalThis.innerHeight??Infinity){
  viewport=viewportFor(width,height);if(canvas.width!==viewport.width||canvas.height!==viewport.height){canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.aspectRatio=`${viewport.width}/${viewport.height}`;}
  const {portrait,originX,originY}=viewport,c=scene.center(),flying=scene.phase==='flight',local=p=>[originX+p.x*45,originY-(p.y-294)*45];ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!flying){
   ctx.save();ctx.beginPath();ctx.rect(0,0,480,canvas.height);ctx.clip();drawScenery(ctx,{width:480,height:canvas.height,region:'grandfatherTree',camera:{x:0,y:297},scale:45,reducedMotion:reduced,time});
   line(local({x:-8,y:294}),local({x:5,y:294}),'#534735',7);line(local({x:-5.1,y:295.5}),local({x:-3.5,y:295.5}),'#92724a',4);
   for(let b=scene.world.getBodyList();b;b=b.getNext())body(scene,b,local,45);for(const rope of scene.ropes)line(local(rope.getAnchorA()),local(rope.getAnchorB()),'#444',2);
   dot(local(scene.arm.getWorldPoint({x:0,y:0})),5,'#e6c475');
   if(scene.phase==='loading'&&!scene.hand&&scene.parts?.length){const root=scene.parts.find(b=>b.getUserData().id==='torso')??scene.parts[Math.floor(scene.parts.length/2)],p=local(root.getWorldCenter());ctx.setLineDash([3,3]);ctx.beginPath();ctx.strokeStyle='#f8eab8';ctx.lineWidth=2;ctx.arc(...p,14,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#273f35';ctx.font='12px system-ui';ctx.fillText('Grab here',p[0]-27,p[1]-20);}
   if(portrait&&preview)preview.points.forEach((p,i)=>dot(local(p),2,`rgba(82,85,45,${(1-i/preview.points.length)*.8})`));
   ctx.fillStyle='#243b30';ctx.font='14px system-ui';ctx.fillText(scene.phase==='uncocked'?'Set height to wind the real counterweight':scene.phase==='winding'?'Winding under torque…':scene.phase==='launching'?'Arm moving under gravity':'Lift over green cradle; release grip to seat',12,24);ctx.restore();
  }
  if(!portrait||flying){
   const panel=flying?{x:0,y:0,w:canvas.width,h:canvas.height}:{x:500,y:56,w:460,h:424},biome=biomeAt(c.y),scale=flying?42:100;
   if(flying&&(!wasFlying||cameraScene!==scene)){camera=createFlightCamera();cameraScene=scene;}
   const cam=flying?camera.update(c,{width:panel.w,height:panel.h,scale,dt:Math.max(0,time-lastTime),reducedMotion:reduced}):c;
   const view=p=>[panel.x+panel.w/2+(p.x-cam.x)*scale,panel.y+panel.h/2-(p.y-cam.y)*scale];
   ctx.save();ctx.translate(panel.x,panel.y);drawScenery(ctx,{width:panel.w,height:panel.h,region:biome.id,camera:cam,scale,reducedMotion:reduced,time});ctx.restore();
   ctx.save();ctx.beginPath();ctx.rect(panel.x,panel.y,panel.w,panel.h);ctx.clip();
   if(flying){for(const s of layout.surfaces)line(view({x:s.minX,y:s.y}),view({x:s.maxX,y:s.y}),'#675337',5);
    for(const pin of layout.bumpers){const p=view(pin);dot(p,pin.radius*scale,'#ab7041');dot(p,pin.radius*scale*.83,'#f3cf76');dot(p,pin.radius*scale*.44,'#d9914c');}
   }else dot([panel.x+panel.w/2,panel.y+panel.h/2],110,'rgba(255,248,222,.45)');
   for(let b=scene.world.getBodyList();b;b=b.getNext())if(['part','enemy'].includes(b.getUserData()?.role))body(scene,b,view,scale);
   if(preview)preview.points.forEach((p,i)=>dot(view(p),2,`rgba(82,85,45,${(1-i/preview.points.length)*.8})`));
   for(const e of effects)dot(view(e),(1-e.life/.4)*(8+10*(e.strength??.4)),`rgba(240,182,79,${e.life})`);ctx.restore();
   if(flying)drawFlightHud(scene,c,panel,biome);else{ctx.fillStyle='#273f35';ctx.font='bold 17px system-ui';ctx.fillText(`${scene.rig?.label??'Volunteer'} • ${(scene.rig?.totalMass??0).toFixed(2)} kg`,512,25);ctx.font='12px system-ui';ctx.fillText('Live close-up • drag in the left view',512,44);}
  }
  if(!portrait&&!flying)line([480,0],[480,480],'#8c9f95',1);wasFlying=flying;lastTime=time;
 }};
}
