import {CritterScene,gripParameters} from './articulated.js';
import {PhysicalHookScene} from './hook-experiment.js';
import {createGripController} from './input.js';
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
let persistence=createEconomyPersistence(localStorage);
const seed=Date.now()>>>0,queue=createVolunteerQueue(seed);let fraction=.6,scene,preview=null,error='',last=performance.now(),accumulator=0,nextPreview=0,clock=0,sliderRunning=true,sliderStart=performance.now(),held=false;
const settings=()=>derivePhysicalConfig(economy,{counterMass:Number($('mass').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:300,armDamping:Number($('friction').value),flightDrag:Number($('drag').value),initialArm:-3,mechanicalWinding:true,releaseHardware:'channel',stoppedSplitPouch:$('split').checked,...($('split').checked&&$('hook').checked?{pouchPanelMass:Number($('panelMass').value)}:{}),sling:Number($('sling').value),hookAngle:Number($('railAngle').value),channelLength:Number($('railLength').value)});
$('species').innerHTML=profiles.map(p=>`<option value="${p.id}">${p.label}</option>`).join('');$('species').value=queue.current;
function reset(){try{grip.reset();sliderRunning=true;sliderStart=performance.now();shotId=null;banked=false;launchStarted=null;scene=new (SceneType())(settings(),$('species').value);preview=null;error='';accumulator=0;}catch(e){error=e.message;}}
$('hook').onchange=reset;$('split').onchange=reset;
for(const id of ['species','mass','long','short','friction','drag','sling','railAngle','railLength','panelMass'])$(id).onchange=reset;
$('reset').onclick=reset;
$('next').onclick=()=>{bank();queue.consume();$('species').value=queue.current;reset();};
$('time').onclick=()=>{if(sliderRunning){fraction=.2+.75*Number($('power').value);sliderRunning=false;try{scene.startWinding(fraction);preview=null;}catch(e){error=e.message;}}else{sliderRunning=true;sliderStart=performance.now();}};
$('launch').onclick=()=>{sound.unlock();try{if(!scene.loadingStatus().contacting)throw new Error('Let the volunteer contact the cradle before unlatching');const saved=scene.snapshot();scene=new (SceneType())(scene.p,scene.rig.id,saved);scene.unlatch();launchStarted=clock;scene.enableEncounters(seed+shotCount);shotId=`${seed}:${shotCount++}`;banked=false;preview=null;error='';sound.play('launch');}catch(e){error=e.message;}};
const grip=createGripController({toPoint:e=>renderer.point(e),tapHold:()=>$('sticky').checked,
 onStart:p=>{sound.unlock();const grabbed=scene?.grab(p)??false;held=grabbed;if(grabbed)preview=null;return grabbed;},onMove:p=>scene?.move(p),onEnd:()=>{held=false;scene?.drop();},
 capture:id=>canvas.setPointerCapture(id),releaseCapture:id=>{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}});
canvas.onpointerdown=grip.pointerDown;canvas.onpointermove=grip.pointerMove;canvas.onpointerup=grip.pointerUp;canvas.onpointercancel=grip.pointerCancel;canvas.onlostpointercapture=grip.lostPointerCapture;
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();scene.control=e.key==='ArrowRight'?1:-1;}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')scene.control=0;});window.addEventListener('blur',()=>{grip.blur();if(scene)scene.control=0;});
function economyUI(){
 $('wallet').textContent=`Points ${economy.points} • Bells ${economy.bells} • prototype balance`;
 $('shop').innerHTML=catalog.map(item=>{const owned=economy.owned.includes(item.id),equipped=Object.values(economy.equipped).includes(item.id);return `<button data-item="${item.id}" ${equipped?'disabled':''}>${item.label} — ${equipped?'equipped':owned?'equip':item.price+' bells'}</button>`;}).join(' ');
 for(const button of $('shop').querySelectorAll('button'))button.onclick=()=>{sound.unlock();try{const id=button.dataset.item;if(!economy.owned.includes(id))economy=economyReducer(economy,{type:'purchase',id});economy=economyReducer(economy,{type:'equip',id});persistence.save(economy);economyUI();sound.play('shop');}catch(e){error=e.message;}};
}
function bank(){if(!shotId||banked||!scene?.release)return;const c=scene.center();economy=economyReducer(economy,{type:'record-shot',shotId,distance:Math.max(0,c.x-scene.release.center.x),impacts:scene.impactCount});banked=true;persistence.save(economy);economyUI();sound.play('coin');}
$('bank').onclick=()=>{sound.unlock();bank();};
$('mute').onchange=()=>sound.setMuted($('mute').checked);
$('volume').oninput=()=>sound.setVolume(Number($('volume').value));
$('save').onchange=()=>{persistence=createEconomyPersistence(localStorage,{enabled:$('save').checked});if($('save').checked){try{economy=persistence.load()??economy;persistence.save(economy);economyUI();}catch(e){error=e.message;}}};
for(const [id,direction]of [['left',-1],['right',1]]){$(id).onpointerdown=e=>{e.preventDefault();$(id).setPointerCapture(e.pointerId);scene.control=direction;};$(id).onpointerup=$(id).onpointercancel=$(id).onlostpointercapture=()=>scene.control=0;}
economyUI();
function render(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;accumulator+=dt;
 if(sliderRunning)$('power').value=(Math.sin((now-sliderStart)/650)+1)/2;
 try{if(scene){while(accumulator>=1/600){scene.step();accumulator-=1/600;}
 const inContact=scene.loadingStatus().contacting;
 if(scene.phase!=='loading'||held||!scene.isLoaded()||!inContact)preview=null;
 if(scene.phase==='loading' && !held && scene.isLoaded() && inContact && clock>nextPreview){preview=scene.predict();nextPreview=clock+.6;}
 $('launch').disabled=scene.phase!=='loading'||held||!scene.isLoaded()||!scene.loadingStatus().contacting;$('time').disabled=!['uncocked','loading','wind-stalled'].includes(scene.phase);$('time').textContent=scene.phase==='winding'?'Winding…':sliderRunning?'Set winding height':'Restart height meter';
 const c=scene.center(),release=scene.release?.center,loading=scene.loadingStatus();
 const hints=[];
 if(scene.phase==='launching'&&launchStarted!==null&&clock-launchStarted>5)hints.push('Payload is still supported. Reset and try different rail mounting, sling length or counterweight.');
 if(scene.phase==='loading'){
  if(preview&&!preview.release)hints.push('No separation in the five-second preview. Try different loading or mechanical settings.');
  if(preview?.release?.center.vx<0)hints.push('Preview heads backward. Adjust hardware or launch to test this setup.');
  if(held)hints.push('Release your grip before launching.');
  else if(!loading.withinEnvelope)hints.push('Lift the volunteer over the cradle and let gravity seat it.');
  else if(!loading.contacting)hints.push('Volunteer is near the cradle but not in contact. Let it land before launching.');
  else if(loading.relativeSpeed>.35)hints.push('Volunteer is contacting the cradle and still moving. Wait to settle or test this moving load.');
  else if(loading.maxPartRelativeSpeed>.35||loading.maxRelativeSpin>1)hints.push('The body is still rolling or redistributing inside the cradle. Wait or test this pose.');
  else if(loading.cradleSpeed>.35||Math.abs(loading.cradleSpin)>.5)hints.push('The cradle is still swinging. Waiting changes the shot; watch the updating preview.');
 }
 $('guidance').textContent=hints.join(' ');
 for(const event of scene.events.splice(0)){if(event.type==='impact'){sound.play('impact',{intensity:Math.min(1,event.strength/5)});if(!$('reduced').checked)effects.push({x:event.position.x,y:event.position.y,life:.4});}else if(event.type==='enemy')sound.play('enemy',{intensity:.3});}
 effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0).slice(-20);
 $('readout').textContent=error||`${scene.rig.label} • ${scene.phase} • ${release?(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(2)+' m/s • ':''}hand work ${scene.handWork.toFixed(2)} J • arcade work ${scene.assistWork.toFixed(2)} J${scene.forceCapped?' ('+gripParameters(scene.rig.totalMass).maxForce.toFixed(0)+' N cap)':''} • motor net work ${scene.windingWork.toFixed(1)} J • counterweight lift ${(-scene.p.shortArm*Math.sin(scene.arm.getAngle())).toFixed(2)} m above pivot • frame x ${scene.frame.getPosition().x.toFixed(3)} m`;
 $('queue').textContent=`Next 3: ${queue.peek().map(id=>profiles.find(p=>p.id===id).label).join(' → ')} • queue seed ${seed}`;
 renderer.draw(scene,preview,effects,clock,$('reduced').checked,window.innerWidth);
 }}catch(e){error=e.message;$('readout').textContent=error;}
 requestAnimationFrame(render);
}
reset();requestAnimationFrame(render);
