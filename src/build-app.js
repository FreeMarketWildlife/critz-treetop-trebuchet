import{PARTS,SLOTS,CRITTERS,STARTER,TUNING,part,critter,grams,validateBuild,buildFacts,scaledPreset}from'./build-catalog.js';
import{BuildSimulation}from'./build-physics.js';
import{createBuildRenderer,drawCritter}from'./build-art.js';
import{newProgress,loadProgress,saveProgress,validateProgress,canBuild,buy,bank,rewards}from'./build-progress.js';
import {visitShop,rerollShop,rerollPrice,priceFor,purchaseOffer,product,packPrice,openPack,choosePack} from './build-shop.js';
import {drawShopArt} from './shop-art.js';
import {createHoldControl} from './hold-control.js';
import {createAudio} from './audio.js';
import {loadAudioPreferences,saveAudioPreferences} from './audio-preferences.js';
const $=id=>document.getElementById(id),el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const qa=new URLSearchParams(location.search).has('qa');
let state=newProgress(),saving=!qa,creative=false,draft,creativeBuild={...STARTER},adventureBuild,sim,paused=false,labels=false,follow=true,shotId='',banked=false,resultShown=false,lastTime=0,refreshAt=0,winding=false,sessionLog=[],toastTimer,dirty=true,lastDraw=0,drawCount=0,ratchetStep=-1,readyCue=false,seenRelease=false,seenContacts=0,scoreStep=0,holdStart=0;
const sound=createAudio({maxVoices:10}),soundQueue=[];
let audioPrefs={muted:false,volume:.35};try{audioPrefs=loadAudioPreferences(localStorage);}catch{}sound.setMuted(audioPrefs.muted);sound.setVolume(audioPrefs.volume);
function cue(name,options){sound.play(name,options);}
function chime(names){names.forEach((name,i)=>soundQueue.push({name,at:performance.now()+i*115}));}
function saveSound(){if(!qa)try{saveAudioPreferences(localStorage,audioPrefs);}catch{}$('soundToggle').textContent=audioPrefs.muted?'♫̸':'♪';$('soundToggle').setAttribute('aria-pressed',String(audioPrefs.muted));$('soundToggle').setAttribute('aria-label',audioPrefs.muted?'Unmute sound':'Mute sound');}
try{if(!qa){saving=localStorage.getItem('treetop-custom-save-enabled')!=='false';if(saving)state=loadProgress(localStorage);}}catch(e){toast(`Save could not be loaded. A fresh session is open; your stored data was kept. ${e.message}`);saving=false;}
state=visitShop(state,qa?42+state.launches:undefined);
adventureBuild={...state.build};draft={...state.build};
const renderer=createBuildRenderer($('stage'));
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5200);}
function persist(){if(!saving||qa)return;try{saveProgress(localStorage,state);$('saveStatus').textContent='Adventure progress saved locally. Your original prototype save is kept separately.';}catch(e){$('saveStatus').textContent=`Saving unavailable: ${e.message}. Export a backup to keep your work.`;toast('Progress is in this session. Browser storage is unavailable; export a backup.');}}
function equippedValue(id){return creative||state.owned.includes(id);}
function populate(){
 $('animal').replaceChildren();for(const a of CRITTERS.filter(a=>creative||state.animals.includes(a.id))){const o=el('option',a.name);o.value=a.id;$('animal').append(o);}$('animal').value=draft.animal;
 $('buildParts').replaceChildren();for(const[slot,title]of SLOTS){const box=el('div',undefined,'part-group'),label=el('label',title);label.htmlFor=`part-${slot}`;label.append(el('span',slot==='chassis'?'MECHANISM':'PART'));const select=el('select');select.id=`part-${slot}`;for(const p of PARTS.filter(p=>p.slot===slot&&equippedValue(p.id))){const o=el('option',p.name);o.value=p.id;select.append(o);}select.value=draft[slot];const desc=el('p',part(draft[slot]).description);select.addEventListener('change',()=>{draft[slot]=select.value;desc.textContent=part(select.value).description;refreshFacts();});box.append(label,select,desc);$('buildParts').append(box);}
 $('tuningFields').replaceChildren();for(const[key,title,unit,min,max,step,slot]of TUNING){const label=el('label',undefined,'tune-row');label.append(el('span',title));const input=el('input');input.type='number';input.id=`tune-${key}`;input.min=min;input.max=max;input.step=step;input.value=draft[key];input.setAttribute('aria-label',`${title}${unit?` (${unit})`:''}`);input.addEventListener('change',()=>{draft[key]=input.valueAsNumber;refreshFacts();});label.append(input,el('span',unit));$('tuningFields').append(label);}
 $('buildName').value=draft.name;$('wind').value=draft.wind;$('drag').checked=!!draft.drag;
 $('ownedCount').textContent=creative?'ALL PARTS UNLOCKED':`${state.owned.length} parts owned`;$('wallet').textContent=creative?'∞':state.bells.toLocaleString();$('best').innerHTML=`${state.best.toFixed(1)} <em>m</em>`;
 $('creativePresets').hidden=!creative;$('creativeWeather').hidden=!creative;refreshFacts();renderShop();renderBlueprints();
}
function refreshFacts(){
 dirty=true;
 const a=critter(draft.animal);$('animalMass').textContent=grams(a.grams);const pc=$('portrait').getContext('2d');pc.clearRect(0,0,108,88);drawCritter(pc,a,52,48,73,0,false);
 const f=buildFacts(draft);$('ratio').textContent=`${f.ratio.toFixed(2)} : 1`;$('beamMass').textContent=grams(f.beamGrams);$('capacity').textContent=grams(f.capacity);
 const work=draft.counterGrams/1000*9.80665*draft.shortArm*(1+Math.sin(draft.cockAngle*Math.PI/180));const prep=Math.max(1.65,work/part(draft.winch).power);$('prepTime').textContent=prep<60?`${prep.toFixed(1)} s`:`${(prep/60).toFixed(1)} min`;
 $('buildWarnings').replaceChildren();let err='';try{validateBuild(draft);canBuild(state,draft,creative);}catch(e){err=e.message;}
 for(const w of [...(err?[err]:[]),...f.warnings])$('buildWarnings').append(el('p',w,'warning'));
 $('apply').disabled=!!err;
 for(const key of ['wheelRadius','wheelGrams','brake'])$(`tune-${key}`).closest('label').hidden=draft.chassis!=='wheels';
 $('tune-walkingLean').closest('label').hidden=draft.chassis!=='walking';for(const key of ['hanger','hingeFriction'])$(`tune-${key}`).closest('label').hidden=draft.mount!=='hinged'||draft.chassis==='floating';
}
function applyBuild({quiet=false}={}){try{const b=validateBuild({...draft,name:$('buildName').value||draft.name});canBuild(state,b,creative);draft=b;hold?.cancel();sim=new BuildSimulation(b);sim.setDraw(0);paused=false;winding=false;dirty=true;seenRelease=false;seenContacts=0;scoreStep=0;ratchetStep=-1;readyCue=false;document.body.classList.remove('holding','in-flight');shotId=crypto.randomUUID();banked=false;resultShown=false;$('resultCard').hidden=true;$('pause').textContent='Pause';$('pause').setAttribute('aria-pressed','false');if(creative)creativeBuild={...b};else{adventureBuild={...b};state={...state,build:{...b}};persist();}populate();drawHudCritter();updateReadouts();if(!document.querySelector('dialog[open]'))$('stage').focus({preventScroll:true});if(!quiet)toast('Parts fitted. Ready for a new experiment.');}catch(e){toast(e.message);}}
function switchMode(next){if(creative===next)return;if(!creative)adventureBuild={...state.build};creative=next;draft={...(creative?creativeBuild:adventureBuild)};document.body.classList.toggle('creative',creative);$('adventureMode').classList.toggle('active',!creative);$('creativeMode').classList.toggle('active',creative);$('adventureMode').setAttribute('aria-pressed',String(!creative));$('creativeMode').setAttribute('aria-pressed',String(creative));$('modeDescription').textContent=creative?'Every part. Every volunteer. Your experiment.':'Build it. Try it. Make it fly.';$('experimentTip').textContent=creative?'Build anything within the available parts’ dimensions. The same gravity, mass, friction and release model applies. Creative launches never change your Adventure Bells.':'Try the same build twice, then change just one part. A heavier counterweight is only useful if your beam and sling can handle it.';populate();applyBuild({quiet:true});toast(creative?'Creative mode: everything unlocked. Adventure progress is safe.':'Back to Adventure. Your earned equipment and Bells are here.');}
function drawHudCritter(){const c=$('hudCritter').getContext('2d');c.clearRect(0,0,100,70);drawCritter(c,sim.animal,50,36,70,0,false);}
const hold=createHoldControl({
 canStart:()=>!paused&&!document.hidden&&!document.querySelector('dialog[open]')&&sim?.phase==='ready',
 onStart(){winding=true;holdStart=performance.now();ratchetStep=-1;readyCue=false;document.body.classList.add('holding');dirty=true;cue('ratchet');},
 onRelease(){winding=false;document.body.classList.remove('holding');dirty=true;if(performance.now()-holdStart<90){sim.setDraw(0);return;}if(sim.fire()){cue('unlatch');document.body.classList.add('in-flight');}updateReadouts();},
 onCancel(){winding=false;document.body.classList.remove('holding');sim?.setDraw(0);dirty=true;},
});
function beginHold(id){
 sound.unlock();
 if(sim.phase==='ready'&&sim.facts.warnings.some(w=>w.includes('exceeds')||w.includes('too small')||w.includes('starts below'))){sim.fire();updateReadouts();dirty=true;return false;}
 return hold.begin(id);
}
function updateReadouts(){
 const s=sim.snapshot();const audioState=sound.getStatus().contextState;if($('stage').dataset.audio!==audioState)$('stage').dataset.audio=audioState;
 $('distance').innerHTML=`${s.distance.toFixed(1)} <em>m</em>`;$('height').innerHTML=`${s.height.toFixed(1)} <em>m</em>`;$('velocity').innerHTML=`${s.release?s.release.speed.toFixed(1):'—'} <em>m/s</em>`;$('tension').innerHTML=`${Math.round(s.tension).toLocaleString()} <em>N</em>`;
 const names={ready:'A LITTLE WIND-UP…',swing:'COUNTERWEIGHT FALLING',flight:'SLING OPEN · IN FLIGHT',finished:'EXPERIMENT COMPLETE',invalid:'CHECK THIS BUILD'};
 const full=(sim.drawFraction??0)>=.999;
 $('phaseBadge').textContent=paused?'TAKE A BREATHER':winding?(full?'RATCHET LOCKED · FULL DRAW':'RAISING THE COUNTERWEIGHT'):names[s.phase];
 $('holdHint').textContent=paused?'Paused':winding?(full?'Ready! Let go to fly.':'Keep holding…'):s.phase==='ready'?'Hold anywhere to wind':s.phase==='swing'?'Here we go…':s.phase==='flight'?`${s.distance.toFixed(1)} metres & counting`:'Nice experiment.';
 $('launchStatus').textContent=paused?'Tap Resume when you’re ready.':winding?(full?'The winch holds it here until you let go.':`${Math.round((sim.drawFraction??0)*100)}% draw · release whenever you like`):s.failure||s.release?(s.failure||`${s.release.speed.toFixed(1)} m/s off the sling · ${s.release.angle.toFixed(0)}° release`):s.phase==='swing'?'Let gravity do its thing.':'Let go to send it flying.';
 const pct=Math.round((sim.drawFraction??0)*100);$('chargeFill').style.transform=`scaleX(${pct/100})`;$('chargeMeter').setAttribute('aria-valuenow',String(pct));
 $('sceneHint').textContent=`${sim.animal.name} · ${grams(sim.animal.grams)}`;
 $('launchPrompt').hidden=resultShown;$('collectShop').hidden=creative;
 $('stage').dataset.phase=s.phase;$('stage').dataset.draw=String(pct);$('stage').dataset.winding=String(winding);
 if(['finished','invalid'].includes(s.phase)&&!resultShown)showResult();
}
function resultData(){return{distance:sim.maxX,height:sim.maxY,release:sim.release,grams:sim.animal.grams,animal:sim.animal.id,failure:sim.failure};}
function showResult(){resultShown=true;dirty=true;$('launchPrompt').hidden=true;chime(sim.failure?['unlatch']:['coin','purchase','score']);const r=rewards(resultData());$('resultCard').hidden=false;$('resultEyebrow').textContent=creative?'CREATIVE FIELD NOTES':'EXPERIMENT COMPLETE';$('resultTitle').textContent=sim.failure?'A useful lesson.':sim.maxX>state.best?'A new horizon.':'Every throw teaches.';$('resultNumbers').textContent=`${sim.maxX.toFixed(1)} m${creative?'':` · +${sim.phase==='invalid'?0:r.bells} Bells`}`;$('resultNote').textContent=sim.failure||(sim.release?`Released at ${sim.release.angle.toFixed(1)}°. Change one variable and see what happens.`:'No release this time. Try changing the pin or lever ratio.');$('collect').textContent=creative?'Keep experimenting':sim.phase==='invalid'?'Adjust build':'Collect Bells & continue';}
function collect(){if(!resultShown)return;if(!banked){const data=resultData();if(sim.phase!=='invalid'){sessionLog.unshift({...rewards(data),animal:sim.animal.id,build:sim.c.name,creative,releaseAngle:sim.release?.angle,releaseSpeed:sim.release?.speed});sessionLog=sessionLog.slice(0,20);state=bank(state,shotId,data,creative);if(!creative){state=visitShop(state,qa?42+state.launches:undefined);$('shopNew').hidden=false;chime(['coin','coin','purchase']);}persist();}banked=true;}applyBuild({quiet:true});}
function shopCard(offer,{packChoice=false}={}){
 const p=product(offer),owned=(offer.kind==='animal'?state.animals:offer.kind==='voucher'?state.vouchers:state.owned).includes(p.id);
 const card=el('article',undefined,`shop-card${owned?' sold':''}`);card.dataset.item=p.id;
 const tag=el('div',offer.kind==='animal'?'VOLUNTEER':offer.kind==='voucher'?'GROVE VOUCHER':SLOTS.find(s=>s[0]===p.slot)?.[1],'slot-tag');tag.append(el('span',offer.kind==='voucher'?'✦':p.price>1000?'✦ RARE':'✧'));
 const art=el('canvas');art.setAttribute('aria-hidden','true');drawShopArt(art,p,offer.kind);
 const cost=priceFor(state,offer),button=el('button',packChoice?'Choose this card':creative?'Unlocked':owned?'Yours forever':`${cost.toLocaleString()} Bells`,`buy${owned||creative?' owned':''}`);
 button.disabled=creative||owned||(!packChoice&&state.bells<cost);button.setAttribute('aria-label',packChoice?`Choose ${p.name}`:creative?`${p.name} unlocked`:owned?`${p.name} owned`:`Buy ${p.name} for ${cost} Bells`);
 button.onclick=()=>{try{state=packChoice?choosePack(state,p.id):purchaseOffer(state,offer);persist();cue('purchase');populate();toast(`${p.name} is yours! ${offer.kind==='voucher'?'Perk active.':'Equip it at your workbench.'}`);}catch(e){toast(e.message);}};
 card.append(tag,art,el('h3',p.name),el('p',offer.kind==='animal'?`${grams(p.grams)} of curiosity. Invite once, fly forever.`:p.description),button);return card;
}
function renderShop(){
 const shop=state.shop;if(!shop)return;
 $('shopWallet').textContent=creative?'∞':state.bells.toLocaleString();$('shopRound').textContent=`VISIT ${shop.round+1}`;
 $('shopMessage').textContent=creative?'Every part is already yours. Build something wild.':'Buy a possibility. See where it takes you.';
 const ctx=$('shopkeeper').getContext('2d');ctx.clearRect(0,0,160,110);drawCritter(ctx,critter('mouse'),78,60,104,0,false);
 $('shopItems').replaceChildren(...shop.offers.map(o=>shopCard(o)));
 if(!shop.offers.length)$('shopItems').append(el('p','The whole grove is in your collection. What will you build?','empty-shelf'));
 $('rerollShop').textContent=`↻ Reroll · ${rerollPrice(state)} Bells`;$('rerollShop').disabled=creative||state.bells<rerollPrice(state)||!shop.offers.some(o=>!(o.kind==='animal'?state.animals:state.owned).includes(o.id))&&state.owned.length===PARTS.length&&state.animals.length===CRITTERS.length;
 $('voucherSlot').replaceChildren();if(shop.voucher)$('voucherSlot').append(shopCard(shop.voucher));else $('voucherSlot').append(el('p','All grove perks collected. Thank you, friend!','empty-shelf'));
 const card=el('article',undefined,'shop-card pack-card'),art=el('canvas');art.setAttribute('aria-hidden','true');drawShopArt(art,{},'pack');
 const packButton=el('button',shop.packTaken?'Pack collected':shop.packOpened?'Choose your card below':`Open · ${packPrice(state)} Bells`,'buy');packButton.disabled=creative||shop.packOpened||!shop.pack.length||shop.pack.every(p=>state.owned.includes(p.id))||state.bells<packPrice(state);
 packButton.onclick=()=>{try{state=openPack(state);persist();cue('pack');populate();$('packChoices').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}catch(e){toast(e.message);}};
 card.append(el('div','MYSTERY PARTS','slot-tag'),art,el('h3','Tinker’s parcel'),el('p',`Unwrap ${shop.pack.length} equipment cards. Keep your favourite. A new parcel after each throw.`),packButton);$('packSlot').replaceChildren(card);
 $('packChoices').hidden=!shop.packOpened||shop.packTaken;$('packCards').replaceChildren(...(shop.packOpened&&!shop.packTaken?shop.pack.map(o=>shopCard(o,{packChoice:true})):[]));
}
function renderBlueprints(){$('blueprintList').replaceChildren();if(!state.blueprints.length)$('blueprintList').append(el('p','Your saved experiments will appear here.','micro'));state.blueprints.forEach((b,i)=>{const row=el('div',undefined,'blueprint'),text=el('span',b.name);text.append(el('small',`${critter(b.animal).name} · ${part(b.chassis).name}`));const button=el('button','Load','secondary');button.addEventListener('click',()=>{try{canBuild(state,b,creative);draft={...b};populate();applyBuild();}catch(e){toast(e.message);}});const remove=el('button','×','text-button');remove.setAttribute('aria-label',`Delete ${b.name}`);remove.addEventListener('click',()=>{state={...state,blueprints:state.blueprints.filter((_,n)=>n!==i)};persist();renderBlueprints();});row.append(text,button,remove);$('blueprintList').append(row);});}
function exportJSON(value,name){const a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function showLog(){$('launchLog').replaceChildren();const records=sessionLog.length?sessionLog:state.history;if(!records.length)$('launchLog').append(el('p','Collect the result of a launch to record your first experiment.'));for(const r of records){const row=el('div',undefined,'log-row');row.append(el('span',`${critter(r.animal).name} · ${r.distance.toFixed(1)} m`),el('span',r.creative?'Creative':`+${r.bells} Bells`),el('small',`${r.build??'Adventure launch'}${r.releaseAngle!==undefined?` · ${r.releaseAngle.toFixed(1)}° · ${r.releaseSpeed.toFixed(1)} m/s`:''}${r.failure?` · ${r.failure}`:''}`));$('launchLog').append(row);}$('logDialog').showModal();}
for(const a of CRITTERS){const o=el('option',`${a.name} · ${grams(a.grams)}`);o.value=a.id;$('presetAnimal').append(o);}for(const p of PARTS.filter(p=>p.slot==='chassis')){const o=el('option',p.name);o.value=p.id;$('presetChassis').append(o);}
$('adventureMode').onclick=()=>switchMode(false);$('creativeMode').onclick=()=>switchMode(true);$('animal').onchange=()=>{draft.animal=$('animal').value;refreshFacts();};$('apply').onclick=()=>{applyBuild();if(!$('apply').disabled){$('workshopDialog').close();cue('shop');}};$('reset').onclick=()=>applyBuild({quiet:true});$('collect').onclick=collect;$('pause').onclick=()=>{hold.cancel();paused=!paused;dirty=true;if(paused){soundQueue.length=0;sound.pause();}else sound.unlock();$('pause').textContent=paused?'Resume':'Pause';$('pause').setAttribute('aria-pressed',String(paused));updateReadouts();};$('labelsToggle').onclick=()=>{labels=!labels;dirty=true;document.body.classList.toggle('show-details',labels);$('labelsToggle').classList.toggle('active',labels);$('labelsToggle').setAttribute('aria-pressed',String(labels));};$('followToggle').onclick=()=>{follow=!follow;dirty=true;$('followToggle').classList.toggle('active',follow);$('followToggle').setAttribute('aria-pressed',String(follow));};$('fitCamera').onclick=()=>{renderer.fit();dirty=true;follow=false;$('followToggle').classList.remove('active');$('followToggle').setAttribute('aria-pressed','false');};
for(const b of document.querySelectorAll('[data-tab]')){b.onkeydown=e=>{const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(b);if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];next.click();next.focus();}};b.onclick=()=>{$('workshopTitle').textContent=b.dataset.tab==='shop'?'The grove’s little shop':b.dataset.tab==='blueprints'?'Good ideas, kept safe':'Your workbench';for(const t of document.querySelectorAll('[data-tab]')){const active=t===b;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));$(`${t.dataset.tab}Panel`).hidden=!active;}};}
function openDialog(id){hold.cancel();$(id).showModal();dirty=true;cue('click');}
function openWorkshop(tab){hold.cancel();$(`${tab}Tab`).click();$('workshopDialog').showModal();dirty=true;cue('shop');if(tab==='shop')$('shopNew').hidden=true;}
$('openBuild').onclick=()=>openWorkshop('build');$('openShop').onclick=()=>openWorkshop('shop');$('openBlueprints').onclick=()=>openWorkshop('blueprints');
$('rerollShop').onclick=()=>{try{state=rerollShop(state);persist();populate();cue('reroll');}catch(e){toast(e.message);}};
$('collectShop').onclick=()=>{collect();openWorkshop('shop');};
$('helpOpen').onclick=()=>openDialog('helpDialog');$('settingsOpen').onclick=()=>openDialog('settingsDialog');$('compareOpen').onclick=()=>{hold.cancel();showLog();};
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>b.closest('dialog').close();
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('close',()=>{dirty=true;lastTime=0;if(!document.querySelector('dialog[open]'))$('stage').focus({preventScroll:true});});dialog.addEventListener('cancel',()=>hold.cancel());}
$('soundToggle').onclick=()=>{audioPrefs.muted=!audioPrefs.muted;sound.setMuted(audioPrefs.muted);sound.unlock().then(()=>cue('coin'));saveSound();};
$('volume').value=audioPrefs.volume;$('volume').oninput=()=>{audioPrefs.volume=Number($('volume').value);sound.setVolume(audioPrefs.volume);saveSound();};$('volume').onchange=()=>cue('coin');saveSound();
$('quality').onchange=()=>{dirty=true;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('This browser uses its full available screen. Add to Home Screen for an immersive view.');}catch{toast('Fullscreen is unavailable here. The game still fills this browser view.');}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';dirty=true;});

