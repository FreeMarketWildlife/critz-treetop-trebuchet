import {PhysicalHookScene} from '../src/hook-experiment.js';
import {load,waitForContact} from './measure-hook.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
const hash=x=>createHash('sha256').update(x).digest('hex'),sources=['src/articulated.js','src/hook-experiment.js','src/species.js','src/physics.js','src/world.js'],rows=[];
const work=s=>s.handWork+s.windingWork+s.assistWork+s.dampingWork+s.dragWork+s.spawnEnergy-s.despawnEnergy;
for(const species of ['mouse','salamander','tiny-primate']){
 let scene=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3},species);
 scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();
 if(!load(scene)||!waitForContact(scene).status.contacting)throw new Error(`Not loaded: ${species}`);
 scene=scene.clone();scene.unlatch();for(let i=0;i<15000&&!(scene.release&&scene.center().y<3&&scene.center().vy<0);i++)scene.step();
 if(!scene.release||scene.center().y>=3)throw new Error(`No ground approach: ${species}`);
 const saved=scene.snapshot(),snapshotSHA256=hash(JSON.stringify(saved));
 for(const {dt,velocity,position,adaptive,collisionStepHz} of [1/300,1/600,1/1200].flatMap(dt=>[[20,12],[40,30]].map(([velocity,position])=>({dt,velocity,position,adaptive:false}))).concat([{dt:1/600,velocity:20,position:12,adaptive:true,collisionStepHz:1200},{dt:1/600,velocity:20,position:12,adaptive:true,collisionStepHz:2400}])){
  const s=new PhysicalHookScene({...scene.p,solverVelocityIterations:velocity,solverPositionIterations:position,collisionSubsteps:adaptive,collisionStepHz:collisionStepHz??1200},species,saved),e0=s.energy(),w0=work(s),start=performance.now();
  const frameMs=[];let frameStart=performance.now(),frameSteps=0;let integrationSteps=0;const originalStep=s.world.step.bind(s.world);s.world.step=(...args)=>{integrationSteps++;return originalStep(...args);};let maxAnchor=0,maxAngular=0,maxEnergyResidual=0,nonfinite=false,firstImpact=null,worstAnchor,worstAngular;
  s.world.on('post-solve',(contact,impulse)=>{if(firstImpact||impulse.normalImpulses.reduce((n,x)=>n+x,0)<1e-6)return;const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();if([a,b].some(x=>x.getUserData()?.role==='part')&&[a,b].some(x=>x.getUserData()?.role==='static'))firstImpact=s.elapsed-saved.elapsed;});
  for(let t=0;t<1;t+=dt){s.step(dt);for(let j=s.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&[j.getBodyA(),j.getBodyB()].every(b=>b.getUserData()?.role==='part')){
   const a=j.getAnchorA(),b=j.getAnchorB(),gap=Math.hypot(a.x-b.x,a.y-b.y),angle=j.isLimitEnabled()?Math.max(0,j.getJointAngle()-j.getUpperLimit(),j.getLowerLimit()-j.getJointAngle()):0;
   if(gap>maxAnchor){maxAnchor=gap;worstAnchor=[j.getBodyA().getUserData().id,j.getBodyB().getUserData().id];}if(angle>maxAngular){maxAngular=angle;worstAngular=[j.getBodyA().getUserData().id,j.getBodyB().getUserData().id];}
   if(!Number.isFinite(gap+angle))nonfinite=true;
  }maxEnergyResidual=Math.max(maxEnergyResidual,s.energy()-e0-(work(s)-w0));if(++frameSteps>=Math.round(1/60/dt)){frameMs.push(performance.now()-frameStart);frameStart=performance.now();frameSteps=0;}}
  frameMs.sort((a,b)=>a-b);rows.push({frameBudgetMs:4,frameP95Ms:frameMs[Math.floor(frameMs.length*.95)],frameMaxMs:Math.max(...frameMs),frameBudgetOverruns:frameMs.filter(x=>x>4).length,frameSamples:frameMs.length,species,adaptive,collisionStepHz:collisionStepHz??1200,integrationSteps,snapshotSHA256,initialCenter:scene.center(),dt,velocity,position,firstImpact,maxAnchor,maxAngular,worstAnchor,worstAngular,maxEnergyResidual,nonfinite,wallMilliseconds:performance.now()-start});
 }
}
mkdirSync('docs/reviews/iteration-11',{recursive:true});writeFileSync('docs/reviews/iteration-11/impact.json',JSON.stringify({protocol:'Three naturally launched rigs; canonical identical snapshot per species at descending COM below3m; one second through ground contact; no encounters or controls. Only outer timestep, collision-region refinement and solver iterations vary. All world bodies contribute energy; joint maxima restrict to articulated part joints. Diagnostic rather than calibrated tolerance.',sourceSHA256:Object.fromEntries(sources.map(p=>[p,hash(readFileSync(p))])),rows},null,2)+'\n');
console.table(rows.map(({species,dt,velocity,position,adaptive,integrationSteps,maxAnchor,maxAngular,maxEnergyResidual,nonfinite})=>({species,hz:Math.round(1/dt),velocity,position,adaptive,integrationSteps,maxAnchor,maxAngular,maxEnergyResidual,nonfinite})));
