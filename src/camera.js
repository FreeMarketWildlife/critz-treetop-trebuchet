const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
/** Render-only offset filtering. COM is followed directly so fast descent cannot
 * outrun a lagging camera. All scales/transforms apply equally to actor/colliders. */
export function createFlightCamera(){let x=0,y=0,ready=false;
 return {update(center,{width,height,scale,dt=1/60,reducedMotion=false}){
  if(![center.x,center.y,center.vx??0,center.vy??0,width,height,scale,dt].every(Number.isFinite)||width<=0||height<=0||scale<=0||dt<0)throw new Error('Invalid camera frame');
  const tx=reducedMotion?0:clamp((center.vx??0)*.1,-width*.16/scale,width*.16/scale),ty=reducedMotion?0:clamp((center.vy??0)*.045,-height*.18/scale,height*.18/scale);
  if(!ready||reducedMotion){x=tx;y=ty;ready=true;}else{const a=1-Math.exp(-Math.min(dt,.1)*10);x+=(tx-x)*a;y+=(ty-y)*a;}
  x=clamp(x,-width*.16/scale,width*.16/scale);y=clamp(y,-height*.18/scale,height*.18/scale);
  return {x:center.x+x,y:Math.max(center.y+y,height*.25/scale)};
 }};
}
