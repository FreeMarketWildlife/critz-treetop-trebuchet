import {world as layout} from './world.js';
import {drawScenery,drawFace,drawEncounterDetails} from './scenery.js';
export function viewportFor(width,height=Infinity){return width<=650&&height>=width?{width:480,height:600,portrait:true,originX:240,originY:560}:{width:960,height:480,portrait:false,originX:260,originY:440};}
export function pointerWorld(point,bounds,viewport){
 if(![point.clientX,point.clientY,bounds.left,bounds.top,bounds.width,bounds.height].every(Number.isFinite)||bounds.width<=0||bounds.height<=0)return null;
 const x=(point.clientX-bounds.left)*viewport.width/bounds.width,y=(point.clientY-bounds.top)*viewport.height/bounds.height;
 return {x:(x-viewport.originX)/45,y:294+(viewport.originY-y)/45};}
export function createRenderer(canvas){const ctx=canvas.getContext('2d');let viewport=viewportFor(1000);
 const line=(a,b,color,width=3)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();};
 const dot=(p,r,color)=>{ctx.beginPath();ctx.fillStyle=color;ctx.arc(...p,r,0,Math.PI*2);ctx.fill();};
 function body(scene,b,transform,scale){const role=b.getUserData()?.role;if(role==='static')return;
 for(let f=b.getFixtureList();f;f=f.getNext()){const s=f.getShape(),color=role==='part'?scene.rig.color:['pouch','pouchflap'].includes(role)?'#71988b':role==='frame'?'#92724a':role==='hooklink'?'#d0b35e':role==='enemy'?b.getUserData().color:'#594936';ctx.fillStyle=color;
  if(s.getType()==='circle')dot(transform(b.getWorldPoint(s.getCenter())),s.getRadius()*scale,color);
  else if(s.getType()==='polygon'){const points=s.m_vertices.map(v=>transform(b.getWorldPoint(v)));ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.strokeStyle='#45554a';ctx.lineWidth=1;ctx.stroke();}
 }
 if(role==='enemy'){const p=transform(b.getWorldCenter()),f=b.getFixtureList();drawEncounterDetails(ctx,{x:p[0],y:p[1],size:f.getShape().getRadius()*scale,shape:b.getUserData().shape,color:b.getUserData().color,angle:-b.getAngle()});}
 if(role==='part' && b.getUserData().id==='head'){const p=transform(b.getPosition()),profile=scene.rig.bodies.find(p=>p.id==='head');drawFace(ctx,{x:p[0],y:p[1],angle:-b.getAngle(),size:Math.max(3,(profile.shape.radius??.1)*scale),species:scene.rig.id,color:scene.rig.color});}
 }
 return {get viewport(){return viewport;},point(e){return pointerWorld(e,canvas.getBoundingClientRect(),viewport);},
 draw(scene,preview,effects,time,reduced,width,height=globalThis.innerHeight??Infinity){viewport=viewportFor(width,height);if(canvas.width!==viewport.width || canvas.height!==viewport.height){canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.aspectRatio=`${viewport.width}/${viewport.height}`;}
 const {portrait,originX,originY}=viewport,c=scene.center(),local=p=>[originX+p.x*45,originY-(p.y-294)*45];ctx.clearRect(0,0,canvas.width,canvas.height);
 if(!portrait || scene.phase!=='flight'){
 ctx.save();ctx.beginPath();ctx.rect(0,0,portrait?480:480,canvas.height);ctx.clip();drawScenery(ctx,{width:480,height:canvas.height,region:'grandfatherTree',camera:{x:0,y:297},scale:45,reducedMotion:reduced,time});
 line(local({x:-8,y:294}),local({x:5,y:294}),'#534735',7);line(local({x:-5.1,y:295.5}),local({x:-3.5,y:295.5}),'#92724a',4);
 for(let b=scene.world.getBodyList();b;b=b.getNext())body(scene,b,local,45);
 for(const rope of scene.ropes)line(local(rope.getAnchorA()),local(rope.getAnchorB()),'#444',2);
 const pivot=scene.arm.getWorldPoint({x:0,y:0});dot(local(pivot),5,'#e6c475');
 if(portrait && preview)preview.points.forEach((p,i)=>dot(local(p),2,`rgba(82,85,45,${(1-i/preview.points.length)*.8})`));
 ctx.fillStyle='#243b30';ctx.font='14px system-ui';ctx.fillText(scene.phase==='uncocked'?'Set height to wind the real counterweight':scene.phase==='winding'?'Winding under torque…':scene.phase==='flight'?'Bank or try the next volunteer':scene.phase==='launching'?'Arm moving under gravity':'Lift over green cradle; release grip to seat',12,24);ctx.restore();
 }
 if(!portrait || scene.phase==='flight'){
 const panel=portrait?{x:0,y:0,w:480,h:600}:{x:500,y:40,w:460,h:440},region=c.y>245?'grandfatherTree':c.y>120?'openSky':c.y>5?'jungleCanopy':'forestFloor';
 const view=p=>[panel.x+panel.w/2+(p.x-c.x)*24,panel.y+panel.h/2-(p.y-c.y)*24];ctx.save();ctx.translate(panel.x,panel.y);drawScenery(ctx,{width:panel.w,height:panel.h,region,camera:c,scale:24,reducedMotion:reduced,time});ctx.restore();
 ctx.save();ctx.beginPath();ctx.rect(panel.x,panel.y,panel.w,panel.h);ctx.clip();for(const s of layout.surfaces)line(view({x:s.minX,y:s.y}),view({x:s.maxX,y:s.y}),'#675337',5);
 for(const pin of layout.bumpers){dot(view(pin),pin.radius*24,'#c69450');dot(view(pin),pin.radius*19,'#f3d28d');}
 for(let b=scene.world.getBodyList();b;b=b.getNext())if(['part','enemy'].includes(b.getUserData()?.role))body(scene,b,view,24);
 if(preview)preview.points.forEach((p,i)=>dot(view(p),2,`rgba(82,85,45,${(1-i/preview.points.length)*.8})`));for(const e of effects)dot(view(e),(1-e.life/.4)*12,`rgba(240,182,79,${e.life})`);ctx.restore();ctx.fillStyle='#243b30';ctx.font='15px system-ui';ctx.fillText(`${region} • ${Math.max(0,c.x).toFixed(0)} m`,panel.x+10,portrait?24:30);
 }
 if(!portrait)line([480,0],[480,480],'#8c9f95',1);
 }};
}
