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
const ease=t=>t*t*(3-2*t),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function groveFlightCamera(previous,payload,{width,height,animalLength,dt=1/60,reducedMotion=false,landing=null}={}){
 if(![payload.x,payload.y,animalLength,width,height].every(Number.isFinite)||animalLength<=0||width<=0||height<=0)throw Error('Finite camera dimensions and positive animal length required.');
 // Use travel measured in viewports per second, so a mouse and a whale get the
 // same framing response without changing their physical sizes or velocities.
 const baseScale=Math.min(width,height)*.07/animalLength;
 const vx=Number.isFinite(payload.vx)?payload.vx:0,vy=Number.isFinite(payload.vy)?payload.vy:0;
 const screenVx=vx*baseScale/width,screenVy=vy*baseScale/height,speed=Math.hypot(screenVx,screenVy);
 // Slow/weak throws are easy to read at nine percent. Strong throws open the
 // lens to seven percent during ordinary travel.
 const size=.09-.02*ease(clamp((speed-.3)/1.7,0,1)),normalScale=Math.min(width,height)*size/animalLength;
 // Briefly open the lens for an imminent landing. Keep a readable body and
 // both regions in one physical transform; no inset, arrow or future route.
 const validLanding=landing&&[landing.x,landing.y,landing.eta].every(Number.isFinite)&&landing.eta>=0&&landing.eta<=.65;
 const dx=validLanding?landing.x-payload.x:0,dy=validLanding?landing.y-payload.y:0;
 const floorScale=Math.min(width,height)*.045/animalLength;
 const fitScale=validLanding?Math.min(width*.60/(Math.abs(dx)+animalLength*2),height*.50/(Math.abs(dy)+animalLength*2)):normalScale;
 const target=validLanding?Math.min(normalScale,Math.max(floorScale,fitScale)):normalScale;
 const step=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;
 const priorScale=Number.isFinite(previous.scale)&&previous.scale>0?previous.scale:target;
 // Keep the volunteer at its release-frame screen position while the lens opens,
 // then ease into travel framing. Tracking its actual position immediately avoids
 // permanent chase lag; presentation offsets never assign a physics transform.
 const prior=previous.followAcquisition;
 const acquisition=prior?{...prior,age:Math.min(FOLLOW_ACQUIRE_SECONDS,prior.age+step)}:{
  age:0,
  x:((Number.isFinite(previous.x)?previous.x:payload.x)-payload.x)*priorScale/width,
  y:((Number.isFinite(previous.y)?previous.y:payload.y)-payload.y)*priorScale/height
 };
 if(reducedMotion)return{x:payload.x,y:payload.y,scale:baseScale,followAcquisition:{...acquisition,age:FOLLOW_ACQUIRE_SECONDS},followMotion:{x:0,y:0}};
 // A bounded, eased lead reveals the next branch in the travel direction. Smooth
 // the offset rather than body velocity so a rebound cannot jerk the camera or
 // let the animal slide out of frame while tracking catches up.
 const oldMotion=previous.followMotion??{x:0,y:0},leadMix=1-Math.exp(-step*4.5);
 const travelX=.17*Math.tanh(screenVx*.24/.17),travelY=.10*Math.tanh(screenVy*.16/.10);
 const leadX=validLanding?clamp(dx*target/width*.48,-.28,.28):travelX;
 const leadY=validLanding?clamp(dy*target/height*.48,-.22,.16):travelY;
 const motion={x:oldMotion.x+(leadX-oldMotion.x)*leadMix,y:oldMotion.y+(leadY-oldMotion.y)*leadMix};
 // Log interpolation handles the full mouse-to-whale range without a scale pop.
 const mix=1-Math.exp(-step*7);
 const scale=step===0?priorScale:Math.exp(Math.log(priorScale)*(1-mix)+Math.log(target)*mix);
 const blend=ease(acquisition.age/FOLLOW_ACQUIRE_SECONDS),remaining=1-blend;
 return{x:payload.x+(acquisition.x*remaining+motion.x*blend)*width/scale,y:payload.y+(acquisition.y*remaining+motion.y*blend)*height/scale,scale,followAcquisition:acquisition,followMotion:motion};
}
export function groveProject(point,camera,width,height){return{x:width/2+(point.x-camera.x)*camera.scale,y:height/2-(point.y-camera.y)*camera.scale};}
export function groveTreeCamera(map,{width,height}){
 const t=map.tree,r=t.crownRadius??t.trunkWidth*3.6,minX=t.trunkX-r-40,maxX=Math.max(220,t.trunkX+r+40),minY=-map.launch.y-30,maxY=t.height-map.launch.y+55;
 return{x:(minX+maxX)/2,y:(minY+maxY)/2,scale:Math.min(Math.max(160,width)*.9/(maxX-minX),Math.max(120,height)*.84/(maxY-minY))};
}
