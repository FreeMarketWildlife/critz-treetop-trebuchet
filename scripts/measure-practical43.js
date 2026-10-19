import {surfaceY,surfaceNear} from '../src/terrain.js';
import {STARTER_HARDWARE} from '../src/starter.js';
import {PhysicalHookScene as BaseScene} from '../src/hook-experiment.js';
import {installBoundaryUnion} from './boundary-union43.js';
const loadingCandidate=process.argv.includes('--loading-candidate');
const reviewDirectory=process.argv.includes('--output-dir')?process.argv[process.argv.indexOf('--output-dir')+1]:`docs/reviews/iteration-43/composed-${loadingCandidate?'candidate':'default'}`;
class PhysicalHookScene extends BaseScene {step(dt){if(loadingCandidate&&this.phase==='loading')this.p.loadingConstraintSubsteps=true;return super.step(dt);}}
import {createPredictionJob} from '../src/prediction.js';
import {profiles} from '../src/species.js';
import {catalog,createEconomyState,economyReducer,derivePhysicalConfig} from '../src/economy.js';
import {world as layout} from '../src/world.js';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

// Diagnostic thresholds flag candidates for review; they are not calibrated tolerances.
const sourcePaths=['src/loading-refinement.js','scripts/rig-policy42.js','scripts/joint-policy42.js','scripts/measure-practical43.js','scripts/boundary-policy43.js','scripts/boundary-union43.js','mobile.css','src/render.js','src/grip-art.js','src/view-recovery.js','src/lab.js','index.html','src/terrain.js','src/articulated.js','src/hook-experiment.js','src/staging.js','src/physics.js','src/species.js','src/economy.js','src/world.js','src/prediction.js','src/starter.js','src/audio.js','src/journey.js'];
const sourceSHA256=Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const DT=1/600,limits={ropeStretch:.05,hingeAnchorError:.05,angularLimitError:.08,
 explosiveEnergyResidual:250,bodySpeed:300,bodySpin:1000,surfaceDepth:.08,releaseSeconds:5};
const base={releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5,
 mechanicalWinding:true,collisionSubsteps:true,collisionStepHz:2400,fastCollisionStepHz:4800,initialArm:-3,counterMass:100,longArm:3,shortArm:.8,sling:2.5,
 hookAngle:3.4,channelLength:.22,...STARTER_HARDWARE};
