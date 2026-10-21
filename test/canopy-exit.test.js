import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,createLandmarkedGroveMap,validateGroveMap,readGroveMap,MAP_KEY,objectBounds} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createFlightWeapons} from '../src/flight-weapons.js';
import {createLaunchFeel} from '../src/launch-feel.js';
function run(map,draw,weapon=null,first=1.2){
 const s=new BuildSimulation(STARTER,{map}),weapons=createFlightWeapons();s.setDraw(draw);s.fire();if(weapon)weapons.select(weapon);let shots=0;
 for(let i=0;i<60*50&&s.phase!=='finished';i++){
  s.step(1/60);weapons.update(1/60);
  if(weapon&&s.release&&s.time-s.release.time>=first+shots*.8&&shots<(weapon==='air'?1:3))if(weapons.fire(s,[0,0],[0,0]))shots++;
 }
 return{s,shots};
}
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} / ${b}`);

test('the canopy exit is two passive editable logs with a real gap, preserving existing routes',()=>{
 const old=validateGroveMap(createLandmarkedGroveMap()),map=validateGroveMap(createGroveMap()),logs=map.objects.filter(o=>o.id.startsWith('canopy-exit-'));
 assert.equal(map.starterRevision,7);assert.equal(map.objects.length,old.objects.length+2);assert.equal(logs.length,2);
 for(const o of old.objects)assert.deepEqual(map.objects.find(n=>n.id===o.id),o);
 for(const o of logs){assert.equal(o.type,'polygon');assert.equal(o.collision,true);assert.equal(o.layer,'world');assert.equal(o.material,'wood');assert.equal(o.bounce,.42);}
 assert.ok(objectBounds(logs[1]).minX-objectBounds(logs[0]).maxX>=2,'the fork never becomes a continuous floor');
});

test('only an exact untouched revision-six starter receives the canopy exit',()=>{
 const previous=createLandmarkedGroveMap(),raw=JSON.stringify(previous);let value=raw;const storage={getItem:k=>k===MAP_KEY?value:null,setItem:()=>assert.fail('reading must not write')};
 assert.deepEqual(readGroveMap(storage),validateGroveMap(createGroveMap()));assert.equal(value,raw);
 for(const edit of [m=>{m.name='My fork';},m=>{m.objects.find(o=>o.id==='opening-skip-4').points[0].x+=.01;},m=>{m.objects.find(o=>o.id==='opening-rest-terrace').bounce=.5;},m=>{m.objects.find(o=>o.material==='foliage').density+=.1;}]){const changed=structuredClone(previous);edit(changed);value=JSON.stringify(changed);assert.deepEqual(readGroveMap(storage),validateGroveMap(changed));}
});

test('the exit leaves weak and medium natural journeys and the four full-draw skips unchanged',()=>{
 for(const draw of[.5,.75,1]){const a=run(createLandmarkedGroveMap(),draw).s,b=run(createGroveMap(),draw).s;
  assert.equal(b.phase,'finished');assert.equal(b.failure,'');for(const key of['time','x','y','vx','vy','angle','speed','energy'])close(a.release[key],b.release[key],`${draw} release ${key}`);
  if(draw<1){close(a.maxX,b.maxX,`${draw} distance`);close(a.time,b.time,`${draw} duration`);assert.deepEqual(a.contactEvents,b.contactEvents);}
  else{for(let i=0;i<4;i++){assert.equal(b.contactEvents[i].id,`opening-skip-${i+1}`);close(a.contactEvents[i].time,b.contactEvents[i].time,`skip ${i+1}`);}const e=b.contactEvents.find(e=>e.id==='canopy-exit-east-log');assert.ok(e&&e.time-b.contactEvents[3].time>3&&e.time-b.contactEvents[3].time<4,'the exit retains an airborne pause');assert.ok(b.time<18);}
 }
});

test('finite early use of all three weapons settles weak, medium and full throws within 25 seconds',()=>{
 for(const draw of[.5,.75,1])for(const weapon of['slingshot','staff','air']){
  const before=run(createLandmarkedGroveMap(),draw,weapon).s,{s,shots}=run(createGroveMap(),draw,weapon);
  assert.equal(s.phase,'finished',`${draw}/${weapon}`);assert.equal(s.failure,'');assert.equal(shots,weapon==='air'?1:3);assert.ok(s.time<25,`${draw}/${weapon}: ${s.time}`);assert.ok(Object.values(s.real(s.shot)).every(Number.isFinite));
  for(const key of['time','x','y','vx','vy','angle','speed','energy'])close(before.release[key],s.release[key],`${draw}/${weapon} release ${key}`);
 }
});

test('late canopy-exit weapon use lands instead of falling into a long lower-world tail',()=>{
 for(const weapon of['slingshot','staff','air']){const {s,shots}=run(createGroveMap(),1,weapon,9);assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.equal(shots,weapon==='air'?1:3);assert.ok(s.time<25,`${weapon}: ${s.time}`);assert.ok(s.contactEvents.some(e=>e.id==='canopy-exit-east-log'));}
});

/** Retained difficult UI-cadence fixtures: actions are accepted on an outer
 * frame crossing the requested physical time. Physical elapsed time cools
 * weapons just as in the app; this verifies a bounded set of complete runs. */
test('broader prepared weapon schedules settle with the live outer-frame cadence',()=>{
 for(const draw of[.5,.75,1])for(const weapon of['none','slingshot','staff','air']){
  const sim=new BuildSimulation(STARTER,{map:createGroveMap()}),feel=createLaunchFeel(),weapons=createFlightWeapons();sim.setDraw(draw);sim.fire();if(weapon!=='none')weapons.select(weapon);
  let wall=0,shots=0;while(['swing','flight'].includes(sim.phase)&&wall<30){
   const previousTime=sim.time;feel.advance(sim,1/60);wall+=1/60;weapons.update(sim.time-previousTime);
   if(weapon!=='none'&&sim.release&&shots<(weapon==='air'?1:3)&&sim.time>=sim.release.time+1.6+shots*.7)if(weapons.fire(sim,[0,0],[0,0]))shots++;
  }
  assert.equal(sim.failure,'');assert.equal(sim.phase,'finished',`${draw}/${weapon}: ${wall}s`);assert.ok(wall<25,`${draw}/${weapon}: ${wall}s`);
  assert.equal(shots,weapon==='none'?0:weapon==='air'?1:3);
 }
});
