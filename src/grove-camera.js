/** The camera changes presentation only: one metre always uses the same scale
 * for the rig, projectile and terrain. Release framing eases into payload follow. */
export function groveSetupCamera(c,{width,height,preview=false,counterRadius=0}={}){
 const W=Math.max(160,width),H=Math.max(120,height);
 const rigHeight=Math.max(1,c.pivotHeight+c.shortArm+counterRadius);
 if(preview){
  const wide=Math.max(c.troughLength*1.15,c.longArm+c.shortArm+c.baseWidth*.5,3.5);
  const scale=Math.min(W*.87/wide,H*.64/rigHeight);
  return{x:-c.troughLength*.2,y:H*.22/scale,scale};
 }
 // Fit the mechanism, left stand and sling inside the area between HUD and dock.
 const minX=-Math.max(c.longArm*.92,c.baseWidth*.9)-Math.max(.18,c.pouchWidth*.8),maxX=Math.max(c.baseWidth*.85,c.shortArm+counterRadius);
 const high=Math.max(c.pivotHeight+c.longArm*Math.sin(1),c.pivotHeight+c.shortArm+counterRadius);
 const scale=Math.min(H*.50/high,W*.90/(maxX-minX));
 // Ground sits just above the bottom dock; the arm has room below the HUD.
 return{x:(minX+maxX)/2,y:(H*.5-H*.77)/-scale,scale};
}
const FOLLOW_ACQUIRE_SECONDS=.55;
const ease=t=>t*t*(3-2*t);
export function groveFlightCamera(previous,payload,{width,height,animalLength,dt=1/60,reducedMotion=false}={}){
 if(![payload.x,payload.y,animalLength,width,height].every(Number.isFinite)||animalLength<=0||width<=0||height<=0)throw Error('Finite camera dimensions and positive animal length required.');
 // Seven percent keeps the smallest volunteers readable beside touch controls.
 const target=Math.min(width,height)*.07/animalLength;
 const step=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;
 const priorScale=Number.isFinite(previous.scale)&&previous.scale>0?previous.scale:target;
 // Keep the volunteer at its release-frame screen position while the lens opens,
 // then ease that screen offset to zero. Following its real motion immediately
 // keeps even a tiny, fast volunteer visible; a finite acquisition avoids the
 // permanent positional lag of a camera chasing a moving world-space target.
 const prior=previous.followAcquisition;
 const acquisition=prior?{...prior,age:Math.min(FOLLOW_ACQUIRE_SECONDS,prior.age+step)}:{
  age:0,
  x:((Number.isFinite(previous.x)?previous.x:payload.x)-payload.x)*priorScale/width,
  y:((Number.isFinite(previous.y)?previous.y:payload.y)-payload.y)*priorScale/height
 };
 if(reducedMotion)return{x:payload.x,y:payload.y,scale:target,followAcquisition:{...acquisition,age:FOLLOW_ACQUIRE_SECONDS}};
 // Log interpolation handles the full mouse-to-whale range without a scale pop.
 const mix=1-Math.exp(-step*7);
 const scale=step===0?priorScale:Math.exp(Math.log(priorScale)*(1-mix)+Math.log(target)*mix);
 const remaining=1-ease(acquisition.age/FOLLOW_ACQUIRE_SECONDS);
 return{x:payload.x+acquisition.x*width*remaining/scale,y:payload.y+acquisition.y*height*remaining/scale,scale,followAcquisition:acquisition};
}
export function groveProject(point,camera,width,height){return{x:width/2+(point.x-camera.x)*camera.scale,y:height/2-(point.y-camera.y)*camera.scale};}
export function groveTreeCamera(map,{width,height}){
 const t=map.tree,r=t.crownRadius??t.trunkWidth*3.6,minX=t.trunkX-r-40,maxX=Math.max(220,t.trunkX+r+40),minY=-map.launch.y-30,maxY=t.height-map.launch.y+55;
 return{x:(minX+maxX)/2,y:(minY+maxY)/2,scale:Math.min(Math.max(160,width)*.9/(maxX-minX),Math.max(120,height)*.84/(maxY-minY))};
}
