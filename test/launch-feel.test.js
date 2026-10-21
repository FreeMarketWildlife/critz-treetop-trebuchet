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
test('release punctuation never freezes free flight and playing faster still respects the speed control',()=>{
 const run=speed=>{const s=start(),f=createLaunchFeel();let releaseEvents=0,wall=0;while(!s.release&&wall<5){const q=f.advance(s,1/120,{speed});releaseEvents+=q.events.filter(e=>e.type==='release').length;wall+=1/120;}assert.equal(releaseEvents,1);const physical=s.time;assert.equal(f.state().freeze,0);const q=f.advance(s,.008);assert.ok(!q.events.some(e=>e.type==='release'));assert.ok(s.time>physical);return wall;};assert.ok(run(3)<run(1)*.4);
});
test('quiet leaves and sap cannot trigger camera impact or hit pause; stalled swings recover normal playback',()=>{
 const s=start(),f=createLaunchFeel();s.detach('test');f.advance(s,.001);for(let i=0;i<60;i++)f.advance(s,1/120);s.contactEvents=[{seq:1,material:'foliage',strength:1,x:0,y:0},{seq:2,material:'sap',strength:1,x:0,y:0}];let q=f.advance(s,.01);assert.equal(q.impact,0);s.contactEvents.push({seq:3,kind:'beetle',material:'wood',strength:1,x:3,y:4});q=f.advance(s,.01);assert.ok(q.impact>0);assert.ok(q.freeze<=.05);assert.deepEqual(q.impactPoint,{x:3,y:4});assert.ok(Math.abs(q.shakeX)<=2.3&&Math.abs(q.shakeY)<=1.5);assert.equal(swingPlaybackRate(s,6),1);
});

test('a held release beat also freezes display-rope inertia, not just its gravity',async()=>{const{RopeVisual}=await import('../src/rope-visual.js');const r=new RopeVisual(),a={x:0,y:2},b={x:1,y:1};for(let i=0;i<10;i++)r.update(a,b,2,1/60);const before=JSON.stringify(r.points);r.update(a,b,2,0);assert.equal(JSON.stringify(r.points),before);});

test('approaching substantial landings keeps ordinary free flight at the selected playback speed',async()=>{
 const {imminentLanding}=await import('../src/landing-view.js');
 for(const draw of[.5,.75,1]){
  const s=new BuildSimulation(STARTER,{map:createGroveMap()}),f=createLaunchFeel();s.setDraw(draw);s.fire();let approaches=0;
  for(let i=0;i<30*120&&s.phase!=='finished';i++){
   const before=f.state(),p=s.real(s.shot),incoming=s.release&&imminentLanding(s.map,p,{radius:s.animal.width*.5});
   const q=f.advance(s,1/120);
   if(before.releaseAge>.35&&before.freeze===0&&incoming&&incoming.eta>.08&&p.vy< -2){assert.equal(q.rate,1,'a landing forecast cannot automatically drag the flight');approaches++;}
  }
  assert.equal(s.phase,'finished');assert.ok(approaches>10,'the fixture exercises actual descending landing approaches');
 }
});
test('pause freezes an impact beat and retry clears its presentation state',()=>{
 const s=start(STARTER,{map:createGroveMap()}),f=createLaunchFeel();for(let i=0;i<20*120&&f.state().freeze===0;i++)f.advance(s,1/120);
 assert.ok(f.state().freeze>0);const state=f.state(),body=s.snapshot();assert.deepEqual(f.advance(s,.5,{paused:true}),{...state,events:[]});assert.deepEqual(s.snapshot(),body);
 f.advance(new BuildSimulation(STARTER),.01);assert.equal(f.state().freeze,0);assert.equal(f.state().releaseAge,null);assert.equal(f.state().impact,0);
});
test('fixed physical-tick weapon inputs keep heat and the full outcome coherent across presentation beats',async()=>{
 const {createFlightWeapons}=await import('../src/flight-weapons.js');
 const run=(draw,presentation)=>{
  const s=new BuildSimulation(STARTER,{map:createGroveMap()}),f=createLaunchFeel(),weapons=createFlightWeapons(),inputs=[];weapons.select('staff');s.setDraw(draw);s.fire();
  const tick=s.tick.bind(s);s.tick=h=>{weapons.update(h);if(s.release&&inputs.length<3&&s.time>=s.release.time+1.6+inputs.length*.7){const e=weapons.fire(s,[0,0],[0,0]);if(e)inputs.push({time:e.time,heat:weapons.snapshot().heat});}tick(h);};
  for(let i=0;i<30*120&&s.phase!=='finished';i++){if(presentation)f.advance(s,1/120);else s.step(1/120);}
  assert.equal(s.phase,'finished');assert.equal(inputs.length,3);return{release:s.release,end:s.real(s.shot),time:s.time,distance:s.maxX,inputs,heat:weapons.snapshot().heat};
 };
 for(const draw of[.5,.75,1])assert.deepEqual(run(draw,true),run(draw,false),'presentation beats cannot move prepared physical action ticks or cool the staff faster');
});
