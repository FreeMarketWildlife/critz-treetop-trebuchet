import {spaceScale} from './grove-map.js?v=14';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
/** Every crown, trunk and forest tree is placed in metres. Parallax fades out
 * for wide views, where the whole silhouette must retain its true geometry. */
export function drawGroveBackdrop(c,{camera:cam,width:W,height:H,map,time=0}){
 const s=cam.scale,origin=map.launch.y,t=map.tree,k=spaceScale(map),alt=cam.y+origin,space=clamp((alt-890*k/2)/(210*k/2),0,1),dark=clamp((470*k/2-alt)/(350*k/2),0,1);
 const skyTop=blend('#a7c8c0','#263f38',dark),skyBottom=blend('#dbe6c5','#7d9471',dark),g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,blend(skyTop,'#222b52',space));g.addColorStop(1,blend(skyBottom,'#69749d',space));c.fillStyle=g;c.fillRect(0,0,W,H);
 const project=(x,y)=>[W/2+(x-cam.x)*s,H/2-(y-cam.y)*s],depth=clamp((s-1)/8,0,1);
 const oval=(x,y,rx,ry,fill,stroke=null,par=1)=>{x+=(cam.x-t.trunkX)*(1-par)*depth;y+=(cam.y-(t.height*.78-origin))*(1-par)*depth;const p=project(x,y),a=rx*s,b=ry*s;if(p[0]+a<0||p[0]-a>W||p[1]+b<0||p[1]-b>H)return;c.beginPath();c.ellipse(...p,Math.max(.01,a),Math.max(.01,b),0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=Math.min(2,Math.max(.6,s*.025));c.stroke();}};
 const stroke=(points,color,width)=>{c.beginPath();points.forEach(([x,y],i)=>{const p=project(x,y);i?c.lineTo(...p):c.moveTo(...p);});c.strokeStyle=color;c.lineWidth=Math.max(.6,width*s);c.lineCap='round';c.lineJoin='round';c.stroke();};
 if(space>.03){c.globalAlpha=space;for(let i=0;i<60;i++){const x=((i*173.17-cam.x*s*.008)%(W+30)+W+30)%(W+30),y=((i*91.37+cam.y*s*.005)%(H+30)+H+30)%(H+30);c.fillStyle='#fff3c8';c.fillRect(x,y,i%5===0?2:1,i%5===0?2:1);}c.globalAlpha=1;}
 if(space<.95){
  // Cloud banks occupy the sky around the tree, rather than covering its crown.
  for(let i=-4;i<13;i++){const x=i*165+Math.sin(i*2.4)*40,y=t.height+70+Math.sin(i*1.7)*75-origin;c.globalAlpha=(1-space)*.62;oval(x,y,65,12,'#eff0dc');oval(x-22,y+9,30,18,'#f4f3df');oval(x+16,y+11,35,24,'#f4f3df');}c.globalAlpha=1;
  // The dark woods have actual distant trunks, forks, layered crowns and roots.
  for(let layer=0;layer<2;layer++)for(let i=-7;i<13;i++){
   const x=i*155+layer*76,h=(230+Math.sin(i*1.9+layer)*85+layer*50)*k/2,y=h-origin;
   const p=project(x,-origin),q=project(x+9,y),wide=(10+layer*3)*s;if(Math.max(p[0],q[0])+wide<0||Math.min(p[0],q[0])-wide>W||q[1]>H)continue;
   stroke([[x,-origin],[x+3,h*.55-origin],[x+9,y]],layer?'#344e3e':'#506e55',10+layer*2);
   stroke([[x+5,h*.55-origin],[x-32,h*.77-origin],[x-58,h*.81-origin]],'#405e48',4);
   const palette=layer?['#416445','#53764e','#628457']:['#638361','#73936c','#7d9c73'];
   for(let j=0;j<5;j++)oval(x+(j-2)*22,y+Math.sin(j*1.7)*16,48,30,palette[j%3],null,.94-layer*.04);
  }
  // One complete Grandfather crown; the same silhouette survives every zoom.
  const radius=t.crownRadius??t.trunkWidth*3.6,half=(t.crownDepth??t.height*.44)/2,cy=t.height-half-origin,cx=t.trunkX;
  oval(cx,cy,radius,half,'#587a50','#385e42');
  for(let row=0;row<5;row++)for(let col=0;col<11;col++){
   const nx=(col-5)/5,ny=(row-2)/2;if(nx*nx+ny*ny>1.3)continue;
   const x=cx+nx*radius*.84+(row%2?radius*.055:0),y=cy+ny*half*.72,rx=radius*(.15+.025*Math.sin(col*4+row)),ry=half*(.26+.02*Math.cos(col+row));
   oval(x,y,rx,ry,['#729457','#688d51','#7a9c5b','#63874d'][(row+col)%4],'#4e7448',.94);
  }
  // Small skylights and overlapping leaf fans make the interior a leafy space.
  for(let i=0;i<21;i++){const a=i*2.399,r=Math.sqrt((i+.5)/21),x=cx+Math.cos(a)*radius*r*.86,y=cy+Math.sin(a)*half*r*.8;oval(x,y,6+i%4*2,3+i%3,'#aec39a',null,.98);}
  // Layered sprays, stems and hanging vines give the close interior depth.
  // Detail is selected on a world grid; wide views retain the same whole crown.
  if(s>3){const area=W*H/(s*s),step=8*Math.max(1,Math.ceil(Math.sqrt(area/22)/8));let budget=24;
   for(let layer=0;layer<2;layer++){
    const x0=Math.floor((cam.x-W/(2*s))/step)*step,y0=Math.floor((cam.y-H/(2*s))/step)*step;
    for(let x=x0;x<cam.x+W/(2*s)+step*.25&&budget>0;x+=step)for(let y=y0;y<cam.y+H/(2*s)+step*.25&&budget>0;y+=step){
     const inCrown=((x-cx)/radius)**2+((y-cy)/half)**2<1,inWoods=y+origin>2&&y+origin<350*k/2;if(!inCrown&&!inWoods)continue;
     const seed=Math.sin(x*9.3+y*7.7+layer*3),xx=x+seed*2+layer*step*.36,yy=y+Math.cos(x+y)*1.6+layer*step*.23,p=project(xx,yy),size=.76+(seed+1)*.24;
     c.save();c.translate(...p);c.scale(s,s);c.rotate(seed*2.7);c.globalAlpha=layer?.55:.34;
     c.beginPath();c.moveTo(-2.8*size,0);c.quadraticCurveTo(0,-.25,3.5*size,.1);c.strokeStyle=layer?'#315d3b':'#5c7d48';c.lineWidth=.055;c.stroke();
     for(let j=0;j<6;j++){const side=j%2?1:-1,xj=(j-2.5)*.9*size,yj=side*.32;c.save();c.translate(xj,yj);c.rotate(side*(.75+(j%3)*.2));const r=(.9+(j%3)*.25)*size;c.beginPath();c.moveTo(-r*.25,0);c.bezierCurveTo(-r*.06,-r*.5,r*.85,-r*.5,r*1.2,0);c.bezierCurveTo(r*.66,r*.5,0,r*.42,-r*.25,0);c.fillStyle=layer?['#446e3e','#567e46','#668b4c'][j%3]:['#8ca566','#9bb578','#7f9e5f'][j%3];c.fill();c.strokeStyle=layer?'#3b633c':'#718e52';c.lineWidth=.026;c.stroke();c.beginPath();c.moveTo(-r*.18,0);c.lineTo(r*.98,0);c.strokeStyle=layer?'#83a25e':'#c0ce92';c.lineWidth=.021;c.stroke();c.restore();}
     c.restore();budget--;
    }
   }
   // Slender vine stems tie the leaf sprays into the surrounding woods.
   if(alt<480*k/2){c.globalAlpha=.36;const x0=Math.floor((cam.x-W/(2*s))/13)*13;for(let x=x0;x<cam.x+W/(2*s);x+=13)stroke([[x,-origin+10],[x+Math.sin(x)*1.5,-origin+160*k/2],[x-1,-origin+335*k/2]],'#365b40',.07);c.globalAlpha=1;}
  }
  // Back bough silhouettes join the crown to the trunk in the same coordinates.
  for(let side of[-1,1])for(let i=0;i<5;i++){const yy=t.height*.62+i*t.height*.037-origin;stroke([[cx,yy-40],[cx+side*radius*.3,yy],[cx+side*radius*.68,yy+30]],'#527248',.7-i*.08);}
  const root=-origin,top=t.height-origin,left=cx-t.trunkWidth/2,right=cx+t.trunkWidth/2;
  const p0=project(left-t.trunkWidth*.13,root),p1=project(left+t.trunkWidth*.13,top),p2=project(right-t.trunkWidth*.2,top),p3=project(right,0),p4=project(right+t.trunkWidth*.16,root);
  if(p4[0]>0&&p0[0]<W&&p0[1]>0&&p1[1]<H){
   c.beginPath();c.moveTo(...p0);c.lineTo(...p1);c.lineTo(...p2);c.bezierCurveTo(...project(right-t.trunkWidth*.08,t.height*.85-origin),...project(right,25),...p3);c.quadraticCurveTo(...project(right,-origin*.7),...p4);c.closePath();
   const grad=c.createLinearGradient(Math.max(-W,p0[0]),0,Math.min(W*2,p4[0]),0);grad.addColorStop(0,'#655738');grad.addColorStop(.6,'#967a48');grad.addColorStop(1,'#b69a5d');c.fillStyle=grad;c.fill();c.strokeStyle='#46553a';c.lineWidth=2.5;c.stroke();c.save();c.clip();
   const visibleMin=cam.x-W/(2*s),visibleMax=cam.x+W/(2*s),spacing=t.trunkWidth/54;
   for(let x=Math.max(left,Math.floor(visibleMin/spacing)*spacing-spacing);x<Math.min(right+30,visibleMax+spacing);x+=spacing){const seed=Math.sin(x*1.37);stroke([[x+seed*2,root],[x-1,t.height*.3-origin],[x+2,t.height*.62-origin],[x-2,top]],Math.floor(x/spacing)%2?'#715e3e':'#c0a16a',Math.max(.025,t.trunkWidth*.0016));}
   if(s>8){const step=.48,x0=Math.max(left,Math.floor((cam.x-W/(2*s))/step)*step),x1=Math.min(right+4,cam.x+W/(2*s));for(let x=x0;x<x1;x+=step){const seed=Math.sin(x*31.7);stroke([[x+seed*.16,root],[x-.13,t.height*.32-origin],[x+.16,t.height*.69-origin],[x-.1,top]],seed>0?'#ad9059':'#7e693f',.025);}}
   c.restore();
   for(let i=0;i<8;i++){const x=right-5-(i%3)*t.trunkWidth*.06,y=root+80+i*t.height/9,p=project(x,y);if(p[0]<-40||p[0]>W+40||p[1]<-80||p[1]>H+80)continue;c.beginPath();c.ellipse(...p,Math.max(2,s*1.3),Math.max(4,s*4),.07,0,TAU);c.strokeStyle='#79623b';c.lineWidth=Math.max(.8,s*.035);c.stroke();}
  }
  // The workshop doorway stays two metres tall beside the actual 3 m rig.
  const [dx,dy]=project(t.doorX,0),dw=1.4*s,dh=2.15*s;if(dx+dw>0&&dx-dw<W&&dy>0&&dy-dh<H){c.save();c.translate(dx,dy);c.beginPath();c.moveTo(-dw*.5,0);c.lineTo(-dw*.5,-dh+dw*.5);c.arc(0,-dh+dw*.5,dw*.5,Math.PI,TAU);c.lineTo(dw*.5,0);c.closePath();c.fillStyle='#34473b';c.fill();c.strokeStyle='#d2b777';c.lineWidth=Math.max(1,s*.06);c.stroke();c.fillStyle='#896f43';c.fillRect(-dw*.37,-dh*.73,dw*.74,dh*.73);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*dw*.22,-dh*.7);c.lineTo(i*dw*.22,0);c.strokeStyle='#bda168';c.lineWidth=Math.max(.5,s*.025);c.stroke();}c.beginPath();c.arc(dw*.2,-dh*.37,Math.max(.6,s*.05),0,TAU);c.fillStyle='#f0d88d';c.fill();c.restore();}
  const gy=project(0,-origin)[1];if(gy<H){c.fillStyle='#4f6242';c.fillRect(0,Math.max(0,gy),W,H-Math.max(0,gy));stroke([[-2000,-origin],[20000,-origin]],'#9da77a',1.2);}
  // Roots, fern fans, shelf fungi and dim pollen give the forest floor detail.
  for(let side of[-1,1])for(let i=0;i<4;i++)stroke([[cx+side*25,-origin+35],[cx+side*(110+i*33),-origin+7],[cx+side*(180+i*50),-origin]],'#5b5437',9-i);
  for(let i=-30;i<80;i++){const x=i*17.3,y=-origin+Math.sin(i*2.1)*.7;const [xx,yy]=project(x,y);if(xx<-40||xx>W+40||yy<-60||yy>H+40)continue;for(let j=0;j<5;j++){const a=-Math.PI*.8+j*.36,px=x+Math.cos(a)*2.4,py=y+Math.abs(Math.sin(a))*3.2;stroke([[x,y],[px,py]],j%2?'#70905c':'#86a26c',.14);}oval(x+3,y+.5,.8,.35,'#c7ab7d');oval(x+3,y+1.15,1.1,.45,'#a17668');}
  if(alt<480*k/2){c.globalAlpha=.55;for(let i=0;i<32;i++)oval(-600+i*43,50+(i*31)%300-origin,.08,.08,'#e1d58f');c.globalAlpha=1;}
 }
}
