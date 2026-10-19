import {loadProgressConsent,saveProgressConsent} from './progress-preferences.js';
import {createJourneyTracker} from './journey.js';
import {loadAudioPreferences,saveAudioPreferences} from './audio-preferences.js';
import {STARTER_HARDWARE} from './starter.js';
import {CritterScene,gripParameters} from './articulated.js';
import {PhysicalHookScene} from './hook-experiment.js';
import {createGripController,isFlightControlKey} from './input.js';
import {createPredictionJob,capturePredictionPose,predictionPoseIsCurrent,predictionAdvice} from './prediction.js';
import {createRenderer} from './render.js';
import {installReviewExports} from './review.js';
import {profiles,createVolunteerQueue} from './species.js';
import {createAudio} from './audio.js';
import {catalog,createEconomyState,economyReducer,derivePhysicalConfig,createEconomyPersistence} from './economy.js';
import {world as layout} from './world.js';
const $=id=>document.getElementById(id),canvas=$('view'),renderer=createRenderer(canvas);
installReviewExports(canvas,$('frameExport'),$('clipExport'));
const SceneType=()=>$('hook').checked?PhysicalHookScene:CritterScene;
$('reduced').checked=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let storageBackend=null;try{storageBackend=window.localStorage;}catch{}
const audioPreferences=loadAudioPreferences(storageBackend),sound=createAudio();sound.setVolume(audioPreferences.volume);sound.setMuted(audioPreferences.muted);$('mute').checked=audioPreferences.muted;$('volume').value=audioPreferences.volume;
let economy=createEconomyState(),shotId=null,banked=false,shotCount=0,effects=[],launchStarted=null,runObstacle=null;
const progressEnabled=loadProgressConsent(storageBackend);$('save').checked=progressEnabled;
let persistence=createEconomyPersistence(storageBackend,{enabled:progressEnabled}),startupWarning='';
if(progressEnabled){try{economy=persistence.load()??economy;}catch{startupWarning='Saved progress could not be read; a fresh session is available.';}}
function saveProgress(){try{return persistence.save(economy);}catch{error='Saving is unavailable; progress remains in this session.';return false;}}
const setText=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
const equipmentNotes={'counterweight-heavy':'180 kg counterweight; changes energy and balance.','beam-long':'3.6 / 0.9 m beam; changes leverage and mass.','beam-light':'Lighter beam material; changes inertia.','sling-long':'Longer sling; changes timing and clearance.','frame-heavy':'50 kg frame; changes recoil and can reduce range.','frame-grip':'Grippier feet; changes sliding behavior.'};
const seed=Date.now()>>>0,queue=createVolunteerQueue(seed);let fraction=.6,scene,preview=null,previewJob=null,previewSource=null,previewCapture=null,previewBasis=null,lastPredictionMs=0,nextStatus=0,statusPhase='',error=startupWarning,last=performance.now(),accumulator=0,nextPreview=0,clock=0,sliderRunning=true,sliderStart=performance.now(),held=false,journey=createJourneyTracker(),zoneNotice='',zoneNoticeUntil=0;
const settings=()=>derivePhysicalConfig(economy,{counterMass:Number($('mass').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:300,armDamping:Number($('friction').value),flightDrag:Number($('drag').value),initialArm:-3,mechanicalWinding:true,collisionSubsteps:true,collisionStepHz:2400,releaseHardware:'channel',stoppedSplitPouch:$('split').checked,...($('split').checked&&$('hook').checked?{pouchPanelMass:Number($('panelMass').value)}:{}),sling:Number($('sling').value),hookAngle:Number($('railAngle').value),channelLength:Number($('railLength').value)});
function restoreStarterValues(){for(const [id,key]of Object.entries({mass:'counterMass',long:'longArm',short:'shortArm',sling:'sling',railAngle:'hookAngle',railLength:'channelLength',panelMass:'pouchPanelMass'}))$(id).value=STARTER_HARDWARE[key];}
restoreStarterValues();
$('starter').onclick=()=>{restoreStarterValues();reset();};
$('species').innerHTML=profiles.map(p=>`<option value="${p.id}">${p.label}</option>`).join('');$('species').value=queue.current;
function clearPreview(){previewJob?.cancel();previewJob=null;previewSource=null;previewCapture=null;previewBasis=null;preview=null;}
function reset(){try{bank();grip.reset();runObstacle=null;journey=createJourneyTracker();zoneNotice='';zoneNoticeUntil=0;sliderRunning=true;sliderStart=performance.now();shotId=null;banked=false;launchStarted=null;scene=new (SceneType())(settings(),$('species').value);clearPreview();nextPreview=clock+.15;error='';accumulator=0;economyUI();}catch(e){error=e.message;}}
$('hook').onchange=reset;$('split').onchange=reset;
for(const id of ['species','mass','long','short','friction','drag','sling','railAngle','railLength','panelMass'])$(id).onchange=reset;
$('reset').onclick=reset;
$('next').onclick=()=>{bank();queue.consume();$('species').value=queue.current;reset();};
$('time').onclick=()=>{if(sliderRunning){fraction=.2+.75*Number($('power').value);sliderRunning=false;try{scene.startWinding(fraction);clearPreview();const windingScene=scene;sound.unlock().then(ok=>{if(ok&&scene===windingScene&&scene.phase==='winding')sound.play('wind',{intensity:.35});});}catch(e){error=e.message;}}else{sliderRunning=true;sliderStart=performance.now();}};
$('launch').onclick=()=>{sound.unlock();try{if(!scene.loadingStatus().contacting)throw new Error('Let the volunteer contact the cradle before unlatching');const saved=scene.snapshot();scene=new (SceneType())(scene.p,scene.rig.id,saved);scene.unlatch();launchStarted=clock;scene.enableEncounters(seed+shotCount);shotId=`${seed}:${shotCount++}`;banked=false;clearPreview();error='';sound.play('unlatch');}catch(e){error=e.message;}};
const grip=createGripController({toPoint:e=>renderer.point(e),tapHold:()=>$('sticky').checked,
 onStart:p=>{sound.unlock();const grabbed=scene?.grab(p)??false;held=grabbed;if(grabbed)clearPreview();return grabbed;},onMove:p=>scene?.move(p),onEnd:()=>{held=false;scene?.drop();},
 capture:id=>canvas.setPointerCapture(id),releaseCapture:id=>{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}});
canvas.onpointerdown=grip.pointerDown;canvas.onpointermove=grip.pointerMove;canvas.onpointerup=grip.pointerUp;canvas.onpointercancel=grip.pointerCancel;canvas.onlostpointercapture=grip.lostPointerCapture;
window.addEventListener('keydown',e=>{if(isFlightControlKey(e)){e.preventDefault();scene.control=e.key==='ArrowRight'?1:-1;}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')scene.control=0;});window.addEventListener('blur',()=>{grip.blur();if(scene)scene.control=0;});
function economyUI(){
 const effective=settings();setText('shopPreview',`Next setup: ${effective.counterMass} kg counterweight • ${effective.longArm} / ${effective.shortArm} m beam • ${effective.sling} m sling • ${(effective.frameMass??30)} kg frame • grip ${(effective.frameFriction??.65).toFixed(2)}`);
 $('wallet').textContent=`Points ${economy.points} • Bells ${economy.bells} • prototype balance`;
 $('shop').innerHTML=catalog.map(item=>{const owned=economy.owned.includes(item.id),equipped=Object.values(economy.equipped).includes(item.id);return `<button data-item="${item.id}" ${!owned&&economy.bells<item.price?'disabled':''}>${item.label} — ${equipped?'equipped: remove':owned?'equip':item.price+' bells'}<small>${equipmentNotes[item.id]}${!owned&&economy.bells<item.price?' Need '+(item.price-economy.bells)+' more bells.':''}</small></button>`;}).join(' ');
 for(const button of $('shop').querySelectorAll('button'))button.onclick=()=>{sound.unlock();try{const id=button.dataset.item,item=catalog.find(item=>item.id===id);if(economy.equipped[item.slot]===id)economy=economyReducer(economy,{type:'unequip',slot:item.slot});else{if(!economy.owned.includes(id))economy=economyReducer(economy,{type:'purchase',id});economy=economyReducer(economy,{type:'equip',id});}saveProgress();economyUI();sound.play('shop');}catch(e){error=e.message;}};
}
function bank(){if(!shotId||banked||!scene?.release)return;const c=scene.center();economy=economyReducer(economy,{type:'record-shot',shotId,distance:Math.max(0,c.x-scene.release.center.x),impacts:scene.impactCount});banked=true;saveProgress();economyUI();sound.play('coin');}
$('bank').onclick=()=>{sound.unlock();bank();};
function rememberSound(){const status=sound.getStatus(),saved=saveAudioPreferences(storageBackend,status);setText('audioStatus',`${status.muted?'Muted':'Sound on'} • ${Math.round(status.volume*100)}% volume • ${saved?'remembered on this device':'session only'}`);}
$('mute').onchange=()=>{sound.setMuted($('mute').checked);if(!$('mute').checked)sound.unlock();rememberSound();};
$('volume').oninput=()=>{sound.setVolume(Number($('volume').value));if(!$('mute').checked)sound.unlock();rememberSound();};
setText('audioStatus',`${audioPreferences.muted?'Muted':'Sound on'} • ${Math.round(audioPreferences.volume*100)}% volume. Playback starts after interaction.`);
$('save').onchange=()=>{saveProgressConsent(storageBackend,$('save').checked);persistence=createEconomyPersistence(storageBackend,{enabled:$('save').checked});if($('save').checked){try{economy=persistence.load()??economy;saveProgress();economyUI();}catch{error='Saved progress could not be read; this session is still available.';}}};
for(const [id,direction]of [['left',-1],['right',1]]){$(id).onpointerdown=e=>{e.preventDefault();$(id).setPointerCapture(e.pointerId);scene.control=direction;};$(id).onpointerup=$(id).onpointercancel=$(id).onlostpointercapture=()=>scene.control=0;}
economyUI();
function render(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;accumulator+=dt;
 if(sliderRunning)$('power').value=(Math.sin((now-sliderStart)/650)+1)/2;
 try{if(scene){while(accumulator>=1/600){scene.step();accumulator-=1/600;}
 const loading=scene.loadingStatus(),inContact=loading.contacting;
 const eligible=scene.phase==='loading'&&!held&&!scene.control&&scene.isLoaded()&&inContact;
 if(!eligible){clearPreview();nextPreview=clock+.15;}
 else {
  if(preview&&!predictionPoseIsCurrent(scene,previewBasis)){preview=null;previewBasis=null;}
  if(previewJob&&previewSource!==scene)clearPreview();
  if(!previewJob&&clock>nextPreview){previewJob=createPredictionJob(scene);previewSource=scene;previewCapture=capturePredictionPose(scene);}
  if(previewJob){previewJob.advance({maxSteps:300,budgetMs:2.5});
   if(previewJob.done){lastPredictionMs=previewJob.stats.cpuMs;
    preview=predictionPoseIsCurrent(scene,previewCapture)?previewJob.result:null;previewBasis=preview?previewCapture:null;previewJob=null;nextPreview=clock+Math.max(.6,lastPredictionMs/1000*8);
   }
  }
 }
 $('launch').disabled=scene.phase!=='loading'||held||!scene.isLoaded()||!inContact;$('time').disabled=!['uncocked','loading','wind-stalled'].includes(scene.phase);$('time').textContent=scene.phase==='winding'?'Winding…':sliderRunning?'Set winding height':'Restart height meter';
 const c=scene.center(),release=scene.release?.center;
 const hints=[];const travel=journey.update(scene.phase,c.y);if(travel.changed){zoneNotice=`Entering ${travel.biome.label}`;zoneNoticeUntil=clock+2.5;if(travel.firstVisit)sound.play('zone',{biome:travel.biome.id});}if(clock<zoneNoticeUntil)hints.push(zoneNotice+'.');
 if(scene.phase==='uncocked')hints.push('Starter tip: aim near the middle of the winding meter, then lift the volunteer over the green cradle.');
 $('bank').disabled=!scene.release||banked;setText('bank',banked?'Run banked':'Bank run');
 setText('reset',scene.release?'Bank & retry setup':'Reset setup');
 if(banked)hints.push('Run banked. Continue to the next volunteer or retry; later impacts do not change this payout.');
 if(runObstacle==='launch branch')hints.push('The volunteer hit the launch branch. Bank & retry keeps this run’s rewards; adjust the load or hardware before another shot.');
 if(scene.phase==='launching'&&launchStarted!==null&&clock-launchStarted>5)hints.push('Payload is still supported. Reset and try different rail mounting, sling length or counterweight.');
 if(scene.phase==='loading'){
  if(fraction<.3&&loading.withinEnvelope&&inContact&&!held)hints.push('Low winding can give a short seating window. Unlatch while contact is ready; waiting may lose the load.');
  if(previewJob&&!preview)hints.push('Calculating a short physical snapshot hint…');
  if(scene.hardwareHasEscaped?.())hints.push('The release bead slipped out while loading. Reset the setup or test this loose pouch.');
  if(preview&&!preview.release)hints.push('No separation in the five-second preview. Try different loading or mechanical settings.');
  const advice=predictionAdvice(preview);if(advice)hints.push(advice);
  if(fraction<.3&&!held&&!inContact&&c.y<scene.pouch.getPosition().y-.5)hints.push('The load slipped from this low winding setup. Reset and try a higher winding target or a different placement.');
  if(held&&scene.hand?.body.getUserData()?.id==='head'&&scene.rig.bodies.some(b=>b.id==='torso'))hints.push('Head grip: try the torso for steadier loading.');
  if(held&&scene.rig.totalMass>=2)hints.push('Heavy load: move slowly; compare the release hint.');
  if(held)hints.push('Release your grip before launching.');
  else if(!loading.withinEnvelope)hints.push('Lift the volunteer over the cradle and let gravity seat it.');
  else if(!loading.contacting)hints.push('Volunteer is near the cradle but not in contact. Let it land before launching.');
  else if(loading.relativeSpeed>.35)hints.push('Volunteer is contacting the cradle and still moving. Wait to settle or test this moving load.');
  else if(loading.maxPartRelativeSpeed>.35||loading.maxRelativeSpin>1)hints.push('The body is still rolling or redistributing inside the cradle. Wait or test this pose.');
  else if(loading.cradleSpeed>.35||Math.abs(loading.cradleSpin)>.5)hints.push('The cradle is still swinging. Waiting changes the shot; watch the updating preview.');
 }
 if(held&&scene.forceCapped)hints.push('Grip force limit reached. Move more gently.');
 setText('guidance',hints.join(' '));
 for(const event of scene.events.splice(0)){if(event.type==='impact'){runObstacle??=event.surface??null;sound.play('impact',{intensity:Math.min(1,event.strength/5),material:event.material,mass:event.mass});if(!$('reduced').checked)effects.push({x:event.position.x,y:event.position.y,life:.4,strength:Math.min(1,event.strength/Math.max(.1,scene.rig.totalMass*10))});}else if(event.type==='launch')sound.play('launch');else if(event.type==='enemy')sound.play('enemy',{intensity:.3});}
 effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0).slice(-20);
 if(clock>=nextStatus||statusPhase!==scene.phase){const audio=sound.getStatus();setText('audioEngine',audio.muted?'Audio muted; no cues are being scheduled.':audio.contextState==='running'?`Audio active • recent cue: ${audio.lastCue??'none'}`:'Audio waiting for an interaction.');nextStatus=clock+.25;statusPhase=scene.phase;
 setText('readout',error||`${scene.rig.label} • ${({uncocked:'Ready to wind',winding:'Winding',loading:'Load the cradle',launching:'Arm moving',flight:'In flight','wind-stalled':'Winding stalled'})[scene.phase]??scene.phase} • ${release?Math.max(0,c.x-release.x).toFixed(0)+' m • '+scene.impactCount+' bounces • '+(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(1)+' m/s':'Counterweight '+(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)+' m above axle'}`);
 setText('mechanicsReadout',`${scene.rig.label} • ${scene.phase} • ${release?(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(2)+' m/s • ':''}hand work ${scene.handWork.toFixed(2)} J • arcade work ${scene.assistWork.toFixed(2)} J${scene.forceCapped?' ('+gripParameters(scene.rig.totalMass).maxForce.toFixed(0)+' N cap)':''} • motor net work ${scene.windingWork.toFixed(1)} J • counterweight lift ${(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)} m above pivot • frame x ${scene.frame.getPosition().x.toFixed(3)} m • queue seed ${seed}`);
 setText('queue',`Next 3: ${queue.peek().map(id=>profiles.find(p=>p.id===id).label).join(' → ')}`);
 }
 renderer.draw(scene,preview,effects,clock,$('reduced').checked,window.innerWidth);
 }}catch(e){error=e.message;$('readout').textContent=error;}
 requestAnimationFrame(render);
}
reset();if(startupWarning)error=startupWarning;requestAnimationFrame(render);
