/** Research only. Public joint state chooses integration times; no body/limit state is assigned. */
export function jointByTags(scene,tags){
 for(let joint=scene.world.getJointList();joint;joint=joint.getNext())
  if(JSON.stringify(joint.getBodyA().getUserData())===JSON.stringify(tags.a)&&JSON.stringify(joint.getBodyB().getUserData())===JSON.stringify(tags.b))return joint;
 throw Error('Recorded joint not found');
}
function nextCrossing(scene,remaining,margin,target){
 let next=null;
 for(let joint=scene.world.getJointList();joint;joint=joint.getNext()){
  if(target&&joint!==target||joint.getType()!=='revolute-joint'||!joint.isLimitEnabled())continue;
  const angle=joint.getJointAngle(),speed=joint.getJointSpeed(),lower=joint.getLowerLimit(),upper=joint.getUpperLimit();
  if(!Number.isFinite(angle)||!Number.isFinite(speed))throw Error('Nonfinite joint motion');
  // An already active physical stop needs its normal solver reaction, not another arrival.
  if(angle<=lower||angle>=upper||speed===0)continue;
  const boundary=speed>0?upper+margin:lower-margin,time=(boundary-angle)/speed;
  if(time>0&&time<remaining&&(!next||time<next.time))next={joint,time,boundary,angle,speed};
 }
 return next;
}
export function advanceBoundaryInterval(scene,duration,{margin=2*Math.PI/180/8,budget=8,target=null,settle=0,leadIn=false,integrate=dt=>scene.integrate(dt)}={}){
 if(scene.phase!=='flight'||!(duration>0&&duration<=1/600)||!(margin>0&&margin<2*Math.PI/180)||!Number.isInteger(budget)||budget<1||budget>8||!Number.isInteger(settle)||settle<0||settle>4)throw Error('Outside local boundary research domain');
 let remaining=duration,settling=0;const steps=[];let budgetFallback=false;
 if(leadIn&&budget>1){const event=nextCrossing(scene,remaining,margin,target);if(event){const dt=Math.min(duration/8,event.time/2);integrate(dt);steps.push({dt,kind:'leadIn',event:null,actualEventAngle:null});remaining-=dt;}}
 for(let i=steps.length;i<budget&&remaining>0;i++){
  const nominal=settling>0?remaining/settling:remaining,event=nextCrossing(scene,nominal,margin,target),last=i===budget-1;
  const dt=last?remaining:event?event.time:nominal;
  if(last&&(event||nominal<remaining))budgetFallback=true;
  const detail=event?{a:event.joint.getBodyA().getUserData(),b:event.joint.getBodyB().getUserData(),predictedBoundary:event.boundary,beforeAngle:event.angle,beforeSpeed:event.speed}:null;
  integrate(dt);steps.push({dt,kind:budgetFallback&&last?'budgetFallback':event?'boundary':settling>0?'settle':'remainder',event:detail,actualEventAngle:event?.joint.getJointAngle()??null});if(event&&!last)settling=settle;else if(settling>0)settling--;remaining=dt>=remaining?0:remaining-dt;
 }
 return{steps,budgetFallback,integratedSeconds:duration-remaining};
}
