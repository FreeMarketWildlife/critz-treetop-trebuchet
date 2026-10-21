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
