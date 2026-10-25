/** Bounded, storage-free audit. No browser, network, personal save or release actions. */
import {PARTS,SLOTS,STARTER,PREVIOUS_STARTER,scaledPreset,validateBuild,buildFacts,part} from '../src/build-catalog.js';
import {fitEquipment,purchaseFit} from '../src/build-equipment.js';
import {BuildSimulation,runBuild} from '../src/build-physics.js';
import {windingMinimum} from '../src/winding-comfort.js';
import {newProgress,buy,canBuild,saveProgress,loadProgress} from '../src/build-progress.js';
import {purchaseOffer,priceFor} from '../src/build-shop.js';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createBuildRenderer} from '../src/build-art.js';
import {pathToFileURL} from 'node:url';

export const CATALOGUE_IDS=Object.freeze(PARTS.map(p=>p.id));
const summary=s=>({phase:s.phase,failure:s.failure,release:s.release?{speed:s.release.speed,angle:s.release.angle,time:s.release.time,reason:s.release.reason}:null,distanceAtCutoff:s.maxX,beamGrams:s.facts.beamGrams,pouchGrams:s.pouchMass*1000,counterRadius:s.facts.counterRadius,peakTension:s.peakTension,peakStress:s.peakStress,frameX:s.real(s.frame).x});
const reject=b=>{try{validateBuild(b);return false;}catch{return true;}};
const previous=p=>{const group=PARTS.filter(q=>q.slot===p.slot);return group[group.findIndex(q=>q.id===p.id)-1];};
export function capacityProof(p){
 const prev=p.id==='guillotine'?null:previous(p),current=fitEquipment(STARTER,{kind:'part',id:p.id});
 let b,measured,limit,settings;
 if(p.slot==='frame'){
  b={...STARTER,frame:p.id,pivotHeight:p.maxHeight*.8,frameGrams:p.maxMass*.8};
  const s=new BuildSimulation(b);s.frame.setType(s.storeTypes.get(s.frame));measured={pivotHeight:s.pivot().y,frameGrams:s.frame.getMass()*s.M*1000/(1+b.braceCount*.04)};
  limit={height:p.maxHeight,mass:p.maxMass};settings={height:current.pivotHeight,mass:current.frameGrams};
 }else if(p.slot==='ballast'){
  b=p.id==='guillotine'?{...current,counterGrams:p.maxMass*.8}:{...STARTER,frame:'leviathan',pivotHeight:200,ballast:p.id,material:'steel',counterGrams:p.maxMass*.8};
  const s=new BuildSimulation(b);s.counter.setType(s.storeTypes.get(s.counter));measured={counterGrams:s.counter.getMass()*s.M*1000};limit={mass:p.maxMass};settings={mass:current.counterGrams};
 }else if(p.slot==='arm'){
  const total=p.maxLength*.8;b={...STARTER,frame:'leviathan',arm:p.id,longArm:total*.8,shortArm:total*.2,pivotHeight:Math.max(1.2,total*.85)};
  const s=new BuildSimulation(b);measured={beamGrams:s.facts.beamGrams,tipDistance:Math.hypot(s.tip().x-s.pivot().x,s.tip().y-s.pivot().y)};limit={length:p.maxLength};settings={length:current.longArm+current.shortArm};
 }else if(p.slot==='sling'){
  b={...STARTER,frame:'leviathan',sling:p.id,slingLength:p.maxLength*.8,pouchWidth:p.width*.8,pivotHeight:Math.max(1.2,p.maxLength*.88)};
  const s=new BuildSimulation(b);measured={ropeMaxLength:s.sling.getMaxLength()*s.L,pouchGrams:s.pouchMass*1000};limit={mass:p.capacity,width:p.width,length:p.maxLength};settings={mass:25,width:current.pouchWidth,length:current.slingLength};
 }else return null;
 validateBuild(b);
 const ref=prev?{...b,[p.slot]:prev.id}:null;
 return{limits:limit,currentSettings:settings,expandedSettings:Object.fromEntries(Object.keys(STARTER).filter(k=>b[k]!==STARTER[k]).map(k=>[k,b[k]])),physical:measured,previousPart:prev?.id??null,previousRejectsExpanded:ref?reject(ref):null};
}
export function purchaseProof(p){
 const base={...newProgress(),bells:100000000,points:18117,owned:newProgress().owned.filter(id=>id!==p.id)};
 const before=JSON.stringify(base),bought=buy(base,p.id),fitted=fitEquipment(bought.build,{kind:'part',id:p.id});
 const state={...bought,build:fitted};canBuild(state,fitted);
 const data=new Map(),storage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)??null};saveProgress(storage,state);const roundtrip=loadProgress(storage);
 let shop=true;
 if(p.price>0){const listed={...base,shop:{round:0,seed:73,rerolls:0,offers:[{kind:'part',id:p.id}],voucher:null,pack:[],packCost:0,packOpened:false,packTaken:false}};const paid=purchaseOffer(listed,{kind:'part',id:p.id});shop=paid.owned.includes(p.id)&&paid.bells===base.bells-priceFor(listed,{kind:'part',id:p.id});}
 return{owned:roundtrip.owned.includes(p.id),equipped:roundtrip.build[p.slot]===p.id,paidExactly:bought.bells===base.bells-p.price,previousOwnershipPreserved:base.owned.every(id=>roundtrip.owned.includes(id)),totalsPreserved:roundtrip.points===base.points&&roundtrip.best===base.best&&roundtrip.launches===base.launches,saveRoundTrip:JSON.stringify(roundtrip)===JSON.stringify(state),sourceUnchanged:JSON.stringify(base)===before,shopPurchase:shop,settingsPreserved:Object.keys(STARTER).filter(k=>!SLOTS.some(([slot])=>slot===k)&&k!=='name').every(k=>fitted[k]===STARTER[k]||p.slot==='arm'&&['longArm','shortArm'].includes(k)||p.slot==='frame'&&['pivotHeight','frameGrams'].includes(k)||p.slot==='ballast'&&k==='counterGrams'||p.slot==='sling'&&['slingLength','pouchWidth'].includes(k))};
}
export function intendedBuild(p){
 const profile={frame:{sapling:'mouse',timber:'rabbit',braced:'bear',giant:'elephant',leviathan:'whale'},ballast:{pebble:'mouse',boulder:'mouse',quarry:'rabbit',mountain:'bear',continental:'whale'},arm:{twig:'mouse',oak:'mouse',laminated:'mouse',ironwood:'bear',colossus:'whale'},sling:{pocket:'mouse',pouch:'rabbit',cradle:'fox',hammock:'bear',elephant:'elephant',whale:'whale'},rope:{twine:'mouse',hemp:'rabbit',cable:'fox',titanCable:'whale'}}[p.slot]?.[p.id]??'mouse';
 return fitEquipment(scaledPreset(profile),{kind:'part',id:p.id});
}
export function windProof(id,{heavy=false,bearing=STARTER.bearing}={}){
 const b={...(heavy?scaledPreset('whale'):STARTER),winch:id,bearing},s=new BuildSimulation(b);s.setDraw(0);
 // Real loading enables the fitted bearing's preparation-comfort governor. A loading object
 // is unnecessary to this preparation-only test: use the existing loading API.
 return import('../src/payload-loading.js').then(({createPayloadLoading})=>{
  s.loading=createPayloadLoading(s);for(let i=0;i<60;i++)s.wind(1/60);
  return{drawAfterOneSecond:s.drawFraction,power:part(id).power,bearing,minimumSeconds:windingMinimum(b),counterGrams:b.counterGrams,shortArm:b.shortArm};
 });
}
/** Observe real rail contacts until release. Tangential work is an estimate
 * from the applied impulse and average pre/post tangential relative speed;
 * this is not a whole-rig energy conservation measurement. */
