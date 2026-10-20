import {part,grams} from './build-catalog.js';
const TAU=Math.PI*2;
const ellipse=(ctx,x,y,rx,ry,color,stroke='#3d4938',lw=2)=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
const path=(ctx,points,color,width)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
export function drawCritter(ctx,animal,x,y,size,angle=0,air=false){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const s=size/100;ctx.scale(s,s);ctx.lineJoin='round';
 const color=animal.color,id=animal.id,ink='#3e4638';
 if(id==='whale'){
  ctx.beginPath();ctx.moveTo(-45,0);ctx.bezierCurveTo(-18,-28,42,-23,48,-3);ctx.bezierCurveTo(50,26,-15,25,-42,8);ctx.lineTo(-56,24);ctx.lineTo(-53,3);ctx.lineTo(-66,-8);ctx.lineTo(-47,-6);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.stroke();ellipse(ctx,16,13,24,5,'#b7d1c5',null);path(ctx,[[-2,10],[-13,24],[10,14]],'#547f8a',4);ellipse(ctx,36,-1,2.6,3.6,'#243e3a',null);path(ctx,[[35,10],[43,8]],ink,1.8);
 }else{
  const elephant=id==='elephant',frog=id==='frog',rabbit=id==='rabbit',bear=id==='bear',tiger=id==='tiger';
  if(!frog&&!elephant){ctx.beginPath();ctx.moveTo(-34,6);ctx.quadraticCurveTo(-65,-(id==='squirrel'?50:3),-46,-(id==='squirrel'?35:9));ctx.strokeStyle=ink;ctx.lineWidth=id==='squirrel'?18:3.5;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=id==='squirrel'?14:2;ctx.stroke();}
  for(const x of [-23,17])ellipse(ctx,x,22,elephant?9:8,elephant?17:8,color,ink,2.4);
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
  ellipse(ctx,frog?24:34,frog?-21:-10,3.5,4.8,'#fffbed',ink,1.2);ellipse(ctx,frog?25:35,frog?-20:-9,1.9,2.8,'#293e32',null);
  if(!frog&&!elephant)ellipse(ctx,46,0,4,3,ink,null);
  if(air){ctx.beginPath();ctx.arc(elephant?36:34,7,5,0,Math.PI);ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.stroke();}else path(ctx,[[33,6],[37,8],[40,6]],ink,1.4);
  if(bear)ellipse(ctx,40,0,8,6,'#c2a382',null);
 }
 ctx.restore();
}
export function createBuildRenderer(canvas){
 const ctx=canvas.getContext('2d');let cam={x:0,y:2,scale:100},lastSim=null,fit=true;let W=1000,H=600;
 function project(p){return[W/2+(p.x-cam.x)*cam.scale,H/2-(p.y-cam.y)*cam.scale];}
 function line(a,b,color,width=2){path(ctx,[project(a),project(b)],color,width);}
 function fitScene(sim){const c=sim.c,wide=c.longArm+c.slingLength+c.shortArm+c.baseWidth*.7,high=c.pivotHeight+c.longArm*.7+sim.facts.counterRadius,scale=Math.min(W*(W<600?.94:.8)/Math.max(wide,3.5),H*.53/Math.max(high,2.4));cam={x:0,y:H*(W<600?.13:.25)/scale,scale};fit=false;}
 function background(sim){
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
 function rope(a,b,slack=0,color='#e0d4a0'){
  const p=project(a),q=project(b);ctx.beginPath();ctx.moveTo(...p);ctx.quadraticCurveTo((p[0]+q[0])/2,(p[1]+q[1])/2+slack*cam.scale,q[0],q[1]);ctx.strokeStyle='#4b5337';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
 }
 function mechanism(sim,labels){
  const c=sim.c,wood=part(c.arm).color,frame=sim.frame;
  for(let f=frame.getFixtureList();f;f=f.getNext())polygon(frame,f,'#ad814c');
  // Grain follows actual frame members.
  const fp=pt=>{const q=frame.getWorldPoint({x:pt.x/sim.L,y:pt.y/sim.L});return{x:q.x*sim.L,y:q.y*sim.L};};
  if(c.chassis==='anchored')for(const x of [-c.baseWidth/2,c.baseWidth/2]){const a=fp({x,y:.04}),b={x:a.x-.08*c.pivotHeight,y:-.12*c.pivotHeight};line(a,b,'#5a6c50',Math.max(2,cam.scale*c.beamWidth*.4));}
  if(c.chassis==='floating'){line({x:-c.baseWidth/2,y:c.pivotHeight},{x:c.baseWidth/2,y:c.pivotHeight},'#788c7d',6);const cw=sim.counterPoint();line({x:cw.x,y:0},{x:cw.x,y:c.pivotHeight+c.shortArm},'#697c6b',4);}
  for(const wheel of sim.wheels){const q=sim.real(wheel),p=project(q),r=c.wheelRadius*cam.scale;ellipse(ctx,...p,r,r,'#b2874b','#445039',3);ellipse(ctx,...p,r*.74,r*.74,'#d2ac6b','#697148',2);for(let i=0;i<6;i++){const a=q.angle+i*TAU/6;path(ctx,[p,[p[0]+Math.cos(a)*r*.72,p[1]-Math.sin(a)*r*.72]],'#796842',Math.max(1,r*.08));}ellipse(ctx,...p,r*.14,r*.14,'#667f65',null);}
  const transform=p=>{const q=sim.arm.getWorldPoint({x:p.x/sim.L,y:p.y/sim.L});return{x:q.x*sim.L,y:q.y*sim.L};};
  const tip=sim.tip(),short=transform({x:-c.shortArm,y:0}),pivot=sim.pivot(),cw=sim.counterPoint();timber(short,tip,c.beamWidth,wood);
  if(c.mount==='hinged'&&c.chassis!=='floating')timber(short,cw,c.beamWidth*.3,'#7a8972');
  const cp=project(cw),r=sim.facts.counterRadius*cam.scale;
  if(c.material==='stone'){
   ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7+sim.real(sim.counter).angle,rr=r*(i%2?.95:1);const x=cp[0]+Math.cos(a)*rr,y=cp[1]-Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fillStyle='#899081';ctx.strokeStyle='#45533f';ctx.lineWidth=2.5;ctx.fill();ctx.stroke();path(ctx,[[cp[0]-r*.4,cp[1]-r*.5],[cp[0]+r*.3,cp[1]-r*.65],[cp[0]+r*.6,cp[1]-r*.2]],'#bac0a6',2);
  }else{ctx.save();ctx.translate(...cp);ctx.rotate(-sim.real(sim.counter).angle);ctx.beginPath();ctx.roundRect(-r,-r,r*2,r*2,Math.max(1,r*.16));ctx.fillStyle=c.material==='sand'?'#aa8951':'#6a8680';ctx.strokeStyle='#3f5347';ctx.lineWidth=2.5;ctx.fill();ctx.stroke();for(let i=-1;i<=1;i++)path(ctx,[[-r*.8,r*i*.45],[r*.8,r*i*.45]],c.material==='sand'?'#735b38':'#abc0ac',2);ctx.restore();}
  const pp=project(pivot);ellipse(ctx,...pp,Math.max(5,c.axleRadius*cam.scale*2),Math.max(5,c.axleRadius*cam.scale*2),'#607b66','#364e3d',2);ellipse(ctx,...pp,2,2,'#c8d3ac',null);
  const pinEnd={x:tip.x+Math.cos(sim.arm.getAngle()+c.pinAngle*Math.PI/180)*c.pinLength,y:tip.y+Math.sin(sim.arm.getAngle()+c.pinAngle*Math.PI/180)*c.pinLength};line(tip,pinEnd,'#496c66',4);
  const payload=sim.real(sim.shot),p=project(payload),physicalSize=sim.animal.length*cam.scale;
  if(sim.sling){const len=Math.hypot(payload.x-tip.x,payload.y-tip.y);rope(tip,payload,Math.max(0,c.slingLength-len)*.4);const o=c.pouchWidth*.32;rope({...tip,x:tip.x+.02*c.longArm},{x:payload.x+o,y:payload.y},Math.max(0,c.slingLength-len)*.3,'#c1d3b1');
   ctx.save();ctx.translate(...p);ctx.beginPath();const pw=Math.max(9,c.pouchWidth*cam.scale*.65);ctx.moveTo(-pw,-4);ctx.quadraticCurveTo(-pw,physicalSize*.4,0,physicalSize*.39);ctx.quadraticCurveTo(pw,physicalSize*.4,pw,-4);ctx.lineTo(pw*.7,2);ctx.quadraticCurveTo(0,physicalSize*.22,-pw*.7,2);ctx.closePath();ctx.fillStyle='#759381';ctx.strokeStyle='#3e5e47';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
  }else if(sim.pouch){const pouch=sim.real(sim.pouch);rope(tip,pouch,Math.max(0,c.slingLength-Math.hypot(tip.x-pouch.x,tip.y-pouch.y))*.35);const a=project(pouch),t=Math.min(1,(sim.time-sim.release.time)*4),pw=Math.max(8,c.pouchWidth*cam.scale*.5);path(ctx,[[a[0]-pw,a[1]],[a[0],a[1]+pw*.55],[a[0]+pw*(1+t),a[1]+pw*t]],'#3f624d',6);path(ctx,[[a[0]-pw,a[1]],[a[0],a[1]+pw*.55],[a[0]+pw*(1+t),a[1]+pw*t]],'#a6baa0',3);}
  drawCritter(ctx,sim.animal,...p,Math.max(7,physicalSize),-payload.angle,!!sim.release);
  if(labels&&!sim.release){annotation(cw,grams(c.counterGrams),24,-55);annotation({x:(tip.x+payload.x)/2,y:(tip.y+payload.y)/2},`${c.slingLength.toFixed(2)} m sling`,-150,-33);if(W>550)annotation(pivot,part(c.chassis).name,35,-25);if(physicalSize<25)annotation(payload,`${sim.animal.name} · ${grams(sim.animal.grams)}`,35,-25);}
  if(sim.release){const origin=project(sim.release);if(origin[0]>0&&origin[0]<W){ellipse(ctx,...origin,5,5,'#f0cb78','#926d38',1.5);ctx.font='9px "DM Sans",sans-serif';ctx.fillStyle='#687848';ctx.textAlign='left';ctx.fillText('RELEASE',origin[0]+9,origin[1]-7);}}
 }
 function draw(sim,{labels=true,follow=true,paused=false,pixelRatio=2}={}){
  const bounds=canvas.getBoundingClientRect();W=Math.max(280,bounds.width);H=Math.max(250,bounds.height);const dpr=Math.min(pixelRatio,devicePixelRatio||1);if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);fit=true;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
  if(lastSim!==sim){lastSim=sim;fit=true;}if(fit)fitScene(sim);
  if(sim.release&&follow&&!paused){const q=sim.real(sim.shot),targetScale=Math.min(cam.scale,Math.max(1,Math.min(W/Math.max(8,sim.release.speed*1.5),H/Math.max(5,sim.maxY*1.3))));cam.x+=(q.x-cam.x)*.07;cam.y+=(Math.max(q.y,sim.animal.length*2+H/(cam.scale*3))-cam.y)*.07;cam.scale+=(targetScale-cam.scale)*.04;}
  background(sim);
  if(sim.trail.length>2){ctx.setLineDash([2,6]);ctx.beginPath();for(let i=0;i<sim.trail.length;i++){const p=project(sim.trail[i]);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.strokeStyle='#f3e5a2';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);}
  mechanism(sim,labels);
  if(labels&&sim.phase!=='ready'&&sim.phase!=='invalid'&&(!sim.release||sim.time-sim.release.time<2)){
   const ix=W-153,iy=246;ctx.fillStyle='#f7f5e5ec';ctx.strokeStyle='#adb998';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(ix,iy,133,91,8);ctx.fill();ctx.stroke();ctx.fillStyle='#788769';ctx.textAlign='left';ctx.font='8px "DM Sans",sans-serif';ctx.fillText(sim.release?'RING FREE · POUCH OPEN':'RELEASE FINGER · CLOSEUP',ix+11,iy+16);
   const cx=ix+64,cy=iy+53,a=-sim.arm.getAngle(),f=a-sim.c.pinAngle*Math.PI/180;
   path(ctx,[[cx-Math.cos(a)*36,cy-Math.sin(a)*36],[cx,cy]],'#a97d48',7);
   const px=cx+Math.cos(f)*29,py=cy+Math.sin(f)*29;path(ctx,[[cx,cy],[px,py]],'#526f61',3);
   const fraction=sim.release?1.3:Math.min(1,(sim.ringTravel??0)/sim.c.pinLength),rx=cx+Math.cos(f)*29*fraction,ry=cy+Math.sin(f)*29*fraction;
   const q=sim.real(sim.shot),tip=sim.tip(),sa=-Math.atan2(q.y-tip.y,q.x-tip.x);path(ctx,[[rx,ry],[rx+Math.cos(sa)*27,ry+Math.sin(sa)*27]],'#a28d56',1.5);ellipse(ctx,rx,ry,5,5,'#efd182','#907641',1.5);
  }
  // The optional parts overlay includes a scale bar in real world units.
  if(labels){
  const desired=90/cam.scale,n=10**Math.floor(Math.log10(desired)),bar=n*(desired/n>=5?5:desired/n>=2?2:1),px=bar*cam.scale;
  path(ctx,[[W-35-px,H-61],[W-35,H-61]],'#536849',1);path(ctx,[[W-35-px,H-65],[W-35-px,H-57]],'#536849',1);path(ctx,[[W-35,H-65],[W-35,H-57]],'#536849',1);ctx.fillStyle='#576d48';ctx.font='9px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText(`${bar.toLocaleString('en-US',{maximumFractionDigits:2})} m`,W-35-px/2,H-70);
  }
 }
 return{draw,fit:()=>{fit=true;},project};
}
