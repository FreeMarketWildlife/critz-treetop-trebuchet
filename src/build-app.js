import {drawAltitudeStrip} from './altitude-strip.js?v=31';
import {installPauseMenu} from './pause-menu.js';
import {createWeaponHud} from './weapon-hud.js?v=25';
import {jungleLayerAt} from './grove-jungle.js?v=25';
import {createLaunchFeel} from './launch-feel.js?v=31';
import {createPayloadLoading} from './payload-loading.js?v=31';
import {crankState} from './crank-wheel.js?v=30';
import{PARTS,SLOTS,CRITTERS,STARTER,TUNING,part,critter,grams,dimensions,validateBuild,buildFacts,scaledPreset}from'./build-catalog.js?v=30';
import {fitEquipment} from './build-equipment.js?v=30';
import {createCapacityControls} from './capacity-controls.js?v=30';
import {equipmentSpec,equipmentUse,tuningLimit,preparationSeconds} from './equipment-summary.js?v=31';
import{BuildSimulation,GRAVITY}from'./build-physics.js?v=31';
import{createBuildRenderer,drawCritter}from'./build-art.js?v=31';
import{newProgress,loadProgress,saveProgress,validateProgress,canBuild,buy,bank,rewards,markSpaceEscape,pendingSpaceResult}from'./build-progress.js?v=31';
import {visitShop,rerollShop,rerollPrice,priceFor,purchaseOffer,product,packPrice,openPack,choosePack} from './build-shop.js?v=30';
import {drawShopArt} from './shop-art.js?v=31';
import {createHoldControl} from './hold-control.js';
import {createAudio} from './audio.js?v=28';
import {loadAudioPreferences,saveAudioPreferences} from './audio-preferences.js';
import {createGroveMap,readGroveMap,validateGroveMap,levelAt,enemyRecipe} from './grove-map.js?v=25';
import {createCritterPerformance,critterPoseName} from './critter-performance.js?v=25';
import {createSandboxShop,sandboxTransaction} from './shop-sandbox.js?v=31';
const $=id=>document.getElementById(id),el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const params=new URLSearchParams(location.search),qa=params.has('qa'),editorSession=params.get('editor')==='1';
let groveMap=(qa?null:readGroveMap())??createGroveMap(),creativeShop=createSandboxShop(qa?73:undefined),seenContactSequence=0,combo=0,lastBumperAt=-Infinity,lastZone='grandfatherTree';
let state=newProgress(),saving=!qa,creative=false,draft,creativeBuild={...STARTER},adventureBuild,sim,paused=false,labels=false,follow=true,landingMarks=true,shotId='',banked=false,resultShown=false,spaceRecorded=false,spaceAchievementNew=false,lastTime=0,refreshAt=0,winding=false,sessionLog=[],toastTimer,dirty=true,lastDraw=0,drawCount=0,ratchetStep=-1,readyCue=false,seenRelease=false,seenContacts=0,scoreStep=0,holdStart=0;
const sound=createAudio({maxVoices:10}),soundQueue=[],hudPerformance=createCritterPerformance();let currentCel={pose:'ready',tier:0,hits:0,angle:0},soundedHits=0;
let audioPrefs={muted:false,volume:.35};try{audioPrefs=loadAudioPreferences(localStorage);}catch{}sound.setMuted(audioPrefs.muted);sound.setVolume(audioPrefs.volume);
function cue(name,options){sound.play(name,options);}
function chime(names){names.forEach((name,i)=>soundQueue.push({name,at:performance.now()+i*115}));}
function saveSound({persist=true}={}){if(persist&&!qa)try{saveAudioPreferences(localStorage,audioPrefs);}catch{}$('soundToggle').textContent=audioPrefs.muted?'♫̸':'♪';$('soundToggle').setAttribute('aria-pressed',String(audioPrefs.muted));$('soundToggle').setAttribute('aria-label',audioPrefs.muted?'Unmute sound':'Mute sound');}
try{if(!qa){saving=localStorage.getItem('treetop-custom-save-enabled')!=='false';if(saving)state=loadProgress(localStorage);}}catch(e){toast(`Save could not be loaded. A fresh session is open; your stored data was kept. ${e.message}`);saving=false;}
state=visitShop(state,qa?42+state.launches:undefined);
adventureBuild={...state.build};draft={...state.build};
const renderer=createBuildRenderer($('stage')),previewRenderer=createBuildRenderer($('previewStage')),launchFeel=createLaunchFeel();let feelFrame=launchFeel.state();
let previewSim,previewKey='',presetAnimal='mouse',presetChassis='anchored',capacityAdjusters=[];
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5200);}
function persist(){if(!saving||qa||editorSession)return true;try{saveProgress(localStorage,state);$('saveStatus').textContent='Adventure progress saved locally. Your original prototype save is kept separately.';return true;}catch(e){$('saveStatus').textContent=`Saving unavailable: ${e.message}. Export a backup to keep your work.`;toast(e.name==='StaleProgressError'?e.message:'Progress is in this session. Browser storage is unavailable; export a backup.');return false;}}
function equippedValue(id){return creative||state.owned.includes(id);}
function populate(){
 $('animal').replaceChildren(...CRITTERS.filter(a=>creative||state.animals.includes(a.id)).map(a=>choiceCard(a,'animal',a.id===draft.animal,()=>selectEquipment({kind:'animal',id:a.id}))));
 $('animalName').textContent=critter(draft.animal).name;
 $('buildParts').replaceChildren();capacityAdjusters=[];
 for(const[slot,title]of SLOTS){
  const box=el('details',undefined,'part-group'),summary=el('summary'),p=part(draft[slot]),art=el('canvas');box.id='part-'+slot;drawShopArt(art,p);art.setAttribute('aria-hidden','true');
  const text=el('span');text.append(el('small',title),el('strong',p.name));summary.append(art,text,el('span','⌄','part-chevron'));
  const choices=el('div',undefined,'part-options');for(const option of PARTS.filter(p=>p.slot===slot&&equippedValue(p.id)))choices.append(choiceCard(option,'part',option.id===p.id,()=>selectEquipment({kind:'part',id:option.id})));
  box.append(summary,el('p',p.description),el('p',equipmentSpec(p),'equipment-spec'));const use=equipmentUse(p,draft);if(use)box.append(el('p',use,'micro'));
  const controls=createCapacityControls({document,slot,getBuild:()=>draft,onPreview:previewCapacity,onApply:next=>applyCapacity(slot,next,p.name)});
  if(controls){capacityAdjusters.push(controls);box.append(controls.element);}box.append(choices);$('buildParts').append(box);
 }
 $('tuningFields').replaceChildren();for(const[key,title,unit,min,max,step,slot]of TUNING){const label=el('label',undefined,'tune-row');label.append(el('span',title));const input=el('input');input.type='number';input.id=`tune-${key}`;input.min=min;input.max=Math.min(max,tuningLimit(draft,key)??max);input.step=step;input.value=draft[key];input.setAttribute('aria-label',`${title}${unit?` (${unit})`:''}`);input.addEventListener('change',()=>{draft[key]=input.valueAsNumber;refreshFacts();});label.append(input,el('span',unit));$('tuningFields').append(label);}
 $('buildName').value=draft.name;$('wind').value=draft.wind;$('drag').checked=!!draft.drag;
 $('spaceAchievement').textContent=state.achievements.includes('spaceEscape')?'✦ Beyond the Moon — unlocked':'Beyond the Moon — reach free drift to unlock';
 $('ownedCount').textContent=creative?'ALL PARTS UNLOCKED':`${state.owned.length} parts owned`;$('wallet').textContent=creative?'∞':state.bells.toLocaleString();$('best').innerHTML=`${state.best.toFixed(1)} <em>m</em>`;
 $('creativePresets').hidden=!creative;$('creativeWeather').hidden=!creative;refreshFacts();renderShop();renderBlueprints();
}
function choiceCard(p,kind,selected,onSelect){
 const button=el('button',undefined,'equipment-choice'),art=el('canvas');drawShopArt(art,p,kind);art.setAttribute('aria-hidden','true');button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',`Fit ${p.name}`);button.append(art,el('span',p.name));if(kind==='part')button.append(el('small',equipmentSpec(p)));if(kind==='animal')button.append(el('small',`${grams(p.grams)} · ${dimensions(p)}`));button.onclick=onSelect;return button;
}
function previewCapacity(next){syncPreview(next);}
function applyCapacity(slot,next,name){
 canBuild(state,next,creative);draft=next;applyBuild({quiet:true});fitted(name,slot);
 $('fittedNotice').textContent=slot==='frame'?'✓ Frame adjustments applied':'✓ Counterweight fill applied';
}
function revealCapacity(slot){
 if(!['frame','ballast'].includes(slot)||!$('workshopDialog').open)return;
 $('buildTab').click();const group=$('part-'+slot);if(!group)return;
 group.open=true;group.scrollIntoView({block:'start',behavior:'auto'});
}
function fitted(name,slot='frame'){
 renderer.equipBurst(slot);previewRenderer.equipBurst(slot);stage.dataset.lastFitted=slot;
 $('fittedNotice').textContent=`✓ ${name} fitted`+(slot==='frame'?' · Adjust axle height or frame mass below.':slot==='ballast'?' · Set your basket fill below.':'');$('fittedNotice').classList.remove('pop');$('previewStage').classList.remove('equip-pop');void $('fittedNotice').offsetWidth;$('fittedNotice').classList.add('pop');$('previewStage').classList.add('equip-pop');dirty=true;revealCapacity(slot);
}
function selectEquipment(offer){try{draft=fitEquipment(draft,offer);applyBuild({quiet:true});cue('purchase');fitted(product(offer).name,offer.kind==='animal'?'animal':product(offer).slot);}catch(e){toast(e.message);}}
function syncPreview(build=draft){
 try{const c=validateBuild(build),key=JSON.stringify(c);if(key!==previewKey){previewSim=new BuildSimulation(c);previewSim.setDraw(1);previewKey=key;}
 const warnings=buildFacts(c).warnings;$('previewWarning').textContent=warnings[0]??'';$('previewWarning').hidden=!warnings.length;
 $('previewName').textContent=c.name;$('previewHeight').textContent=`↕ ${c.pivotHeight.toFixed(2)} m to axle`;$('previewWeight').textContent=`◆ ${grams(c.counterGrams)} ballast`;$('previewAnimal').textContent=`${critter(c.animal).name} · ${dimensions(critter(c.animal))}`;
 }catch{}dirty=true;
}
function refreshFacts(){
 dirty=true;for(const controls of capacityAdjusters)controls.sync(draft);
 const a=critter(draft.animal);$('animalMass').textContent=`${grams(a.grams)} · ${dimensions(a)} (L × W)`;const pc=$('portrait').getContext('2d');pc.clearRect(0,0,108,88);drawCritter(pc,a,52,48,73,0,false);
 for(const[key,,,min,max]of TUNING){const input=$('tune-'+key);if(input)input.max=Math.min(max,tuningLimit(draft,key)??max);}
 const f=buildFacts(draft);$('ratio').textContent=`${f.ratio.toFixed(2)} : 1`;$('beamMass').textContent=grams(f.beamGrams);$('capacity').textContent=grams(f.capacity);
 const prep=preparationSeconds(draft);$('prepTime').textContent=prep<60?'~'+prep.toFixed(1)+' s':'~'+(prep/60).toFixed(1)+' min';
 $('buildWarnings').replaceChildren();let err='';try{validateBuild(draft);canBuild(state,draft,creative);}catch(e){err=e.message;}
 for(const w of [...(err?[err]:[]),...f.warnings])$('buildWarnings').append(el('p',w,'warning'));
 $('apply').disabled=!!err;
 for(const key of ['wheelRadius','wheelGrams','brake'])$(`tune-${key}`).closest('label').hidden=draft.chassis!=='wheels';
 syncPreview();$('tune-walkingLean').closest('label').hidden=draft.chassis!=='walking';for(const key of ['hanger','hingeFriction'])$(`tune-${key}`).closest('label').hidden=draft.mount!=='hinged'||draft.chassis==='floating';
}
function pendingCollection(){return !creative&&!banked&&sim?.spaceState==='escaped'&&!!state.pendingSpace;}
function protectSpaceResult(){if(!pendingCollection())return false;toast('Collect your space rewards before starting another experiment.');return true;}
function applyBuild({quiet=false,restore=false}={}){if(!restore&&protectSpaceResult())return false;try{$('arcAdvice').textContent='';const b=validateBuild({...draft,name:$('buildName').value||draft.name});canBuild(state,b,creative);draft=b;hold?.cancel();sim=new BuildSimulation(b,{map:groveMap});weaponHud.reset();sim.setDraw(0);sim.loading=createPayloadLoading(sim);launchFeel.reset(sim);feelFrame=launchFeel.state();paused=false;winding=false;dirty=true;seenRelease=false;seenContacts=0;soundedHits=0;seenContactSequence=0;combo=0;lastBumperAt=-Infinity;scoreStep=0;ratchetStep=-1;readyCue=false;document.body.classList.remove('holding','in-flight');shotId=crypto.randomUUID();banked=false;resultShown=false;spaceRecorded=false;spaceAchievementNew=false;document.body.classList.remove('space-escaped');$('spaceRewardBadge').hidden=true;$('resultCard').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-pressed','false');if(creative)creativeBuild={...b};else{adventureBuild={...b};state={...state,build:{...b}};persist();}populate();drawHudCritter();updateReadouts();if(!document.querySelector('dialog[open]'))$('stage').focus({preventScroll:true});if(!quiet)toast('Parts fitted. Ready for a new experiment.');return true;}catch(e){toast(e.message);return false;}}
function updateModeUi(){document.body.classList.toggle('creative',creative);$('adventureMode').classList.toggle('active',!creative);$('creativeMode').classList.toggle('active',creative);$('adventureMode').setAttribute('aria-pressed',String(!creative));$('creativeMode').setAttribute('aria-pressed',String(creative));$('modeDescription').textContent=creative?'Every part. Every volunteer. Your experiment.':'Build it. Try it. Make it fly.';$('experimentTip').textContent=creative?'Build anything within the available parts’ dimensions. The same gravity, mass, friction and release model applies. Creative launches never change your Adventure Bells.':'Try the same build twice, then change just one part. A heavier counterweight is only useful if your beam and sling can handle it.';}
function switchMode(next){if(protectSpaceResult())return;if(editorSession&&!next)return;if(creative===next)return;if(!creative)adventureBuild={...state.build};creative=next;draft={...(creative?creativeBuild:adventureBuild)};updateModeUi();populate();applyBuild({quiet:true});toast(creative?'Creative mode: everything unlocked. Adventure progress is safe.':'Back to Adventure. Your earned equipment and Bells are here.');}
function drawHeightMap(){
 const canvas=$('altitudeStrip'),box=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 if(!(box.width>0&&box.height>0))return;
 const width=Math.round(box.width*dpr),height=Math.round(box.height*dpr);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const context=canvas.getContext('2d');context.setTransform(dpr,0,0,dpr,0,0);
 const world=sim.spaceEscape?.world,chartMap=world?{...groveMap,version:world.version,height:world.height,tree:{...groveMap.tree,height:world.treeHeight},launch:{...groveMap.launch,y:world.launchY}}:groveMap;
 const model=drawAltitudeStrip(context,{width:box.width,height:box.height,map:chartMap,altitude:sim.real(sim.shot).y+groveMap.launch.y,animal:sim.animal,spaceState:sim.spaceState??'bound',gravityFactor:sim.release?sim.gravityFactor:1,drawMarker:drawCritter});
 canvas.setAttribute('aria-label',model.label);canvas.dataset.altitude=String(model.altitude);canvas.dataset.position=String(model.fraction);canvas.dataset.spaceState=model.spaceState;
}
function drawHudCritter(){currentCel=hudPerformance.update(sim);const canvas=$('hudCritter'),c=canvas.getContext('2d');if(canvas.width!==200){canvas.width=200;canvas.height=140;}c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,100,70);drawCritter(c,sim.animal,50,36,76,0,!!sim.release,undefined,currentCel);canvas.dataset.pose=currentCel.pose;canvas.setAttribute('aria-label',`${sim.animal.name}: ${critterPoseName(currentCel)}`);}
const hold=createHoldControl({
 canStart:()=>!paused&&!document.hidden&&!document.querySelector('dialog[open]')&&sim?.phase==='ready'&&sim.loading.loaded&&!sim.loading.dragging,
 onStart(){winding=true;holdStart=performance.now();ratchetStep=-1;readyCue=false;document.body.classList.add('holding');dirty=true;cue('ratchet');},
 onRelease(){winding=false;document.body.classList.remove('holding');dirty=true;const elapsed=performance.now()-holdStart;if(elapsed<90){if(qa)stage.dataset.launchAttempt=JSON.stringify({elapsed,accepted:false,reason:'short-tap',draw:sim.drawFraction});sim.setDraw(0);return;}const loaded=sim.loading.loaded,draw=sim.drawFraction,accepted=sim.fire();if(qa)stage.dataset.launchAttempt=JSON.stringify({elapsed,loaded,draw,accepted,phase:sim.phase,supported:sim.loading.loaded});if(accepted){cue('unlatch');document.body.classList.add('in-flight');}else if(sim.phase==='ready')toast('The volunteer is still settling. Hold and release again once they’re supported.');updateReadouts();},
 onCancel(){winding=false;document.body.classList.remove('holding');sim?.setDraw(0);dirty=true;},
});
function beginHold(id){
 sound.unlock();
 if(paused||document.hidden||document.querySelector('dialog[open]'))return false;
 if(!sim.loading.loaded)return false;
 if(sim.phase==='ready'&&sim.facts.warnings.some(w=>w.includes('exceeds')||w.includes('too small')||w.includes('starts below'))){sim.fire();updateReadouts();dirty=true;return false;}
 return hold.begin(id);
}
function updateReadouts(){
 recordSpaceEscape();drawHudCritter();const s=sim.snapshot();const altitude=s.payload.y+groveMap.launch.y,zone=levelAt(altitude,groveMap);document.body.classList.toggle('preparing',sim.phase==='ready');document.body.classList.toggle('swinging',sim.phase==='swing');
 $('regionName').textContent=(jungleLayerAt(altitude,groveMap)?.name??zone.name).toUpperCase();$('regionGravity').textContent=`${Math.max(0,altitude).toFixed(1)} m altitude · ${`${(GRAVITY*(sim.release?sim.gravityFactor:1)).toFixed(2)} m/s²`}`;
 $('bumperCombo').hidden=combo===0;$('bumperCombo').textContent=`✦ ${combo} ${combo===1?'BOUNCE':'BOUNCES'}`;
 const audioState=sound.getStatus().contextState;if($('stage').dataset.audio!==audioState)$('stage').dataset.audio=audioState;
 $('distance').innerHTML=`${s.distance.toFixed(1)} <em>m</em>`;$('height').innerHTML=`${s.height.toFixed(1)} <em>m</em>`;$('velocity').innerHTML=`${s.release?s.release.speed.toFixed(1):'—'} <em>m/s</em>`;$('tension').innerHTML=`${Math.round(s.tension).toLocaleString()} <em>N</em>`;
 const names={ready:'A LITTLE WIND-UP…',swing:'COUNTERWEIGHT FALLING',flight:'SLING OPEN · IN FLIGHT',finished:'EXPERIMENT COMPLETE',invalid:'CHECK THIS BUILD',escaped:'BEYOND THE MOON · FREE DRIFT'};
 const full=(sim.drawFraction??0)>=.999;
 $('phaseBadge').textContent=paused?'TAKE A BREATHER':winding?(full?'RATCHET LOCKED · FULL DRAW':'RAISING THE COUNTERWEIGHT'):names[s.phase];
 $('holdHint').textContent=paused?'Paused':winding?(full?'Ready! Let go to fly.':'Keep holding…'):s.phase==='ready'?(sim.loading.loaded?'Hold anywhere to crank':sim.loading.falling?'Let them settle into the basket':'Drag your volunteer into the basket'):s.phase==='swing'?(feelFrame.swingAge<.5?'Counterweight dropping…':feelFrame.swingAge<1?'Sling picking up speed…':'Here we go…'):s.phase==='flight'?`${s.distance.toFixed(1)} metres & counting`:s.phase==='escaped'?'Zero gravity · collect whenever you’re ready':'Nice experiment.';
 $('launchStatus').textContent=s.phase==='escaped'?'Space reached. This run’s rewards are safely fixed at the boundary.':paused?'Tap Resume when you’re ready.':winding?(full?'The winch holds it here until you let go.':`${Math.round((sim.drawFraction??0)*100)}% draw · release whenever you like`):s.failure||s.release?(s.failure||`${s.release.speed.toFixed(1)} m/s off the sling · ${s.release.angle.toFixed(0)}° release`):s.phase==='swing'?'Let gravity do its thing.':sim.loading.loaded?'Clockwise to wind · release to fly.':'Pick up the head, body or tail. Enter loads with the keyboard.';
 if(sim.phase==='ready'&&!sim.loading.loaded)$('phaseBadge').textContent=sim.loading.dragging?'DROP INTO THE BASKET':'LOAD THE SLING';
 $('loadingTip').hidden=true;
 const pct=Math.round((sim.drawFraction??0)*100);$('launchButton').disabled=paused||sim.phase!=='ready'||(!winding&&!sim.loading.loaded);$('launchButtonText').textContent=winding?`Release to launch · ${pct}%`:sim.loading.loaded?'Hold to crank & launch':'Load basket first';$('chargeFill').style.transform=`scaleX(${pct/100})`;$('chargeMeter').setAttribute('aria-valuenow',String(pct));
 $('sceneHint').textContent=`${sim.animal.name} · ${grams(sim.animal.grams)}${sim.release?' · '+critterPoseName(currentCel):''}`;
 $('launchPrompt').hidden=resultShown||paused||sim.phase!=='ready'||(!sim.loading.loaded&&!winding);$('collectShop').hidden=false;$('collectShop').textContent=creative?'Try the shop →':'Collect & visit shop →';
 $('stage').dataset.phase=s.phase;$('stage').dataset.draw=String(pct);$('stage').dataset.winding=String(winding);$('stage').dataset.build=sim.c.name;$('stage').dataset.axleHeight=String(sim.c.pivotHeight);$('stage').dataset.animal=sim.animal.id;$('stage').dataset.altitude=altitude.toFixed(2);$('stage').dataset.zone=zone.id;$('stage').dataset.mapObjects=String(groveMap.objects.length);$('stage').dataset.creative=String(creative);$('stage').dataset.combo=String(combo);
 if(['finished','invalid','escaped'].includes(s.phase)&&!resultShown)showResult();
}
function recordSpaceEscape(){
 if(sim?.spaceState!=='escaped'||spaceRecorded)return;
 spaceRecorded=true;renderer.clearLandingCue();document.body.classList.add('space-escaped');
 spaceAchievementNew=!creative&&!state.achievements.includes('spaceEscape');
 if(!creative){state=markSpaceEscape(state,{id:shotId,build:sim.c,spaceEscape:sim.spaceEscape});persist();}
 $('spaceAchievement').textContent=state.achievements.includes('spaceEscape')?'✦ Beyond the Moon — unlocked':'Beyond the Moon — reach free drift to unlock';
}
function resultData(){return sim.spaceEscape?pendingSpaceResult({spaceEscape:sim.spaceEscape}):{distance:sim.maxX,height:sim.maxY,release:sim.release,grams:sim.animal.grams,animal:sim.animal.id,failure:sim.failure};}
function showResult(){
 resultShown=true;dirty=true;$('launchPrompt').hidden=true;
 const escaped=sim.spaceState==='escaped',data=resultData(),r=rewards(data);
 chime(escaped?['coin','purchase','score']:sim.failure?['unlatch']:['coin','purchase','score']);
 $('resultCard').hidden=false;$('spaceRewardBadge').hidden=!escaped||creative;
 $('resultEyebrow').textContent=escaped?(creative?'CREATIVE · SPACE REACHED':spaceAchievementNew?'ACHIEVEMENT UNLOCKED':'SPACE REACHED'):creative?'CREATIVE FIELD NOTES':'EXPERIMENT COMPLETE';
 $('resultTitle').textContent=escaped?'Beyond the Moon!':sim.failure?'A useful lesson.':sim.maxX>state.best?'A new horizon.':'Every throw teaches.';
 $('resultNumbers').textContent=escaped?(creative?`${data.distance.toFixed(1)} m`: `+${r.bells.toLocaleString()} Bells · +${r.points.toLocaleString()} points`):`${sim.maxX.toFixed(1)} m${creative?'':` · +${sim.phase==='invalid'?0:r.bells} Bells`}`;
 $('resultNote').textContent=escaped?`Free drift begins at ${sim.spaceEscape.altitude.toLocaleString()} m. ${creative?'Adventure progress stays untouched.':'Seven times this run’s normal Bells and points. Collect once, then try again.'}`:sim.failure||(sim.release?`Released at ${sim.release.angle.toFixed(1)}°. Change one variable and see what happens.`:'No release this time. Try changing the pin or lever ratio.');
 $('collect').textContent=escaped?(creative?'Retry experiment':'Collect & retry'):creative?'Keep experimenting':sim.phase==='invalid'?'Adjust build':'Collect Bells & continue';
}
function resumePendingSpace(){
 const packet=state.pendingSpace;if(!packet||qa||editorSession)return false;
 creative=false;updateModeUi();draft={...packet.build};adventureBuild={...packet.build};populate();if(!applyBuild({quiet:true,restore:true}))return false;
 sim.restoreSpaceEscape(packet.spaceEscape);shotId=packet.id;banked=false;spaceRecorded=true;spaceAchievementNew=false;seenRelease=true;
 launchFeel.reset(sim);feelFrame=launchFeel.state();renderer.clearLandingCue();document.body.classList.add('in-flight','space-escaped');
 updateReadouts();dirty=true;return true;
}
function collect(){if(!resultShown)return;if(!banked){const data=resultData(),before=state,oldLog=[...sessionLog];if(sim.phase!=='invalid'){sessionLog.unshift({...rewards(data),animal:sim.animal.id,build:sim.c.name,creative,releaseAngle:sim.release?.angle,releaseSpeed:sim.release?.speed});sessionLog=sessionLog.slice(0,20);state=bank(state,shotId,data,creative);if(!creative){state=visitShop(state,qa?42+state.launches:undefined);$('shopNew').hidden=false;chime(['coin','coin','purchase']);}if(!persist()&&!creative&&data.spaceEscape){state=before;sessionLog=oldLog;return;}}banked=true;if(creative)creativeShop=visitShop({...creativeShop,launches:creativeShop.launches+1});}applyBuild({quiet:true});}
function shopLedger(){return creative?creativeShop:state;}
function shopCard(offer,{packChoice=false}={}){
 const ledger=shopLedger(),p=product(offer),owned=(offer.kind==='animal'?ledger.animals:offer.kind==='voucher'?ledger.vouchers:ledger.owned).includes(p.id);
 const card=el('article',undefined,`shop-card${owned&&!creative?' sold':''}`);card.dataset.item=p.id;
 const tag=el('div',offer.kind==='animal'?'VOLUNTEER':offer.kind==='voucher'?'GROVE VOUCHER':SLOTS.find(s=>s[0]===p.slot)?.[1],'slot-tag');tag.append(el('span',offer.kind==='voucher'?'✦':p.price>1000?'✦ RARE':'✧'));
 const art=el('canvas');art.setAttribute('aria-hidden','true');drawShopArt(art,p,offer.kind);
 const cost=priceFor(ledger,offer),button=el('button',packChoice?'Choose this card':creative?(offer.kind==='voucher'&&owned?'Perk active':'Fit · Free'):owned?'Yours forever':`${cost.toLocaleString()} Bells`,`buy${owned&&!creative?' owned':''}`);
 button.disabled=(owned&&(!creative||packChoice||offer.kind==='voucher'))||(!creative&&!packChoice&&ledger.bells<cost);
 button.setAttribute('aria-label',packChoice?`Choose ${p.name}`:creative?`Try ${p.name} free`:owned?`${p.name} owned`:`Buy ${p.name} for ${cost} Bells`);
 button.onclick=()=>{try{
  if(creative){creativeShop=sandboxTransaction(creativeShop,packChoice?'choosePack':'purchase',offer);draft=fitEquipment(draft,offer);}
  else{const next=packChoice?choosePack(state,p.id):purchaseOffer(state,offer),build=fitEquipment(state.build,offer);canBuild(next,build);state={...next,build};draft={...build};adventureBuild={...build};}
  applyBuild({quiet:true});persist();cue('purchase');chime(['sparkle','score']);fitted(p.name,offer.kind==='animal'?'animal':p.slot);toast(`${p.name} ${offer.kind==='voucher'?'perk active!':'fitted to your trebuchet!'}`);
 }catch(e){toast(e.message);}};
 card.append(tag,art,el('h3',p.name),el('p',offer.kind==='animal'?`${grams(p.grams)} · ${dimensions(p)}. Fits immediately.`:p.description+(offer.kind==='part'?' '+equipmentSpec(p):'')),button);return card;
}
function renderShop(){
 const ledger=shopLedger(),shop=ledger.shop;if(!shop)return;
 $('shopWallet').textContent=creative?'∞':state.bells.toLocaleString();$('shopRound').textContent=creative?'CREATIVE DEAL':`VISIT ${shop.round+1}`;
 $('shopMessage').textContent=creative?'Try every card for free. Your Adventure Bells stay safe.':'Pick a card. Watch your trebuchet change.';
 const ctx=$('shopkeeper').getContext('2d');ctx.clearRect(0,0,160,110);drawCritter(ctx,critter('mouse'),78,60,104,0,false);
 $('shopItems').replaceChildren(...shop.offers.map(o=>shopCard(o)));
 if(!shop.offers.length)$('shopItems').append(el('p','The whole grove is in your collection. What will you build?','empty-shelf'));
 $('rerollShop').textContent=creative?'↻ Reroll · Free':`↻ Reroll · ${rerollPrice(state)} Bells`;
 $('rerollShop').disabled=!creative&&(state.bells<rerollPrice(state)||!shop.offers.some(o=>!(o.kind==='animal'?state.animals:state.owned).includes(o.id))&&state.owned.length===PARTS.length&&state.animals.length===CRITTERS.length);
 $('voucherSlot').replaceChildren();if(shop.voucher)$('voucherSlot').append(shopCard(shop.voucher));else $('voucherSlot').append(el('p','All grove perks collected. Thank you, friend!','empty-shelf'));
 const card=el('article',undefined,'shop-card pack-card'),art=el('canvas');art.setAttribute('aria-hidden','true');drawShopArt(art,{},'pack');
 const packButton=el('button',shop.packTaken?'Pack collected':shop.packOpened?'Choose your card below':creative?'Open · Free':`Open · ${packPrice(ledger)} Bells`,'buy');
 packButton.disabled=shop.packOpened||!shop.pack.length||shop.pack.every(p=>ledger.owned.includes(p.id))||(!creative&&ledger.bells<packPrice(ledger));
 packButton.onclick=()=>{try{if(creative)creativeShop=sandboxTransaction(creativeShop,'openPack');else state=openPack(state);persist();cue('pack');populate();$('packChoices').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}catch(e){toast(e.message);}};
 card.append(el('div','MYSTERY PARTS','slot-tag'),art,el('h3','Tinker’s parcel'),el('p',`Unwrap ${shop.pack.length} equipment cards. Keep your favourite. A new parcel after each throw.`),packButton);$('packSlot').replaceChildren(card);
 $('packChoices').hidden=!shop.packOpened||shop.packTaken;$('packCards').replaceChildren(...(shop.packOpened&&!shop.packTaken?shop.pack.map(o=>shopCard(o,{packChoice:true})):[]));
}
function renderBlueprints(){$('blueprintList').replaceChildren();if(!state.blueprints.length)$('blueprintList').append(el('p','Your saved experiments will appear here.','micro'));state.blueprints.forEach((b,i)=>{const row=el('div',undefined,'blueprint'),text=el('span',b.name);text.append(el('small',`${critter(b.animal).name} · ${part(b.chassis).name}`));const button=el('button','Load','secondary');button.addEventListener('click',()=>{try{canBuild(state,b,creative);draft={...b};populate();applyBuild();}catch(e){toast(e.message);}});const remove=el('button','×','text-button');remove.setAttribute('aria-label',`Delete ${b.name}`);remove.addEventListener('click',()=>{state={...state,blueprints:state.blueprints.filter((_,n)=>n!==i)};persist();renderBlueprints();});row.append(text,button,remove);$('blueprintList').append(row);});}
function exportJSON(value,name){const a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function showLog(){$('launchLog').replaceChildren();const records=sessionLog.length?sessionLog:state.history;if(!records.length)$('launchLog').append(el('p','Collect the result of a launch to record your first experiment.'));for(const r of records){const row=el('div',undefined,'log-row');row.append(el('span',`${critter(r.animal).name} · ${r.distance.toFixed(1)} m`),el('span',r.creative?'Creative':`+${r.bells} Bells`),el('small',`${r.build??'Adventure launch'}${r.releaseAngle!==undefined?` · ${r.releaseAngle.toFixed(1)}° · ${r.releaseSpeed.toFixed(1)} m/s`:''}${r.failure?` · ${r.failure}`:''}`));$('launchLog').append(row);}$('logDialog').showModal();}
function renderPresets(){
 $('presetAnimal').replaceChildren(...CRITTERS.map(a=>choiceCard(a,'animal',a.id===presetAnimal,()=>{presetAnimal=a.id;renderPresets();})));
 $('presetChassis').replaceChildren(...PARTS.filter(p=>p.slot==='chassis').map(p=>choiceCard(p,'part',p.id===presetChassis,()=>{presetChassis=p.id;renderPresets();})));
}
renderPresets();
$('restoreStarter').onclick=()=>{draft={...STARTER};$('buildName').value=draft.name;applyBuild({quiet:true});fitted(`${STARTER.pivotHeight.toFixed(1)} m Acorn Flyer`);};
$('tuneArc').onclick=async()=>{
 const fingerprint=JSON.stringify(draft),c={...draft};$('tuneArc').disabled=true;$('arcAdvice').textContent='Trying release-pin settings on this exact build…';let best;
 try{
  for(let angle=-110;angle<=35;angle+=3){
   const test=new BuildSimulation({...c,pinAngle:angle});test.fire();for(let t=0;t<Math.max(8,12*test.T)&&test.phase==='swing';t+=1/60)test.step(1/60);
   if(test.release&&!test.failure&&test.release.vx>1){const score=Math.abs(test.release.angle-40)+8/test.release.speed;if(!best||score<best.score)best={score,angle,release:test.release};}
   if(angle%9===-2||angle%9===7){await new Promise(requestAnimationFrame);if(JSON.stringify(draft)!==fingerprint)return;}
  }
  if(best){draft={...c,pinAngle:best.angle};applyBuild({quiet:true});fitted('Release pin','release');$('arcAdvice').textContent=`Full draw: ${best.release.angle.toFixed(1)}° arc · ${best.release.speed.toFixed(1)} m/s. Pin set to ${best.angle}°. Hold until the chime.`;}
  else $('arcAdvice').textContent='This build needs more than a pin adjustment. Check the counterweight, beam and pouch warnings.';
 }catch(e){$('arcAdvice').textContent=e.message;}finally{$('tuneArc').disabled=false;}
};
$('adventureMode').onclick=()=>switchMode(false);$('creativeMode').onclick=()=>switchMode(true);$('apply').onclick=()=>{applyBuild();if(!$('apply').disabled){$('workshopDialog').close();cue('shop');}};$('reset').onclick=()=>applyBuild({quiet:true});$('collect').onclick=collect;$('pause').onclick=()=>{cancelLoading();hold.cancel();paused=!paused;dirty=true;if(paused){soundQueue.length=0;sound.pause();}else sound.unlock();$('pause').textContent=paused?'Resume':'Pause';$('pause').setAttribute('aria-pressed',String(paused));updateReadouts();};$('labelsToggle').onclick=()=>{labels=!labels;dirty=true;document.body.classList.toggle('show-details',labels);$('labelsToggle').classList.toggle('active',labels);$('labelsToggle').setAttribute('aria-pressed',String(labels));};$('landingCueToggle').onclick=()=>{landingMarks=!landingMarks;$('landingCueToggle').setAttribute('aria-pressed',String(landingMarks));dirty=true;};$('followToggle').onclick=()=>{follow=!follow;dirty=true;$('followToggle').classList.toggle('active',follow);$('followToggle').setAttribute('aria-pressed',String(follow));};$('fitCamera').onclick=()=>{renderer.fit();dirty=true;follow=true;$('treeCamera').setAttribute('aria-pressed','false');$('followToggle').classList.add('active');$('followToggle').setAttribute('aria-pressed','true');};
for(const b of document.querySelectorAll('[data-tab]')){b.onkeydown=e=>{const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(b);if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];next.click();next.focus();}};b.onclick=()=>{$('workshopTitle').textContent=b.dataset.tab==='shop'?'The grove’s little shop':b.dataset.tab==='blueprints'?'Good ideas, kept safe':'Your workbench';for(const t of document.querySelectorAll('[data-tab]')){const active=t===b;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));$(`${t.dataset.tab}Panel`).hidden=!active;}dirty=true;};}
function openDialog(id){if(id==='workshopDialog'&&protectSpaceResult())return;cancelLoading();hold.cancel();$(id).showModal();dirty=true;cue('click');}
function openWorkshop(tab){if(protectSpaceResult())return;cancelLoading();hold.cancel();$(`${tab}Tab`).click();$('workshopDialog').showModal();syncPreview();previewRenderer.fit();dirty=true;cue('shop');if(tab==='shop')$('shopNew').hidden=true;}
$('openBuild').onclick=()=>openWorkshop('build');$('openShop').onclick=()=>openWorkshop('shop');$('openBlueprints').onclick=()=>openWorkshop('blueprints');
$('rerollShop').onclick=()=>{try{if(creative)creativeShop=sandboxTransaction(creativeShop,'reroll');else state=rerollShop(state);persist();populate();cue('reroll');}catch(e){toast(e.message);}};
$('collectShop').onclick=()=>{collect();openWorkshop('shop');};
$('helpOpen').onclick=()=>openDialog('helpDialog');$('settingsOpen').onclick=()=>openDialog('settingsDialog');$('compareOpen').onclick=()=>{hold.cancel();showLog();};
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>b.closest('dialog').close();
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('close',()=>{dirty=true;lastTime=0;if(!document.querySelector('dialog[open]'))$('stage').focus({preventScroll:true});});dialog.addEventListener('cancel',()=>hold.cancel());}
$('soundToggle').onclick=()=>{audioPrefs.muted=!audioPrefs.muted;sound.setMuted(audioPrefs.muted);sound.unlock().then(()=>cue('coin'));saveSound();};
$('volume').value=audioPrefs.volume;$('volume').oninput=()=>{audioPrefs.volume=Number($('volume').value);sound.setVolume(audioPrefs.volume);saveSound();};$('volume').onchange=()=>cue('coin');saveSound({persist:false});
$('quality').onchange=()=>{dirty=true;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('This browser uses its full available screen. Add to Home Screen for an immersive view.');}catch{toast('Fullscreen is unavailable here. The game still fills this browser view.');}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';dirty=true;});

