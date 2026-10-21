import {ordinaryLeafHalfLength,drawCanopySpray} from './grove-nature.js?v=21';
import {drawAncientTree} from './grove-tree-art.js?v=21';
import {drawJungleBackdrop} from './grove-jungle-art.js?v=21';
import {spaceScale} from './grove-map.js?v=21';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
/** Every crown, trunk and forest tree is placed in metres. Parallax fades out
 * for wide views, where the whole silhouette must retain its true geometry. */
export function drawGroveBackdrop(c,{camera:cam,width:W,height:H,map,time=0}){
 const s=cam.scale,origin=map.launch.y,t=map.tree,k=spaceScale(map),alt=cam.y+origin,space=clamp((alt-890*k/2)/(210*k/2),0,1),dark=clamp((470*k/2-alt)/(350*k/2),0,1);
 const skyTop=blend('#8fbbb7','#183b43',dark),skyBottom=blend('#f3e7bb','#6e9e93',dark),g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,blend(skyTop,'#222b52',space));g.addColorStop(1,blend(skyBottom,'#69749d',space));c.fillStyle=g;c.fillRect(0,0,W,H);
 const project=(x,y)=>[W/2+(x-cam.x)*s,H/2-(y-cam.y)*s],depth=clamp((s-1)/8,0,1);
 const oval=(x,y,rx,ry,fill,stroke=null,par=1)=>{x+=(cam.x-t.trunkX)*(1-par)*depth;y+=(cam.y-(t.height*.78-origin))*(1-par)*depth;const p=project(x,y),a=rx*s,b=ry*s;if(p[0]+a<0||p[0]-a>W||p[1]+b<0||p[1]-b>H)return;c.beginPath();c.ellipse(...p,Math.max(.01,a),Math.max(.01,b),0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=Math.min(2,Math.max(.6,s*.025));c.stroke();}};
 const stroke=(points,color,width)=>{c.beginPath();points.forEach(([x,y],i)=>{const p=project(x,y);i?c.lineTo(...p):c.moveTo(...p);});c.strokeStyle=color;c.lineWidth=Math.max(.6,width*s);c.lineCap='round';c.lineJoin='round';c.stroke();};
 if(space>.03){c.globalAlpha=space;for(let i=0;i<60;i++){const x=((i*173.17-cam.x*s*.008)%(W+30)+W+30)%(W+30),y=((i*91.37+cam.y*s*.005)%(H+30)+H+30)%(H+30);c.fillStyle='#fff3c8';c.fillRect(x,y,i%5===0?2:1,i%5===0?2:1);}c.globalAlpha=1;}
 if(space<.95){
  // Cloud banks occupy the sky around the tree, rather than covering its crown.
  for(let i=-4;i<13;i++){const x=i*165+Math.sin(i*2.4)*40,y=t.height+70+Math.sin(i*1.7)*75-origin;c.globalAlpha=(1-space)*.62;oval(x,y,65,12,'#eff0dc');oval(x-22,y+9,30,18,'#f4f3df');oval(x+16,y+11,35,24,'#f4f3df');}c.globalAlpha=1;
  drawJungleBackdrop(c,{project,camera:cam,scale:s,width:W,height:H,origin,parallax:depth});
  // Whole-tree views retain its real silhouette. At mouse scale the immense
  // crown is a distant mass, so transparent cool colour keeps local solids clear.
  const close=clamp((s-3)/24,0,1);c.save();c.globalAlpha=1-close*.68;
  drawAncientTree(c,{project,tree:t,origin,scale:s,width:W,height:H,camera:cam});c.restore();
  // A quiet pool of canopy light separates small volunteers from the enormous
  // crown behind them. Atmosphere is screen-space; actual trees stay in metres.
  if(s>6&&space<.1){const light=c.createRadialGradient(W*.54,H*.38,0,W*.54,H*.38,Math.max(W,H)*.76);light.addColorStop(0,'#fff0c856');light.addColorStop(.5,'#e6eac01c');light.addColorStop(1,'#b5dbcc00');c.fillStyle=light;c.fillRect(0,0,W,H);}
  // Long, clearly distant lianas provide a calm directional silhouette at
  // critter scale. Their fixed canopy lattice uses slower parallax, never the
  // strong flat upper lip reserved for real collision surfaces.
  if(s>12&&alt>25&&alt<t.height-20){
   const par=.16,spacing=3.7,x0=Math.floor((cam.x*par-W/(2*s)-2)/spacing)*spacing;
   let count=0;for(let x=x0;x<cam.x*par+W/(2*s)+2&&count<5;x+=spacing,count++){
    const seed=Math.sin(x*14.73),xx=x+cam.x*(1-par),anchorY=Math.floor((cam.y*par+H/(2*s))/6)*6+cam.y*(1-par)+2;
    c.save();c.globalAlpha=.12;c.beginPath();c.moveTo(...project(xx,anchorY));c.bezierCurveTo(...project(xx+.6*seed,anchorY-2),...project(xx-.35,anchorY-4),...project(xx+.3*seed,anchorY-6.5));c.strokeStyle='#29565a';c.lineWidth=Math.max(.7,s*.028);c.stroke();
    for(let j=1;j<4;j++){const yy=anchorY-j*1.55,pp=project(xx+Math.sin(j+seed)*.18,yy);c.save();c.translate(...pp);c.scale(s,s);c.rotate((j%2?-1:1)*.8);drawCanopySpray(c,.045,j%4,seed);c.restore();}c.restore();
   }
  }
  const radius=t.crownRadius??t.trunkWidth*3.6,half=(t.crownDepth??t.height*.44)/2,cy=t.height-half-origin,cx=t.trunkX;
  // Sparse botanical accents occupy stable world cells. Different fronds,
  // curled tips and seed sprays replace a screen-wide repeated leaf wallpaper.
  if(s>6){const area=W*H/(s*s),step=.95*Math.max(1,Math.ceil(Math.sqrt(area/14)/.95));let budget=14;
   const x0=Math.floor((cam.x-W/(2*s))/step)*step,y0=Math.floor((cam.y-H/(2*s))/step)*step;
   for(let x=x0;x<cam.x+W/(2*s)+step*.3&&budget>0;x+=step)for(let y=y0;y<cam.y+H/(2*s)+step*.3&&budget>0;y+=step){
    const inCrown=((x-cx)/radius)**2+((y-cy)/half)**2<1,inWoods=y+origin>2&&y+origin<350*k/2;if(!inCrown&&!inWoods)continue;
    const seed=Math.sin(x*9.3+y*7.7),family=Math.abs(Math.floor(x*11+y*17))%4,xx=x+seed*step*.23,yy=y+Math.cos(x+y)*step*.22,p=project(xx,yy),size=ordinaryLeafHalfLength(seed);
    c.save();c.translate(...p);c.scale(s,s);c.rotate(seed*2.2);c.globalAlpha=.18+(seed+1)*.09;
    drawCanopySpray(c,size,family,seed);c.restore();budget--;
   }
   if(alt<480*k/2){c.globalAlpha=.24;const x0=Math.floor((cam.x-W/(2*s))/13)*13;for(let x=x0;x<cam.x+W/(2*s);x+=13)stroke([[x,-origin+10],[x+Math.sin(x)*1.5,-origin+160*k/2],[x-1,-origin+335*k/2]],'#345f61',.07);c.globalAlpha=1;}
  }
  // The workshop doorway stays two metres tall beside the compact starter rig.
  const [dx,dy]=project(t.doorX,0),dw=1.4*s,dh=2.15*s;if(dx+dw>0&&dx-dw<W&&dy>0&&dy-dh<H){c.save();c.translate(dx,dy);c.beginPath();c.moveTo(-dw*.5,0);c.lineTo(-dw*.5,-dh+dw*.5);c.arc(0,-dh+dw*.5,dw*.5,Math.PI,TAU);c.lineTo(dw*.5,0);c.closePath();c.fillStyle='#253f40';c.fill();c.strokeStyle='#d2b777';c.lineWidth=Math.max(1,s*.06);c.stroke();c.fillStyle='#9b643e';c.fillRect(-dw*.37,-dh*.73,dw*.74,dh*.73);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*dw*.22,-dh*.7);c.lineTo(i*dw*.22,0);c.strokeStyle='#d8a966';c.lineWidth=Math.max(.5,s*.025);c.stroke();}c.beginPath();c.arc(dw*.2,-dh*.37,Math.max(.6,s*.05),0,TAU);c.fillStyle='#f0d88d';c.fill();c.restore();}
  if(alt<480*k/2){c.globalAlpha=.55;for(let i=0;i<32;i++)oval(-600+i*43,50+(i*31)%300-origin,.08,.08,'#e1d58f');c.globalAlpha=1;}
  // The ordinary physical floor has its own continuous contact edge. Unlike
  // background silhouettes it stays opaque and exactly at y=-launch altitude.
  const gy=project(0,-origin)[1];if(gy<H+2){
   const top=Math.max(0,gy),earth=c.createLinearGradient(0,top,0,Math.max(top+1,H));earth.addColorStop(0,'#a66c42');earth.addColorStop(.18,'#755136');earth.addColorStop(1,'#33483c');c.fillStyle=earth;c.fillRect(0,top,W,H-top);
   if(gy>=-2){c.fillStyle='#314e3a';c.fillRect(0,gy,W,Math.max(2,Math.min(13,s*.065)));c.fillStyle='#c9c978';c.fillRect(0,gy,W,Math.max(1,Math.min(3,s*.015)));}
   if(s>2){const step=Math.max(.55,22/s),x0=Math.floor((cam.x-W/(2*s))/step)*step;let budget=48;
    for(let x=x0;x<cam.x+W/(2*s)&&budget-->0;x+=step){const seed=Math.sin(x*11.3),p=project(x,-origin-.1-Math.abs(seed)*.16),r=Math.min(7,s*.025);c.beginPath();c.moveTo(p[0]-r,p[1]);c.quadraticCurveTo(p[0],p[1]-r*.55,p[0]+r*1.5,p[1]+r*.4);c.strokeStyle=seed>0?'#dfab6a':'#4c4933';c.lineWidth=Math.max(.7,s*.007);c.stroke();}
   }
  }

 }
}
