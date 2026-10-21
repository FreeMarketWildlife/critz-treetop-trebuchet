import test from 'node:test';import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';import {STARTER,scaledPreset} from '../src/build-catalog.js';import{createLaunchFeel,swingPlaybackRate}from'../src/launch-feel.js';import{createGroveMap}from'../src/grove-map.js';
function start(c=STARTER,options={}){const s=new BuildSimulation(c,options);s.setDraw(1);s.fire();return s;}
test('the starter swing takes more than twice as long to watch with exactly the same measured physical release',()=>{
 const baseline=start(STARTER,{map:createGroveMap()});while(!baseline.release&&baseline.phase==='swing')baseline.step(1/120);
 const s=start(STARTER,{map:createGroveMap()}),director=createLaunchFeel();let wall=0;while(!s.release&&wall<5){director.advance(s,1/120);wall+=1/120;}
 assert.ok(wall>baseline.release.time*2.2&&wall<baseline.release.time*3.2,`${wall} vs ${baseline.release.time}`);assert.ok(wall>1.3&&wall<1.7);
 for(const key of['time','angle','speed','energy','vx','vy'])assert.ok(Math.abs(s.release[key]-baseline.release[key])<1e-10,key);
 assert.equal(s.failure,'');assert.equal(s.initialEnergy,baseline.initialEnergy);
});
test('slow swing works across all foundations and huge rigs without adding release energy',()=>{
 for(const [animal,chassis]of[['mouse','anchored'],['mouse','skids'],['mouse','wheels'],['mouse','walking'],['mouse','floating'],['whale','anchored']]){
  const a=start(scaledPreset(animal,chassis)),b=start(scaledPreset(animal,chassis)),feel=createLaunchFeel();let wall=0;
  while(!a.release&&wall<20){a.step(1/120);wall+=1/120;}
  wall=0;while(!b.release&&wall<24){feel.advance(b,1/60);wall+=1/60;}
  assert.ok(b.release,`${animal} ${chassis}`);assert.ok(Math.abs(a.release.speed-b.release.speed)<1e-9);assert.ok(Math.abs(a.release.angle-b.release.angle)<1e-9);
 }
});
test('pause freezes physics and feedback; rebuilding resets all effects and timing',()=>{
 const s=start(),f=createLaunchFeel();f.advance(s,.1);const before=JSON.stringify(s.snapshot()),state=f.state();assert.deepEqual(f.advance(s,1,{paused:true}),{...state,events:[]});assert.equal(JSON.stringify(s.snapshot()),before);assert.ok(f.state().trail.length<=14);f.advance(new BuildSimulation(STARTER),.01);assert.equal(f.state().swingAge,0);assert.equal(f.state().releaseClock,null);
});
test('release punctuation is emitted once, hit pause is bounded and playing faster still respects the speed control',()=>{
 const run=speed=>{const s=start(),f=createLaunchFeel();let releaseEvents=0,wall=0;while(!s.release&&wall<5){const q=f.advance(s,1/120,{speed});releaseEvents+=q.events.filter(e=>e.type==='release').length;wall+=1/120;}assert.equal(releaseEvents,1);const physical=s.time;let maxFreeze=f.state().freeze;const q=f.advance(s,Math.min(.008,f.state().freeze*.5));maxFreeze=Math.max(maxFreeze,q.freeze);assert.ok(!q.events.some(e=>e.type==='release'));assert.equal(s.time,physical);assert.ok(maxFreeze<=.045);return wall;};assert.ok(run(3)<run(1)*.4);
});
test('quiet leaves and sap cannot trigger camera impact or hit pause; stalled swings recover normal playback',()=>{
 const s=start(),f=createLaunchFeel();s.detach('test');f.advance(s,.001);for(let i=0;i<60;i++)f.advance(s,1/120);s.contactEvents=[{seq:1,material:'foliage',strength:1,x:0,y:0},{seq:2,material:'sap',strength:1,x:0,y:0}];let q=f.advance(s,.01);assert.equal(q.impact,0);s.contactEvents.push({seq:3,kind:'beetle',material:'wood',strength:1,x:3,y:4});q=f.advance(s,.01);assert.ok(q.impact>0);assert.ok(q.freeze<=.05);assert.deepEqual(q.impactPoint,{x:3,y:4});assert.ok(Math.abs(q.shakeX)<=2.3&&Math.abs(q.shakeY)<=1.5);assert.equal(swingPlaybackRate(s,6),1);
});

test('a held release beat also freezes display-rope inertia, not just its gravity',async()=>{const{RopeVisual}=await import('../src/rope-visual.js');const r=new RopeVisual(),a={x:0,y:2},b={x:1,y:1};for(let i=0;i<10;i++)r.update(a,b,2,1/60);const before=JSON.stringify(r.points);r.update(a,b,2,0);assert.equal(JSON.stringify(r.points),before);});