export function releaseMechanicsProof(c){
 const s=new BuildSimulation(c),pre=new WeakMap();
 let estimatedRailWorkJ=0,tangentialImpulseNs=0,postSolveCalls=0,slidingContactSeconds=0;
 s.world.on('pre-solve',contact=>{
  const a=contact.getFixtureA(),b=contact.getFixtureB();if(a!==s.troughFixture&&b!==s.troughFixture)return;
  const m=contact.getWorldManifold(),count=contact.getManifold().pointCount;if(!m||!count)return;
  const t={x:m.normal.y,y:-m.normal.x};
  const speeds=m.points.slice(0,count).map(p=>{const va=a.getBody().getLinearVelocityFromWorldPoint(p),vb=b.getBody().getLinearVelocityFromWorldPoint(p);return(vb.x-va.x)*t.x+(vb.y-va.y)*t.y;});
  pre.set(contact,{a,b,m,t,speeds});
 });
 s.world.on('post-solve',(contact,impulse)=>{
  const before=pre.get(contact);if(!before)return;pre.delete(contact);postSolveCalls++;let sliding=false;
  for(let i=0;i<before.speeds.length;i++){
   const p=before.m.points[i],va=before.a.getBody().getLinearVelocityFromWorldPoint(p),vb=before.b.getBody().getLinearVelocityFromWorldPoint(p);
   const after=(vb.x-va.x)*before.t.x+(vb.y-va.y)*before.t.y,j=Math.abs(impulse.tangentImpulses[i]);
   tangentialImpulseNs+=j*s.M*s.L/s.T;estimatedRailWorkJ+=j*(Math.abs(before.speeds[i])+Math.abs(after))*.5*s.M*s.L;
   sliding ||= Math.abs(before.speeds[i])*s.L/s.T>.01;
  }
  if(sliding)slidingContactSeconds+=s.T/480;
 });
 s.fire();for(let i=0;i<2400&&!s.release&&s.phase==='swing';i++)s.step(1/480);
 let counterFixtureRadius=0;for(let f=s.counter.getFixtureList();f;f=f.getNext())if(f.getShape().getType()==='circle')counterFixtureRadius=Math.max(counterFixtureRadius,f.getShape().getRadius()*s.L);
 return{build:{...c},failure:s.failure,phase:s.phase,release:s.release?{speed:s.release.speed,angle:s.release.angle,time:s.release.time,reason:s.release.reason}:null,rail:{friction:s.troughFixture.getFriction(),estimatedWorkJ:estimatedRailWorkJ,tangentialImpulseNs,postSolveCalls,slidingContactSeconds},counter:{fixtureRadius:counterFixtureRadius,inertiaKgM2:s.counter.getInertia()*s.M*s.L*s.L}};
}
export function relevantMechanicComparisons(){
 const trough=[];for(const [profile,b]of [['starter',STARTER],['ground-loaded',{...PREVIOUS_STARTER,longArm:4,shortArm:.65,cockAngle:80,slingLength:3}],['rabbit',scaledPreset('rabbit')]])for(const id of ['runway','waxedRunway'])trough.push({profile,id,...releaseMechanicsProof({...b,trough:id})});
 const release=[];for(const [profile,b]of [['starter',STARTER],['ground-loaded',{...PREVIOUS_STARTER,longArm:4,shortArm:.65,cockAngle:80,slingLength:3}],['rabbit',scaledPreset('rabbit')]])for(const p of PARTS.filter(p=>p.slot==='release'))release.push({profile,id:p.id,...releaseMechanicsProof({...b,release:p.id})});
 const material=PARTS.filter(p=>p.slot==='material').map(p=>({id:p.id,...releaseMechanicsProof({...STARTER,material:p.id})}));
 return{trough,release,material};
}

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const AUDITED_SOURCE=['src/build-catalog.js','src/build-physics.js','src/build-equipment.js','src/winding-comfort.js','src/payload-loading.js','src/build-art.js','src/critter-body.js','src/mouse-art.js','src/crank-wheel.js','src/rope-visual.js','src/critter-performance.js','src/flight-art.js','scripts/audit-catalogue.mjs'];
async function sourceFingerprint(){return Object.fromEntries(await Promise.all(AUDITED_SOURCE.map(async path=>[path,digest(await readFile(new URL('../'+path,import.meta.url)))])));}
async function archiveProvenance(){return Promise.all(['upgrade-audit','upgrade-usefulness'].map(async folder=>{
 const path=`docs/${folder}/catalogue-measurements.json`,bytes=await readFile(new URL('../'+path,import.meta.url)),record=JSON.parse(bytes);
 return{path,sha256:digest(bytes),parts:record.rows.length,role:'Historical measurements only; not the current starter acceptance target'};
}));}
/** Record the actual mechanism painter at unchanged selected geometry. Distinct
 * non-colour commands establish connected variants, not novice recognition or
 * native viewport acceptance. The renderer must not mutate solver state. */
