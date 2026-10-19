import {createWindingInput,windingMeter} from './winding-input.js';
import {createFrameClock,createRuntimeMetrics} from './runtime.js';
import {createLoadingCoach} from './loading-coach.js';
import {drawVolunteerPortrait,speciesTraits} from './species-art.js';
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
import {profiles,createRig,createVolunteerQueue} from './species.js';
import {createAudio} from './audio.js';
import {catalog,createEconomyState,economyReducer,derivePhysicalConfig,createEconomyPersistence,shotReward} from './economy.js';
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
const seed=Date.now()>>>0,queue=createVolunteerQueue(seed);let fraction=.6,scene,preview=null,previewJob=null,previewSource=null,previewCapture=null,previewBasis=null,lastPredictionMs=0,nextStatus=0,statusPhase='',error=startupWarning,accumulator=0,nextPreview=0,clock=0,sliderRunning=false,sliderStart=performance.now(),held=false,journey=createJourneyTracker(),zoneNotice='',zoneNoticeUntil=0;
const frameClock=createFrameClock(),runtimeMetrics=createRuntimeMetrics();let manualPaused=false,focusPaused=false,nextRuntime=0,loadingCoach=createLoadingCoach(),resizeNoticeUntil=0;const isPaused=()=>manualPaused||document.hidden||focusPaused||(banked&&scene?.phase==='flight');
const settings=()=>derivePhysicalConfig(economy,{counterMass:Number($('mass').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:300,armDamping:Number($('friction').value),flightDrag:Number($('drag').value),initialArm:-3,mechanicalWinding:true,collisionSubsteps:true,collisionStepHz:2400,fastCollisionStepHz:4800,releaseHardware:'channel',stoppedSplitPouch:$('split').checked,...($('split').checked&&$('hook').checked?{pouchPanelMass:Number($('panelMass').value)}:{}),sling:Number($('sling').value),hookAngle:Number($('railAngle').value),channelLength:Number($('railLength').value)});
function restoreStarterValues(){for(const [id,key]of Object.entries({mass:'counterMass',long:'longArm',short:'shortArm',sling:'sling',railAngle:'hookAngle',railLength:'channelLength',panelMass:'pouchPanelMass'}))$(id).value=STARTER_HARDWARE[key];}
restoreStarterValues();
$('starter').onclick=()=>{restoreStarterValues();reset();};
$('species').innerHTML=profiles.map(p=>`<option value="${p.id}">${p.label}</option>`).join('');$('species').value=queue.current;
function clearPreview(){previewJob?.cancel();previewJob=null;previewSource=null;previewCapture=null;previewBasis=null;preview=null;}
let rosterKey='';
function updateRoster(){const ids=queue.peek(),key=ids.join(',');if(key===rosterKey)return;rosterKey=key;$('roster').replaceChildren(...ids.map((id,i)=>{const p=profiles.find(p=>p.id===id),card=document.createElement('div'),canvas=document.createElement('canvas'),label=document.createElement('span');card.className='volunteer-card';canvas.width=160;canvas.height=72;canvas.setAttribute('aria-hidden','true');label.textContent=`${i+1}. ${p.label}${id==='flying-squirrel'?' • rare':''}`;card.append(canvas,label);drawVolunteerPortrait(canvas.getContext('2d'),createRig(id),160,72);return card;}));}
function installScene(candidate){bank();winding.cancel();grip.reset();held=false;effects=[];runObstacle=null;journey=createJourneyTracker();loadingCoach=createLoadingCoach();zoneNotice='';zoneNoticeUntil=0;sliderRunning=false;shotId=null;banked=false;launchStarted=null;scene=candidate;fraction=.6;$('power').value=(fraction-.2)/.75;clearPreview();nextPreview=clock+.15;error='';accumulator=0;nextStatus=0;nextRuntime=0;frameClock.reset();runtimeMetrics.reset();economyUI();updateRoster();setText('speciesTrait',speciesTraits[scene.rig.id]);setText('rigFacts',`${scene.rig.label}: ${scene.rig.bodies.map(b=>`${b.id} ${(b.mass*1000).toFixed(0)} g`).join(' • ')}. Contact friction ${scene.rig.friction}; restitution ${scene.rig.restitution}. Prototype units, not biological measurements.`);}
function reset(){try{const candidate=new (SceneType())(settings(),$('species').value);installScene(candidate);return true;}catch(e){error=e.message;return false;}}
$('hook').onchange=reset;$('split').onchange=reset;
for(const id of ['species','mass','long','short','friction','drag','sling','railAngle','railLength','panelMass'])$(id).onchange=reset;
$('reset').onclick=reset;
$('next').onclick=()=>{try{const id=queue.peek()[0],candidate=new (SceneType())(settings(),id);bank();queue.consume();$('species').value=id;installScene(candidate);}catch(e){error=e.message;}};
function beginWinding(){if(isPaused())return;fraction=.2+.75*Number($('power').value);sliderRunning=false;try{scene.startWinding(fraction);clearPreview();error='';const windingScene=scene;sound.unlock().then(ok=>{if(ok&&!isPaused()&&scene===windingScene&&scene.phase==='winding')sound.play('wind',{intensity:.35});});}catch(e){error=e.message;}}
const winding=createWindingInput({enabled:()=>!isPaused()&&!held&&['uncocked','loading','wind-stalled'].includes(scene?.phase),onAim:()=>{sliderRunning=true;sliderStart=performance.now();$('power').value=0;sound.unlock();clearPreview();},onCommit:()=>{if(sliderRunning)$('power').value=windingMeter(performance.now(),sliderStart);beginWinding();},onCancel:()=>{sliderRunning=false;},capture:id=>$('time').setPointerCapture(id),releaseCapture:id=>{if($('time').hasPointerCapture(id))$('time').releasePointerCapture(id);}});
$('time').onpointerdown=winding.pointerDown;$('time').onpointerup=winding.pointerUp;$('time').onpointercancel=winding.pointerCancel;$('time').onlostpointercapture=winding.lostPointerCapture;$('time').onkeydown=winding.keyDown;$('time').onkeyup=winding.keyUp;$('time').onclick=winding.click;
$('power').oninput=()=>{winding.cancel();sliderRunning=false;};$('power').onchange=beginWinding;
$('retry').onclick=()=>{if(reset()){$('power').value=(.6-.2)/.75;beginWinding();}};
function freezeInputs(){grip.blur();winding.cancel();if(scene)scene.control=0;accumulator=0;frameClock.reset();clearPreview();sound.pause();}
$('pause').onclick=()=>{manualPaused=!manualPaused;freezeInputs();if(!manualPaused)sound.unlock();setText('pause',manualPaused?'Resume':'Pause');setText('pauseStatus',manualPaused?'Paused. Resume when ready.':'');};
document.addEventListener('visibilitychange',()=>{freezeInputs();setText('pauseStatus',document.hidden?'Paused while this tab is hidden.':manualPaused?'Paused. Resume when ready.':'');});
window.addEventListener('resize',()=>{resizeNoticeUntil=grip.active?clock+2:0;grip.reset();winding.cancel();if(scene)scene.control=0;clearPreview();});
$('launch').onclick=()=>{sound.unlock();try{if(!scene.loadingStatus().contacting)throw new Error('Let the volunteer contact the cradle before unlatching');const saved=scene.snapshot();scene=new (SceneType())(scene.p,scene.rig.id,saved);scene.unlatch();launchStarted=clock;scene.enableEncounters(seed+shotCount);shotId=`${seed}:${shotCount++}`;banked=false;clearPreview();error='';sound.play('unlatch');}catch(e){error=e.message;}};
const grip=createGripController({toPoint:e=>renderer.point(e),tapHold:()=>$('sticky').checked,
 onStart:p=>{if(isPaused())return false;sound.unlock();const grabbed=scene?.grab(p)??false;held=grabbed;if(grabbed)clearPreview();return grabbed;},onMove:p=>scene?.move(p),onEnd:()=>{held=false;scene?.drop();},
 capture:id=>canvas.setPointerCapture(id),releaseCapture:id=>{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}});
canvas.onpointerdown=grip.pointerDown;canvas.onpointermove=grip.pointerMove;canvas.onpointerup=grip.pointerUp;canvas.onpointercancel=grip.pointerCancel;canvas.onlostpointercapture=grip.lostPointerCapture;
window.addEventListener('keydown',e=>{if(isFlightControlKey(e)&&scene?.phase==='flight'&&!isPaused()){e.preventDefault();scene.control=e.key==='ArrowRight'?1:-1;}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')scene.control=0;});window.addEventListener('blur',()=>{focusPaused=true;freezeInputs();setText('pauseStatus','Paused while the game is unfocused.');});window.addEventListener('focus',()=>{focusPaused=false;frameClock.reset();setText('pauseStatus',manualPaused?'Paused. Resume when ready.':'');});
function economyUI(){
 const effective=settings();setText('shopPreview',`Next setup: ${effective.counterMass} kg counterweight • ${effective.longArm} / ${effective.shortArm} m beam • ${effective.sling} m sling • ${(effective.frameMass??30)} kg frame • grip ${(effective.frameFriction??.65).toFixed(2)}`);
 $('wallet').textContent=`Points ${economy.points} • Bells ${economy.bells} • prototype balance`;
 $('shop').innerHTML=catalog.map(item=>{const owned=economy.owned.includes(item.id),equipped=Object.values(economy.equipped).includes(item.id);return `<button data-item="${item.id}" ${!owned&&economy.bells<item.price?'disabled':''}>${item.label} — ${equipped?'equipped: remove':owned?'equip':item.price+' bells'}<small>${equipmentNotes[item.id]}${!owned&&economy.bells<item.price?' Need '+(item.price-economy.bells)+' more bells.':''}</small></button>`;}).join(' ');
 for(const button of $('shop').querySelectorAll('button'))button.onclick=()=>{sound.unlock();try{const id=button.dataset.item,item=catalog.find(item=>item.id===id);if(economy.equipped[item.slot]===id)economy=economyReducer(economy,{type:'unequip',slot:item.slot});else{if(!economy.owned.includes(id))economy=economyReducer(economy,{type:'purchase',id});economy=economyReducer(economy,{type:'equip',id});}saveProgress();economyUI();setText('shopNotice',`${item.label} ${economy.equipped[item.slot]===id?'equipped':'removed'} for the next setup. Reset or choose the next volunteer to use it.`);sound.play('shop');}catch(e){error=e.message;}};
}
function bank(){if(!shotId||banked||!scene?.release)return false;const c=scene.center(),action={type:'record-shot',shotId,distance:Math.max(0,c.x-scene.release.center.x),impacts:scene.impactCount},reward=shotReward(action);economy=economyReducer(economy,action);banked=true;scene.control=0;accumulator=0;frameClock.reset();saveProgress();economyUI();setText('shopNotice',`Collected ${reward.points} points and ${reward.bells} bells. Choose owned gear or buy an upgrade, then try the next setup.`);sound.play('coin');return true;}
$('bank').onclick=()=>{sound.unlock();if(bank()){const panel=$('shop').closest('details');panel.open=true;panel.scrollIntoView({block:'start',behavior:'auto'});}};
function rememberSound(){const status=sound.getStatus(),saved=saveAudioPreferences(storageBackend,status);setText('audioStatus',`${status.muted?'Muted':'Sound on'} • ${Math.round(status.volume*100)}% volume • ${saved?'remembered on this device':'session only'}`);}
$('mute').onchange=()=>{sound.setMuted($('mute').checked);if(!$('mute').checked)sound.unlock();rememberSound();};
$('volume').oninput=()=>{sound.setVolume(Number($('volume').value));if(!$('mute').checked)sound.unlock();rememberSound();};
setText('audioStatus',`${audioPreferences.muted?'Muted':'Sound on'} • ${Math.round(audioPreferences.volume*100)}% volume. Playback starts after interaction.`);
$('save').onchange=()=>{saveProgressConsent(storageBackend,$('save').checked);persistence=createEconomyPersistence(storageBackend,{enabled:$('save').checked});if($('save').checked){try{economy=persistence.load()??economy;saveProgress();economyUI();}catch{error='Saved progress could not be read; this session is still available.';}}};
for(const [id,direction]of [['left',-1],['right',1]]){$(id).onpointerdown=e=>{if(isPaused()||scene?.phase!=='flight')return;e.preventDefault();$(id).setPointerCapture(e.pointerId);scene.control=direction;};$(id).onpointerup=$(id).onpointercancel=$(id).onlostpointercapture=()=>scene.control=0;}
economyUI();
function render(now){const frameBegan=performance.now(),samplePhase=scene?.phase,paused=isPaused(),dt=frameClock.advance(now,paused);clock+=dt;accumulator+=dt;
 if(sliderRunning&&!paused)$('power').value=windingMeter(now,sliderStart);
 try{if(scene){let steps=0;const engineBegan=performance.now();while(accumulator>=1/600){scene.step();accumulator-=1/600;steps++;}const engineMs=performance.now()-engineBegan;let predictionMs=0;
 const loading=scene.loadingStatus(),inContact=loading.contacting;
 const eligible=!paused&&scene.phase==='loading'&&!held&&!scene.control&&scene.isLoaded()&&inContact;
 if(!eligible){clearPreview();nextPreview=clock+.15;}
 else {
  if(preview&&!predictionPoseIsCurrent(scene,previewBasis)){preview=null;previewBasis=null;}
  if(previewJob&&previewSource!==scene)clearPreview();
  if(!previewJob&&clock>nextPreview){const cloneBegan=performance.now();previewJob=createPredictionJob(scene);previewSource=scene;previewCapture=capturePredictionPose(scene);predictionMs+=performance.now()-cloneBegan;}
  if(previewJob){const predictionBegan=performance.now();previewJob.advance({maxSteps:300,budgetMs:2.5});predictionMs+=performance.now()-predictionBegan;
   if(previewJob.done){lastPredictionMs=previewJob.stats.cpuMs;
    preview=predictionPoseIsCurrent(scene,previewCapture)?previewJob.result:null;previewBasis=preview?previewCapture:null;previewJob=null;nextPreview=clock+Math.max(.6,lastPredictionMs/1000*8);
   }
  }
 }
 $('launch').disabled=paused||scene.phase!=='loading'||held||!scene.isLoaded()||!inContact;$('time').disabled=paused||held||!['uncocked','loading','wind-stalled'].includes(scene.phase);$('power').disabled=$('time').disabled;$('time').textContent=scene.phase==='winding'?'Winding…':sliderRunning?'Release to wind':'Hold to aim; release to wind';
 const c=scene.center(),release=scene.release?.center;
 const hints=[];if(clock<resizeNoticeUntil)hints.push('View resized; grip released. Re-grip the volunteer to continue.');const travel=journey.update(scene.phase,c.y);if(travel.changed){zoneNotice=`Entering ${travel.biome.label}`;zoneNoticeUntil=clock+2.5;if(travel.firstVisit)sound.play('zone',{biome:travel.biome.id});}if(clock<zoneNoticeUntil)hints.push(zoneNotice+'.');
 if(scene.phase==='uncocked')hints.push('Hold the winding button (or Space/Enter), release near the middle, then lift beside the green cradle before moving across above it.');
 $('bank').disabled=!scene.release||banked;const potential=scene.release&&!banked?shotReward({distance:Math.max(0,c.x-release.x),impacts:scene.impactCount}):null;setText('bank',banked?'Rewards collected':potential?`Collect ${potential.bells} bells`:'Collect rewards');$('bank').title=potential?`${potential.points} points and ${potential.bells} bells earned`:'Collect earned points and bells';$('pause').disabled=banked;for(const id of ['left','right'])$(id).disabled=paused||scene.phase!=='flight';setText('pauseStatus',banked?'Run complete. Rewards collected; choose the next volunteer or retry.':document.hidden?'Paused while this tab is hidden.':focusPaused?'Paused while the game is unfocused.':manualPaused?'Paused. Resume when ready.':'');
 setText('reset',scene.release?'Collect & retry setup':'Reset setup');
 if(banked)hints.push('Rewards collected. Shop, choose the next volunteer or retry.');
 if(runObstacle==='launch branch')hints.push('The volunteer hit the launch branch. Collect & retry keeps this run’s rewards; adjust the load or hardware before another shot.');
 if(scene.phase==='launching'&&launchStarted!==null&&clock-launchStarted>5)hints.push('Payload is still supported. Reset and try different rail mounting, sling length or counterweight.');
 const coaching=loadingCoach.update(scene,{fraction,held});$('retry').hidden=!coaching.retry||paused;if(coaching.reason)hints.push(coaching.reason);
 if(scene.phase==='loading'){
  if(held&&scene.hand?.body.getUserData()?.id==='head'&&scene.rig.bodies.some(b=>b.id==='torso'))hints.push('Head grip: try the torso for steadier loading.');
  if(held&&scene.rig.totalMass>=2)hints.push('Heavy load: move slowly.');
  const advice=predictionAdvice(preview);if(advice)hints.push(advice);else if(previewJob)hints.push('Updating the short physical hint…');
 }
 if(held&&scene.forceCapped)hints.push('Grip force limit reached. Move more gently.');
 setText('guidance',hints.join(' '));
 for(const event of scene.events.splice(0)){if(event.type==='impact'){runObstacle??=event.surface??null;sound.play('impact',{intensity:Math.min(1,event.strength/5),material:event.material,mass:event.mass});if(!$('reduced').checked)effects.push({x:event.position.x,y:event.position.y,life:.4,material:event.material,strength:Math.min(1,event.strength/Math.max(.1,scene.rig.totalMass*10))});}else if(event.type==='launch')sound.play('launch');else if(event.type==='enemy')sound.play('enemy',{intensity:.3});}
 effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0).slice(-20);
 if(clock>=nextStatus||statusPhase!==scene.phase){const audio=sound.getStatus();setText('audioEngine',audio.muted?'Audio muted; no cues are being scheduled.':audio.contextState==='running'?`Audio active • recent cue: ${audio.lastCue??'none'}`:'Audio waiting for an interaction.');nextStatus=clock+.25;statusPhase=scene.phase;
 setText('readout',error||`${scene.rig.label} • ${({uncocked:'Ready to wind',winding:'Winding',loading:'Load the cradle',launching:'Arm moving',flight:'In flight','wind-stalled':'Winding stalled'})[scene.phase]??scene.phase} • ${release?Math.max(0,c.x-release.x).toFixed(0)+' m • '+scene.impactCount+' bounces • '+(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(1)+' m/s':'Counterweight '+(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)+' m above axle'}`);
 setText('mechanicsReadout',`${scene.rig.label} • ${scene.phase} • ${release?(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(2)+' m/s • ':''}hand work ${scene.handWork.toFixed(2)} J • arcade work ${scene.assistWork.toFixed(2)} J${scene.forceCapped?' ('+gripParameters(scene.rig.totalMass).maxForce.toFixed(0)+' N cap)':''} • motor net work ${scene.windingWork.toFixed(1)} J • counterweight lift ${(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)} m above pivot • frame x ${scene.frame.getPosition().x.toFixed(3)} m • queue seed ${seed}`);
 setText('queue',`Next 3: ${queue.peek().map(id=>profiles.find(p=>p.id===id).label).join(' → ')}`);
 }
 const drawBegan=performance.now();renderer.draw(scene,preview,effects,clock,$('reduced').checked,window.innerWidth);const drawMs=performance.now()-drawBegan;
 if(paused)runtimeMetrics.pause();else runtimeMetrics.record(performance.now()-frameBegan,{frameTime:now,phase:samplePhase,engineMs,predictionMs,drawMs,steps});if(clock>=nextRuntime){nextRuntime=clock+1;const stats=runtimeMetrics.snapshot();setText('runtimeReadout',`Simulation ${scene.elapsed.toFixed(2)} s • ${scene.world.getBodyCount()} bodies / ${scene.world.getJointCount()} joints • ${scene.enemies.size} encounters • ${sound.getStatus().voices} audio voices • frame CPU p95/max ${stats.p95.toFixed(2)}/${stats.max.toFixed(2)} ms • engine ${stats.engine.p95.toFixed(2)} / hint ${stats.prediction.p95.toFixed(2)} / draw ${stats.draw.p95.toFixed(2)} ms p95 • RAF interval p95/max ${stats.interval.p95.toFixed(2)}/${stats.interval.max.toFixed(2)} ms • max ${stats.maxSteps} steps/frame (last ${stats.samples} frames)${performance.memory?` • JS heap ${(performance.memory.usedJSHeapSize/1048576).toFixed(1)} MB (browser estimate)`:''}`);}
 }}catch(e){error=e.message;$('readout').textContent=error;}
 requestAnimationFrame(render);
}
reset();if(startupWarning)error=startupWarning;requestAnimationFrame(render);
