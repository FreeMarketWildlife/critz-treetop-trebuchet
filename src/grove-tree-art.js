import {ancientBough} from './grove-tree-layout.js?v=25';
import {foliageClump} from './grove-nature.js?v=25';
// A whole, branching tree, rather than a cylinder behind an oval. Coordinates
// remain fixed at every camera scale, including the academy doorway at y=0.
export function drawAncientTree(c,{project,tree:t,origin,scale:s,width:W,height:H,camera}){
 const cx=t.trunkX,w=t.trunkWidth,h=t.height,r=t.crownRadius??w*3.6,root=-origin,top=h-origin;
 const visible=(x,y,rx,ry)=>{const p=project(x,y);return p[0]+rx*s>0&&p[0]-rx*s<W&&p[1]+ry*s>0&&p[1]-ry*s<H;};
 const crown=(front=false)=>{
  // The asymmetric crown rises into lobes and dips around the main forks.
  for(let i=0;i<(front?31:24);i++){
   const a=i*2.39996,rr=Math.sqrt((i+.8)/(front?31:24)),x=cx+Math.cos(a)*r*rr*.86,y=top-h*.18+Math.sin(a)*h*.175*rr,rx=r*(.17+.025*Math.sin(i*1.7)),ry=h*(.072+.012*Math.cos(i*2));
   if(!visible(x,y,rx*1.15,ry*1.15))continue;
   foliageClump(c,project,x,y,rx,ry,(front?['#3e7267','#4c8674','#6c9d7c','#4b7e69']:['#234e51','#315e5d','#416f64'])[i%(front?4:3)],front?'#bad19a':'#6e9980',i);
  }
 };
 crown(false);crown(true);
 // Graceful scaffold limbs taper into the spreading crown. Broad bases merge
 // into the trunk; forks are visible through deliberate gaps in the foliage.
 for(let side of[-1,1])for(let row=0;row<10;row++){
  const points=ancientBough(t,origin,row,side);c.beginPath();points.forEach((p,i)=>i?c.lineTo(...project(p.x,p.y)):c.moveTo(...project(p.x,p.y)));c.closePath();c.fillStyle=row%2?'#965f3c':'#754c38';c.fill();
 }
 // Flared buttresses rise out of the root mound. The right edge at launch
 // altitude stays exactly at trunkX+trunkWidth/2, beside the existing door.
 const right=cx+w/2,left=cx-w/2;
 c.beginPath();c.moveTo(...project(cx-w*1.05,root));c.bezierCurveTo(...project(left-w*.3,root+12),...project(left+w*.2,root+h*.16),...project(left+w*.25,root+h*.4));
 c.bezierCurveTo(...project(left+w*.35,root+h*.62),...project(cx-w*.15,root+h*.7),...project(cx-w*.44,root+h*.89));
 c.quadraticCurveTo(...project(cx-w*.33,root+h*.83),...project(cx+w*.05,root+h*.72));
 c.bezierCurveTo(...project(cx+w*.2,root+h*.78),...project(cx+w*.49,root+h*.86),...project(cx+w*.55,root+h*.91));
 c.bezierCurveTo(...project(cx+w*.53,root+h*.82),...project(right-3,root+h*.78),...project(right,0));
 c.bezierCurveTo(...project(right-7,root+h*.35),...project(right-10,root+55),...project(cx+w*1.03,root));c.closePath();
 const g=c.createLinearGradient(...project(left,0),...project(right,0));g.addColorStop(0,'#4f4235');g.addColorStop(.28,'#704b35');g.addColorStop(.29,'#a46b42');g.addColorStop(.69,'#b67c49');g.addColorStop(.70,'#8b5639');g.addColorStop(1,'#5b4434');c.fillStyle=g;c.fill();c.strokeStyle='#302d2b';c.lineWidth=Math.min(3,Math.max(.8,s*.15));c.stroke();
 c.save();c.clip();
 // Ridges twist and converge up the trunk, with moss gathering in the folds.
 for(let i=0;i<25;i++){
  const x=left+i*w/24,bend=Math.sin(i*1.9)*w*.05;
  c.beginPath();c.moveTo(...project(x-w*.18*Math.sin(i),root));c.bezierCurveTo(...project(x+bend,root+h*.27),...project(x+w*.08,root+h*.53),...project(cx+w*.3+(x-cx)*.35,top-h*.09));c.strokeStyle=i%3?'#67432f':'#d19b5d';c.lineWidth=Math.max(.6,s*w*(i%3?.009:.006));c.stroke();
 }
 // Local bark detail is bounded by the viewport instead of covering 800 m.
 if(s>5){const low=Math.max(root,camera.y-H/(2*s)-2),high=Math.min(top,camera.y+H/(2*s)+2),xmin=Math.max(left,camera.x-W/(2*s)-2),xmax=Math.min(right,camera.x+W/(2*s)+2);for(let x=Math.floor(xmin/.7)*.7;x<xmax;x+=.7){c.beginPath();c.moveTo(...project(x,low));c.bezierCurveTo(...project(x+.18,low+(high-low)*.3),...project(x-.16,low+(high-low)*.7),...project(x+.1,high));c.strokeStyle=Math.sin(x*37)>0?'#c18b51':'#6c4733';c.lineWidth=Math.max(.5,s*.017);c.stroke();}}
 c.restore();
 for(let side of[-1,1])for(let i=0;i<5;i++){
  const end=cx+side*w*(.75+i*.17),start=cx+side*w*.15;
  c.beginPath();c.moveTo(...project(start,root+h*(.22-i*.025)));c.bezierCurveTo(...project(start+side*w*.12,root+27),...project(end-side*23,root+13),...project(end,root));c.quadraticCurveTo(...project(end+side*36,root-1),...project(end+side*45,root));c.bezierCurveTo(...project(end-side*12,root+28),...project(start+side*10,root+50),...project(start,root+h*(.22-i*.025)));c.fillStyle=['#8b5939','#5f4d36','#ac7748'][i%3];c.fill();c.strokeStyle='#3b3830';c.lineWidth=Math.max(.5,Math.min(2,s*.16));c.stroke();
 }
 // Front foliage leaves the rooted trunk and structural forks exposed.
 // Small sprays break the crown's silhouette into individual leafy edges.
 if(s<5)for(let i=0;i<35;i++){const a=i*2.39996,rr=Math.sqrt((i+.5)/35),x=cx+Math.cos(a)*r*rr*.96,y=top-h*.18+Math.sin(a)*h*.19*rr;if(!visible(x,y,18,12))continue;foliageClump(c,project,x,y,12+i%5*2,5+i%3*2,i%3?'#6a9973':'#93b885','#c8dca3',i);}
}

