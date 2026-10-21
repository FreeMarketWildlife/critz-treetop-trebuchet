/** Original material illustration follows the exact editable polygon silhouette.
 * A bounded number of knots, facets and edge tufts is decoration, never terrain. */
const INK='#302d2b',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const GROVE_MATERIALS={wood:['#a5663e','#d6a15a'],leaf:['#9b6740','#b5cc78'],stone:['#617b80','#b3c7bb'],bumper:['#bd6a4e','#f2cf79']};
const stroke=(c,pts,color,width)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
export function drawMaterialPolygon(c,o,b,project,{width:W,height:H,scale:s}){
 const colors=GROVE_MATERIALS[o.material]??GROVE_MATERIALS.wood,pts=o.points.map(p=>project(p.x,p.y));
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=colors[0];c.fill();
 if(s<3){c.strokeStyle=INK;c.lineWidth=.65;c.stroke();return;}
 c.save();c.clip();
 const left=Math.max(-40,project(b.minX,0)[0]),right=Math.min(W+40,project(b.maxX,0)[0]),top=project(0,b.maxY)[1],bottom=project(0,b.minY)[1],thick=bottom-top;
 c.fillStyle=o.material==='stone'?'#425f68':o.material==='bumper'?'#833f39':'#70462f';c.fillRect(left,top+thick*.67,Math.max(0,right-left),Math.max(0,thick*.33));
 if(o.material==='stone'){
  const step=Math.max(28,Math.min(90,s*.45));let count=0;for(let x=Math.floor(left/step)*step;x<right&&count<24;x+=step,count++){
   const y=top+thick*(.22+.18*Math.sin(x*.3));c.beginPath();c.moveTo(x,y);c.lineTo(x+step*.58,y-thick*.1);c.lineTo(x+step*.83,y+thick*.35);c.lineTo(x+step*.2,y+thick*.18);c.closePath();c.fillStyle=count%2?'#809b9c':'#6d888c';c.fill();stroke(c,[[x,y],[x+step*.58,y-thick*.1]],'#aec7bb',1.2);
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
  if(o.material==='leaf'&&s>12){const length=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.min(10,Math.floor(length/28));for(let j=0;j<n;j++){const t=(j+.45)/Math.max(1,n),x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t;stroke(c,[[x-3,y],[x-5,y-6],[x,y-2],[x+5,y-8],[x+4,y]],'#c8d991',1.8);}}
 }
}
