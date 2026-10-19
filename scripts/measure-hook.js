import {PhysicalHookScene} from '../src/hook-experiment.js';
import {CritterScene} from '../src/articulated.js';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
// Run from repository root: node scripts/measure-hook.js
// Bounded experiment only; failures and timestep sensitivity are evidence, not tuning targets.
export function load(s){for(let i=0;i<600;i++)s.step();const root=s.parts.find(b=>b.getUserData().id==='torso')??s.parts[0];if(!s.grab(root.getWorldCenter()))return false;for(let i=0;i<600;i++){s.move({x:-4.3,y:297});s.step();}for(let i=0;i<1200;i++){const p=s.pouch.getPosition();s.move({x:p.x,y:p.y+.85});s.step();}s.drop();for(let i=0;i<300;i++)s.step();return s.isLoaded();}
export function run(Type,params={},species='lizard',dt=1/600){try{const s=new Type(params,species);if(!load(s))return {loaded:false};const c=s.clone(),start=c.elapsed;c.unlatch();for(let i=0;i<5/dt&&!c.release;i++)c.step(dt);return {loaded:true,released:!!c.release,launchTime:c.release?c.release.time-start:null,center:c.release?.center,speed:c.release?Math.hypot(c.release.center.vx,c.release.center.vy):null,energy:c.energy(),hookOpen:c.hookOpen};}catch(e){return {error:e.message};}}
function iteration4(){
const classify=r=>({...r,forwardUpward:!!r.center&&r.center.vx>0&&r.center.vy>0});
const variants=[];
for(const[species,parameters]of[['lizard',{}],['turtle',{}],['armadillo',{}],['lizard',{counterMass:150}],['lizard',{longArm:2.6}],['lizard',{longArm:3.4}]]){
 variants.push({species,parameters,channel:classify(run(PhysicalHookScene,{...parameters,releaseHardware:'channel'},species)),cLink:classify(run(PhysicalHookScene,parameters,species)),baseline:classify(run(CritterScene,parameters,species))});
}
const timesteps=[1/300,1/600,1/1200].map(dt=>({dt,channel:classify(run(PhysicalHookScene,{releaseHardware:'channel'},'lizard',dt))}));
const angleCheck=[];for(const hookAngle of[3.2,3.3,3.4])for(const species of['lizard','turtle','armadillo'])angleCheck.push({hookAngle,species,...classify(run(PhysicalHookScene,{releaseHardware:'channel',hookAngle},species))});
const splitPouchCheck=[];for(const channelLength of[.12,.22,.3])for(const species of['lizard','turtle','armadillo'])splitPouchCheck.push({channelLength,species,...classify(run(PhysicalHookScene,{releaseHardware:'channel',hingedPouch:true,channelLength},species))});
const failedHingedPouch=classify(run(PhysicalHookScene,{hingedPouch:true}));
const checksums=Object.fromEntries(['src/articulated.js','src/hook-experiment.js','src/species.js'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const evidence={scope:'Finite open-ended channel and sliding bead: optional planar physical release experiment. Not a calibrated real ring-on-pin model.',protocol:{loadingStep:1/600,loading:'600 gravity steps; grip torso COM; 600 steps target(-4.3,297); 1200 steps target(pouch.x,pouch.y+0.85); drop; 300 settling steps; require isLoaded; clone canonical snapshot; unlatch and observe at most 5 seconds.',units:'metres, seconds, kilograms; velocities are ragdoll center of mass at observed release. Each assembly changes its actual contact-loading history, so comparisons do not isolate release efficiency.',channel:'One shared geometry in every variant: angle3.4rad relative arm, length0.22m, inner width0.07m, bead diameter0.05m/mass0.04kg, friction0.03. Closed heel and two finite rails; open tip. No slot joint, motor, release force, body velocity assignment, release-time fixture disabling or joint deletion.',release:'Observe 0.01 seconds with no payload/cradle contact and center farther than0.7m from cradle. Hardware escape means bead center axial distance beyond channelLength+beadRadius; diagnostic only: rim ejection can occur before bead exit. Both straps and cradle persist.',timestep:'Loading always1/600; only launch timestep changes.'},sourceSHA256:checksums,limitations:['Channel is a planar clevis abstraction rather than a closed3D ring.','Release hardware collides only with matching hardware; massless straps do not collide with bodies.','Rigid U cradle is retained; optional failed hinged-panel trials are recorded separately. Readiness uses the existing center-in-cradle envelope; it is not proof of settled load-bearing contact.','Weak and backward shots remain possible; no per-species or per-shot tuning.','Release detector observes later than exact last contact; it does not modify dynamics.','Finite solver timestep/contact loss remains; no calibrated-realism claim.','Baseline uses geometric ghost-cradle release and has different physical behavior.'],variants,timesteps,angleCheck,splitPouchCheck,failedHingedPouch};
mkdirSync('docs/reviews/iteration-4',{recursive:true});writeFileSync('docs/reviews/iteration-4/hook-measurements.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({variants,timesteps,angleCheck,splitPouchCheck,failedHingedPouch},null,2));

}

export const physicalMatrix=[
 {class:'light',species:'lizard',parameters:{releaseHardware:'channel',hookAngle:3.4,channelLength:.22,counterMass:100,longArm:3,sling:2.5}},
 {class:'medium',species:'turtle',parameters:{releaseHardware:'channel',hookAngle:3.6,channelLength:.12,counterMass:200,longArm:3,sling:2.5}},
 {class:'heavy',species:'armadillo',parameters:{releaseHardware:'channel',hookAngle:3.8,channelLength:.22,counterMass:150,longArm:2.2,sling:2.2}}
];
export const stoppedMatrix=[
 {class:'light',species:'lizard',parameters:{releaseHardware:'channel',stoppedSplitPouch:true,hookAngle:3.4,channelLength:.22,counterMass:100,longArm:3,sling:2.5}},
 {class:'medium',species:'turtle',parameters:{releaseHardware:'channel',stoppedSplitPouch:true,hookAngle:3.55,channelLength:.12,counterMass:200,longArm:3,sling:2.5}},
 {class:'heavy',species:'armadillo',parameters:{releaseHardware:'channel',stoppedSplitPouch:true,hookAngle:3.7,channelLength:.22,counterMass:200,longArm:2.2,sling:2.2}}
];
export function waitForContact(scene,maxWait=3,quietDuration=.1){
 let waited=0,quiet=0;for(let i=0;i<maxWait*600;i++){
  const q=scene.loadingStatus();quiet=q.contacting&&q.withinEnvelope&&q.relativeSpeed<.35?quiet+1/600:0;
  if(quiet>=quietDuration)return {waited,quiet,status:q};scene.step();waited+=1/600;
 }return {waited,quiet,status:scene.loadingStatus()};
}
function firstWorldImpact(scene){
 let hit=null;const start=scene.elapsed;
 scene.world.on('post-solve',(contact,impulse)=>{if(hit)return;const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();
  const roles=[a.getUserData()?.role,b.getUserData()?.role];if(!roles.includes('part')||!roles.includes('static')||impulse.normalImpulses.reduce((n,x)=>n+x,0)<1e-6)return;
  const point=contact.getWorldManifold()?.points[0];if(point)hit={afterRelease:scene.elapsed-start,x:point.x,y:point.y,surface:Math.abs(point.y-294)<.2?'launch branch':Math.abs(point.y-105)<.2?'canopy branch':Math.abs(point.y)<.2?'ground':'loading shelf/other'};
 });
 for(let i=0;i<9000&&!hit;i++)scene.step();return hit;
}
function contactCount(scene){let n=0;for(const body of scene.parts)for(let edge=body.getContactList();edge;edge=edge.next)if((edge.other===scene.pouch||edge.other===scene.flap)&&edge.contact.isTouching())n++;return n;}
export function measureSnapshot(saved,p,species,dt){
 const scene=new PhysicalHookScene(p,species,saved),initialEnergy=scene.energy(),start=scene.elapsed;
 const initialWork=scene.handWork+scene.windingWork+scene.assistWork+scene.dampingWork+scene.dragWork;
 let maximumEnergyGain=0,maximumStepEnergyGain=0,previousEnergy=initialEnergy,firstHardwareExit=null,firstPanelOpening=null,escapedAtPanelOpening=null;
 scene.unlatch();for(let i=0;i<5/dt&&!scene.release;i++){
  scene.step(dt);const e=scene.energy();maximumEnergyGain=Math.max(maximumEnergyGain,e-initialEnergy);maximumStepEnergyGain=Math.max(maximumStepEnergyGain,e-previousEnergy);previousEnergy=e;
  if(scene.hookOpen&&firstHardwareExit===null)firstHardwareExit=scene.elapsed-start;
  if(scene.pouchOpening()>.2&&firstPanelOpening===null){firstPanelOpening=scene.elapsed-start;escapedAtPanelOpening=scene.hookOpen;}
 }
 const center=scene.release?.center,energyChange=scene.energy()-initialEnergy,panelOpeningAtDeparture=scene.pouchOpening();
 const explicitWork=scene.handWork+scene.windingWork+scene.assistWork+scene.dampingWork+scene.dragWork-initialWork,escapedAtDeparture=scene.hookOpen;
 const impact=scene.release?firstWorldImpact(scene):null;
 return {dt,released:!!scene.release,firstWorldImpact:impact,time:scene.release?scene.release.time-start:null,center,speed:center?Math.hypot(center.vx,center.vy):null,firstHardwareExit,firstPanelOpening,escapedAtPanelOpening,panelOpeningAtDeparture,hardwareEscapedAtPayloadDeparture:escapedAtDeparture,initialEnergy,energyChange,maximumEnergyGain,maximumStepEnergyGain,explicitWork};
}
function iteration5(){
 const setups=[];for(const entry of physicalMatrix){const scene=new PhysicalHookScene(entry.parameters,entry.species),loaded=load(scene),settling=waitForContact(scene);const initial={center:scene.center(),cup:{...scene.pouch.getPosition()},supportContacts:contactCount(scene),readyEnvelope:scene.isLoaded(),settling};const saved=scene.snapshot();
  setups.push({...entry,mass:scene.rig.totalMass,loaded,initial,launches:loaded?[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,scene.p,entry.species,dt)):[]});
 }
 const defaultHeavy=new PhysicalHookScene({releaseHardware:'channel'},'armadillo');load(defaultHeavy);const saved=defaultHeavy.snapshot();
 const heavyComparison={parameters:{releaseHardware:'channel',hookAngle:3.4,channelLength:.22,counterMass:100,longArm:3,sling:2.5},initial:{center:defaultHeavy.center(),supportContacts:contactCount(defaultHeavy)},launches:[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,defaultHeavy.p,'armadillo',dt))};
 const endToEnd=[];for(const entry of physicalMatrix){const scene=new PhysicalHookScene({...entry.parameters,mechanicalWinding:true,initialArm:-3},entry.species);scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();const loaded=scene.phase==='loading'&&load(scene),settling=loaded?waitForContact(scene):null;const saved=scene.snapshot();endToEnd.push({...entry,actualParameters:scene.p,loaded,settling,windingWork:scene.windingWork,launch:loaded?measureSnapshot(saved,scene.p,entry.species,1/600):null});}
 const evidence={scope:'Visible hardware configuration matrix, not automatic species tuning or a promoted default. Each class has explicit physical parameters; launch velocity is an observed output. Contact-settled reference snapshots and complete motor/load runs are both measured.',protocol:'Same force-driven loading recipe as iteration4 at600Hz. Serialize one loaded state per setup, reconstruct that identical state for each300/600/1200Hz launch. Contact cache is reconstructed consistently; no encounter or control forces. Payload can eject over the rim before bead exit. First actual world impact after departure is observed from contact impulse; launch-branch hits fail usefulness.',limitations:['Readiness uses existing COM envelope; initial support contacts are reported separately. Reference snapshots additionally wait for observed contact with relative speed<0.35m/s sustained0.1s, at most3s. This is a measurement protocol, not forced settling or a gameplay timer.','Net energy loss includes contacts and numerical residual, not a calibrated dissipation model. Step gains reveal position-correction/contact artifacts even when no net energy gain occurs.','Stability shown for these snapshots only, not every loading history or hardware combination.','Useful means positive horizontal and vertical velocity with at least~10m/s speed; it does not mean optimized range.','Baseline ghost-cradle release remains unchanged; this channel remains optional.'],sourceSHA256:Object.fromEntries(['src/articulated.js','src/hook-experiment.js','src/species.js'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),setups,endToEnd,heavyComparison};
 mkdirSync('docs/reviews/iteration-5',{recursive:true});writeFileSync('docs/reviews/iteration-5/hook-matrix.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}
function iteration6(){
 const setups=[];for(const entry of stoppedMatrix){const scene=new PhysicalHookScene({...entry.parameters,mechanicalWinding:true,initialArm:-3},entry.species);scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();const loaded=scene.phase==='loading'&&load(scene),settling=loaded?waitForContact(scene):null,saved=scene.snapshot();
  setups.push({...entry,actualParameters:scene.p,loaded,settling,windingWork:scene.windingWork,hingeAngleAtStart:scene.pouchHinge.getJointAngle(),launches:loaded&&scene.isLoaded()?[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,scene.p,entry.species,dt)):[]});
 }
 const halfKgMatrix=[];for(const entry of stoppedMatrix){const scene=new PhysicalHookScene({...entry.parameters,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3},entry.species);scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();const loaded=load(scene),settling=waitForContact(scene),saved=scene.snapshot();halfKgMatrix.push({...entry,parameters:{...entry.parameters,pouchPanelMass:.5},settling,loaded,launches:loaded?[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,scene.p,entry.species,dt)):[]});}
 const panelMassStudy=[];let legacySource=null;
 for(const pouchPanelMass of[undefined,.25,.5,1]){const entry=stoppedMatrix[2],scene=new PhysicalHookScene({...entry.parameters,...(pouchPanelMass===undefined?{}:{pouchPanelMass}),mechanicalWinding:true,initialArm:-3},entry.species);scene.startWinding(.6);for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();const loaded=load(scene),settling=waitForContact(scene),saved=scene.snapshot();if(pouchPanelMass===undefined)legacySource=scene;
  panelMassStudy.push({requestedPanelMass:pouchPanelMass??'legacy density1',actualPanelMasses:[scene.pouch.getMass(),scene.flap.getMass()],settling,loaded,snapshotSHA256:createHash('sha256').update(JSON.stringify(saved)).digest('hex'),launches:loaded?[1/600,1/1200].map(dt=>measureSnapshot(saved,scene.p,entry.species,dt)):[]});}
 const solverStudy=[],saved=legacySource.snapshot(),snapshotSHA256=createHash('sha256').update(JSON.stringify(saved)).digest('hex');
 for(const[solverVelocityIterations,solverPositionIterations]of[[20,12],[40,30],[80,60]])solverStudy.push({solverVelocityIterations,solverPositionIterations,snapshotSHA256,launches:[1/600,1/1200].map(dt=>measureSnapshot(saved,{...legacySource.p,solverVelocityIterations,solverPositionIterations},legacySource.rig.id,dt))});
 const evidence={scope:'Bounded causal and panel-mass studies of the prototype stopped contact pouch; not calibrated accuracy or universal gameplay validation.',geometry:{halfAngleRadians:Math.PI/9,hingeLimits:[-Math.PI,0],referenceAngle:2*Math.PI/9,openingThresholdRadians:.2,strands:'Both equal to hypot(sling,0.65). Legacy free-strand length was measured from its shifted hardware anchor, so this is an explicit equal-strand design rather than preservation of both legacy actual lengths.',construction:'Common floor hinge; initial tilt matches support-height difference to outer-anchor-height difference. Whole assembly translated to lower equal-radius circle intersection. Both rope distances equal their max lengths before simulation. No release-time limit or fixture changes.'},protocol:'Actual torque-limited motor from arm -3rad to height fraction0.6; same force-driven torso loading recipe; observe contact+COMrelative speed<0.35 for0.1s (max3s); clone fixed snapshot for300/600/1200Hz launches. This criterion is not proof every part or pendulum is at rest; full loading diagnostics are retained.',sourceSHA256:Object.fromEntries(['src/articulated.js','src/hook-experiment.js','src/species.js'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),limitations:['Narrow useful hardware windows; no automatic species tuning.','Two rigid panels with a hard hinge stop approximate fabric, including solver angular slop.','Head-first and sway robustness require independent stress tests; do not promote from torso recipe alone.','Energy residual combines physical contact/friction with numerical artifacts.','Payload may still spill or eject before hardware exit; timing fields distinguish actual observed cases.','Panel-mass and solver studies retain their outcomes without assuming a numerical cause. Heavier panels change real hardware and loading; comparisons do not isolate solver conditioning.'],setups,halfKgMatrix,panelMassStudy,solverStudy};
 const outputIndex=process.argv.indexOf('--output-dir'),outputDir=outputIndex<0?'docs/reviews/iteration-6':process.argv[outputIndex+1];if(!outputDir)throw new Error('Output directory required');mkdirSync(outputDir,{recursive:true});writeFileSync(resolve(outputDir,'hook-stopped-pouch.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]??'')).href){if(process.argv.includes('--stopped'))iteration6();else if(process.argv.includes('--matrix'))iteration5();else iteration4();}