export function catalogueVisualProof(){
 const oldClock=Object.getOwnPropertyDescriptor(globalThis,'performance'),oldDpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>0},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});
 try{return PARTS.map(p=>{
  const build=fitEquipment(STARTER,{kind:'part',id:p.id}),views={};
  for(const [name,size]of [['phone',{width:390,height:844}],['desktop',{width:1726,height:875}]]){
   const sim=new BuildSimulation(build),before=JSON.stringify(sim.snapshot()),calls=[],styles={},stack=[];let depth=0;
   const record=(name,args)=>{for(const n of args.flat())if(typeof n==='number'&&!Number.isFinite(n))throw Error(p.id+' non-finite '+name);calls.push([name,...args]);};
   const ctx=new Proxy({}, {get(_,key){
    if(key in styles)return styles[key];
    if(key==='createLinearGradient'||key==='createRadialGradient')return(...args)=>{record(key,args);return{addColorStop(...values){record('addColorStop',values);}};};
    if(key==='measureText')return text=>({width:String(text).length*5});
    if(key==='save')return()=>{depth++;stack.push({...styles});record(key,[]);};
    if(key==='restore')return()=>{if(depth<=0)throw Error('Unbalanced renderer restore');depth--;const prior=stack.pop();for(const k of Object.keys(styles))delete styles[k];Object.assign(styles,prior);record(key,[]);};
    return(...args)=>record(key,args);
   },set(_,key,value){styles[key]=value;record(`set:${String(key)}`,[value]);return true;}});
   createBuildRenderer({dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>size}).draw(sim,{labels:false,pixelRatio:1,preview:true});
   const geometry=calls.filter(row=>!['set:fillStyle','set:strokeStyle'].includes(row[0]));
   views[name]={width:size.width,height:size.height,commandCount:calls.length,geometrySha256:digest(JSON.stringify(geometry)),finite:true,balanced:depth===0,simulationUnchanged:JSON.stringify(sim.snapshot())===before};
  }
  return{id:p.id,slot:p.slot,views};
 });}finally{Object.defineProperty(globalThis,'performance',oldClock);if(oldDpr)Object.defineProperty(globalThis,'devicePixelRatio',oldDpr);else delete globalThis.devicePixelRatio;}
}