$('saveBlueprint').onclick=()=>{try{const b=validateBuild({...draft,name:$('buildName').value.trim()||'Untitled experiment'});if(state.blueprints.length>=20)throw Error('20 blueprints saved. Remove one to make room.');state={...state,blueprints:[...state.blueprints,b]};persist();renderBlueprints();toast('Blueprint saved.');}catch(e){toast(e.message);}};
$('loadPreset').onclick=()=>{draft=scaledPreset(presetAnimal,presetChassis);populate();applyBuild();};$('exportBuild').onclick=()=>{try{exportJSON({type:'treetop-build',version:1,build:validateBuild(draft)},'treetop-blueprint.json');}catch(e){toast(e.message);}};
$('importBuild').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>50000)throw Error('Blueprint is too large.');const data=JSON.parse(await f.text());if(data.type!=='treetop-build'||data.version!==1)throw Error('Choose a Treetop blueprint.');const b=validateBuild(data.build);canBuild(state,b,creative);draft=b;populate();applyBuild();}catch(e){toast(e.message);}finally{e.target.value='';}};
$('saveEnabled').checked=saving&&!qa&&!editorSession;$('saveEnabled').disabled=qa||editorSession;$('saveEnabled').onchange=()=>{if(qa||editorSession){saving=false;$('saveEnabled').checked=false;return;}saving=$('saveEnabled').checked;try{localStorage.setItem('treetop-custom-save-enabled',String(saving));}catch{}if(saving)persist();else $('saveStatus').textContent='Saving is off. Existing saved progress remains untouched.';};$('exportSave').onclick=()=>exportJSON(state,'treetop-progress.json');$('importSave').onchange=async e=>{try{if(protectSpaceResult())return;const f=e.target.files[0];if(!f)return;if(f.size>150000)throw Error('Save is too large.');const next=validateProgress(JSON.parse(await f.text())),imported=visitShop(next);if(saving&&!qa&&!editorSession)saveProgress(localStorage,imported);state=imported;adventureBuild={...state.build};draft={...state.build};creative=false;updateModeUi();persist();populate();if(!resumePendingSpace())applyBuild({quiet:true,restore:true});toast('Adventure progress imported.');}catch(e){toast(`Import rejected: ${e.message}`);}finally{e.target.value='';}};
$('wind').onchange=()=>{if(creative)draft.wind=$('wind').valueAsNumber;};$('drag').onchange=()=>{if(creative)draft.drag=Number($('drag').checked);};
$('treeCamera').onclick=()=>{hold.cancel();cancelLoading();const on=renderer.overview();$('treeCamera').setAttribute('aria-pressed',String(on));dirty=true;};
for(const [id,factor]of[['gameZoomOut',.7],['gameZoomIn',1/.7]])$(id).onclick=()=>{renderer.zoomBy(factor);dirty=true;};
const stage=$('stage');
const weaponHud=createWeaponHud({stage,renderer,getSim:()=>sim,isBlocked:()=>paused||document.hidden||!!document.querySelector('dialog[open]'),onFire:e=>{if(e.hit)renderer.clearLandingCue();dirty=true;cue(e.hit?'bumper':'click');}});
stage.addEventListener('wheel',e=>{e.preventDefault();hold.cancel();cancelLoading();renderer.zoomBy(Math.exp(-e.deltaY*.0015));dirty=true;},{passive:false});
let loadPointer=null;
function pointerPoint(e){const b=stage.getBoundingClientRect();return renderer.unproject(e.clientX-b.left,e.clientY-b.top);}
function cancelLoading(){if(loadPointer!==null){sim?.loading.cancel();loadPointer=null;dirty=true;}}
stage.addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary)return;e.preventDefault();
 if(sim.phase==='flight'){const r=stage.getBoundingClientRect();weaponHud.fire([e.clientX-r.left,e.clientY-r.top]);return;}
 if(!paused&&sim.phase==='ready'&&!document.querySelector('dialog[open]')){
  const point=pointerPoint(e);sim.loading.activity();
  if(sim.loading.begin(point,Math.min(sim.animal.length*.15,8/renderer.camera.scale))){
   hold.cancel();loadPointer=e.pointerId;stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});dirty=true;updateReadouts();return;
  }
 }
 if(beginHold(e.pointerId)){stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});}
});
stage.addEventListener('pointermove',e=>{if(e.pointerId===loadPointer){sim.loading.move(pointerPoint(e));dirty=true;}});
stage.addEventListener('pointerup',e=>{
 if(e.pointerId===loadPointer){sim.loading.move(pointerPoint(e));const seated=sim.loading.drop();loadPointer=null;dirty=true;cue(seated?'ready':'click');updateReadouts();}
 else hold.end(e.pointerId);
 if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
});
stage.addEventListener('pointercancel',e=>{if(e.pointerId===loadPointer)cancelLoading();hold.cancel(e.pointerId);});
stage.addEventListener('lostpointercapture',e=>{if(e.pointerId===loadPointer)cancelLoading();hold.cancel(e.pointerId);});
const launchButton=$('launchButton');
launchButton.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();if(beginHold(e.pointerId))launchButton.setPointerCapture(e.pointerId);});
launchButton.addEventListener('pointerup',e=>{hold.end(e.pointerId);if(launchButton.hasPointerCapture(e.pointerId))launchButton.releasePointerCapture(e.pointerId);});
for(const type of ['pointercancel','lostpointercapture'])launchButton.addEventListener(type,e=>hold.cancel(e.pointerId));
launchButton.addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)beginHold('launcher-key:'+e.code);}});
launchButton.addEventListener('keyup',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();hold.end('launcher-key:'+e.code);}});
// Focus changes cancel only this control's keyboard owners. Pointer capture and
// the stage's Space gesture keep their independent ownership.
launchButton.addEventListener('blur',()=>{for(const code of ['Space','Enter'])hold.cancel('launcher-key:'+code);});
stage.addEventListener('blur',()=>hold.cancel('space'));
launchButton.addEventListener('click',e=>e.preventDefault());
stage.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerdown',()=>{sound.unlock();},{capture:true});
document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#soundToggle'))cue('click');});
document.addEventListener('keydown',e=>{
 if(!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){if(['Digit1','Digit2','Digit3'].includes(e.code)){weaponHud.select(['slingshot','staff','air'][Number(e.code.slice(-1))-1]);e.preventDefault();}if(e.code==='KeyF'){weaponHud.fire();e.preventDefault();}}
 if(e.code==='Enter'&&document.activeElement===stage&&!paused&&sim.phase==='ready'&&!sim.loading.loaded&&!sim.loading.dragging&&!document.querySelector('dialog[open]')){e.preventDefault();sim.loading.loadKeyboard();dirty=true;cue('ready');updateReadouts();}

 if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();if(!e.repeat)beginHold('space');}
 if(e.code==='Escape'&&!document.querySelector('dialog[open]')){if(loadPointer!==null){cancelLoading();updateReadouts();}else if(hold.active){hold.cancel();updateReadouts();}else $('pause').click();}
});
document.addEventListener('keyup',e=>{if(['Space','Enter'].includes(e.code)){const launcher=hold.end('launcher-key:'+e.code),stageKey=e.code==='Space'&&hold.end('space');if(launcher||stageKey)e.preventDefault();}});
function interrupt(){cancelLoading();hold.cancel();soundQueue.length=0;sound.pause();if(['swing','flight','escaped'].includes(sim?.phase)){paused=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-pressed','true');}lastTime=0;dirty=true;}
window.addEventListener('blur',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();lastTime=0;});
new ResizeObserver(()=>{dirty=true;renderer.fit(false);}).observe(stage);
new ResizeObserver(()=>{dirty=true;previewRenderer.fit();}).observe($('previewStage'));
function frame(timestamp){
 const physicsBefore=sim.time;
 const delta=lastTime?Math.min((timestamp-lastTime)/1000,.05):0;lastTime=timestamp;
 const modal=!!document.querySelector('dialog[open]'),active=!paused&&!document.hidden&&!modal;
 sim.winding=winding;
 if(active){
  if(winding){sim.wind(delta);const tick=Math.floor((sim.drawFraction??0)*24);if(tick!==ratchetStep){cue('ratchet',{intensity:.6+tick/60});ratchetStep=tick;}if(sim.drawFraction>=1&&!readyCue){cue('ready');readyCue=true;}}
  const wasLoaded=sim.loading.loaded;if(sim.loading.step(delta))dirty=true;if(!wasLoaded&&sim.loading.loaded){cue('ready');updateReadouts();}
  if(!winding){feelFrame=launchFeel.advance(sim,delta,{speed:Number($('speed').value)});for(const event of feelFrame.events)cue(event.type==='release'?'releasePop':event.type,{intensity:event.intensity});}
  if(sim.release&&!seenRelease){seenRelease=true;cue('launch');document.body.classList.remove('launch-kick');void stage.offsetWidth;document.body.classList.add('launch-kick');}
  recordSpaceEscape();
  const contacts=(sim.contactEvents??[]).filter(e=>e.seq>seenContactSequence);
  for(const hit of contacts){seenContactSequence=hit.seq;if(hit.material==='foliage'||hit.material==='sap'){cue(hit.material==='foliage'?'rustle':'sap',{intensity:hit.material==='foliage'?.22:.65});dirty=true;continue;}const bumper=!!enemyRecipe(hit.kind)||hit.material==='bumper';combo=sim.time-lastBumperAt<5?combo+1:1;lastBumperAt=sim.time;cue(bumper?'bumper':'impact',{material:hit.material??'wood',mass:Math.max(.15,Math.log10(sim.animal.grams)),intensity:Math.min(1,.35+(hit.strength??1)*.6),variant:(combo-1)%4});if(bumper)chime(['coin']);dirty=true;}
  currentCel=hudPerformance.update(sim);if(currentCel.hits>soundedHits){soundedHits=currentCel.hits;cue('bonk',{intensity:.65,variant:(soundedHits-1)%4});}
  const zone=levelAt(sim.real(sim.shot).y+groveMap.launch.y,groveMap);if(zone.id!==lastZone){lastZone=zone.id;cue('zone',{biome:zone.id});}
  if((sim.contacts??0)>seenContacts){seenContacts=sim.contacts;if(!contacts.length)cue('impact',{material:'wood',intensity:.4});}
  const milestone=Math.floor(sim.maxX/Math.max(10,sim.c.longArm*10));if(milestone>scoreStep){scoreStep=milestone;cue('coin',{intensity:.45});}
 }
 if(!document.hidden){for(let i=soundQueue.length-1;i>=0;i--)if(timestamp>=soundQueue[i].at){cue(soundQueue[i].name);soundQueue.splice(i,1);}}
 $('loadingTip').hidden=!active||sim.phase!=='ready'||!sim.loading.hint;
 const running=active&&(sim.loading.animating||winding||['swing','flight','escaped'].includes(sim.phase));
 const animating=(active&&feelFrame.animating)||renderer.needsAnimation()||previewRenderer.needsAnimation();
 const refresh=dirty||running||(!resultShown&&['finished','invalid','escaped'].includes(sim.phase));
 const low=$('quality').value==='low',interval=low?1000/30:1000/60;
 if((dirty||running||animating)&&timestamp-lastDraw>=interval-.5&&!document.hidden){
  if($('workshopDialog').open&&previewSim)previewRenderer.draw(previewSim,{labels:true,follow:false,paused:true,preview:true,pixelRatio:low?1:2});
  drawHeightMap();renderer.draw(sim,{labels,follow,landingMarks,paused:paused||modal,feel:feelFrame,pixelRatio:low?1:$('quality').value==='high'?2:Math.min(2,Math.sqrt(1800000/(stage.clientWidth*stage.clientHeight)))});dirty=false;lastDraw=timestamp;drawCount++;stage.dataset.renderedFrames=String(drawCount);stage.dataset.playbackRate=feelFrame.rate.toFixed(3);stage.dataset.swingPlayback=feelFrame.swingAge.toFixed(3);stage.dataset.releasePlayback=feelFrame.releaseClock?.toFixed(3)??'';stage.dataset.presentationTime=feelFrame.clock.toFixed(3);
 }
 weaponHud.draw(active?delta:0,active?Math.max(0,sim.time-physicsBefore):0);
 if(refresh&&timestamp-refreshAt>110){updateReadouts();refreshAt=timestamp;}
 requestAnimationFrame(frame);
}
// A playtest accepts only its embedding editor, never arbitrary cross-origin messages.
window.addEventListener('message',event=>{
 if(!editorSession||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='grove-playtest-map')return;
 try{groveMap=validateGroveMap(event.data.map);applyBuild({quiet:true});window.parent.postMessage({type:'grove-playtest-loaded',objects:groveMap.objects.length},location.origin);}catch(error){toast(`Map rejected: ${error.message}`);}
});
const pauseMenu=installPauseMenu({open(){cancelLoading();hold.cancel();paused=true;dirty=true;soundQueue.length=0;sound.pause();updateReadouts();},resume(){paused=false;lastTime=0;dirty=true;sound.unlock();updateReadouts();}});
populate();applyBuild({quiet:true});
if(!resumePendingSpace()&&params.get('creative')==='1')switchMode(true);
if(editorSession){saving=false;$('saveEnabled').checked=false;$('saveEnabled').disabled=true;$('adventureMode').disabled=true;$('saveStatus').textContent='Editor playtest: Adventure progress is untouched.';window.parent.postMessage({type:'grove-playtest-ready'},location.origin);}
persist();requestAnimationFrame(frame);
window.treetop=Object.freeze({snapshot:()=>structuredClone({...sim.snapshot(),creative,weapons:weaponHud.snapshot(),bells:state.bells,build:sim.c,winding,draw:sim.drawFraction,drawCount,audio:sound.getStatus(),performance:{...currentCel},crank:crankState(sim),loading:{loaded:sim.loading.loaded,dragging:sim.loading.dragging,returning:sim.loading.returning,home:renderer.project(sim.loading.home()),animal:renderer.project(sim.real(sim.shot)),target:renderer.project(sim.loading.target())}}),getProgress:()=>structuredClone(state)});
