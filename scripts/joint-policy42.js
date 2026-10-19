import{mechanismArrival}from'./rig-policy42.js';
/** Fast real angular-stop arrival can need resolution even away from external contact. */
export function flightStopArrival(scene,dt){
 if(scene.phase!=='flight')return false;
 const slop=2*Math.PI/180;
 for(let joint=scene.world.getJointList();joint;joint=joint.getNext()){
  if(joint.getType()!=='revolute-joint'||!joint.isLimitEnabled())continue;
  const angle=joint.getJointAngle(),speed=joint.getJointSpeed(),lower=joint.getLowerLimit(),upper=joint.getUpperLimit();
  if(angle>upper+2*slop||angle<lower-2*slop)return true;
  if(Math.abs(speed)*dt>slop/2&&(speed>0?angle+speed*dt>upper-slop:angle+speed*dt<lower+slop))return true;
 }
 return false;
}
export function installJointPolicy(scene,stopFactor=8){
 const original=scene.step.bind(scene),stats={outerSteps:0,refinedSteps:0,distanceSteps:0,stopSteps:0,compatiblePairs:0,distanceQueries:0};
 scene.step=(dt=1/600)=>{
  stats.outerSteps++;const stop=flightStopArrival(scene,dt),contact=mechanismArrival(scene,dt,stats);
  const count=Math.max(stop?stopFactor:1,contact?8:1);if(stop)stats.stopSteps++;if(contact)stats.distanceSteps++;if(count>1)stats.refinedSteps++;
  // A union, not nested refinements: at standard600Hz the total remains <=8.
  for(let i=0;i<count;i++)original(dt/count);
 };return stats;
}
