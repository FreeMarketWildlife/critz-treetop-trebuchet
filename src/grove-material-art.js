/** Original material illustration follows the exact editable polygon silhouette.
 * Broad bark seams, leaf folds and stone facets are decoration, never terrain. */
const INK='#302d2b',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const GROVE_MATERIALS={wood:['#a5663e','#d6a15a'],leaf:['#738d52','#c2d58c'],stone:['#617b80','#b3c7bb'],bumper:['#bd6a4e','#f2cf79']};
const stroke=(c,pts,color,width)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
export function drawMaterialPolygon(c,o,b,project,{width:W,height:H,scale:s}){
 const colors=GROVE_MATERIALS[o.material]??GROVE_MATERIALS.wood,pts=o.points.map(p=>project(p.x,p.y));
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=colors[0];c.fill();
 if(s<3){c.strokeStyle=INK;c.lineWidth=.65;c.stroke();return;}
 c.save();c.clip();
 const left=Math.max(-40,project(b.minX,0)[0]),right=Math.min(W+40,project(b.maxX,0)[0]),top=project(0,b.maxY)[1],bottom=project(0,b.minY)[1],thick=bottom-top;
 if(o.material==='stone'||o.material==='bumper'){c.fillStyle=o.material==='stone'?'#425f68':'#833f39';c.fillRect(left,top+thick*.67,Math.max(0,right-left),Math.max(0,thick*.33));}
 if(o.material==='leaf'){
  // Flexible leaf faces use broad folds and a few veins, not timber grain.
  // Every mark stays clipped to the editable shape, with metre-anchored ribs.
  const a=o.points[0],z=o.points[1],dx=z.x-a.x,slope=Math.abs(dx)>.001?(z.y-a.y)/dx:0;
  const depth=Math.max(.08,...o.points.map(p=>a.y+(p.x-a.x)*slope-p.y)),at=(x,d)=>project(x,a.y+(x-a.x)*slope-d);
  const worldLeft=Math.max(b.minX,b.minX+(left-project(b.minX,0)[0])/s),worldRight=Math.min(b.maxX,worldLeft+(right-left)/s);
  const band=(from,to,color)=>{const ps=[at(worldLeft,from),at(worldRight,from),at(worldRight,to),at(worldLeft,to)];c.beginPath();ps.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();};
  band(0,depth*.25,'#9eb36b');band(depth*.62,depth*2,'#405f42');
  stroke(c,[at(worldLeft,depth*.45),at(worldRight,depth*.45)],'#c2d58c',clamp(s*.04,1.1,3));
  if(depth*s>5){const spacing=Math.max(1.5,(b.maxX-b.minX)/8);let ribs=0;
   for(let x=Math.ceil(worldLeft/spacing)*spacing;x<worldRight&&ribs<8;x+=spacing,ribs++){
    stroke(c,[at(x-spacing*.24,depth*.1),at(x,depth*.45),at(x-spacing*.21,depth*.86)],'#425f42',clamp(s*.018,.8,1.9));
   }
  }
 }else if(o.material==='stone'){
  const step=Math.max(28,Math.min(90,s*.45));let count=0;for(let x=Math.floor(left/step)*step;x<right&&count<24;x+=step,count++){
   const y=top+thick*(.22+.18*Math.sin(x*.3));c.beginPath();c.moveTo(x,y);c.lineTo(x+step*.58,y-thick*.1);c.lineTo(x+step*.83,y+thick*.35);c.lineTo(x+step*.2,y+thick*.18);c.closePath();c.fillStyle=count%2?'#809b9c':'#6d888c';c.fill();stroke(c,[[x,y],[x+step*.58,y-thick*.1]],'#aec7bb',1.2);
  }
 }else if(o.material==='wood'||!GROVE_MATERIALS[o.material]){
  // Bark has a rounded lit shoulder and a few long organic seams. Its light
  // follows the editable face instead of cutting it with horizontal planks.
  const a=o.points[0],z=o.points[1],dx=z.x-a.x,slope=Math.abs(dx)>.001?(z.y-a.y)/dx:0;
  const depth=Math.max(.08,...o.points.map(p=>a.y+(p.x-a.x)*slope-p.y)),at=(x,f)=>project(x,a.y+(x-a.x)*slope-depth*f);
  const worldLeft=Math.max(b.minX,b.minX+(left-project(b.minX,0)[0])/s),worldRight=Math.min(b.maxX,worldLeft+(right-left)/s);
  // The cylindrical light runs perpendicular to the actual upper contour;
  // smooth depth replaces wide hard bands and repeated triangular patches.
  const d=depth/(1+slope*slope),p=project(a.x,a.y),q=project(a.x+slope*d,a.y-d),shade=c.createLinearGradient(...p,...q);
  for(const [at,color]of[[0,'#ce995c'],[.15,'#ad7243'],[.5,'#925a37'],[.83,'#694631'],[1,'#4c372b']])shade.addColorStop(at,color);
  c.fillStyle=shade;c.fillRect(left,top,Math.max(0,right-left),Math.max(0,thick));
  if(depth*s>8){const spacing=6.5,start=Math.floor(worldLeft/spacing)*spacing;let seams=0;
   for(let x=start;x<worldRight&&seams<5;x+=spacing,seams++){
    const seed=Math.sin(Math.floor(x/spacing)*9.17),f=.46+seed*.1;
    c.beginPath();c.moveTo(...at(x+spacing*.06,.76));c.bezierCurveTo(...at(x+spacing*.28,.68+seed*.13),...at(x+spacing*.5,f),...at(x+spacing*.94,f-.04));c.strokeStyle='#513a2e';c.lineWidth=clamp(depth*s*.019,.9,3);c.stroke();
    c.beginPath();c.moveTo(...at(x+spacing*.36,f-.04));c.bezierCurveTo(...at(x+spacing*.53,f-.11),...at(x+spacing*.67,f-.05),...at(x+spacing*.83,f-.08));c.strokeStyle='#bc8450';c.lineWidth=clamp(s*.009,.6,1.5);c.stroke();
    if(seed>.6){const pt=at(x+spacing*.57,.52),rx=clamp(s*.08,2,11),ry=Math.max(1,rx*.4);c.beginPath();c.ellipse(...pt,rx,ry,-Math.atan(slope),0,Math.PI*2);c.strokeStyle='#613f2b';c.lineWidth=1.3;c.stroke();}
   }
  }
 }else{
  // Grain bends with the bough's top edge. It is anchored in metres, not to
  // a screen-space plank grid, so camera motion never slides its pattern.
  const a=o.points[0],z=o.points[1],dx=z.x-a.x,dy=z.y-a.y,slope=Math.abs(dx)>.001?dy/dx:0;
  const grainDepth=Math.max(.08,Math.min(.65,b.maxY-b.minY,(b.maxY-b.minY)-Math.abs(dy)));
  for(let row=1;row<=3;row++){
   const yy=a.y-grainDepth*row*.23,worldLeft=Math.max(b.minX,b.minX+(left-project(b.minX,0)[0])/s),worldRight=Math.min(b.maxX,worldLeft+(right-left)/s);
   const p=project(worldLeft,yy+(worldLeft-a.x)*slope),q=project(worldRight,yy+(worldRight-a.x)*slope),bend=Math.min(10,thick*.13);
   c.beginPath();c.moveTo(...p);c.bezierCurveTo(p[0]+(q[0]-p[0])*.32,p[1]+bend,q[0]-(q[0]-p[0])*.25,q[1]-bend,...q);c.strokeStyle=row%2?'#78492e':'#d39a57';c.lineWidth=row===2?2.1:1.1;c.stroke();
  }
  if(thick>13&&s>4){const spacing=2.7,x0=Math.ceil((b.minX+(left-project(b.minX,0)[0])/s)/spacing)*spacing;let knots=0;
   for(let x=x0;x<b.maxX&&knots<5;x+=spacing,knots++){const y=(b.minY+b.maxY)*.5+Math.sin(x)*Math.min(.08,(b.maxY-b.minY)*.08),p=project(x,y),rx=clamp(s*.055,3,12),ry=Math.max(2,rx*.33);c.beginPath();c.ellipse(...p,rx,ry,-.13,0,Math.PI*2);c.strokeStyle='#5a3d2c';c.lineWidth=1.5;c.stroke();c.beginPath();c.ellipse(...p,rx*.42,ry*.55,-.13,0,Math.PI*2);c.fillStyle='#70462f';c.fill();}
  }
 }
 c.restore();c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.strokeStyle=INK;c.lineWidth=clamp(thick*.08,.8,2.8);c.stroke();
 const area=o.points.reduce((sum,p,i)=>{const q=o.points[(i+1)%o.points.length];return sum+p.x*q.y-q.x*p.y;},0);
 for(let i=0;i<o.points.length;i++){
  const a=o.points[i],z=o.points[(i+1)%o.points.length],dx=z.x-a.x,dy=z.y-a.y;if(dx*(area<0?1:-1)<=0||Math.abs(dy)>Math.abs(dx)*1.2)continue;
  const p=project(a.x,a.y),q=project(z.x,z.y);stroke(c,[p,q],colors[1],clamp(s*.07,1.5,6));
 }
}