$('saveBlueprint').onclick=()=>{try{const b=validateBuild({...draft,name:$('buildName').value.trim()||'Untitled experiment'});if(state.blueprints.length>=20)throw Error('20 blueprints saved. Remove one to make room.');state={...state,blueprints:[...state.blueprints,b]};persist();renderBlueprints();toast('Blueprint saved.');}catch(e){toast(e.message);}};
$('loadPreset').onclick=()=>{draft=scaledPreset($('presetAnimal').value,$('presetChassis').value);populate();applyBuild();};$('exportBuild').onclick=()=>{try{exportJSON({type:'treetop-build',version:1,build:validateBuild(draft)},'treetop-blueprint.json');}catch(e){toast(e.message);}};
$('importBuild').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>50000)throw Error('Blueprint is too large.');const data=JSON.parse(await f.text());if(data.type!=='treetop-build'||data.version!==1)throw Error('Choose a Treetop blueprint.');const b=validateBuild(data.build);canBuild(state,b,creative);draft=b;populate();applyBuild();}catch(e){toast(e.message);}finally{e.target.value='';}};
$('saveEnabled').checked=saving;$('saveEnabled').onchange=()=>{saving=$('saveEnabled').checked;try{localStorage.setItem('treetop-custom-save-enabled',String(saving));}catch{}if(saving)persist();else $('saveStatus').textContent='Saving is off. Existing saved progress remains untouched.';};$('exportSave').onclick=()=>exportJSON(state,'treetop-progress.json');$('importSave').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>150000)throw Error('Save is too large.');const next=validateProgress(JSON.parse(await f.text()));state=visitShop(next);adventureBuild={...state.build};if(!creative)draft={...state.build};persist();populate();applyBuild({quiet:true});toast('Adventure progress imported.');}catch(e){toast(`Import rejected: ${e.message}`);}finally{e.target.value='';}};
$('wind').onchange=()=>{if(creative)draft.wind=$('wind').valueAsNumber;};$('drag').onchange=()=>{if(creative)draft.drag=Number($('drag').checked);};
const stage=$('stage');
stage.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();if(beginHold(e.pointerId)){stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});}});
stage.addEventListener('pointerup',e=>{hold.end(e.pointerId);if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);});
stage.addEventListener('pointercancel',e=>hold.cancel(e.pointerId));stage.addEventListener('lostpointercapture',e=>hold.cancel(e.pointerId));stage.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerdown',()=>{sound.unlock();},{capture:true});
document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#soundToggle'))cue('click');});
document.addEventListener('keydown',e=>{
 if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();if(!e.repeat)beginHold('space');}
 if(e.code==='Escape'&&!document.querySelector('dialog[open]')){if(hold.active){hold.cancel();updateReadouts();}else if(['swing','flight'].includes(sim.phase))$('pause').click();}
});
document.addEventListener('keyup',e=>{if(e.code==='Space'){if(hold.active)e.preventDefault();hold.end('space');}});
function interrupt(){hold.cancel();soundQueue.length=0;sound.pause();if(['swing','flight'].includes(sim?.phase)){paused=true;$('pause').textContent='Resume';$('pause').setAttribute('aria-pressed','true');}lastTime=0;dirty=true;}
window.addEventListener('blur',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();lastTime=0;});
new ResizeObserver(()=>{dirty=true;renderer.fit();}).observe(stage);
function frame(timestamp){
 const delta=lastTime?Math.min((timestamp-lastTime)/1000,.05):0;lastTime=timestamp;
 const modal=!!document.querySelector('dialog[open]'),active=!paused&&!document.hidden&&!modal;
 if(active){
  if(winding){sim.wind(delta);const tick=Math.floor((sim.drawFraction??0)*24);if(tick!==ratchetStep){cue('ratchet',{intensity:.6+tick/60});ratchetStep=tick;}if(sim.drawFraction>=1&&!readyCue){cue('ready');readyCue=true;}}
  else {let remaining=delta*Number($('speed').value);while(remaining>0){const step=Math.min(.05,remaining);sim.step(step);remaining-=step;}}
  if(sim.release&&!seenRelease){seenRelease=true;cue('launch');}
  if((sim.contacts??0)>seenContacts){seenContacts=sim.contacts;cue('impact',{material:'bumper',mass:Math.max(.15,Math.log10(sim.animal.grams)),intensity:.7});}
  const milestone=Math.floor(sim.maxX/Math.max(10,sim.c.longArm*10));if(milestone>scoreStep){scoreStep=milestone;cue('coin',{intensity:.45});}
 }
 if(!document.hidden){for(let i=soundQueue.length-1;i>=0;i--)if(timestamp>=soundQueue[i].at){cue(soundQueue[i].name);soundQueue.splice(i,1);}}
 const running=active&&(winding||['swing','flight'].includes(sim.phase));
 const refresh=dirty||running||(!resultShown&&['finished','invalid'].includes(sim.phase));
 const low=$('quality').value==='low',interval=low?1000/30:1000/60;
 if((dirty||running)&&timestamp-lastDraw>=interval-.5&&!document.hidden){
  renderer.draw(sim,{labels,follow,paused:paused||modal,pixelRatio:low?1:$('quality').value==='high'?2:Math.min(2,Math.sqrt(1800000/(stage.clientWidth*stage.clientHeight)))});dirty=false;lastDraw=timestamp;drawCount++;stage.dataset.renderedFrames=String(drawCount);
 }
 if(refresh&&timestamp-refreshAt>110){updateReadouts();refreshAt=timestamp;}
 requestAnimationFrame(frame);
}
populate();applyBuild({quiet:true});persist();requestAnimationFrame(frame);
window.treetop=Object.freeze({snapshot:()=>structuredClone({...sim.snapshot(),creative,bells:state.bells,build:sim.c,winding,draw:sim.drawFraction,drawCount,audio:sound.getStatus()}),getProgress:()=>structuredClone(state)});