// V4 oak: a 76 m broad crown over a 7 m basal trunk. These normalized
// control points describe only foliage; no procedural solid boughs are added.
const OAK_CROWN_PROFILE=Object.freeze([
 ['M',-1,.44],['C',-1,.57,-.94,.62,-.86,.60],['C',-.97,.80,-.73,.91,-.61,.80],
 ['C',-.65,.99,-.37,1,-.26,.90],['C',-.17,1,-.05,1,.08,1],['C',.20,1,.30,.93,.33,.84],
 ['C',.45,.99,.68,.96,.68,.80],['C',.89,.88,.99,.69,.89,.58],['C',1,.60,1,.48,1,.40],
 ['C',1,.28,.91,.25,.82,.30],['C',.87,.13,.67,.07,.58,.18],['C',.53,.04,.41,0,.30,0],
 ['C',.16,0,.05,.14,-.04,.12],['C',-.22,.04,-.36,.01,-.48,.16],['C',-.61,.05,-.83,.14,-.79,.30],
 ['C',-.92,.22,-1,.29,-1,.44],['Z']
].map(Object.freeze));
/** World-coordinate crown commands are also usable in a standalone scale
 * comparison. All controls stay within the declared crown width/depth. */
export function oakCrownCommands(tree,origin=0){
 const radius=tree.crownRadius,depth=tree.crownDepth,bottom=tree.height-depth-origin;
 return OAK_CROWN_PROFILE.map(([command,...values])=>[command,...values.map((v,i)=>i%2?bottom+v*depth:tree.trunkX+v*radius)]);
}
function oakPath(c,commands,project){
 c.beginPath();for(const [command,...a]of commands){if(command==='Z'){c.closePath();continue;}const p=[];for(let i=0;i<a.length;i+=2)p.push(...project(a[i],a[i+1]));if(command==='M')c.moveTo(...p);else if(command==='L')c.lineTo(...p);else if(command==='Q')c.quadraticCurveTo(...p);else c.bezierCurveTo(...p);}
}
/** Exact tapered trunk in world metres; root spread is separately declared. */
export function oakTrunkCommands(t,origin=0){
 const x=t.trunkX,w=t.trunkWidth,h=t.height,y=-origin;
 return[['M',x-w/2,y],['C',x-w*.40,y+h*.14,x-w*.36,y+h*.29,x-w*.31,y+h*.44],['C',x-w*.43,y+h*.56,x-w*.22,y+h*.65,x-w*.28,y+h*.75],['Q',x-w*.11,y+h*.78,x-w*.078,y+h*.855],['L',x+w*.071,y+h*.855],['C',x+w*.03,y+h*.73,x+w*.24,y+h*.65,x+w*.19,y+h*.55],['C',x+w*.31,y+h*.44,x+w*.34,y+h*.24,x+w/2,y],['Z']];
}
export function oakRootCommands(t,origin=0){
 const x=t.trunkX,w=t.trunkWidth,y=-origin;
 return[-1,1].flatMap(side=>Array.from({length:3},(_,i)=>{const start=x+side*w*(.24+i*.06),end=x+side*w*(.55+i*.075);return[['M',start,y+3.1-i*.6],['Q',start+side*w*.12,y+.8,end,y],['Q',end-side*.8,y-.10,x+side*w*.32,y],['Z']];}));
}
/** V4 only. The shared editor/runtime object painter supplies every solid
 * oak-scaffold-* branch, so decoration cannot invent a landable-looking bough. */
