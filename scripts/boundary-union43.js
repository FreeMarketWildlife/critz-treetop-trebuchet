import{installJointPolicy}from'./joint-policy42.js';import{advanceBoundaryInterval}from'./boundary-policy43.js';
/** Research-only whole-step composition. Preserve baseline contact subdivisions, cap added work. */
export function installBoundaryUnion(scene,{extraBudget=8,leadIn=false,settle=2,composeUnion=true}={}){
 if(!Number.isInteger(extraBudget)||extraBudget<0||extraBudget>8)throw Error('Outside research extra-work budget');
 const originalIntegrate=scene.integrate.bind(scene),unionStats=composeUnion?installJointPolicy(scene,8):null,unionStep=scene.step.bind(scene);
 const stats={composeUnion,outerSteps:0,baseIntervals:0,actualIntegrations:0,extraIntegrations:0,budgetFallbacks:0,maxOuterBase:0,maxOuterActual:0,union:unionStats};
 let active=false,remainingExtra=0,outerBase=0,outerActual=0;
 const integrate=dt=>{stats.actualIntegrations++;outerActual++;return originalIntegrate(dt);};
 scene.integrate=dt=>{
  if(!active||scene.phase!=='flight')return integrate(dt);
  stats.baseIntervals++;outerBase++;
  const result=advanceBoundaryInterval(scene,dt,{budget:Math.min(8,remainingExtra+1),settle,leadIn,integrate});
  const extra=result.steps.length-1;remainingExtra-=extra;stats.extraIntegrations+=extra;if(result.budgetFallback)stats.budgetFallbacks++;
 };
 scene.step=(dt=1/600)=>{
  if(!(dt>0&&dt<=1/600))throw Error('Whole-step boundary research supports at most1/600s');
  if(active)throw Error('Nested whole-step dispatch');active=true;remainingExtra=extraBudget;outerBase=0;outerActual=0;stats.outerSteps++;
  try{return unionStep(dt);}finally{
   active=false;stats.maxOuterBase=Math.max(stats.maxOuterBase,outerBase);stats.maxOuterActual=Math.max(stats.maxOuterActual,outerActual);
   if(outerActual>16)throw Error('Actual integration work exceeded research cap');
  }
 };return stats;
}
