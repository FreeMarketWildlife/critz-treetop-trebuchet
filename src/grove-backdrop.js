import {ordinaryLeafHalfLength} from './grove-nature.js?v=16';
import {drawAncientTree} from './grove-tree-art.js?v=16';
import {drawJungleBackdrop} from './grove-jungle-art.js?v=16';
import {spaceScale} from './grove-map.js?v=16';
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
  drawJungleBackdrop(c,{project,camera:cam,scale:s,width:W,height:H,origin,parallax:depth});
  drawAncientTree(c,{project,tree:t,origin,scale:s,width:W,height:H,camera:cam});
  const radius=t.crownRadius??t.trunkWidth*3.6,half=(t.crownDepth??t.height*.44)/2,cy=t.height-half-origin,cx=t.trunkX;
  // Layered sprays, stems and hanging vines give the close interior depth.
  // Detail is selected on a world grid; wide views retain the same whole crown.
  if(s>6){const area=W*H/(s*s),step=.65*Math.max(1,Math.ceil(Math.sqrt(area/40)/.65));let budget=40;
   for(let layer=0;layer<2;layer++){
    const x0=Math.floor((cam.x-W/(2*s))/step)*step,y0=Math.floor((cam.y-H/(2*s))/step)*step;
    for(let x=x0;x<cam.x+W/(2*s)+step*.25&&budget>0;x+=step)for(let y=y0;y<cam.y+H/(2*s)+step*.25&&budget>0;y+=step){
     const inCrown=((x-cx)/radius)**2+((y-cy)/half)**2<1,inWoods=y+origin>2&&y+origin<350*k/2;if(!inCrown&&!inWoods)continue;
     const seed=Math.sin(x*9.3+y*7.7+layer*3),xx=x+seed*step*.2+layer*step*.36,yy=y+Math.cos(x+y)*step*.2+layer*step*.23,p=project(xx,yy),size=ordinaryLeafHalfLength(seed)*.78;
     c.save();c.translate(...p);c.scale(s,s);c.rotate(seed*2.7);c.globalAlpha=layer?.55:.34;
     c.beginPath();c.moveTo(-2.8*size,0);c.quadraticCurveTo(0,-.25*size,3.5*size,.1*size);c.strokeStyle=layer?'#315d3b':'#5c7d48';c.lineWidth=.005;c.stroke();
     for(let j=0;j<6;j++){const side=j%2?1:-1,xj=(j-2.5)*.9*size,yj=side*.32*size;c.save();c.translate(xj,yj);c.rotate(side*(.75+(j%3)*.2));const r=(.9+(j%3)*.25)*size;c.beginPath();c.moveTo(-r*.25,0);c.bezierCurveTo(-r*.06,-r*.5,r*.85,-r*.5,r*1.2,0);c.bezierCurveTo(r*.66,r*.5,0,r*.42,-r*.25,0);c.fillStyle=layer?['#446e3e','#567e46','#668b4c'][j%3]:['#8ca566','#9bb578','#7f9e5f'][j%3];c.fill();c.strokeStyle=layer?'#3b633c':'#718e52';c.lineWidth=.0026;c.stroke();c.beginPath();c.moveTo(-r*.18,0);c.lineTo(r*.98,0);c.strokeStyle=layer?'#83a25e':'#c0ce92';c.lineWidth=.0021;c.stroke();c.restore();}
     c.restore();budget--;
    }
   }
   // Slender vine stems tie the leaf sprays into the surrounding woods.
   if(alt<480*k/2){c.globalAlpha=.36;const x0=Math.floor((cam.x-W/(2*s))/13)*13;for(let x=x0;x<cam.x+W/(2*s);x+=13)stroke([[x,-origin+10],[x+Math.sin(x)*1.5,-origin+160*k/2],[x-1,-origin+335*k/2]],'#365b40',.07);c.globalAlpha=1;}
  }
  // The workshop doorway stays two metres tall beside the compact starter rig.
  const [dx,dy]=project(t.doorX,0),dw=1.4*s,dh=2.15*s;if(dx+dw>0&&dx-dw<W&&dy>0&&dy-dh<H){c.save();c.translate(dx,dy);c.beginPath();c.moveTo(-dw*.5,0);c.lineTo(-dw*.5,-dh+dw*.5);c.arc(0,-dh+dw*.5,dw*.5,Math.PI,TAU);c.lineTo(dw*.5,0);c.closePath();c.fillStyle='#34473b';c.fill();c.strokeStyle='#d2b777';c.lineWidth=Math.max(1,s*.06);c.stroke();c.fillStyle='#896f43';c.fillRect(-dw*.37,-dh*.73,dw*.74,dh*.73);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*dw*.22,-dh*.7);c.lineTo(i*dw*.22,0);c.strokeStyle='#bda168';c.lineWidth=Math.max(.5,s*.025);c.stroke();}c.beginPath();c.arc(dw*.2,-dh*.37,Math.max(.6,s*.05),0,TAU);c.fillStyle='#f0d88d';c.fill();c.restore();}
  if(alt<480*k/2){c.globalAlpha=.55;for(let i=0;i<32;i++)oval(-600+i*43,50+(i*31)%300-origin,.08,.08,'#e1d58f');c.globalAlpha=1;}
 }
}