export function drawProportionedOak(c,{project,tree:t,origin,scale:s,width:W,height:H,camera}){
 const cx=t.trunkX,w=t.trunkWidth,h=t.height,r=t.crownRadius,depth=t.crownDepth,root=-origin,commands=oakCrownCommands(t,origin);
 const crownBottom=h-depth-origin,close=Math.max(0,Math.min(1,(s-8)/52));
 c.save();c.globalAlpha*=1-close*.76;oakPath(c,commands,project);
 const g=c.createLinearGradient(...project(cx,crownBottom),...project(cx,h-origin));g.addColorStop(0,'#315e50');g.addColorStop(.46,'#527b55');g.addColorStop(1,'#8ca76a');c.fillStyle=g;c.fill();c.save();c.clip();
 // Broad crown volumes are leaf masses, not metre-long individual leaves.
 for(let i=0;i<17;i++){const a=i*2.39996,q=Math.sqrt((i+.5)/17),x=cx+Math.cos(a)*r*q*.88,y=crownBottom+depth*(.52+Math.sin(a)*q*.46),rx=r*(.19+.035*Math.sin(i)),ry=depth*(.14+.025*Math.cos(i*1.7));foliageClump(c,project,x,y,rx,ry,['#668b5b','#486f50','#78965e','#527e57'][i%4],'#b6c78a',i,s<1.4);}
 c.restore();c.restore();
 // Root buttresses are a few metres across, rather than old 20–45 m fins.
 for(const [i,commands]of oakRootCommands(t,origin).entries()){oakPath(c,commands,project);c.fillStyle=i%2?'#71543a':'#8c6945';c.fill();}
 const left=cx-w/2,right=cx+w/2;
 oakPath(c,oakTrunkCommands(t,origin),project);
 const bark=c.createLinearGradient(...project(left,root),...project(right,root));bark.addColorStop(0,'#65503b');bark.addColorStop(.32,'#a27a4d');bark.addColorStop(.57,'#b68b59');bark.addColorStop(1,'#705039');c.fillStyle=bark;c.fill();c.save();c.clip();
 for(let i=0;i<11;i++){const x=left+w*i/10;c.beginPath();c.moveTo(...project(x,root));c.bezierCurveTo(...project(x+Math.sin(i)*w*.06,root+h*.27),...project(cx+(x-cx)*.65,root+h*.53),...project(cx+(x-cx)*.22,root+h*.86));c.strokeStyle=i%3?'#715138':'#c09c66';c.lineWidth=Math.max(.45,Math.min(3,s*w*.012));c.stroke();}
 if(s>12){const low=Math.max(root,camera.y-H/(2*s)-.2),high=Math.min(root+h*.86,camera.y+H/(2*s)+.2),xmin=Math.max(left,camera.x-W/(2*s)-.2),xmax=Math.min(right,camera.x+W/(2*s)+.2);let budget=42;
  for(let x=Math.floor(xmin/.11)*.11;x<xmax&&budget-->0;x+=.11){const bend=Math.sin(x*27)*.035;c.beginPath();c.moveTo(...project(x,low));c.bezierCurveTo(...project(x+bend,low+(high-low)*.35),...project(x-bend,low+(high-low)*.7),...project(x+.014,high));c.strokeStyle=Math.sin(x*17)>0?'#be965e':'#725039';c.lineWidth=Math.max(.4,s*.006);c.stroke();}
 }c.restore();
}
