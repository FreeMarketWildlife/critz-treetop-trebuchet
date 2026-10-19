import {CritterScene,gripParameters} from './articulated.js';
import {PhysicalHookScene} from './hook-experiment.js';
import {createGripController} from './input.js';
import {createPredictionJob,capturePredictionPose,predictionPoseIsCurrent} from './prediction.js';
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
const sound=createAudio();sound.setVolume(.35);let economy=createEconomyState(),shotId=null,banked=false,shotCount=0,effects=[],launchStarted=null;
let storageBackend=null;try{storageBackend=window.localStorage;}catch{}
let persistence=createEconomyPersistence(storageBackend);
function saveProgress(){try{return persistence.save(economy);}catch{error='Saving is unavailable; progress remains in this session.';return false;}}
const setText=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
const equipmentNotes={'counterweight-heavy':'140 kg counterweight; changes energy and balance.','beam-long':'3.6 / 0.9 m beam; changes leverage and mass.','beam-light':'Lighter beam material; changes inertia.','sling-long':'Longer sling; changes timing and clearance.','frame-heavy':'50 kg frame; changes recoil and can reduce range.','frame-grip':'Grippier feet; changes sliding behavior.'};
const seed=Date.now()>>>0,queue=createVolunteerQueue(seed);let fraction=.6,scene,preview=null,previewJob=null,previewSource=null,previewCapture=null,previewBasis=null,lastPredictionMs=0,nextStatus=0,statusPhase='',error='',last=performance.now(),accumulator=0,nextPreview=0,clock=0,sliderRunning=true,sliderStart=performance.now(),held=false;
const settings=()=>derivePhysicalConfig(economy,{counterMass:Number($('mass').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:300,armDamping:Number($('friction').value),flightDrag:Number($('drag').value),initialArm:-3,mechanicalWinding:true,releaseHardware:'channel',stoppedSplitPouch:$('split').checked,...($('split').checked&&$('hook').checked?{pouchPanelMass:Number($('panelMass').value)}:{}),sling:Number($('sling').value),hookAngle:Number($('railAngle').value),channelLength:Number($('railLength').value)});
$('species').innerHTML=profiles.map(p=>`<option value="${p.id}">${p.label}</option>`).join('');$('species').value=queue.current;
function clearPreview(){previewJob?.cancel();previewJob=null;previewSource=null;previewCapture=null;previewBasis=null;preview=null;}
function reset(){try{grip.reset();sliderRunning=true;sliderStart=performance.now();shotId=null;banked=false;launchStarted=null;scene=new (SceneType())(settings(),$('species').value);clearPreview();nextPreview=clock+.15;error='';accumulator=0;}catch(e){error=e.message;}}
$('hook').onchange=reset;$('split').onchange=reset;
for(const id of ['species','mass','long','short','friction','drag','sling','railAngle','railLength','panelMass'])$(id).onchange=reset;
$('reset').onclick=reset;
$('next').onclick=()=>{bank();queue.consume();$('species').value=queue.current;reset();};
$('time').onclick=()=>{if(sliderRunning){fraction=.2+.75*Number($('power').value);sliderRunning=false;try{scene.startWinding(fraction);clearPreview();}catch(e){error=e.message;}}else{sliderRunning=true;sliderStart=performance.now();}};
$('launch').onclick=()=>{sound.unlock();try{if(!scene.loadingStatus().contacting)throw new Error('Let the volunteer contact the cradle before unlatching');const saved=scene.snapshot();scene=new (SceneType())(scene.p,scene.rig.id,saved);scene.unlatch();launchStarted=clock;scene.enableEncounters(seed+shotCount);shotId=`${seed}:${shotCount++}`;banked=false;clearPreview();error='';sound.play('launch');}catch(e){error=e.message;}};
const grip=createGripController({toPoint:e=>renderer.point(e),tapHold:()=>$('sticky').checked,
 onStart:p=>{sound.unlock();const grabbed=scene?.grab(p)??false;held=grabbed;if(grabbed)clearPreview();return grabbed;},onMove:p=>scene?.move(p),onEnd:()=>{held=false;scene?.drop();},
 capture:id=>canvas.setPointerCapture(id),releaseCapture:id=>{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}});
canvas.onpointerdown=grip.pointerDown;canvas.onpointermove=grip.pointerMove;canvas.onpointerup=grip.pointerUp;canvas.onpointercancel=grip.pointerCancel;canvas.onlostpointercapture=grip.lostPointerCapture;
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();scene.control=e.key==='ArrowRight'?1:-1;}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')scene.control=0;});window.addEventListener('blur',()=>{grip.blur();if(scene)scene.control=0;});
function economyUI(){
 $('wallet').textContent=`Points ${economy.points} • Bells ${economy.bells} • prototype balance`;
 $('shop').innerHTML=catalog.map(item=>{const owned=economy.owned.includes(item.id),equipped=Object.values(economy.equipped).includes(item.id);return `<button data-item="${item.id}">${item.label} — ${equipped?'equipped: remove':owned?'equip':item.price+' bells'}<small>${equipmentNotes[item.id]}</small></button>`;}).join(' ');
 for(const button of $('shop').querySelectorAll('button'))button.onclick=()=>{sound.unlock();try{const id=button.dataset.item,item=catalog.find(item=>item.id===id);if(economy.equipped[item.slot]===id)economy=economyReducer(economy,{type:'unequip',slot:item.slot});else{if(!economy.owned.includes(id))economy=economyReducer(economy,{type:'purchase',id});economy=economyReducer(economy,{type:'equip',id});}saveProgress();economyUI();sound.play('shop');}catch(e){error=e.message;}};
}
function bank(){if(!shotId||banked||!scene?.release)return;const c=scene.center();economy=economyReducer(economy,{type:'record-shot',shotId,distance:Math.max(0,c.x-scene.release.center.x),impacts:scene.impactCount});banked=true;saveProgress();economyUI();sound.play('coin');}
$('bank').onclick=()=>{sound.unlock();bank();};
$('mute').onchange=()=>sound.setMuted($('mute').checked);
$('volume').oninput=()=>sound.setVolume(Number($('volume').value));
$('save').onchange=()=>{persistence=createEconomyPersistence(storageBackend,{enabled:$('save').checked});if($('save').checked){try{economy=persistence.load()??economy;saveProgress();economyUI();}catch{error='Saved progress could not be read; this session is still available.';}}};
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
 const hints=[];
 if(scene.phase==='launching'&&launchStarted!==null&&clock-launchStarted>5)hints.push('Payload is still supported. Reset and try different rail mounting, sling length or counterweight.');
 if(scene.phase==='loading'){
  if(previewJob&&!preview)hints.push('Calculating a short physical snapshot hint…');
  if(scene.hardwareHasEscaped?.())hints.push('The release bead slipped out while loading. Reset the setup or test this loose pouch.');
  if(preview&&!preview.release)hints.push('No separation in the five-second preview. Try different loading or mechanical settings.');
  if(preview?.release?.center.vx<0)hints.push('Preview heads backward. Adjust hardware or launch to test this setup.');
  if(held)hints.push('Release your grip before launching.');
  else if(!loading.withinEnvelope)hints.push('Lift the volunteer over the cradle and let gravity seat it.');
  else if(!loading.contacting)hints.push('Volunteer is near the cradle but not in contact. Let it land before launching.');
  else if(loading.relativeSpeed>.35)hints.push('Volunteer is contacting the cradle and still moving. Wait to settle or test this moving load.');
  else if(loading.maxPartRelativeSpeed>.35||loading.maxRelativeSpin>1)hints.push('The body is still rolling or redistributing inside the cradle. Wait or test this pose.');
  else if(loading.cradleSpeed>.35||Math.abs(loading.cradleSpin)>.5)hints.push('The cradle is still swinging. Waiting changes the shot; watch the updating preview.');
 }
 if(held&&scene.forceCapped)hints.push('Grip force limit reached. Move more gently.');
 setText('guidance',hints.join(' '));
 for(const event of scene.events.splice(0)){if(event.type==='impact'){sound.play('impact',{intensity:Math.min(1,event.strength/5),material:event.material,mass:event.mass});if(!$('reduced').checked)effects.push({x:event.position.x,y:event.position.y,life:.4});}else if(event.type==='enemy')sound.play('enemy',{intensity:.3});}
 effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0).slice(-20);
 if(clock>=nextStatus||statusPhase!==scene.phase){nextStatus=clock+.25;statusPhase=scene.phase;
 setText('readout',error||`${scene.rig.label} • ${scene.phase} • ${release?Math.max(0,c.x-release.x).toFixed(0)+' m • '+scene.impactCount+' bounces • '+(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(1)+' m/s':'Counterweight '+(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)+' m above axle'}`);
 setText('mechanicsReadout',`${scene.rig.label} • ${scene.phase} • ${release?(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(2)+' m/s • ':''}hand work ${scene.handWork.toFixed(2)} J • arcade work ${scene.assistWork.toFixed(2)} J${scene.forceCapped?' ('+gripParameters(scene.rig.totalMass).maxForce.toFixed(0)+' N cap)':''} • motor net work ${scene.windingWork.toFixed(1)} J • counterweight lift ${(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)} m above pivot • frame x ${scene.frame.getPosition().x.toFixed(3)} m`);
 setText('queue',`Next 3: ${queue.peek().map(id=>profiles.find(p=>p.id===id).label).join(' → ')} • queue seed ${seed}`);
 }
 renderer.draw(scene,preview,effects,clock,$('reduced').checked,window.innerWidth);
 }}catch(e){error=e.message;$('readout').textContent=error;}
 requestAnimationFrame(render);
}
reset();requestAnimationFrame(render);
