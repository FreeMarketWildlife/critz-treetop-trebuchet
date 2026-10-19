import {world as layout} from './world.js';
export function capturePredictionPose(scene){return {elapsed:scene.elapsed,parts:scene.parts.map(b=>({id:b.getUserData().id,x:b.getPosition().x,y:b.getPosition().y,angle:b.getAngle()}))};}
export function predictionPoseIsCurrent(scene,capture){
 if(!capture||scene.elapsed<capture.elapsed||scene.elapsed-capture.elapsed>1||scene.parts.length!==capture.parts.length)return false;
 return scene.parts.every((b,i)=>{const p=capture.parts[i],q=b.getPosition();return p.id===b.getUserData().id&&Math.hypot(q.x-p.x,q.y-p.y)<=.2&&Math.abs(b.getAngle()-p.angle)<=.4;});
}
// Same canonical physics, advanced in bounded RAF-sized slices rather than pointer events.
export function createPredictionJob(scene,{now=()=>performance.now()}={}){
 if(scene.phase!=='loading'||scene.hand||scene.control||!scene.isLoaded())return null;
 const began=now(),clone=scene.clone();clone.unlatch();const cloneMs=now()-began,points=[];
 let done=false,cancelled=false,result=null,launchTicks=0,flightTicks=0,cpuMs=cloneMs;
 const finish=reason=>{done=true;result={points,release:clone.release??undefined,reason};};
 return {get done(){return done;},get cancelled(){return cancelled;},get result(){return result;},get stats(){return {cloneMs,cpuMs,launchTicks,flightTicks};},
  cancel(){done=true;cancelled=true;result=null;},
  advance({maxSteps=300,budgetMs=2.5}={}){
   if(!Number.isInteger(maxSteps)||maxSteps<1||!Number.isFinite(budgetMs)||budgetMs<=0)throw new Error('Invalid prediction budget');
   if(done)return result;const start=now();
   for(let i=0;i<maxSteps&&!done;i++){
    if(i&&now()-start>=budgetMs)break;
    if(!clone.release){clone.step();launchTicks++;if(clone.release)points.push(clone.center());else if(launchTicks>=3000)finish('No separation within five seconds');}
    else {const before=clone.center();clone.step();flightTicks++;const after=clone.center();
     const hit=clone.events.some(e=>e.type==='impact')||layout.surfaces.some(s=>Math.min(before.y,after.y)<=s.y+.5&&Math.max(before.y,after.y)>=s.y+.5&&after.x>=s.minX-.5&&after.x<=s.maxX+.5);
     if(hit)finish('Same physical snapshot; clipped before obstacle');else {if((flightTicks-1)%30===0)points.push(after);if(flightTicks>=480)finish('Same physical snapshot; short hint');}
    }
   }
   cpuMs+=now()-start;return result;
  }
 };
}