export async function runCatalogueAudit(){
 const sourceBefore=await sourceFingerprint(),baseline=summary(runBuild(STARTER,12)),rows=[];
 for(const p of PARTS){
  const fitted=fitEquipment(STARTER,{kind:'part',id:p.id}),direct=summary(runBuild(fitted,12)),intended=intendedBuild(p),fit=summary(runBuild(intended,30));
  const changed=Object.keys(direct).filter(k=>JSON.stringify(direct[k])!==JSON.stringify(baseline[k]));
  const safe=purchaseFit(STARTER,{kind:'part',id:p.id}),warnings=buildFacts(fitted).warnings;
  rows.push({id:p.id,slot:p.slot,name:p.name,price:p.price,starterCompatibility:{autoFits:safe.fitted,reason:safe.reason,warnings,movingHardwareGrams:direct.pouchGrams,critterGrams:25,needsLargerRig:!!direct.failure},specification:{...p},mechanism:mechanism[p.slot],purchase:purchaseProof(p),capacity:capacityProof(p),baseline:direct,changedBaselineFields:changed,intended:{animal:intended.animal,build:intended,result:fit},...(p.slot==='winch'?{wind:{light:await windProof(p.id),heavy:await windProof(p.id,{heavy:true})}}:p.slot==='bearing'?{wind:{light:await windProof(STARTER.winch,{bearing:p.id}),heavy:await windProof(STARTER.winch,{bearing:p.id,heavy:true})}}:{})});
 }
 const bearings=[];for(const animal of ['mouse','bear','whale'])for(const p of PARTS.filter(p=>p.slot==='bearing')){const b={...scaledPreset(animal),bearing:p.id};bearings.push({animal,id:p.id,axleRadius:b.axleRadius,...summary(runBuild(b,30))});}
 const relevantMechanics=relevantMechanicComparisons(),visuals=catalogueVisualProof(),sourceAfter=await sourceFingerprint();
 const findings=rows.filter(row=>row.starterCompatibility.autoFits&&row.starterCompatibility.needsLargerRig).map(row=>({kind:'unsafe-starter-auto-fit',id:row.id,failure:row.baseline.failure,movingHardwareGrams:row.baseline.pouchGrams,explanation:'Supported larger recipe works; inventory purchase should not automatically replace the working starter.'}));
 return{method:{kind:'bounded deterministic current-source Node comparisons',generatedAt:new Date().toISOString(),baselineBuild:{...STARTER},sourceBefore,sourceAfter,sourceStable:JSON.stringify(sourceBefore)===JSON.stringify(sourceAfter),archives:await archiveProvenance(),baselineSeconds:12,intendedSeconds:30,map:false,loading:'full-draw shots exclude loose loading; preparation uses the real loading controller',weapons:false,personalStorage:false,limits:'Current geometry is authoritative. Archived trajectories remain historical evidence. Distances are cutoff observations, not guaranteed final ranges. Direct placement excludes loose UI loading variation and door/walkout progression. Capacity envelope construction is not a certified launch. Canvas traces do not establish native visual legibility.'},counts:{parts:PARTS.length,slots:SLOTS.length},baseline,rows,bearings,relevantMechanics,visuals,findings};
}
export const mechanism={chassis:'Physical ground contacts, recoil and axle/carriage constraints.',arm:'Density changes distributed beam mass/inertia; strength controls overload; maxLength validates geometry.',frame:'Capacity permits taller/heavier player-authored frames; actual height/mass/brace values create geometry/inertia. Selecting ID alone does not auto-resize.',ballast:'Capacity permits a larger counterweight fill; actual counterGrams drives mass/energy. Selecting ID alone does not auto-fill.',material:'Density changes counterweight radius/contact geometry and inertia at identical mass.',mount:'Fixed mass on arm versus separate hinged pendulum (floating chassis has its own guided weight).',sling:'Moving cloth mass and capacity/width/length limits; larger sizes require a compatible complete rig.',rope:'Distributed cord mass is lumped into pouch mass; strength controls tension failure.',bearing:'Coulomb axle torque uses selected friction × reaction load × axle radius; explicit arcade winding comfort gives light-load minimum preparation 3.6/3/2.4/2 seconds, preserving bronze baseline and full-draw launch physics.',release:'Resolved ring pull minus selected friction × normal drives release travel.',winch:'Preparation power cap controls raising speed, limited by the fitted bearing winding-comfort minimum; launch at identical draw receives no energy multiplier.',trough:'Selected fixture friction affects the pouch slide before lift-off.'};

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const audit=await runCatalogueAudit();if(!audit.method.sourceStable)throw Error('Audited source changed during measurement; rerun after the owning edit is complete.');if(process.argv[2]){await mkdir(process.argv[2],{recursive:true});await writeFile(`${process.argv[2]}/catalogue-measurements.json`,JSON.stringify(audit,null,2)+'\n');}console.log(JSON.stringify({counts:audit.counts,allPurchasesPass:audit.rows.every(r=>Object.values(r.purchase).every(Boolean)),noIntendedRelease:audit.rows.filter(r=>!r.intended.result.release).map(r=>r.id),sameStarter:audit.rows.filter(r=>r.changedBaselineFields.length===0).map(r=>r.id),findings:audit.findings},null,2));}
