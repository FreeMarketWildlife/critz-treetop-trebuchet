import {drawCounterweight} from './counterweight-art.js?v=14';
import {drawCrankWheel,crankGeometry,crankState as crankStateForQA} from './crank-wheel.js?v=14';
import {RopeVisual} from './rope-visual.js?v=14';
import {part,grams} from './build-catalog.js?v=14';
import {drawGroveWorld} from './grove-art.js?v=14';
import {createCritterPerformance} from './critter-performance.js?v=14';
import {groveSetupCamera,groveFlightCamera,groveTreeCamera} from './grove-camera.js?v=14';
const TAU=Math.PI*2;
const ellipse=(ctx,x,y,rx,ry,color,stroke='#3d4938',lw=2)=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
const path=(ctx,points,color,width)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
export function drawCritter(ctx,animal,x,y,size,angle=0,air=false,height,performance={}){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const bounds=animal.id==='whale'?[-68,-24,52,27]:animal.id==='elephant'?[-43,-42,62,41]:animal.id==='rabbit'?[-57,-56,52,32]:animal.id==='squirrel'?[-61,-48,52,32]:[-57,-33,52,32];const [x0,y0,x1,y1]=bounds;ctx.scale(size/(x1-x0),height===undefined?size/(x1-x0):height/(y1-y0));ctx.translate(-(x0+x1)/2,-(y0+y1)/2);ctx.lineJoin='round';
 const color=animal.color,id=animal.id,ink='#3e4638',pose=performance.pose??(air?'flying':'ready'),tier=performance.tier??0,bonk=pose.startsWith('bonk'),stars=pose==='stars',dazed=pose==='dazed',active=air&&pose!=='ready';
 // Held silhouettes: paws out in flight, tucked on one hit, splayed on the next.
 if(bonk)ctx.rotate(pose==='bonk-a'?-.08:.08);
 if(id==='whale'){
  ctx.beginPath();ctx.moveTo(-45,0);ctx.bezierCurveTo(-18,-28,42,-23,48,-3);ctx.bezierCurveTo(50,26,-15,25,-42,8);ctx.lineTo(-56,24);ctx.lineTo(-53,3);ctx.lineTo(-66,-8);ctx.lineTo(-47,-6);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.stroke();ellipse(ctx,16,13,24,5,'#b7d1c5',null);path(ctx,bonk?[[-2,10],[-17,bonk&&pose==='bonk-a'?-3:27],[10,14]]:active?[[-2,10],[-18,24],[10,14]]:[[-2,10],[-13,24],[10,14]],'#547f8a',4);drawCritterFace(ctx,{x:36,y:-1,whale:true,pose,tier});
 }else{
  const elephant=id==='elephant',frog=id==='frog',rabbit=id==='rabbit',bear=id==='bear',tiger=id==='tiger';
  if(!frog&&!elephant){ctx.beginPath();ctx.moveTo(-34,6);ctx.quadraticCurveTo(-65,-(id==='squirrel'?50:3),-46,-(id==='squirrel'?35:9));ctx.strokeStyle=ink;ctx.lineWidth=id==='squirrel'?18:3.5;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=id==='squirrel'?14:2;ctx.stroke();}
  for(const x of [-23,17]){const limbY=bonk?(pose==='bonk-a'?8:28):active?14:22,limbX=x+(bonk?(x<0?-9:8):active?(x<0?-5:4):0);ellipse(ctx,limbX,limbY,elephant?9:8,elephant?17:8,color,ink,2.4);}
  ellipse(ctx,-4,2,elephant?37:34,elephant?29:frog?20:24,color,ink,2.8);
  ellipse(ctx,-7,12,23,9,elephant?'#abb9af':id==='tiger'?'#f2c678':'#ddccaa',null);
  if(tiger)for(const x of [-28,-12,4])path(ctx,[[x,-19],[x+3,-5],[x-3,1]],'#73523c',4);
  if(id==='armadillo')for(const x of [-24,-14,-4,6]){ctx.beginPath();ctx.ellipse(x,0,10,22,0,-1.2,1.2);ctx.strokeStyle='#665e56';ctx.lineWidth=2;ctx.stroke();}
  if(id==='chipmunk')path(ctx,[[-27,-8],[-10,-13],[8,-9]],'#f1d3a0',6);
  if(rabbit){ellipse(ctx,25,-34,6,20,color,ink,2.4);ellipse(ctx,12,-31,7,18,color,ink,2.4);ellipse(ctx,25,-34,2,13,'#bd9683',null);}
  if(!frog&&!rabbit){ellipse(ctx,16,-20,elephant?15:9,elephant?20:11,color,ink,2.4);if(!elephant)ellipse(ctx,16,-21,4.5,6,'#d7a99c',null);}
  ellipse(ctx,29,-6,elephant?20:19,elephant?24:18,color,ink,2.5);
  if(elephant){ellipse(ctx,13,-5,13,19,'#b1bcb0',ink,2);path(ctx,[[43,4],[49,25],[57,24]],ink,10);path(ctx,[[43,4],[49,25],[57,24]],color,6);path(ctx,[[38,9],[46,14],[47,10]],'#f3e1b9',3);}
  if(frog){ellipse(ctx,23,-21,7,9,color,ink,2);ellipse(ctx,38,-20,7,9,color,ink,2);}
  if(bear)ellipse(ctx,40,0,8,6,'#c2a382',null);
  drawCritterFace(ctx,{x:frog?26:34,y:frog?-20:-10,pose,tier});
  if(!frog&&!elephant)ellipse(ctx,46,0,4,3,ink,null);
  if(active){const pawY=bonk?(pose==='bonk-a'?-5:24):18;path(ctx,[[-16,8],[-29,pawY],[-39,pawY-3]],ink,5);path(ctx,[[-16,8],[-29,pawY],[-39,pawY-3]],color,2.7);if(!elephant){path(ctx,[[12,12],[19,pawY+5],[27,pawY+2]],ink,4);path(ctx,[[12,12],[19,pawY+5],[27,pawY+2]],color,2);}}

 }
 if(stars||dazed)drawDizzyStars(ctx,tier,performance.frame??0);
 ctx.restore();
}
function drawCritterFace(ctx,{x,y,whale=false,pose,tier}){
 const ink='#3e4638',bonk=pose.startsWith('bonk'),dazed=pose==='stars'||pose==='dazed',active=pose!=='ready',eye=whale?4:5;
 if(bonk){path(ctx,[[x-eye,y-eye],[x+eye,y+eye]],ink,2.5);path(ctx,[[x+eye,y-eye],[x-eye,y+eye]],ink,2.5);}
 else if(dazed){ctx.beginPath();for(let i=0;i<26;i++){const a=i*.46,r=.16*i;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.strokeStyle=ink;ctx.lineWidth=1.9;ctx.stroke();}
 else{ellipse(ctx,x,y,eye,eye*1.4,'#fffbed',ink,1.4);ellipse(ctx,x+1.5,y-.5,eye*.5,eye*.7,'#293e32',null);ellipse(ctx,x+2,y-2,1,1,'#fffbed',null);}
 const mx=x+(whale?1:1),my=y+(whale?10:16);
 if(active){
  ellipse(ctx,mx,my,bonk?7:6,bonk?6.8:4.7,'#684b46',ink,1.5);
  if(!bonk||tier>=2){ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.roundRect(mx-4.5,my-3.2,9,3.6,1);ctx.fill();if(tier>=2){ctx.fillStyle='#684b46';ctx.fillRect(mx-.7,my-3.6,tier>=3?3.6:2.2,4.4);}}
  if(bonk||tier===0)ellipse(ctx,mx+1,my+2,3.1,1.7,'#d89683',null);
 }else path(ctx,[[mx-4,my],[mx,my+2],[mx+4,my-1]],ink,1.5);
 if(tier>0){ellipse(ctx,x-10,y+9,5,3.5,'#bc8f99',null);path(ctx,[[x-13,y+8],[x-10,y+11]],'#937d91',1);}
 if(tier>=2){ctx.save();ctx.translate(x-13,y-9);ctx.rotate(-.4);ctx.fillStyle='#f3dbac';ctx.strokeStyle='#9b825d';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-8,-3,16,6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#d1b184';ctx.fillRect(-2.5,-2.5,5,5);ctx.restore();}
}
function drawDizzyStars(ctx,tier,frame){
 const ink='#8b764e';for(let i=0;i<3;i++){const a=i*Math.PI*2/3+(frame%4)*Math.PI/12,x=13+Math.cos(a)*24,y=-24+Math.sin(a)*8,r=3.4+(tier>2?1:0);ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.4,y-r*.3);ctx.lineTo(x+r,y);ctx.lineTo(x+r*.35,y+r*.35);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.35,y+r*.35);ctx.lineTo(x-r,y);ctx.lineTo(x-r*.4,y-r*.3);ctx.closePath();ctx.fillStyle=i%2?'#f4d476':'#fff0b4';ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.stroke();}
}
export function createBuildRenderer(canvas){
 const ctx=canvas.getContext('2d');let cam={x:0,y:2,scale:100},lastSim=null,fit=true;let zoomFactor=1,treeZoom=1,treeOverview=false,cameraUntil=0;let W=1000,H=600,preview=false,ropeTime=0,ropeDt=1/60;let cords=[new RopeVisual(),new RopeVisual()];let effects=[],nowTime=0,windActive=false;const performanceState=createCritterPerformance();let critterCel={pose:'ready',tier:0,hits:0,angle:0};const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 function project(p){return[W/2+(p.x-cam.x)*cam.scale,H/2-(p.y-cam.y)*cam.scale];}
 function line(a,b,color,width=2){path(ctx,[project(a),project(b)],color,width);}
 function fitScene(sim){cam=groveSetupCamera(sim.c,{width:W,height:H,preview,counterRadius:sim.facts.counterRadius});cam.scale*=zoomFactor;fit=false;}
 function background(sim){
  if(sim.map){drawGroveWorld(ctx,{camera:cam,width:W,height:H,map:sim.map,time:sim.time,editor:false});return;}
  const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#cedec5');grad.addColorStop(.65,'#dee4be');grad.addColorStop(1,'#b5c18d');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  // The same authored clearing and tree silhouettes at every launch; camera parallax only.
  ctx.globalAlpha=.18;
  for(let i=0;i<13;i++){const x=i*145-170-cam.x*cam.scale*.025;path(ctx,[[x,H*.9],[x+30,H*.38],[x+16,-80]],'#819e74',25+i%3*12);ellipse(ctx,x+15,H*.17,160,100,'#a7bf92',null);}
  ctx.globalAlpha=.24;ctx.fillStyle='#fffbe0';ctx.beginPath();ctx.moveTo(W*.66,0);ctx.lineTo(W*.87,0);ctx.lineTo(W*.45,H);ctx.lineTo(W*.23,H);ctx.fill();ctx.globalAlpha=1;
  const tx=W*.10-cam.x*cam.scale*.06;
  ctx.fillStyle='#728b57';ctx.beginPath();ctx.moveTo(tx-165,-10);ctx.lineTo(tx-18,-10);ctx.bezierCurveTo(tx-37,H*.3,tx-30,H*.65,tx+30,H);ctx.lineTo(tx-190,H);ctx.closePath();ctx.fill();
  path(ctx,[[tx-27,H*.36],[tx+85,H*.18],[tx+195,H*.15]],'#728b57',21);path(ctx,[[tx-130,H*.22],[tx-115,H*.65],[tx-147,H]],'#879d62',9);path(ctx,[[tx-77,-5],[tx-90,H*.48],[tx-64,H*.84]],'#617d50',5);
  for(let i=0;i<16;i++){const x=tx-100+Math.cos(i*2.3)*220,y=-17+Math.sin(i*1.6)*85;ellipse(ctx,x,y,75+i%3*15,48+i%4*8,['#718e4c','#819c55','#90a863'][i%3],'#6b854f',1.5);}
  const gy=project({x:0,y:0})[1];if(gy<H+100){ctx.fillStyle='#85965b';ctx.fillRect(0,gy,W,H-gy+5);ctx.fillStyle='#aaba73';ctx.fillRect(0,gy,W,8);path(ctx,[[0,gy+8],[W,gy+8]],'#667e48',2);
   const earth=ctx.createLinearGradient(0,gy+8,0,H);earth.addColorStop(0,'#8a8855');earth.addColorStop(1,'#596d42');ctx.fillStyle=earth;ctx.fillRect(0,gy+10,W,H-gy);
   for(let i=0;i<75;i++){const x=((i*93.71-cam.x*cam.scale)%(W+80)+W+80)%(W+80)-40;const y=gy+10+(i*37)%Math.max(20,H-gy);ellipse(ctx,x,y,2+i%4,1.5,'#b2ad73',null);}
   for(let i=0;i<30;i++){const x=((i*63.2-cam.x*cam.scale)%(W+60)+W+60)%(W+60)-30;path(ctx,[[x-4,gy],[x-7,gy-7],[x-2,gy-2],[x+3,gy-11],[x+4,gy]],'#6b8547',1.5);}

  }
  if(!preview){
   const stride=cam.scale<12?10:cam.scale<30?5:1,start=Math.ceil((cam.x-W/(2*cam.scale)-sim.startX)/stride)*stride,end=cam.x+W/(2*cam.scale)-sim.startX;
   for(let m=start;m<=end;m+=stride){if(m<0)continue;const x=project({x:sim.startX+m,y:0})[0],y=gy;path(ctx,[[x,y+2],[x,y+13]],'#4b613e',2);ctx.fillStyle='#ece3b4';ctx.textAlign='center';ctx.font='bold 10px Trebuchet MS';ctx.fillText(`${m} m`,x,y+27);}
  }
  // Pale pollen and distant birds are decorative, never hidden forces.
  for(let i=0;i<20;i++)ellipse(ctx,(i*317.1)%W,(i*97.3)%(H*.7),1+i%2,1+i%2,'#f7f5cd',null);
 }
 function polygon(body,fixture,fill,outline='#4d5139'){
  const shape=fixture.getShape();ctx.lineWidth=2;ctx.strokeStyle=outline;ctx.fillStyle=fill;
  if(shape.getType()==='circle'){const w=body.getWorldPoint(shape.getCenter()),p=project({x:w.x*lastSim.L,y:w.y*lastSim.L});const r=shape.getRadius()*lastSim.L*cam.scale;ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.5,r),0,TAU);}else{const pts=shape.m_vertices.map(v=>{const q=body.getWorldPoint(v);return project({x:q.x*lastSim.L,y:q.y*lastSim.L});});ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.closePath();}
  ctx.fill();ctx.stroke();
 }
 function timber(a,b,width,color){line(a,b,'#444a34',Math.max(4,width*cam.scale+3));line(a,b,color,Math.max(2,width*cam.scale));const p=project(a),q=project(b);path(ctx,[[p[0],p[1]-Math.max(1,width*cam.scale*.2)],[q[0],q[1]-Math.max(1,width*cam.scale*.2)]],'#e1b16b',Math.max(.7,width*cam.scale*.09));}
 function annotation(p,text,dx,dy){const [x,y]=project(p),xx=Math.max(15,Math.min(W-190,x+dx)),yy=Math.max(88,Math.min(H-80,y+dy));path(ctx,[[x,y],[xx,yy+9],[xx+8,yy+9]],'#61754e88',1);ctx.font='10px "DM Sans",sans-serif';const width=Math.min(190,ctx.measureText(text).width+18);ctx.fillStyle='#f4f4dfec';ctx.beginPath();ctx.roundRect(xx+5,yy-3,width,24,5);ctx.fill();ctx.fillStyle='#5a6d45';ctx.textAlign='left';ctx.fillText(text,xx+14,yy+12);}
 function rope(a,b,length,index=0,color='#e0d4a0',free=false){
  const ps=cords[index].update(a,b,length,ropeDt,x=>lastSim.supportHeight(x)+.006*lastSim.L,{pinA:!free});
  const points=ps.map(project);path(ctx,points,'#4b5337',3.5);path(ctx,points,color,1.8);
 }
 function trough(sim,front=false){
  const c=sim.c,a=sim.railPoint(-c.troughLength*.75),b=sim.railPoint(c.troughLength*.25),dy=front?-.04:.025;
  timber({x:a.x,y:a.y+dy},{x:b.x,y:b.y+dy},Math.max(.025,c.troughHeight*.5),front?'#c7a062':'#e3c48c');
  if(!front){for(let i=0;i<=8;i++){const x=a.x+(b.x-a.x)*i/8,y=a.y+(b.y-a.y)*i/8;line({x,y:y-.04},{x,y:y+.06},'#695a3b',1.3);}}
 }
 function mechanism(sim,labels){
  const c=sim.c,wood=part(c.arm).color,frame=sim.frame;
  for(let f=frame.getFixtureList();f;f=f.getNext())if(f!==sim.troughFixture)polygon(frame,f,'#ad814c');
  trough(sim);
  if(sim.loading&&!preview)drawLoadingStand(sim);
  // Grain follows actual frame members.
  const fp=pt=>{const q=frame.getWorldPoint({x:pt.x/sim.L,y:pt.y/sim.L});return{x:q.x*sim.L,y:q.y*sim.L};};
  if(c.chassis==='anchored')for(const x of [-c.baseWidth/2,c.baseWidth/2]){const a=fp({x,y:.04}),b={x:a.x-.08*c.pivotHeight,y:-.12*c.pivotHeight};line(a,b,'#5a6c50',Math.max(2,cam.scale*c.beamWidth*.4));}
  if(c.chassis==='floating'){line({x:-c.baseWidth/2,y:c.pivotHeight},{x:c.baseWidth/2,y:c.pivotHeight},'#788c7d',6);const cw=sim.counterPoint();line({x:cw.x,y:0},{x:cw.x,y:c.pivotHeight+c.shortArm},'#697c6b',4);}
  for(const wheel of sim.wheels){const q=sim.real(wheel),p=project(q),r=c.wheelRadius*cam.scale;ellipse(ctx,...p,r,r,'#b2874b','#445039',3);ellipse(ctx,...p,r*.74,r*.74,'#d2ac6b','#697148',2);for(let i=0;i<6;i++){const a=q.angle+i*TAU/6;path(ctx,[p,[p[0]+Math.cos(a)*r*.72,p[1]-Math.sin(a)*r*.72]],'#796842',Math.max(1,r*.08));}ellipse(ctx,...p,r*.14,r*.14,'#667f65',null);}
  const transform=p=>{const q=sim.arm.getWorldPoint({x:p.x/sim.L,y:p.y/sim.L});return{x:q.x*sim.L,y:q.y*sim.L};};
  const tip=sim.tip(),short=transform({x:-c.shortArm,y:0}),pivot=sim.pivot(),cw=sim.counterPoint();timber(short,tip,c.beamWidth,wood);
  if(c.mount==='hinged'&&c.chassis!=='floating')timber(short,cw,c.beamWidth*.3,'#7a8972');
  const cp=project(cw),r=sim.facts.counterRadius*cam.scale;
  drawCounterweight(ctx,{point:cp,radius:r,angle:sim.real(sim.counter).angle,material:c.material});
  const pp=project(pivot);ellipse(ctx,...pp,Math.max(5,c.axleRadius*cam.scale*2),Math.max(5,c.axleRadius*cam.scale*2),'#607b66','#364e3d',2);ellipse(ctx,...pp,2,2,'#c8d3ac',null);
  const pinEnd={x:tip.x+Math.cos(sim.arm.getAngle()+c.pinAngle*Math.PI/180)*c.pinLength,y:tip.y+Math.sin(sim.arm.getAngle()+c.pinAngle*Math.PI/180)*c.pinLength};line(tip,pinEnd,'#496c66',4);
  const animalPoint=sim.real(sim.shot),payload=sim.loading&&!sim.loading.loaded?sim.loading.target():animalPoint,p=project(payload),physicalSize=sim.animal.length*cam.scale;
  if(sim.sling){rope(tip,payload,c.slingLength);const o=c.pouchWidth*.32;rope({...tip,x:tip.x+.02*c.longArm},{x:payload.x+o,y:payload.y},c.slingLength,1,'#c1d3b1');
   ctx.save();ctx.translate(...p);ctx.beginPath();const pw=Math.max(9,c.pouchWidth*cam.scale*.65);ctx.moveTo(-pw,-4);ctx.quadraticCurveTo(-pw,physicalSize*.4,0,physicalSize*.39);ctx.quadraticCurveTo(pw,physicalSize*.4,pw,-4);ctx.lineTo(pw*.7,2);ctx.quadraticCurveTo(0,physicalSize*.22,-pw*.7,2);ctx.closePath();ctx.fillStyle='#759381';ctx.strokeStyle='#3e5e47';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
  }else if(sim.pouch){const pouch=sim.real(sim.pouch);rope(tip,pouch,c.slingLength);rope(tip,pouch,c.slingLength,1,'#c1d3b1',true);const a=project(pouch),t=Math.min(1,(sim.time-sim.release.time)*4),pw=Math.max(8,c.pouchWidth*cam.scale*.5);path(ctx,[[a[0]-pw,a[1]],[a[0],a[1]+pw*.55],[a[0]+pw*(1+t),a[1]+pw*t]],'#3f624d',6);path(ctx,[[a[0]-pw,a[1]],[a[0],a[1]+pw*.55],[a[0]+pw*(1+t),a[1]+pw*t]],'#a6baa0',3);}
  if(sim.loading&&!sim.loading.loaded&&!preview)drawLoadingCritter(sim);
  else drawCritter(ctx,sim.animal,...project(animalPoint),physicalSize,critterCel.angle,!!sim.release,sim.animal.width*cam.scale,critterCel);
  trough(sim,true);
  drawCrankWheel(ctx,sim,project,cam.scale);
  if(sim.loading&&!sim.loading.loaded&&!preview)loadingCues(sim);
  if(preview&&H>250){
   const a=project({x:-c.baseWidth*.75,y:0}),b=project({x:-c.baseWidth*.75,y:c.pivotHeight});path(ctx,[a,b],'#66774f',1);for(const pt of[a,b])path(ctx,[[pt[0]-4,pt[1]],[pt[0]+4,pt[1]]],'#66774f',1.5);ctx.fillStyle='#4a613d';ctx.font='bold 11px Trebuchet MS';ctx.textAlign='left';ctx.textAlign='right';ctx.fillText(`${c.pivotHeight.toFixed(2)} m`,a[0]-7,(a[1]+b[1])/2);
  }
  if(labels&&!sim.release&&!preview){annotation(cw,grams(c.counterGrams),24,-55);annotation({x:(tip.x+payload.x)/2,y:(tip.y+payload.y)/2},`${c.slingLength.toFixed(2)} m sling`,-150,-33);if(W>550)annotation(pivot,part(c.chassis).name,35,-25);if(physicalSize<25)annotation(payload,`${sim.animal.name} · ${grams(sim.animal.grams)}`,35,-25);}
  if(sim.release){const origin=project(sim.release);if(origin[0]>0&&origin[0]<W){ellipse(ctx,...origin,5,5,'#f0cb78','#926d38',1.5);ctx.font='9px "DM Sans",sans-serif';ctx.fillStyle='#687848';ctx.textAlign='left';ctx.fillText('RELEASE',origin[0]+9,origin[1]-7);}}
 }
 function drawLoadingStand(sim){
  const s=sim.loading.stand,a={x:s.x-s.width*.5,y:s.y},b={x:s.x+s.width*.5,y:s.y};
  for(const x of [s.x-s.width*.34,s.x+s.width*.34])timber({x,y:sim.supportHeight(x)+.02},{x,y:s.y},s.height*.25,'#947447');
  timber(a,b,s.height*.45,'#d4ad69');
  const p=project({x:s.x,y:s.y-s.height*.35});ctx.font='bold 9px Trebuchet MS,sans-serif';ctx.textAlign='center';ctx.fillStyle='#514a32';ctx.fillText('VOLUNTEER',p[0],p[1]+15);
 }
 function drawLoadingCritter(sim){
  const size=sim.animal.length*cam.scale,h=sim.animal.width*cam.scale;
  for(const p of sim.loading.parts){ctx.save();ctx.translate(...project(p));ctx.rotate(-p.angle);ctx.beginPath();ctx.rect((p.a-p.offset-.012)*size,-h*.7,(p.b-p.a+.024)*size,h*1.4);ctx.clip();drawCritter(ctx,sim.animal,-p.offset*size,0,size,0,false,h,{pose:'ready'});ctx.restore();}
  const grip=sim.loading.grip;if(grip){const p=project(grip),q=project(grip.cursor);if(Math.hypot(p[0]-q[0],p[1]-q[1])>3){ctx.save();ctx.setLineDash([3,3]);path(ctx,[p,q],'#f6d782',1.5);ctx.restore();}ellipse(ctx,...p,4.5,4.5,'#ffe4a5','#715637',1.5);ellipse(ctx,...p,1.5,1.5,'#6a603e',null);}
 }
 function loadingCues(sim){
  const target=project(sim.loading.target()),animal=project(sim.real(sim.shot)),held=sim.loading.dragging;
  ctx.save();ctx.setLineDash([4,4]);ellipse(ctx,...target,Math.max(12,sim.c.pouchWidth*cam.scale*.65),Math.max(7,sim.animal.width*cam.scale*.55),'#ffe5a418','#e5ba63',1.5);ctx.setLineDash([]);
  ctx.font='bold 12px Trebuchet MS,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#fff0cc';ctx.fillStyle='#3b3428';
  if(held){ctx.strokeText('Drop into the basket',target[0],target[1]-26);ctx.fillText('Drop into the basket',target[0],target[1]-26);}
  if(sim.loading.hint){
   const phase=sim.loading.hintPhase,t=reducedMotion?.55:Math.max(0,Math.min(1,(phase-.08)/.65)),ease=t*t*(3-2*t),x=animal[0]+(target[0]-animal[0])*ease,y=animal[1]+(target[1]-animal[1])*ease-Math.sin(t*Math.PI)*Math.min(65,H*.1);
   ctx.globalAlpha=reducedMotion?.8:Math.min(1,phase*10,(1-phase)*7);ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(...animal);ctx.quadraticCurveTo((animal[0]+target[0])/2,Math.min(animal[1],target[1])-70,...target);ctx.strokeStyle='#ffe6a5';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
   // A cursor paw, not an in-world operator or human hand.
   ellipse(ctx,x,y,8,6,'#fff0c2','#6e6746',1.5);for(let i=0;i<3;i++)ellipse(ctx,x-7+i*7,y-8-Math.abs(i-1)*2,3,3.5,'#fff0c2','#6e6746',1);
   const labelY=Math.max(H*.38,Math.min(target[1],animal[1])-30);ctx.strokeText('Drag → drop',W/2,labelY);ctx.fillStyle='#3b3428';ctx.fillText('Drag → drop',W/2,labelY);
  }ctx.restore();
 }
 function effectAnchor(sim,slot){
  if(['ballast','material','mount'].includes(slot))return sim.counterPoint();
  if(['release','arm'].includes(slot))return sim.tip();
  if(['sling','rope','animal'].includes(slot))return sim.real(sim.shot);
  if(slot==='trough')return sim.railPoint(0);
  if(slot==='winch')return crankGeometry(sim).center;
  if(slot==='chassis')return{x:sim.c.baseWidth*.5,y:sim.c.wheelRadius};
  return sim.pivot();
 }
 function drawEffects(sim){
  effects=effects.filter(e=>nowTime-e.start<1.2);
  for(const e of effects){const age=(nowTime-e.start)/1.2,p=project(effectAnchor(sim,e.slot));ctx.save();ctx.globalAlpha=1-age;const spread=(reducedMotion?12:12+age*58);for(let i=0;i<12;i++){const a=i*TAU/12+.2,xx=p[0]+Math.cos(a)*spread,yy=p[1]+Math.sin(a)*spread-age*15,r=(1-age)*(i%3+2.5);ctx.fillStyle=i%2?'#fff0a1':'#e7b95d';ctx.beginPath();ctx.moveTo(xx,yy-r*1.6);ctx.lineTo(xx+r*.5,yy-r*.4);ctx.lineTo(xx+r*1.4,yy);ctx.lineTo(xx+r*.4,yy+r*.4);ctx.lineTo(xx,yy+r*1.5);ctx.lineTo(xx-r*.4,yy+r*.4);ctx.lineTo(xx-r*1.4,yy);ctx.lineTo(xx-r*.4,yy-r*.4);ctx.closePath();ctx.fill();}ellipse(ctx,...p,6+age*40,6+age*40,null,'#f8eab0',2*(1-age));ctx.restore();}
 }
 function draw(sim,{labels=true,follow=true,paused=false,pixelRatio=2,preview:showPreview=false,winding=false}={}){
  preview=showPreview;windActive=winding||!!sim.winding;const now=performance.now()/1000;nowTime=now;ropeDt=Math.min(1/30,now-ropeTime||1/60);ropeTime=now;
  const bounds=canvas.getBoundingClientRect();W=Math.max(160,bounds.width);H=Math.max(120,bounds.height);const dpr=Math.min(pixelRatio,devicePixelRatio||1);if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);fit=true;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
  if(lastSim!==sim){lastSim=sim;fit=true;cords=[new RopeVisual(),new RopeVisual()];}if(fit)fitScene(sim);
  if(treeOverview&&sim.map&&!preview){const target=groveTreeCamera(sim.map,{width:W,height:H});target.scale*=treeZoom;const mix=reducedMotion||nowTime>=cameraUntil?1:1-Math.exp(-ropeDt*8);cam={x:cam.x+(target.x-cam.x)*mix,y:cam.y+(target.y-cam.y)*mix,scale:Math.exp(Math.log(cam.scale)*(1-mix)+Math.log(target.scale)*mix)};}
  else if(sim.release&&follow&&!preview){cam=groveFlightCamera(cam,sim.real(sim.shot),{width:W,height:H,animalLength:sim.animal.length/zoomFactor,dt:paused?0:ropeDt,reducedMotion});}
  canvas.dataset.cameraScale=cam.scale.toFixed(4);canvas.dataset.cameraMode=treeOverview&&!preview?'tree':sim.release&&follow&&!preview?'payload':'rig';
  critterCel=performanceState.update(sim);canvas.dataset.critterPose=critterCel.pose;canvas.dataset.critterHits=String(critterCel.hits);canvas.dataset.critterDamage=String(critterCel.tier);
  background(sim);
  if(sim.trail.length>2){ctx.setLineDash([2,6]);ctx.beginPath();for(let i=0;i<sim.trail.length;i++){const p=project(sim.trail[i]);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.strokeStyle='#f3e5a2';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);}
  mechanism(sim,labels);
  const crank=crankStateForQA(sim);canvas.dataset.crankAngle=String(crank.angle);canvas.dataset.crankRadius=String(crank.radius);canvas.dataset.loaded=String(sim.loading?.loaded??true);canvas.dataset.dragging=String(sim.loading?.dragging??false);canvas.dataset.loadingHint=String(sim.loading?.hint??false);canvas.dataset.grabPart=sim.loading?.grip?.part??'';canvas.dataset.loadingParts=JSON.stringify(sim.loading?.parts.map(p=>({...p,screen:project(p)}))??[]);canvas.dataset.loadingGrip=JSON.stringify(sim.loading?.grip?project(sim.loading.grip):null);
  canvas.dataset.animalPoint=JSON.stringify(project(sim.real(sim.shot)));canvas.dataset.slingPoint=JSON.stringify(project(sim.loading?.target()??sim.real(sim.shot)));

  if(sim.map)drawGroveWorld(ctx,{camera:cam,width:W,height:H,map:sim.map,time:sim.time,foreground:true});
  drawEffects(sim);
  if(critterCel.pose.startsWith('bonk')&&!preview){const p=project(sim.real(sim.shot)),r=Math.max(15,Math.min(30,sim.animal.length*cam.scale*.65));ctx.save();ctx.globalAlpha=.85;ctx.fillStyle='#ffedab';ctx.strokeStyle='#9b7851';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16,rr=r*(i%2?.72:1.15),x=p[0]+Math.cos(a)*rr,y=p[1]+Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();ctx.font='bold 12px Trebuchet MS,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#fff0ba';const word=critterCel.pose==='bonk-a'?'BONK!':'OOF!';ctx.strokeText(word,p[0],p[1]-r-8);ctx.fillStyle='#594e3e';ctx.fillText(word,p[0],p[1]-r-8);ctx.restore();}
  // The optional parts overlay includes a scale bar in real world units.
  if(!preview){
  const desired=90/cam.scale,n=10**Math.floor(Math.log10(desired)),bar=n*(desired/n>=5?5:desired/n>=2?2:1),px=bar*cam.scale;
  path(ctx,[[W-35-px,H-61],[W-35,H-61]],'#536849',1);path(ctx,[[W-35-px,H-65],[W-35-px,H-57]],'#536849',1);path(ctx,[[W-35,H-65],[W-35,H-57]],'#536849',1);ctx.fillStyle='#576d48';ctx.font='9px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText(`${bar.toLocaleString('en-US',{maximumFractionDigits:2})} m`,W-35-px/2,H-70);
  }
 }
 return{draw,fit:(reset=true)=>{fit=true;if(reset){zoomFactor=1;treeZoom=1;treeOverview=false;}},overview(){treeOverview=!treeOverview;cameraUntil=performance.now()/1000+.7;if(!treeOverview)fit=true;return treeOverview;},zoomBy(factor){if(!Number.isFinite(factor)||factor<=0)return;if(treeOverview){cameraUntil=performance.now()/1000+.45;treeZoom=Math.max(.3,Math.min(10,treeZoom*factor));}else{const before=zoomFactor;zoomFactor=Math.max(.002,Math.min(4,zoomFactor*factor));cam.scale*=zoomFactor/before;}},project,unproject:(x,y)=>({x:cam.x+(x-W/2)/cam.scale,y:cam.y-(y-H/2)/cam.scale}),equipBurst(slot){effects.push({slot,start:performance.now()/1000});if(effects.length>8)effects.shift();},needsAnimation(){const now=performance.now()/1000;effects=effects.filter(e=>now-e.start<1.2);return effects.length>0||now<cameraUntil;},get camera(){return{...cam};}};
}
