/** The camera changes presentation only: one metre always uses the same scale
 * for the rig, projectile and terrain. Flight centers the actual payload. */
export function groveSetupCamera(c,{width,height,preview=false,counterRadius=0}={}){
 const W=Math.max(160,width),H=Math.max(120,height);
 const rigHeight=Math.max(1,c.pivotHeight+c.shortArm+counterRadius);
 if(preview){
  const wide=Math.max(c.troughLength*1.15,c.longArm+c.shortArm+c.baseWidth*.5,3.5);
  const scale=Math.min(W*.87/wide,H*.64/rigHeight);
  return{x:-c.troughLength*.2,y:H*.22/scale,scale};
 }
 const scale=Math.min(H*.22/rigHeight,W*.54/Math.max(c.longArm+c.slingLength+c.shortArm,c.troughLength,3));
 return{x:W<600?-c.baseWidth*.5:c.baseWidth*.75,y:H*.16/scale,scale};
}
export function groveFlightCamera(previous,payload,{width,height,animalLength,dt=1/60,reducedMotion=false}={}){
 if(![payload.x,payload.y,animalLength,width,height].every(Number.isFinite)||animalLength<=0)throw Error('Finite camera dimensions and positive animal length required.');
 const target=Math.min(width,height)*.05/animalLength;
 // Log interpolation avoids a sudden scale surge when changing from whales to mice.
 const mix=reducedMotion?1:1-Math.exp(-Math.max(0,Math.min(.1,dt))*7);
 const scale=Math.exp(Math.log(Math.max(.001,previous.scale))*(1-mix)+Math.log(target)*mix);
 return{x:payload.x,y:payload.y,scale};
}
export function groveProject(point,camera,width,height){return{x:width/2+(point.x-camera.x)*camera.scale,y:height/2-(point.y-camera.y)*camera.scale};}
