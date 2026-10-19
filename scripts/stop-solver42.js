import{flightStopArrival,installJointPolicy}from'./joint-policy42.js';
/** Research-only extra constraint convergence at predicted real angular-stop arrivals. */
export function installStopSolver(scene,{position=24,velocity=null}={}){
 const stats=installJointPolicy(scene,8),step=scene.step.bind(scene);stats.extraSolveSteps=0;
 scene.step=(dt=1/600)=>{
  const critical=flightStopArrival(scene,dt),previousPosition=scene.p.solverPositionIterations,previousVelocity=scene.p.solverVelocityIterations;
  if(critical){stats.extraSolveSteps++;scene.p.solverPositionIterations=position;if(velocity!==null)scene.p.solverVelocityIterations=velocity;}
  try{return step(dt);}finally{
   if(previousPosition===undefined)delete scene.p.solverPositionIterations;else scene.p.solverPositionIterations=previousPosition;
   if(previousVelocity===undefined)delete scene.p.solverVelocityIterations;else scene.p.solverVelocityIterations=previousVelocity;
  }
 };return stats;
}
/** Inner-step check also sees angular motion created by an earlier contact substep. */
export function installInnerStopSolver(scene,{position=24,velocity=null}={}){
 const stats=installJointPolicy(scene,8),integrate=scene.integrate.bind(scene);stats.extraSolveIntegrations=0;
 scene.integrate=dt=>{
  const critical=flightStopArrival(scene,dt),previousPosition=scene.p.solverPositionIterations,previousVelocity=scene.p.solverVelocityIterations;
  if(critical){stats.extraSolveIntegrations++;scene.p.solverPositionIterations=position;if(velocity!==null)scene.p.solverVelocityIterations=velocity;}
  try{return integrate(dt);}finally{
   if(previousPosition===undefined)delete scene.p.solverPositionIterations;else scene.p.solverPositionIterations=previousPosition;
   if(previousVelocity===undefined)delete scene.p.solverVelocityIterations;else scene.p.solverVelocityIterations=previousVelocity;
  }
 };return stats;
}
