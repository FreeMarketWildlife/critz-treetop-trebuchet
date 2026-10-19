import {CritterScene} from './articulated.js';
import {profiles,createVolunteerQueue} from './species.js';
import {createAudio} from './audio.js';
import {catalog,createEconomyState,economyReducer,derivePhysicalConfig,createEconomyPersistence} from './economy.js';
import {world as layout} from './world.js';
const $=id=>document.getElementById(id),canvas=$('view'),ctx=canvas.getContext('2d');
$('reduced').checked=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound=createAudio();sound.setVolume(.35);let economy=createEconomyState(),shotId=null,banked=false,shotCount=0,effects=[];
let persistence=createEconomyPersistence(localStorage);
const seed=Date.now()>>>0,queue=createVolunteerQueue(seed);let fraction=.6,scene,preview=null,error='',last=performance.now(),accumulator=0,nextPreview=0,clock=0,sliderRunning=true,sliderStart=performance.now(),held=false;
const settings=()=>derivePhysicalConfig(economy,{counterMass:Number($('mass').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:300,armDamping:Number($('friction').value),flightDrag:Number($('drag').value),initialArm:-Math.PI+Math.asin(fraction)});
const local=p=>[260+p.x*45,440-(p.y-294)*45];
const fromEvent=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*960/r.width,y=(e.clientY-r.top)*480/r.height;return {x:(x-260)/45,y:294+(440-y)/45};};
$('species').innerHTML=profiles.map(p=>`<option value="${p.id}">${p.label}</option>`).join('');$('species').value=queue.current;
function reset(){try{shotId=null;banked=false;scene=new CritterScene(settings(),$('species').value);preview=null;error='';accumulator=0;}catch(e){error=e.message;}}
for(const id of ['species','mass','long','short','friction','drag'])$(id).onchange=reset;
$('reset').onclick=reset;
$('next').onclick=()=>{bank();queue.consume();$('species').value=queue.current;reset();};
$('time').onclick=()=>{if(sliderRunning){fraction=.2+.75*Number($('power').value);sliderRunning=false;reset();}else{sliderRunning=true;sliderStart=performance.now();}};
$('launch').onclick=()=>{sound.unlock();try{const saved=scene.snapshot();scene=new CritterScene(scene.p,scene.rig.id,saved);scene.unlatch();scene.enableEncounters(seed+shotCount);shotId=`${seed}:${shotCount++}`;banked=false;preview=null;error='';sound.play('launch');}catch(e){error=e.message;}};
canvas.onpointerdown=e=>{sound.unlock();if(held){scene.drop();held=false;return;}if(scene?.grab(fromEvent(e))){canvas.setPointerCapture(e.pointerId);held=true;preview=null;}};
canvas.onpointermove=e=>{if(held)scene.move(fromEvent(e));};
canvas.onpointerup=()=>{if(!$('sticky').checked){held=false;scene?.drop();}};canvas.onpointercancel=()=>{held=false;scene?.drop();};
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();scene.control=e.key==='ArrowRight'?1:-1;}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')scene.control=0;});window.addEventListener('blur',()=>{held=false;scene?.drop();if(scene)scene.control=0;});
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
for(const [id,direction]of [['left',-1],['right',1]]){$(id).onpointerdown=e=>{e.preventDefault();$(id).setPointerCapture(e.pointerId);scene.control=direction;};$(id).onpointerup=$(id).onpointercancel=()=>scene.control=0;}
economyUI();
function line(a,b,color,width=3){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
function dot(p,r,color){ctx.beginPath();ctx.fillStyle=color;ctx.arc(...p,r,0,Math.PI*2);ctx.fill();}
function drawBody(body,transform=local,scale=45){const role=body.getUserData()?.role;if(role==='static')return;
 for(let f=body.getFixtureList();f;f=f.getNext()){const s=f.getShape(),color=role==='part'?scene.rig.color:role==='pouch'?'#71988b':role==='frame'?'#92724a':role==='enemy'?body.getUserData().color:'#594936';ctx.fillStyle=role==='enemy'?body.getUserData().color:color;
 if(s.getType()==='circle'){const center=body.getWorldPoint(s.getCenter());dot(transform(center),s.getRadius()*scale,color);}
 else if(s.getType()==='polygon'){const points=s.m_vertices.map(v=>transform(body.getWorldPoint(v)));ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.strokeStyle='#45554a';ctx.lineWidth=1;ctx.stroke();}}
}
function render(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;accumulator+=dt;
 if(sliderRunning)$('power').value=(Math.sin((now-sliderStart)/650)+1)/2;
 try{if(scene){while(accumulator>=1/600){scene.step();accumulator-=1/600;}
 if(scene.phase==='loading' && !held && scene.isLoaded() && clock>nextPreview){preview=scene.predict();nextPreview=clock+.6;}
 $('launch').disabled=scene.phase!=='loading'||held||!scene.isLoaded();
 const c=scene.center(),release=scene.release?.center;
 for(const event of scene.events.splice(0)){if(event.type==='impact'){sound.play('impact',{intensity:Math.min(1,event.strength/5)});if(!$('reduced').checked)effects.push({x:event.position.x,y:event.position.y,life:.4});}else if(event.type==='enemy')sound.play('enemy',{intensity:.3});}
 effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0).slice(-20);
 $('readout').textContent=error||`${scene.rig.label} • ${scene.phase} • ${release?(Math.atan2(release.vy,release.vx)*180/Math.PI).toFixed(1)+'° / '+Math.hypot(release.vx,release.vy).toFixed(2)+' m/s • ':''}hand work ${scene.handWork.toFixed(2)} J • arcade work ${scene.assistWork.toFixed(2)} J${scene.forceCapped?' (80 N cap)':''} • counterweight cocked lift ${(scene.p.shortArm*fraction).toFixed(2)} m above pivot • frame x ${scene.frame.getPosition().x.toFixed(3)} m`;
 $('queue').textContent=`Next 3: ${queue.peek().map(id=>profiles.find(p=>p.id===id).label).join(' → ')} • queue seed ${seed}`;
 ctx.clearRect(0,0,960,480);ctx.fillStyle='#263a31';ctx.font='15px system-ui';ctx.fillText('Physical frame, cradle and articulated payload',12,25);
 line([480,0],[480,480],'#8c9f95',1);line(local({x:-8,y:294}),local({x:5,y:294}),'#534735',6);line(local({x:-5.1,y:295.5}),local({x:-3.5,y:295.5}),'#92724a',3);
 for(let b=scene.world.getBodyList();b;b=b.getNext())drawBody(b);
 for(const rope of scene.ropes)line(local(rope.getAnchorA()),local(rope.getAnchorB()),'#444',2);
 const view=p=>[730+(p.x-c.x)*24,250-(p.y-c.y)*24];
 const gradient=ctx.createLinearGradient(500,40,960,480);gradient.addColorStop(0,c.y>120?'#b8d2cc':'#759c6c');gradient.addColorStop(1,c.y>120?'#e3e7c4':'#c3c99b');ctx.fillStyle=gradient;ctx.fillRect(500,40,460,440);
 ctx.save();ctx.beginPath();ctx.rect(500,40,460,440);ctx.clip();
 for(const surface of layout.surfaces)line(view({x:surface.minX,y:surface.y}),view({x:surface.maxX,y:surface.y}),'#675337',5);
 for(const pin of layout.bumpers){dot(view(pin),pin.radius*24,'#c69450');dot(view(pin),pin.radius*19,'#f3d28d');}
 for(let b=scene.world.getBodyList();b;b=b.getNext())if(['part','enemy'].includes(b.getUserData()?.role))drawBody(b,view,24);
 if(preview)preview.points.forEach((p,i)=>dot(view(p),2,`rgba(82,85,45,${(1-i/preview.points.length)*.8})`));
 for(const effect of effects)dot(view(effect),(1-effect.life/.4)*12,`rgba(240,182,79,${effect.life})`);
 ctx.restore();ctx.fillStyle='#263a31';ctx.fillText(`${c.y>245?'Grandfather Tree':c.y>120?'Open sky':c.y>5?'Jungle canopy':'Forest floor'} • ${Math.max(0,c.x).toFixed(0)} m`,510,30);
 }}catch(e){error=e.message;$('readout').textContent=error;}
 requestAnimationFrame(render);
}
reset();requestAnimationFrame(render);
