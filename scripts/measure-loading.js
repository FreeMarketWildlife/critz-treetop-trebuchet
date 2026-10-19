import {CritterScene,gripParameters} from '../src/articulated.js';
const rows=[],saved=[];
for(const hz of [300,600,1200])for(const p of [{},{counterMass:150},{longArm:3.4}]){
 const s=new CritterScene(p,'armadillo'),dt=1/hz,ticks=(seconds,move)=>{for(let i=0;i<Math.round(seconds*hz);i++){if(move)move();s.step(dt);}};
 ticks(1);s.grab(s.parts.find(b=>b.getUserData().id==='torso').getWorldCenter());ticks(1,()=>s.move({x:-4.3,y:297}));ticks(2,()=>s.move({x:s.pouch.getPosition().x,y:s.pouch.getPosition().y+.85}));s.drop();ticks(1.5);
 const loaded=s.isLoaded(),speedBefore=Math.hypot(s.center().vx,s.center().vy),energy=s.energy(),handWork=s.handWork;
 if(loaded&&hz===600)saved.push({p:s.p,state:s.snapshot()});
 if(loaded){s.unlatch();for(let i=0;i<hz*5&&!s.release;i++)s.step(dt);}
 rows.push({hz,hardware:p,loaded,settledSpeed:speedBefore,handLimitN:gripParameters(5).maxForce,handWorkJ:handWork,release:s.release?.center??null,launchEnergyChangeJ:s.energy()-energy});
}
const canonical=saved.flatMap(({p,state})=>[300,600,1200].map(hz=>{const s=new CritterScene(p,'armadillo',state),before=s.energy();s.unlatch();for(let i=0;i<hz*5&&!s.release;i++)s.step(1/hz);return {hz,longArm:p.longArm,counterMass:p.counterMass,release:s.release?.center??null,energyChangeJ:s.energy()-before};}));
console.log(JSON.stringify({canonicalLaunchFromIdenticalSnapshots:canonical,scope:'Physical armadillo loading with identical timed finite-force target recipe, no pose assignment; hardware configs and timesteps varied. No claim of calibrated real-world forces.',rows},null,2));
