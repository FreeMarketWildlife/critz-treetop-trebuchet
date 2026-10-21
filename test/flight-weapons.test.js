import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlightWeapons} from '../src/flight-weapons.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
function flight(){const s=new BuildSimulation(STARTER);s.shot.setDynamic();s.release={time:0};s.phase='flight';s.time=1;return s;}
test('weapons only affect released flight, never winding, blocked input or finished runs',()=>{const w=createFlightWeapons(),s=flight();for(const phase of ['ready','swing','finished']){s.phase=phase;assert.equal(w.fire(s,[0,0],[0,0]),null);}s.phase='flight';assert.equal(w.fire(s,[0,0],[0,0],{blocked:true}),null);assert.equal(w.snapshot().ammo.slingshot,3);});
test('aimed hits apply physical momentum; misses spend shots without a boost; ammo exhausts',()=>{const w=createFlightWeapons(),s=flight();assert.equal(w.fire(s,[0,0],[0,0]).hit,true);assert.ok(s.real(s.shot).vy>0);s.time++;const v=s.real(s.shot);assert.equal(w.fire(s,[100,100],[0,0]).hit,false);assert.equal(s.real(s.shot).vy,v.vy);s.time++;w.fire(s,[0,0],[0,0]);s.time++;assert.equal(w.fire(s,[0,0],[0,0]),null);w.reset();assert.equal(w.snapshot().ammo.slingshot,3);});
test('staff overheats, cooldown rejects spam, cooling unlocks; air has one wide blast',()=>{const w=createFlightWeapons(),s=flight();w.select('staff');for(let i=0;i<3;i++){assert.ok(w.fire(s,[0,0],[0,0]));assert.equal(w.fire(s,[0,0],[0,0]),null);s.time++;}assert.equal(w.snapshot().locked,true);assert.equal(w.fire(s,[0,0],[0,0]),null);w.update(5);assert.equal(w.snapshot().locked,false);assert.ok(w.fire(s,[0,0],[0,0]));w.select('air');s.time++;assert.equal(w.fire(s,[100,0],[0,0]).hit,true);s.time++;assert.equal(w.fire(s,[0,0],[0,0]),null);});

// Cooldown and heat both consume simulation elapsed time during presentation slowdown.
test('weapon availability follows physical time and resets cleanly',()=>{
 const w=createFlightWeapons(),s=flight();w.select('staff');assert.ok(w.fire(s,[0,0],[0,0]));
 assert.ok(Math.abs(w.cooldownRemaining(s.time)-.35)<1e-10);
 const heat=w.snapshot().heat;w.update(.084);s.time+=.084;
 assert.ok(Math.abs(w.snapshot().heat-(heat-.084*.22))<1e-10);
 assert.ok(Math.abs(w.cooldownRemaining(s.time)-.266)<1e-10);assert.equal(w.fire(s,[0,0],[0,0]),null);
 w.update(0);assert.ok(Math.abs(w.cooldownRemaining(s.time)-.266)<1e-10,'paused physical time cannot ready a shot');
 s.time+=.27;assert.equal(w.cooldownRemaining(s.time),0);assert.ok(w.fire(s,[0,0],[0,0]));
 w.reset();assert.equal(w.cooldownRemaining(s.time),0);assert.equal(w.snapshot().heat,0);
});
