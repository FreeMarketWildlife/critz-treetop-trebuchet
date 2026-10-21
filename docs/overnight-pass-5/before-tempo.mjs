import {imminentLanding} from '../../src/landing-view.js';
import {GRAVITY} from '../../src/build-physics.js?v=22';
/** Presentation timing over the unmodified fixed-step mechanism solver.
 * A slower counterweight fall reveals real motion; no forces, transforms or
 * release velocities are assigned here. All feedback uses active playback time. */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),smooth=n=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
export function swingPlaybackRate(sim,age){
 const heavy=clamp(Math.log10(Math.max(1,sim.T/.6))*.12,0,.18),base=.26+heavy;
 const dramatic=base+.24*smooth(age/1.35);
 // An unusual stalled build must not remain in slow motion for its whole run.
 return dramatic+(1-dramatic)*smooth((age-4)/2);
}
export function createLaunchFeel(){
 let current=null,clock=0,swingAge=0,releaseAge=null,releaseClock=null,freeze=0,rate=1,lastSeq=0,lastImpact=-Infinity,impactAge=10,impactPoint=null,impactStrength=0,creakBeat=0,swished=false;
 let samples=[],events=[],approachRate=1,approachSpent=0;
 function reset(sim){current=sim;clock=0;swingAge=0;releaseAge=null;releaseClock=null;freeze=0;rate=1;lastSeq=0;lastImpact=-Infinity;impactAge=10;impactPoint=null;impactStrength=0;creakBeat=0;swished=false;samples=[];events=[];approachRate=1;approachSpent=0;}
 function advance(sim,dt,{speed=1,paused=false,anticipation=true}={}){
  if(current!==sim)reset(sim);events=[];
  if(paused||!Number.isFinite(dt)||dt<=0)return state();
  const p=sim.release&&sim.phase==='flight'?sim.real(sim.shot):null;
  const incoming=anticipation&&p&&p.vy< -2&&Math.hypot(p.vx,p.vy)>5?imminentLanding(sim.map,p,{radius:sim.animal.width*.5,gravity:GRAVITY*(sim.gravityFactor??1)}):null;
  let remaining=Math.min(.1,dt)*clamp(Number.isFinite(speed)?speed:1,.05,3);
  while(remaining>1e-8){const h=Math.min(1/120,remaining);remaining-=h;clock+=h;impactAge+=h;if(releaseAge!==null)releaseAge+=h;
   if(sim.phase==='swing')swingAge+=h;
   // Give an incoming substantial landing a little active presentation time.
   // No velocity/force changes. A finite budget prevents a false forecast or
   // repeated tiny contacts from keeping the whole flight in slow motion.
   const approachTarget=incoming&&approachSpent<1.25?.62:1;
   approachRate+=(approachTarget-approachRate)*(1-Math.exp(-h*(approachTarget<approachRate?10:7)));
   if(approachTarget<1)approachSpent+=h;
   if(freeze>0){const stopped=Math.min(h,freeze);freeze-=stopped;if(stopped===h){rate=0;continue;}rate=approachRate;sim.step((h-stopped)*rate);}
   else{rate=sim.phase==='swing'?swingPlaybackRate(sim,swingAge):releaseAge!==null&&releaseAge<.28?.62+.38*smooth(releaseAge/.28):approachRate;sim.step(h*rate);}
   if(sim.release&&releaseAge===null){releaseAge=0;releaseClock=clock;events.push({type:'release',intensity:1});}
  }
  if(sim.phase==='swing'){
   const c=sim.counterPoint();if(!samples.length||clock-samples.at(-1).at>.045){samples.push({...c,at:clock});if(samples.length>14)samples.shift();}
   const beat=Math.floor(Math.min(swingAge,3)/.28);if(beat>creakBeat){creakBeat=beat;events.push({type:'creak',intensity:.38+Math.min(.35,swingAge*.16)});}
   const p=sim.real(sim.shot);if(!swished&&Math.hypot(p.vx,p.vy)>Math.sqrt(sim.c.pivotHeight*GRAVITY)*1.5){swished=true;events.push({type:'swish',intensity:.72});}
  }
  for(const hit of sim.contactEvents??[]){if(hit.seq<=lastSeq)continue;lastSeq=hit.seq;if(!sim.release||clock-lastImpact<.20||['foliage','sap'].includes(hit.material))continue;
   if((hit.strength??0)<.3&&!hit.power&&hit.material!=='bumper')continue;
   lastImpact=clock;approachSpent=0;impactAge=0;impactPoint={x:hit.x,y:hit.y};impactStrength=clamp(hit.strength??.55,.3,1);freeze=Math.max(freeze,.025+impactStrength*.025);
  }
  return state();
 }
 function state(){const kick=releaseAge===null?0:Math.max(0,1-releaseAge/.30),impact=Math.max(0,1-impactAge/.22)*impactStrength,shake=Math.max(kick*.9,impact);
  return{clock,swingAge,releaseAge,releaseClock,rate,freeze,approachRate,releaseKick:kick,impact,impactAge,impactPoint:impactPoint?{...impactPoint}:null,
   shakeX:Math.sin(clock*78)*shake*2.3,shakeY:Math.cos(clock*91)*shake*1.5,
   trail:samples.filter(p=>clock-p.at<.55).map(p=>({...p,alpha:(1-(clock-p.at)/.55)*.22})),events:[...events],
   animating:kick>0||impact>0||freeze>0};
 }
 return{advance,state,reset};
}
