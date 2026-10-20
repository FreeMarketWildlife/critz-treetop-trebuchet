// Shared world art for the editor and live game. All scenery uses the same
// metre-to-pixel transform; distant layers alone use deliberate parallax.
const TAU=Math.PI*2,INK='#374b3c';
const ellipse=(c,x,y,rx,ry,fill,stroke=INK,line=2)=>{c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=line;c.strokeStyle=stroke;c.stroke();}};
const line=(c,pts,color,w=2)=>{if(!pts.length)return;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();};
const objectCache=new WeakMap();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>{const v=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return'#'+v(a).map((n,i)=>Math.round(mix(n,v(b)[i],t)).toString(16).padStart(2,'0')).join('');};
function leaf(c,x,y,s,angle,color){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(-s,0);c.quadraticCurveTo(-s*.2,-s*.7,s,0);c.quadraticCurveTo(s*.1,s*.8,-s,0);c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=Math.max(.7,s*.055);c.stroke();line(c,[[-s*.7,0],[s*.65,0]],'#cee09d',Math.max(.7,s*.04));c.restore();}
function cloud(c,x,y,s,alpha=1){c.save();c.globalAlpha*=alpha;ellipse(c,x,y,s*1.4,s*.36,'#f5f4df',null);ellipse(c,x-s*.5,y-s*.14,s*.62,s*.44,'#f5f4df',null);ellipse(c,x+s*.13,y-s*.32,s*.7,s*.58,'#f8f7e8',null);ellipse(c,x+s*.7,y-s*.04,s*.67,s*.4,'#f5f4df',null);line(c,[[x-s*.8,y+s*.18],[x+s*.8,y+s*.18]],'#c7ded4',Math.max(1,s*.06));c.restore();}
/** Original illustrated encounter models. size means diameter in screen px. */
export function drawGroveEnemy(c,kind,x,y,size,time=0){
 const name=String(kind??'beetle').toLowerCase();c.save();c.translate(x,y);c.scale(Math.max(.001,size)/100,Math.max(.001,size)/100);c.lineJoin='round';c.lineCap='round';
 const frog=name.includes('hopper')||name.includes('leaf'),bird=name.includes('bird'),yokai=name.includes('yokai'),cloudy=name.includes('cloud'),fungus=name.includes('fung')||name.includes('mushroom'),pod=name.includes('pod'),ring=name.includes('fragment')||name.includes('ring'),skid=name.includes('skid'),b=Math.sin(time*3)*2;
 if(yokai){
  c.beginPath();c.moveTo(-29,20);c.bezierCurveTo(-53,-39,32,-57,35,0);c.quadraticCurveTo(38,20,47,32);c.quadraticCurveTo(24,26,14,38);c.quadraticCurveTo(4,26,-9,37);c.quadraticCurveTo(-20,28,-29,20);c.fillStyle='#b3a1da';c.fill();c.strokeStyle='#534968';c.lineWidth=3;c.stroke();
  ellipse(c,-9,-4,7,11,'#f3eddd',null);ellipse(c,15,-4,7,11,'#f3eddd',null);ellipse(c,-7,-2,3,5,'#493c60',null);ellipse(c,17,-2,3,5,'#493c60',null);line(c,[[-5,15],[3,19],[12,14]],'#655073',3);leaf(c,-24,-28,15,-.6,'#7c75ad');leaf(c,21,-31,14,.8,'#7c75ad');
  c.globalAlpha=.5;ellipse(c,-42,6,4,4,'#ebe2ff',null);ellipse(c,44,-23,3,3,'#ebe2ff',null);
 }else if(cloudy){
  cloud(c,0,6,29,1);ellipse(c,-7,2,3,4,INK,null);ellipse(c,13,2,3,4,INK,null);line(c,[[0,11],[5,14],[10,10]],INK,2);for(let i=0;i<3;i++)line(c,[[-21+i*20,31],[-25+i*20,40+b]],'#87b9cb',4);leaf(c,23,-23,14,-.5,'#8aaf8c');
 }else if(fungus){
  ellipse(c,0,23,13,22,'#ead5a1',INK,3);line(c,[[-9,39],[-18,44]],INK,4);line(c,[[9,39],[18,44]],INK,4);
  c.beginPath();c.moveTo(-44,9);c.bezierCurveTo(-40,-48,37,-51,45,9);c.quadraticCurveTo(5,28,-44,9);c.fillStyle='#d48b93';c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();ellipse(c,0,11,44,10,'#f2d3a9',INK,3);
  for(const [a,b,r]of [[-21,-13,7],[8,-24,10],[29,-7,5]])ellipse(c,a,b,r,r*.7,'#ffe9bb',null);
  ellipse(c,-4,26,2.5,4,INK,null);ellipse(c,6,26,2.5,4,INK,null);line(c,[[-1,35],[4,37],[8,34]],INK,2);
 }else if(bird){
  line(c,[[-8,26],[-14,39],[-23,39]],INK,3);line(c,[[13,26],[18,39],[27,39]],INK,3);
  ellipse(c,0,0,31,28,'#7eabbe',INK,3);leaf(c,-28,-3,22,.2+b*.05,'#9dc4c5');leaf(c,29,-4,23,-.2-b*.05,'#9dc4c5');ellipse(c,14,-13,18,17,'#a6c6c7',INK,3);
  c.beginPath();c.moveTo(28,-12);c.lineTo(43,-6);c.lineTo(28,-1);c.closePath();c.fillStyle='#e4ba6e';c.fill();c.strokeStyle=INK;c.stroke();ellipse(c,20,-16,3.3,4.5,INK,null);
  c.save();c.rotate(-.2);c.fillStyle='#fff0bf';c.strokeStyle='#7a7052';c.lineWidth=2;c.fillRect(-16,3,32,22);c.strokeRect(-16,3,32,22);line(c,[[-16,3],[0,16],[16,3]],'#9e8c5d',2);ellipse(c,0,17,4,4,'#bb705b',null);c.restore();
 }else if(ring){
  c.rotate(.25);c.beginPath();c.moveTo(-37,-14);c.lineTo(-14,-36);c.lineTo(30,-25);c.lineTo(43,12);c.lineTo(12,35);c.lineTo(-29,26);c.closePath();c.fillStyle='#c5a584';c.fill();c.strokeStyle='#5c554f';c.lineWidth=3;c.stroke();line(c,[[-30,-11],[9,-19],[28,4],[9,25]],'#eee0b2',5);line(c,[[-9,-27],[-1,-9],[-13,8],[-2,30]],'#8a7668',3);ellipse(c,25,-12,3,3,'#fff0ba',null);
 }else if(pod){
  line(c,[[-19,27],[-27,42]],INK,4);line(c,[[19,27],[27,42]],INK,4);ellipse(c,0,0,29,36,'#d4a05c',INK,3);ellipse(c,-5,5,17,26,'#edc582',null);for(const xx of[-16,0,16])line(c,[[xx,-23],[xx*.8,25]],'#a67b47',2);leaf(c,-10,-32,20,-.65,'#83a85c');leaf(c,13,-30,19,.6,'#98b974');ellipse(c,-9,-2,3.5,5,INK,null);ellipse(c,11,-2,3.5,5,INK,null);line(c,[[-5,10],[2,16],[11,9]],INK,2.5);line(c,[[-25,7],[-40,1]],INK,3);line(c,[[25,7],[39,0]],INK,3);
 }else if(skid){
  leaf(c,0,0,49,-.16,name.includes('wax')?'#71b6a0':'#c7a46a');ellipse(c,3,7,26,12,'#e3ca91',INK,3);ellipse(c,-8,3,3,4,INK,null);ellipse(c,12,0,3,4,INK,null);line(c,[[-25,23],[24,14]],'#e4ebc0',4);line(c,[[-22,31],[13,24]],'#e4ebc0',2);
 }else if(frog){
  line(c,[[-20,14],[-37,31],[-46,26]],INK,5);line(c,[[20,14],[37,31],[46,26]],INK,5);ellipse(c,0,4,31,25,'#86b966',INK,3);leaf(c,-10,-12,35,-.4,'#9bc477');line(c,[[-21,-11],[-27,-31],[-36,-37]],INK,2);line(c,[[17,-12],[23,-33],[32,-38]],INK,2);ellipse(c,-14,-14,10,12,'#c4d38e',INK,3);ellipse(c,14,-16,10,12,'#c4d38e',INK,3);ellipse(c,-11,-14,4,6,INK,null);ellipse(c,17,-16,4,6,INK,null);line(c,[[-6,10],[2,17],[13,8]],INK,3);ellipse(c,-25,5,5,3,'#d4cf8c',null);
 }else{
  for(let i=0;i<3;i++){const yy=-10+i*15;line(c,[[-20,yy],[-36,yy-8],[-44,yy+1+b]],INK,4);line(c,[[20,yy],[36,yy-8],[44,yy+1-b]],INK,4);}
  ellipse(c,0,5,31,33,name.includes('archive')?'#b77c4a':'#a88767',INK,3);ellipse(c,-8,0,15,26,'#d9a562',null);line(c,[[0,-24],[0,35]],'#705b3e',3);for(const y of[-10,6,22]){line(c,[[-25,y],[-4,y+6]],'#8d6e44',2);line(c,[[6,y+6],[25,y]],'#8d6e44',2);}
  ellipse(c,0,-24,22,17,'#7f9c73',INK,3);line(c,[[-12,-36],[-20,-45],[-29,-45]],INK,2.5);line(c,[[12,-36],[20,-45],[29,-45]],INK,2.5);ellipse(c,-9,-25,5,7,'#f7ebbc',INK,1.8);ellipse(c,10,-25,5,7,'#f7ebbc',INK,1.8);ellipse(c,-7,-24,2,4,INK,null);ellipse(c,12,-24,2,4,INK,null);
 }
 c.restore();
}
function objectBounds(o){if(o.points?.length){const xs=o.points.map(p=>p.x),ys=o.points.map(p=>p.y);return{minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};}const r=o.radius??1;return{minX:o.x-r,maxX:o.x+r,minY:o.y-r,maxY:o.y+r};}
export function drawGroveWorld(c,{camera,width:W,height:H,map,time=0,foreground=false,editor=false}={}){
 if(!map)return;const cam=camera,s=cam.scale,alt=cam.y+(map.launch?.y??300),project=(x,y)=>[W/2+(x-cam.x)*s,H/2-(y-cam.y)*s];
 c.save();c.lineJoin='round';c.lineCap='round';
 if(!foreground){
  const space=clamp((alt-445)/100,0,1),floor=clamp((150-alt)/140,0,1);
  const top=blend(blend('#9dc6ce','#4f776d',floor),'#222b52',space),bottom=blend(blend('#e5edd1','#b5bd88',floor),'#69749d',space);
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,0,W,H);
  if(space>.05){c.globalAlpha=space;for(let i=0;i<72;i++){const x=((i*173.17-cam.x*s*.008)%(W+30)+W+30)%(W+30),y=((i*91.37+cam.y*s*.005)%(H+30)+H+30)%(H+30);ellipse(c,x,y,i%5===0?1.8:1,i%5===0?1.8:1,'#fff3c8',null);}c.globalAlpha=1;}
  // Three cloud depths drift at different fractions of camera travel, not with
  // the projectile. Their spacing remains readable during extreme close-ups.
  for(let depth=0;depth<3;depth++){const par=[.012,.035,.075][depth],spacing=470-depth*85;
   for(let i=-1;i<Math.ceil(W/spacing)+2;i++){const phase=cam.x*9*par+time*(.7+depth*.3),xx=((i*spacing-phase)%(W+spacing)+W+spacing)%(W+spacing)-spacing*.3;const yy=H*(.18+depth*.19)+Math.sin(i*2.3+depth)*H*.12+Math.sin(cam.y*.006)*H*.1;cloud(c,xx,yy,35+depth*17,(1-space)*(.55-depth*.09));}}
  // Distant layers describe the great crown overhead and lower forest beneath.
  const crownY=project(0,100)[1],lowerY=project(0,-150)[1];
  const canopyBand=(base,par,color,count=10)=>{for(let i=-1;i<count+1;i++){const xx=i*W/(count-1)-((cam.x*s*par)%(W/(count-1))),yy=base+Math.sin(i*2.4)*20;ellipse(c,xx,yy,W/count*.95,36+W/count*.3,color,null);}};
  if(alt<445){
   const by=H*.83+clamp((alt-300)/150,-1,1)*H*.48;canopyBand(by,.018,blend('#7fa693','#a8bbb0',.2),9);canopyBand(by+H*.11,.045,'#779b83',7);
   if(alt<240){canopyBand(H*.76+(alt-160)*1.2,.075,'#577d63',10);for(let i=0;i<12;i++){const xx=i*150-((cam.x*s*.08)%150);line(c,[[xx,H+20],[xx+15,H*.48]],'#6c8d68',10+i%4*6);}}
   if(crownY>-H&&crownY<H){const yy=H*.05+(crownY-H*.05)*.1;canopyBand(yy,.025,'#91ad77',8);}
  }
  // One immense trunk spans 400 metres. At launch it is a wall of bark,
  // not a small tree stamped behind the machine.
  const tx=map.tree?.trunkX??-12,tw=map.tree?.trunkWidth??14,root=-(map.launch?.y??300),topY=(map.tree?.height??400)+root;
  const left=project(tx-tw/2,0)[0],right=project(tx+tw/2,0)[0],yt=project(0,topY)[1],yb=project(0,root)[1];
  if(right>-50&&left<W+50&&yb>0&&yt<H){
   const trunk=c.createLinearGradient(Math.max(-W,left),0,Math.min(W*2,right),0);trunk.addColorStop(0,'#665b3c');trunk.addColorStop(.56,'#a38550');trunk.addColorStop(1,'#b8995e');c.fillStyle=trunk;c.beginPath();c.moveTo(left-tw*s*.12,yb);c.lineTo(left,yt);c.lineTo(right-tw*s*.2,yt);c.bezierCurveTo(right-tw*s*.08,H*.3,right,H*.8,right+tw*s*.2,yb);c.closePath();c.fill();c.strokeStyle='#46553b';c.lineWidth=3;c.stroke();
   c.save();c.beginPath();c.rect(left,Math.max(-100,yt),right-left,Math.min(H+200,yb-yt));c.clip();for(let i=0;i<16;i++){const xx=left+(right-left)*i/16;const shift=Math.sin(i*8)*10;line(c,[[xx+shift,-30],[xx-8,H*.31],[xx+8,H*.62],[xx-5,H+30]],i%2?'#796640':'#d2b477',Math.max(1.1,Math.min(5,s*.04)));}c.restore();
   for(let i=0;i<4;i++){const p=project(tx+tw*(.05+i*.12),35-i*24);if(p[1]>-100&&p[1]<H+100)ellipse(c,...p,Math.max(2,tw*s*.035),Math.max(4,tw*s*.12),null,'#78613c',Math.max(1,s*.02));}
   // The arched workshop door and brass lantern provide a human-sized cue.
   const dx=map.tree?.doorX??-8,[xx,yy]=project(dx,0),dw=1.4*s,dh=2.15*s;
   if(xx+dw>0&&xx-dw<W&&yy>0&&yy-dh<H){
    c.save();c.translate(xx,yy);c.beginPath();c.moveTo(-dw*.5,0);c.lineTo(-dw*.5,-dh+dw*.5);c.arc(0,-dh+dw*.5,dw*.5,Math.PI,TAU);c.lineTo(dw*.5,0);c.closePath();c.fillStyle='#34473b';c.fill();c.strokeStyle='#d2b777';c.lineWidth=Math.max(2,s*.06);c.stroke();
    c.beginPath();c.roundRect(-dw*.38,-dh*.76,dw*.76,dh*.75,Math.max(1,s*.12));c.fillStyle='#866b43';c.fill();c.strokeStyle='#1f3a30';c.lineWidth=Math.max(1,s*.025);c.stroke();for(let i=-1;i<=1;i++)line(c,[[i*dw*.22,-dh*.71],[i*dw*.22,-s*.06]],'#b29558',Math.max(1,s*.025));ellipse(c,dw*.2,-dh*.38,s*.055,s*.055,'#efd888',null);ellipse(c,0,-dh*.84,s*.19,s*.15,'#f3d995','#536447',Math.max(1,s*.025));line(c,[[-dw*.62,0],[dw*.62,0]],'#d3b36e',Math.max(3,s*.1));
    line(c,[[dw*.65,-dh*.8],[dw*.9,-dh*.8],[dw*.9,-dh*.62]],'#314c39',Math.max(1,s*.04));ellipse(c,dw*.9,-dh*.52,s*.12,s*.18,'#f9dc8b','#586648',Math.max(1,s*.03));c.restore();
   }
  }
  const gy=project(0,-(map.launch?.y??300))[1];if(gy<H){c.fillStyle='#79865d';c.fillRect(0,Math.max(0,gy),W,H-Math.max(0,gy));line(c,[[0,gy],[W,gy]],'#b8c98c',5);}
 }
 const visible={minX:cam.x-W/(2*s)-4,maxX:cam.x+W/(2*s)+4,minY:cam.y-H/(2*s)-4,maxY:cam.y+H/(2*s)+4};
 const palette={wood:['#a6814c','#d4b371'],leaf:['#739558','#bed58c'],stone:['#899b90','#c1ccc0'],bumper:['#c68c75','#ffe4a2']};
 let objects=map.objects??[];
 if(!editor){let cached=objectCache.get(map);if(!cached){cached=objects.map(o=>({o,b:objectBounds(o)})).sort((a,b)=>(a.o.layer==='back'?-1:0)-(b.o.layer==='back'?-1:0));objectCache.set(map,cached);}objects=cached;}else objects=objects.map(o=>({o,b:objectBounds(o)})).sort((a,b)=>(a.o.layer==='back'?-1:0)-(b.o.layer==='back'?-1:0));
 for(const {o,b} of objects){
  const layer=o.layer??'world';if((layer==='front')!==foreground)continue;
  if(b.maxX<visible.minX||b.minX>visible.maxX||b.maxY<visible.minY||b.minY>visible.maxY)continue;
  c.save();if(o.collision===false)c.globalAlpha=editor?.55:layer==='back'?.52:.7;
  if(o.type==='enemy'){const p=project(o.x,o.y);drawGroveEnemy(c,o.kind??o.enemy??o.recipe,...p,(o.radius??.5)*2*s,time);c.restore();continue;}
  const colors=palette[o.material]??palette.wood;
  if(o.type==='circle'){const p=project(o.x,o.y),r=(o.radius??1)*s;ellipse(c,...p,r,r,colors[0],INK,2.5);ellipse(c,p[0]-r*.15,p[1]-r*.16,r*.64,r*.58,colors[1],INK,1.4);ellipse(c,...p,r*.2,r*.2,'#f0dc9c',INK,1.5);if(o.material==='bumper'){for(let j=0;j<8;j++){const a=j*TAU/8;line(c,[[p[0]+Math.cos(a)*r*.8,p[1]+Math.sin(a)*r*.8],[p[0]+Math.cos(a)*r*.95,p[1]+Math.sin(a)*r*.95]],'#ffe8aa',2);}}}
  else if(o.points?.length){
   const pts=o.points.map(p=>project(p.x,p.y));c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);
   if(o.type==='polygon'){c.closePath();c.fillStyle=colors[0];c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();c.save();c.clip();const by=project(0,b.maxY)[1],ey=project(0,b.minY)[1],bx=project(b.minX,0)[0],ex=project(b.maxX,0)[0];
    const row=Math.max(13,Math.min(38,s*.3));for(let yy=Math.max(-row,by+row*.5);yy<Math.min(H+row,ey);yy+=row){line(c,[[Math.max(-30,bx),yy],[Math.min(W+30,ex),yy+Math.sin(yy)*3]],'#775c3730',1.5);}c.restore();
    // Bright upper edges make the collision plane legible without wireframes.
    for(let i=0;i<o.points.length;i++){const a=o.points[i],b=o.points[(i+1)%o.points.length];if(Math.abs(a.y-b.y)<Math.abs(a.x-b.x)*.65)line(c,[project(a.x,a.y),project(b.x,b.y)],colors[1],Math.max(2,Math.min(5,s*.07)));}
   }else{c.strokeStyle=INK;c.lineWidth=Math.max(4,Math.min(16,(o.width??.16)*s+3));c.stroke();line(c,pts,colors[0],Math.max(2,Math.min(13,(o.width??.16)*s)));}
  }
  c.restore();
 }
 // Thin foreground leaves frame the world without hiding the flight center.
 if(foreground&&!editor&&alt>220&&alt<400){c.globalAlpha=.45;for(let i=0;i<4;i++){const xx=(i%2?W+12:-12)-Math.sin(cam.x*.03+i)*8,yy=H*(.2+i*.19)+Math.sin(cam.y*.012+i)*28;leaf(c,xx,yy,35+i*9,i%2?2.5:.2,'#507954');}c.globalAlpha=1;}
 c.restore();
}
