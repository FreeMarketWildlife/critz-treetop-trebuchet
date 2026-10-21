import test from 'node:test';
import assert from 'node:assert/strict';
import {weaponActionState,flightEffectCaption} from '../src/weapon-hud.js';
import {WEAPONS,createFlightWeapons} from '../src/flight-weapons.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {Vec2} from '../vendor/planck/planck.mjs';
function flight(vx=8,vy=-5){
 const s=new BuildSimulation(STARTER);s.shot.setDynamic();s.release={time:0};s.phase='flight';s.time=1;
 s.shot.setLinearVelocity(Vec2(vx*s.T/s.L,vy*s.T/s.L));return s;
}
const state=(w,s,blocked=false)=>weaponActionState(s,w.snapshot(),{remaining:w.cooldownRemaining(s.time),blocked});
function compareAcceptance(w,s,{blocked=false,aim=[0,0]}={}){
 const action=state(w,s,blocked),event=w.fire(s,aim,[0,0],{blocked});
 assert.equal(!action.disabled,!!event,'HUD readiness must agree with the current model');return{action,event};
}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} versus ${b}`);
test('Fire waits through the final half millisecond and enables at the exact model deadline',()=>{
 for(const remaining of[.0005,0]){
  const s=flight(),w=createFlightWeapons(),first=w.fire(s,[0,0],[0,0]);
  s.time=first.time+first.cooldown-remaining;
  const {action,event}=compareAcceptance(w,s);
  assert.equal(action.verb,remaining?'Wait':'Fire');assert.equal(action.disabled,remaining>0);
  assert.equal(action.caption,remaining?'Ready soon':'Right + up');
  assert.equal(w.snapshot().ammo.slingshot,event?1:2);
 }
});
test('HUD mirrors released-flight, blocked, ammo and reset guards without touching the model',()=>{
 for(const phase of['ready','swing','finished','invalid']){
  const s=flight(),w=createFlightWeapons();s.phase=phase;
  assert.equal(compareAcceptance(w,s).action.caption,'In flight');assert.equal(w.snapshot().ammo.slingshot,3);
 }
 const s=flight(),w=createFlightWeapons();s.release=null;
 assert.equal(compareAcceptance(w,s).action.caption,'In flight');s.release={time:0};
 assert.equal(compareAcceptance(w,s,{blocked:true}).event,null);assert.equal(w.snapshot().ammo.slingshot,3);
 w.select('air');assert.equal(compareAcceptance(w,s,{aim:[200,200]}).event.hit,false,'an aimed miss still spends its accepted shot');
 s.time++;const empty=compareAcceptance(w,s);assert.equal(empty.action.verb,'Empty');assert.equal(empty.action.caption,'Choose gear');
 w.reset();assert.equal(w.snapshot().selected,'air');assert.equal(w.snapshot().ammo.air,1);assert.equal(compareAcceptance(w,s).action.verb,'Fire');
});
test('capability captions match actual impulse components, including zero-boost accepted hits',()=>{
 for(const weapon of WEAPONS)for(const [vx,vy,caption,right,up]of[
  [8,-5,'Right + up',true,true],[41,5,'Up',false,true],[8,33,'Right',true,false],[45,35,'At limit',false,false],[-20,5,'Right + up',true,true]
 ]){
  const s=flight(vx,vy),w=createFlightWeapons();w.select(weapon.id);const before=s.real(s.shot),ammo=w.snapshot().ammo[weapon.id];
  const {action,event}=compareAcceptance(w,s),after=s.real(s.shot);
  assert.equal(action.verb,'Fire');assert.equal(action.caption,caption);assert.equal(event.hit,true);
  assert.equal(after.vx>before.vx+1e-9,right);assert.equal(after.vy>before.vy+1e-9,up);
  if(!right)close(after.vx,before.vx);if(!up)close(after.vy,before.vy);
  assert.equal(w.snapshot().ammo[weapon.id],ammo-1,'At limit must preserve the model\'s acceptance and shot consumption');
  if(vx<0&&weapon.id==='slingshot')assert.ok(Math.hypot(after.vx,after.vy)<Math.hypot(before.vx,before.vy),'right + up does not guarantee scalar speed gain');
 }
});
test('shared cooldown and staff heat availability remain coherent across selection and pause',()=>{
 const s=flight(),w=createFlightWeapons();w.fire(s,[0,0],[0,0]);w.select('staff');s.time+=.1;
 assert.equal(compareAcceptance(w,s).action.verb,'Wait','switching weapons cannot bypass cooldown');
 s.time=1.25;for(let i=0;i<3;i++){assert.ok(compareAcceptance(w,s).event);s.time++;}
 assert.equal(w.snapshot().locked,true);const cooling=compareAcceptance(w,s);
 assert.equal(cooling.action.verb,'Cooling');assert.equal(cooling.action.caption,'Heat falling');
 const before=w.snapshot();assert.equal(compareAcceptance(w,s,{blocked:true}).action.caption,'Heat paused');w.update(0);assert.deepEqual(w.snapshot(),before);
 w.update(4);assert.equal(w.snapshot().locked,false);assert.equal(compareAcceptance(w,s).action.verb,'Fire');
 for(let i=0;i<2;i++){s.time++;assert.ok(compareAcceptance(w,s).event);}assert.equal(w.snapshot().locked,true);assert.ok(w.cooldownRemaining(s.time)>0);
 w.reset();assert.equal(w.snapshot().heat,0);assert.equal(w.snapshot().locked,false);assert.equal(w.cooldownRemaining(s.time),0);assert.equal(compareAcceptance(w,s).action.verb,'Fire');
});
test('HUD state reads remain pure and invalid/outside-flight captions stay neutral',()=>{
 const s=flight(),w=createFlightWeapons(),before=s.snapshot(),snapshot=w.snapshot(),saved=structuredClone(snapshot);
 for(let i=0;i<3;i++)assert.deepEqual(weaponActionState(s,snapshot),{verb:'Fire',caption:'Right + up',disabled:false});
 assert.deepEqual(s.snapshot(),before);assert.deepEqual(snapshot,saved);
 assert.equal(flightEffectCaption(null),'In flight');
 assert.equal(flightEffectCaption({phase:'flight',release:{},real:()=>({vx:NaN,vy:5})}),'In flight');
});


test('paused cooldown copy does not promise time is advancing',()=>{
 const s=flight(),w=createFlightWeapons();w.fire(s,[0,0],[0,0]);
 const before=w.snapshot();assert.deepEqual(state(w,s,true),{verb:'Wait',caption:'Paused',disabled:true});assert.deepEqual(w.snapshot(),before);
});