const cases=[],equipmentSets=[['stock',[]],...catalog.map(item=>[item.id,[item.id]]),['combined',['beam-long','sling-long','counterweight-heavy']]];
for(const [hardware,equipment]of equipmentSets)for(const [index,p]of profiles.entries())for(const fraction of [.45,.6,.75])cases.push({id:`${hardware}-${p.id}-${fraction}`,hardware,species:p.id,grip:index%2?'head':'torso',fraction,equipment});
function frozenPose(scene){const bodies=[];for(let b=scene.world.getBodyList();b;b=b.getNext()){const tag=b.getUserData();if(tag?.role==='static')continue;const fixtures=[];for(let f=b.getFixtureList();f;f=f.getNext()){const shape=f.getShape();if(shape.getType()==='circle')fixtures.push({type:'circle',center:{...b.getWorldPoint(shape.getCenter())},radius:shape.getRadius()});else if(shape.getType()==='polygon')fixtures.push({type:'polygon',vertices:shape.m_vertices.map(p=>({...b.getWorldPoint(p)}))});}bodies.push({tag,position:{...b.getPosition()},angle:b.getAngle(),fixtures});}return {species:scene.rig.id,phase:scene.phase,center:scene.center(),bodies,hand:scene.hand?{anchor:{...scene.hand.body.getWorldPoint(scene.hand.local)},target:{...scene.hand.target},capped:scene.forceCapped}:null};}
const angularFrames=[];
const selectedId=process.argv.includes('--case')?process.argv[process.argv.indexOf('--case')+1]:null;
const benchmarkOnly=process.argv.includes('--bench-prediction');
const group=process.argv.includes('--group')?Number(process.argv[process.argv.indexOf('--group')+1]):null;
const selected=selectedId?cases.filter(c=>c.id===selectedId):group!==null?cases.filter((_,i)=>i%3===group):benchmarkOnly?cases.filter(c=>['default-lizard-torso','default-turtle-torso','default-armadillo-torso'].includes(c.id)):cases;if(!selected.length)throw new Error('Unknown regression case');
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const work=s=>s.handWork+s.windingWork+s.assistWork+s.dampingWork+s.dragWork+s.spawnEnergy-s.despawnEnergy;
function equipped(ids){let state={...createEconomyState(),bells:1000};for(const id of ids){state=economyReducer(state,{type:'purchase',id});state=economyReducer(state,{type:'equip',id});}return state;}
function surfaceFor(point){return layout.surfaces.find(s=>surfaceNear(s,point,.25))?.id??'loading shelf/other';}
let capturedGround=false;if(process.argv.includes('--capture-ground')&&!selectedId)throw Error('Select one case for an incoming fixture');
function diagnostics(scene){
 const initialEnergy=scene.energy(),initialWork=work(scene),above=new Map(),contactSteps=new Map(),surfaceCandidates=[];
 const data={samples:0,maxRopeStretch:0,maxHingeAnchorError:0,maxAngularLimitError:0,maxBodySpeed:0,maxBodySpin:0,maxEnergyResidual:0,nonfinite:null,surfaceCandidates,phaseStats:{}};let stepIndex=0,phase='setup',firstFlightImpact=null,groundImpact=null;
 scene.world.on('post-solve',(contact,impulse)=>{
  if(impulse.normalImpulses.reduce((n,x)=>n+x,0)<1e-6)return;const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();
  const part=a.getUserData()?.role==='part'?a:b.getUserData()?.role==='part'?b:null,other=part===a?b:a;if(!part||other.getUserData()?.role!=='static')return;
  const point=contact.getWorldManifold()?.points[0];if(!point)return;const fixture=other===a?contact.getFixtureA():contact.getFixtureB(),surface=fixture.getUserData()?.id??(fixture.getShape().getType()==='circle'?'bumper':surfaceFor(point));contactSteps.set(`${part.getUserData().id}:${surface}`,stepIndex);
  if(scene.phase==='flight'&&!firstFlightImpact)firstFlightImpact={surface,x:point.x,y:point.y,time:scene.elapsed};if(scene.phase==='flight'&&surface==='ground'&&!groundImpact)groundImpact={surface,x:point.x,y:point.y,time:scene.elapsed};
 });
 const inner={samples:0,maxRope:0,maxAnchor:0,maxAngular:0};data.inner=inner;const integrate=scene.integrate.bind(scene);scene.integrate=dt=>{integrate(dt);inner.samples++;for(let j=scene.world.getJointList();j;j=j.getNext()){const a=j.getAnchorA(),b=j.getAnchorB(),gap=Math.hypot(a.x-b.x,a.y-b.y);if(j.getType()==='rope-joint')inner.maxRope=Math.max(inner.maxRope,gap-j.getMaxLength());if(j.getType()==='revolute-joint'){inner.maxAnchor=Math.max(inner.maxAnchor,gap);if(j.isLimitEnabled())inner.maxAngular=Math.max(inner.maxAngular,j.getJointAngle()-j.getUpperLimit(),j.getLowerLimit()-j.getJointAngle());}}};
 data.boundaryPolicy=installBoundaryUnion(scene,{leadIn:true});
 const inspect=()=>{if(process.argv.includes('--capture-ground')&&!capturedGround&&scene.phase==='flight'&&scene.center().y<3&&scene.center().vy<0){capturedGround=true;mkdirSync(reviewDirectory,{recursive:true});const incomingPath=`${reviewDirectory}/incoming-${selectedId}.json`;if(!existsSync(incomingPath))writeFileSync(incomingPath,JSON.stringify(scene.snapshot(),null,2)+'\n');}data.samples++;let anchorBad=false,angularBad=false,finalAnchor=0,finalAngular=0;
  for(let body=scene.world.getBodyList();body;body=body.getNext())if(body.isDynamic()){
   const q=body.getWorldCenter(),v=body.getLinearVelocity(),w=body.getAngularVelocity(),tag=body.getUserData();
   if(![q.x,q.y,v.x,v.y,w,body.getAngle(),body.getMass(),body.getInertia()].every(Number.isFinite)){data.nonfinite??={phase,time:scene.elapsed,tag};continue;}
   data.maxBodySpeed=Math.max(data.maxBodySpeed,Math.hypot(v.x,v.y));if(Math.abs(w)>data.maxBodySpin){data.maxBodySpin=Math.abs(w);const local=body.getLocalCenter(),inertia=body.getInertia()-body.getMass()*(local.x**2+local.y**2);data.worstSpin={phase,time:scene.elapsed,tag,mass:body.getMass(),inertia,angularVelocity:w,rotationalEnergy:.5*inertia*w*w};}
   if(tag?.role==='part')for(const surface of layout.surfaces){const key=`${tag.id}:${surface.id}`;
    if(q.y>=surfaceY(surface,q.x)+.02)above.set(key,{x:q.x,y:q.y,step:stepIndex});else if(q.y<surfaceY(surface,q.x)-limits.surfaceDepth){const prev=above.get(key);if(!prev)continue;above.delete(key);
     const da=prev.y-surfaceY(surface,prev.x),db=q.y-surfaceY(surface,q.x),f=da/(da-db),x=prev.x+(q.x-prev.x)*f,last=contactSteps.get(key)??-Infinity;
     if(stepIndex-prev.step<60&&x>surface.minX+.25&&x<surface.maxX-.25&&last<prev.step-2&&surfaceCandidates.length<12)
      surfaceCandidates.push({phase,part:tag.id,surface:surface.id,x,y:q.y,from:prev,time:scene.elapsed,lastContactStep:Number.isFinite(last)?last:null});
    }
   }
  }
  for(let joint=scene.world.getJointList();joint;joint=joint.getNext()){
   const a=joint.getAnchorA(),b=joint.getAnchorB();if(![a.x,a.y,b.x,b.y].every(Number.isFinite)){data.nonfinite??={phase,time:scene.elapsed,joint:joint.getType()};continue;}
   const gap=Math.hypot(a.x-b.x,a.y-b.y),context=()=>({phase,time:scene.elapsed,joint:joint.getUserData()??joint.getType(),bodyA:joint.getBodyA().getUserData(),bodyB:joint.getBodyB().getUserData()});
   if(joint.getType()==='rope-joint'&&gap-joint.getMaxLength()>data.maxRopeStretch){data.maxRopeStretch=gap-joint.getMaxLength();data.worstRope={...context(),value:data.maxRopeStretch};}
   if(joint.getType()==='revolute-joint'){finalAnchor=Math.max(finalAnchor,gap);anchorBad ||=gap>limits.hingeAnchorError;if(gap>data.maxHingeAnchorError){data.maxHingeAnchorError=gap;data.worstHinge={...context(),value:gap};}
    if(joint.isLimitEnabled()){const error=Math.max(joint.getJointAngle()-joint.getUpperLimit(),joint.getLowerLimit()-joint.getJointAngle());finalAngular=Math.max(finalAngular,error);angularBad ||=error>limits.angularLimitError;if(error>data.maxAngularLimitError){data.maxAngularLimitError=error;data.worstAngular={...context(),value:error,angle:joint.getJointAngle(),limits:[joint.getLowerLimit(),joint.getUpperLimit()],...(error>.08?{pose:frozenPose(scene)}:{})};}}}
  }
  const stats=data.phaseStats[phase]??={samples:0,anchorBadSteps:0,angularBadSteps:0,anchorRun:0,angularRun:0,longestAnchorSeconds:0,longestAngularSeconds:0};stats.samples++;stats.anchorBadSteps+=Number(anchorBad);stats.angularBadSteps+=Number(angularBad);stats.anchorRun=anchorBad?stats.anchorRun+DT:0;stats.angularRun=angularBad?stats.angularRun+DT:0;stats.longestAnchorSeconds=Math.max(stats.longestAnchorSeconds,stats.anchorRun);stats.longestAngularSeconds=Math.max(stats.longestAngularSeconds,stats.angularRun);stats.finalAnchor=finalAnchor;stats.finalAngular=finalAngular;
  data.maxEnergyResidual=Math.max(data.maxEnergyResidual,scene.energy()-initialEnergy-(work(scene)-initialWork));
 };
 return {data,setPhase:v=>phase=v,step:()=>{stepIndex++;scene.step(DT);inspect();},inspect,firstImpact:()=>firstFlightImpact,groundImpact:()=>groundImpact};
}
function jointAngles(scene){const result=new Map();for(let j=scene.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'){const a=j.getBodyA().getUserData(),b=j.getBodyB().getUserData();result.set(JSON.stringify([a?.role,a?.id,b?.role,b?.id]),j.getJointAngle());}return result;}
function releaseDifference(a,b){if(!a||!b)return a===b?0:Number.MAX_VALUE;const x=a.center,y=b.center;return Math.max(Math.abs(a.time-b.time),...['x','y','vx','vy','mass'].map(k=>Math.abs(x[k]-y[k])));}
function run(entry){
 const began=performance.now(),state=equipped(entry.equipment),parameters=derivePhysicalConfig(state,base),row={...entry,parameters,equipped:state.equipped,flags:[]};let scene,diag;
 const done=()=>{row.wallMilliseconds=performance.now()-began;if(diag){
  const stages=[...new Set([row.loadingDiagnostics,diag.data].filter(Boolean))],d={samples:stages.reduce((n,s)=>n+s.samples,0),surfaceCandidates:stages.flatMap(s=>s.surfaceCandidates),nonfinite:stages.find(s=>s.nonfinite)?.nonfinite??null};
  for(const key of['maxRopeStretch','maxHingeAnchorError','maxAngularLimitError','maxBodySpeed','maxBodySpin','maxEnergyResidual'])d[key]=Math.max(...stages.map(s=>s[key]));
  for(const[key,maximum]of[['worstRope','maxRopeStretch'],['worstHinge','maxHingeAnchorError'],['worstAngular','maxAngularLimitError'],['worstSpin','maxBodySpin']])d[key]=stages.reduce((best,s)=>s[maximum]>best[maximum]?s:best,stages[0])[key];
  if(d.worstAngular?.pose){const {pose,...worst}=d.worstAngular;angularFrames.push({id:entry.id,species:entry.species,worst,pose});for(const stage of stages)if(stage.worstAngular)delete stage.worstAngular.pose;}
  d.inner={samples:stages.reduce((n,s)=>n+s.inner.samples,0),maxRope:Math.max(...stages.map(s=>s.inner.maxRope)),maxAnchor:Math.max(...stages.map(s=>s.inner.maxAnchor)),maxAngular:Math.max(...stages.map(s=>s.inner.maxAngular))};d.innerStages=stages.map(s=>s.inner);d.boundary={maxOuterActual:Math.max(...stages.map(s=>s.boundaryPolicy.maxOuterActual)),maxOuterBase:Math.max(...stages.map(s=>s.boundaryPolicy.maxOuterBase)),extraIntegrations:stages.reduce((n,s)=>n+s.boundaryPolicy.extraIntegrations,0),budgetFallbacks:stages.reduce((n,s)=>n+s.boundaryPolicy.budgetFallbacks,0)};if(d.boundary.budgetFallbacks)row.flags.push('boundary_budget_fallback');d.phases=stages.map(s=>s.phaseStats);row.diagnostics=d;
  if(d.inner.maxRope>limits.ropeStretch)row.flags.push('inner_rope_stretch');if(d.inner.maxAnchor>limits.hingeAnchorError)row.flags.push('inner_hinge_anchor_error');if(d.inner.maxAngular>limits.angularLimitError)row.flags.push('inner_angular_limit_error');
  if(d.nonfinite)row.flags.push('nonfinite');if(d.maxRopeStretch>limits.ropeStretch)row.flags.push('rope_stretch');if(d.maxHingeAnchorError>limits.hingeAnchorError)row.flags.push('hinge_anchor_error');
  if(d.maxAngularLimitError>limits.angularLimitError)row.flags.push('angular_limit_error');if(d.maxBodySpeed>limits.bodySpeed||d.maxBodySpin>limits.bodySpin)row.flags.push('explosive_speed');
  if(d.maxEnergyResidual>limits.explosiveEnergyResidual)row.flags.push('explosive_energy_residual');if(d.surfaceCandidates.length)row.flags.push('suspected_surface_penetration');}
  return row;};
 try{
  scene=new PhysicalHookScene(parameters,entry.species);diag=diagnostics(scene);diag.setPhase('winding');scene.startWinding(entry.fraction);
  for(let i=0;i<7200&&scene.phase==='winding';i++)diag.step();row.winding={phase:scene.phase,target:scene.windingTarget,actualAngle:scene.arm.getAngle(),work:scene.windingWork};
  if(scene.phase!=='loading'){row.outcome='winding_stalled';return done();}
  diag.setPhase('loading');for(let i=0;i<600;i++)diag.step();
  const part=scene.parts.find(b=>b.getUserData().id===(entry.grip==='head'?'head':'torso'))??scene.parts[0];row.actualGrabbedPart=part.getUserData().id;
  const grip=entry.grip==='offset'?part.getWorldPoint({x:part.getLocalCenter().x+.045,y:part.getLocalCenter().y}):part.getWorldCenter();
  if(!scene.grab(grip)){row.outcome='grip_rejected';return done();}
  for(let i=0;i<600;i++){scene.move({x:-4.3,y:297});diag.step();}
  for(let i=0;i<1200;i++){scene.move({x:scene.pouch.getPosition().x+(entry.grip==='offset'?.2:0),y:scene.pouch.getPosition().y+.85});diag.step();}
  scene.drop();for(let i=0;i<300;i++)diag.step();
  // Same observational criterion as previous measurements, integrated with diagnostics.
  let quiet=0,waited=0;for(let i=0;i<1800;i++){const q=scene.loadingStatus();quiet=q.contacting&&q.withinEnvelope&&q.relativeSpeed<.35?quiet+DT:0;if(quiet>=.1)break;diag.step();waited+=DT;}
  row.loading={...scene.loadingStatus(),waited,quiet};if(!scene.isLoaded()||!row.loading.contacting){row.outcome='seating_failed';return done();}
  const saved=scene.snapshot(),before=digest(saved),predictionStart=performance.now(),hint=scene.predict();row.prediction={wallMilliseconds:performance.now()-predictionStart,mutatedLive:digest(scene.snapshot())!==before,reason:hint?.reason};
  if(row.prediction.mutatedLive)row.flags.push('prediction_mutated_live');
  if(benchmarkOnly){const start=performance.now(),job=createPredictionJob(scene);let slices=0,maxSliceMilliseconds=0;while(job&&!job.done){const t=performance.now();job.advance({maxSteps:300,budgetMs:2.5});maxSliceMilliseconds=Math.max(maxSliceMilliseconds,performance.now()-t);slices++;}row.prediction.budgeted={...job?.stats,wallMilliseconds:performance.now()-start,slices,maxSliceMilliseconds,releaseDifference:releaseDifference(hint?.release??null,job?.result?.release??null),mutatedLive:digest(scene.snapshot())!==before};}
  const originalAngles=jointAngles(scene);
  // Reconstruct canonically, matching the production launch path and prediction.
  row.loadingDiagnostics=diag.data;scene=new PhysicalHookScene(scene.p,entry.species,saved);diag=diagnostics(scene);row.canonicalJointAngleDiscontinuities=[];for(const[key,angle]of jointAngles(scene)){const original=originalAngles.get(key),difference=angle-original;if(Math.abs(difference)>1e-8)row.canonicalJointAngleDiscontinuities.push({bodies:JSON.parse(key),original,restored:angle,difference});}
  if(row.canonicalJointAngleDiscontinuities.length)row.flags.push('canonical_joint_angle_discontinuity');diag.setPhase('canonical_restore');diag.inspect();diag.setPhase('launch');scene.unlatch();
  for(let i=0;i<3000&&!scene.release;i++)diag.step();row.release=scene.release;row.prediction.maximumDifference=releaseDifference(hint?.release??null,scene.release);
  if(row.prediction.maximumDifference>1e-8)row.flags.push('prediction_divergence');
  if(!scene.release){row.outcome='no_release_within_5s';return done();}
  if(scene.release.center.vx<=0)row.flags.push('backward_or_vertical_launch');if(scene.release.center.vy<=0)row.flags.push('downward_launch');
  diag.setPhase('flight');for(let i=0;i<9000&&!diag.firstImpact();i++)diag.step();row.firstImpact=diag.firstImpact();if(row.firstImpact){diag.setPhase('impact_recovery');for(let i=0;i<300;i++)diag.step();if(row.firstImpact.surface!=='ground'){diag.setPhase('descent_after_obstacle');for(let i=0;i<9000&&!diag.groundImpact()&&scene.elapsed-scene.release.time<15;i++)diag.step();if(diag.groundImpact()){diag.setPhase('ground_recovery');for(let i=0;i<300;i++)diag.step();}}}row.groundImpact=diag.groundImpact();if(row.firstImpact?.surface==='launch branch')row.flags.push('launch_branch_impact');
  row.outcome='launched';return done();
 }catch(error){row.outcome=scene?'simulation_error':'construction_rejected';row.error=error.message;if(/nonfinite/i.test(error.message))row.flags.push('nonfinite');return done();}
}
const expectedSuffix=selectedId?'-'+selectedId:group!==null?'-group'+group:benchmarkOnly?'-prediction-benchmark':'';if(existsSync(`${reviewDirectory}/regression${expectedSuffix}.json`))throw Error('Evidence already exists; choose a fresh --output-dir');
const start=performance.now(),rows=[];for(const entry of selected){const row=run(entry);rows.push(row);console.error(`${entry.id}: ${row.outcome}${row.flags.length?' ['+row.flags.join(', ')+']':''} (${row.wallMilliseconds.toFixed(0)} ms)`);}
const totalWallMilliseconds=performance.now()-start,counts={};for(const r of rows)counts[r.outcome]=(counts[r.outcome]??0)+1;
const experimentalPreload=process.execArgv.some(v=>v.includes('research-joint-motion'));
const evidence={experimentalPreload,nodeExecArgv:process.execArgv,scope:'Bounded stratified diagnostic of the explicit stopped-pouch0.5kg physical prototype. One force-driven loading recipe cannot establish universal input validity; seating failures and poor throws are preserved separately from numeric faults.',protocol:{cases:selected.length,dt:DT,limits,phases:'Actual bounded motor; torso/head/offset physical grip; unheld gravity settling; canonical same-solver prediction/live launch; first world impact plus0.5s recovery; continue to ground plus0.5s recovery within15s flight when possible.',matrix:'8actual catalog equipment sets x11species x3winding fractions(.45,.6,.75)=264cases; head pickup for odd-index species, torso for even; each group88cases is one winding fraction.',equipment:'Acquired and equipped in isolated in-memory economy state through actual reducers. No user save or account writes.',surfaceDetection:'Suspected surface penetration means a part COM crossed through authored material depth with no matching recent per-part surface impulse. Candidates require review; this is not proof of continuous-collision failure.',finiteChecks:'Every diagnostic step inspects every dynamic body and rope/revolute joint. Energy residual is mechanical-energy change minus recorded hand/motor/control/damping/drag/spawn work.',runtime:'Node wall time includes prediction and diagnostic scanning; not browser FPS.'},runtime:{node:process.version,platform:process.platform,arch:process.arch,planck:JSON.parse(readFileSync('node_modules/planck/package.json')).version},sourceSHA256,sourcesChangedDuringRun:sourcePaths.filter(p=>createHash('sha256').update(readFileSync(p)).digest('hex')!==sourceSHA256[p]),totalWallMilliseconds,counts,rows};
mkdirSync(reviewDirectory,{recursive:true});const suffix=selectedId?'-'+selectedId:group!==null?'-group'+group:benchmarkOnly?'-prediction-benchmark':'';writeFileSync(`${reviewDirectory}/${experimentalPreload?'regression-joint-motion8-shelf':'regression'}${suffix}.json`,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({totalWallMilliseconds,counts,cases:rows.length},null,2));

writeFileSync(`${reviewDirectory}/angular-frames-${selectedId??'group'+group}.json`,JSON.stringify({protocol:'Frozen actual fixture vertices/circles/body transforms from this deterministic35case run, read without taking held launch snapshots. Real hand target/anchor recorded for static feedback. These are static poses only; no body state changed and no physical continuation claimed.',frames:angularFrames},null,2)+'\n');
