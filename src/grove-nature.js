export const ORDINARY_LEAF_LENGTH=.18;
export const ordinaryLeafHalfLength=seed=>ORDINARY_LEAF_LENGTH*(.28+(Math.max(-1,Math.min(1,seed))+1)*.11);
// Original vector foliage: scalloped crowns, feathered fern fronds and lianas.
// All dimensions are world metres. No bitmap changes resolution when zooming.
const TAU=Math.PI*2;
export function foliageClump(c,project,x,y,rx,ry,fill,light,seed=0,coarse=false){
 const p=project(x,y),a=project(x+rx,y),b=project(x,y+ry),w=Math.abs(a[0]-p[0]),h=Math.abs(b[1]-p[1]);
 c.beginPath();
 const segments=coarse?10:18,pts=Array.from({length:segments},(_,i)=>{const t=i/segments*TAU,r=1+.1*Math.sin(i*2.1+seed)+.05*Math.cos(i*3.7+seed);return[p[0]+Math.cos(t)*w*r,p[1]+Math.sin(t)*h*r];});
 c.moveTo((pts[segments-1][0]+pts[0][0])/2,(pts[segments-1][1]+pts[0][1])/2);
 for(let i=0;i<segments;i++){const q=pts[i],n=pts[(i+1)%segments];c.quadraticCurveTo(q[0],q[1],(q[0]+n[0])/2,(q[1]+n[1])/2);}
 c.closePath();c.fillStyle=fill;c.fill();
 if(coarse)return;
 // Short scalloped highlights describe leaf masses without outlining volumes.
 c.beginPath();for(let j=0;j<3;j++){const xx=p[0]+(j-1)*w*.48,yy=p[1]-h*(.15+.17*Math.sin(j+seed));c.moveTo(xx-w*.17,yy);c.quadraticCurveTo(xx,yy-h*.25,xx+w*.18,yy);}
 c.strokeStyle=light;c.lineWidth=Math.max(.6,Math.min(2.5,w*.018));c.stroke();
}
export function fern(c,project,x,y,size,color='#527957',detail=true){
 c.strokeStyle=color;c.fillStyle=color;
 for(let j=0;j<5;j++){
  const a=-1.35+j*.67,dx=Math.sin(a)*size,dy=Math.cos(a)*size*.8;
  c.beginPath();c.moveTo(...project(x,y));c.quadraticCurveTo(...project(x+dx*.35,y+size*.6),...project(x+dx,y+dy));c.lineWidth=Math.max(.7,Math.abs(project(x+.03*size,y)[0]-project(x,y)[0]));c.stroke();
  if(!detail)continue;
  c.beginPath();for(let n=1;n<7;n++){const t=n/7,xx=x+dx*t*t,yy=y+size*1.2*t*(1-t)+dy*t*t,w=size*.09*Math.sin(t*Math.PI);for(const side of[-1,1]){c.moveTo(...project(xx,yy));c.quadraticCurveTo(...project(xx+side*w*.4,yy+w*.85),...project(xx+side*w,yy+w*.65));c.quadraticCurveTo(...project(xx+side*w*.55,yy),...project(xx,yy-.04*size));}}c.fill();
 }
}
export function liana(c,project,x,y,length,color='#48623d',width=.3){
 c.beginPath();c.moveTo(...project(x,y));c.bezierCurveTo(...project(x-2,y-length*.36),...project(x+3,y-length*.7),...project(x+.8,y-length));c.strokeStyle=color;c.lineWidth=Math.max(.6,Math.abs(project(x+width,y)[0]-project(x,y)[0]));c.stroke();
}
