import {WEAPONS,createFlightWeapons} from './flight-weapons.js?v=24';
export function flightMotionCaption(sim){
 if(sim?.phase!=='flight'||!sim.release)return 'Lift + speed';
 const p=sim.real(sim.shot);if(![p.vx,p.vy].every(Number.isFinite)||Math.hypot(p.vx,p.vy)<2)return 'Lift + speed';
 return p.vy>1.5?'Rising · speed':p.vy< -1.5?'Falling · lift':'Level · lift';
}
export function createWeaponHud({stage,renderer,getSim,isBlocked,onFire}){
 const weapons=createFlightWeapons(),tray=document.createElement('aside'),fx=document.createElement('canvas');
 tray.className='weapon-tray';tray.setAttribute('aria-label','Flight weapons');fx.className='weapon-effects';fx.setAttribute('aria-hidden','true');
 const hint=document.createElement('p');hint.textContent='IN FLIGHT · aim & click · 1–3 select · F hits';tray.append(hint);
 const buttons=WEAPONS.map((w,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<kbd>${i+1}</kbd><img src="assets/weapons/${w.id}.svg" alt=""><span>${w.name}</span><small></small>`;b.title=w.hint;b.setAttribute('aria-label',w.name);b.onclick=()=>{weapons.select(w.id);update();stage.focus({preventScroll:true});};tray.append(b);return b;});
 const fireButton=document.createElement('button');fireButton.type='button';fireButton.id='fireWeapon';fireButton.className='weapon-fire';const fireVerb=document.createElement('strong');fireVerb.textContent='Fire';fireButton.append(fireVerb);const fireName=document.createElement('small');fireButton.append(fireName);fireButton.onclick=()=>{fire();stage.focus({preventScroll:true});};tray.append(fireButton);
 stage.parentElement.append(fx,tray);let effects=[];
 function update(){const s=weapons.snapshot(),sim=getSim(),chosen=WEAPONS.find(w=>w.id===s.selected);buttons.forEach((b,i)=>{const w=WEAPONS[i];b.setAttribute('aria-pressed',String(s.selected===w.id));b.querySelector('small').textContent=w.id==='staff'?(s.locked?'COOLING':`${Math.round(s.heat*100)}% HEAT`):`${s.ammo[w.id]} ${s.ammo[w.id]===1?'SHOT':'SHOTS'}`;});const empty=s.ammo[s.selected]<=0,cooling=s.selected==='staff'&&s.locked,waiting=weapons.cooldownRemaining(sim?.time??0)>.001;fireVerb.textContent=empty?'Empty':cooling?'Cooling':waiting?'Wait':'Fire';fireName.textContent=empty?'Choose gear':cooling?'Heat falling':waiting?'Ready soon':flightMotionCaption(sim);fireButton.setAttribute('aria-label',`${fireVerb.textContent} ${chosen.name}`);fireButton.title=`${chosen.name} · lift your critter forward · F`;fireButton.disabled=sim?.phase!=='flight'||isBlocked()||empty||cooling||waiting;}
 function fire(aim){const sim=getSim(),target=renderer.project(sim.real(sim.shot)),e=weapons.fire(sim,aim??target,target,{blocked:isBlocked()});if(e){effects.push({...e,age:0});onFire(e);update();}return !!e;}
 function draw(dt,physicalDt=dt){weapons.update(physicalDt);effects.forEach(e=>e.age+=dt);effects=effects.filter(e=>e.age<.5);const r=stage.getBoundingClientRect();if(fx.width!==Math.round(r.width)||fx.height!==Math.round(r.height)){fx.width=Math.round(r.width);fx.height=Math.round(r.height);}const c=fx.getContext('2d');c.clearRect(0,0,fx.width,fx.height);
  // Hit feedback stays with the critter as the camera acquires and moves.
  for(const e of effects){const sim=getSim(),[x,y]=e.hit?renderer.project(sim.real(sim.shot)):e.aim;c.save();if(e.age<.15){c.globalAlpha=1-e.age/.15;c.strokeStyle=e.color;c.lineWidth=e.id==='staff'?5:3;c.beginPath();c.moveTo(65,330);if(e.id==='staff'){c.lineTo(x*.45,y*.5+40);c.lineTo(x*.55,y*.5-20);}c.lineTo(x,y);c.stroke();}c.restore();c.save();c.globalAlpha=1-e.age/.5;c.translate(x,y);c.strokeStyle='#241c21';c.fillStyle=e.color;c.lineWidth=4;c.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI/10,rr=(i%2?13:27)+e.age*70;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();if(!e.hit)c.fill();c.stroke();c.font='900 22px Trebuchet MS';c.textAlign='center';c.lineWidth=5;c.strokeText(e.hit?e.word:'MISS',0,-35-e.age*35);c.fillStyle='#fff4cc';c.fillText(e.hit?e.word:'MISS',0,-35-e.age*35);c.restore();}update();
 }
 update();return {fire,draw,select:weapons.select,snapshot:weapons.snapshot,reset(){weapons.reset();effects=[];update();}};
}
