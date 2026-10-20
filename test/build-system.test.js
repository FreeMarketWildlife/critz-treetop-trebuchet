import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTER,PARTS,CRITTERS,part,scaledPreset,validateBuild,buildFacts} from '../src/build-catalog.js';
import {BuildSimulation,runBuild,GRAVITY} from '../src/build-physics.js';
import {newProgress,buy,bank,rewards,validateProgress,canBuild,saveProgress,loadProgress} from '../src/build-progress.js';
const approx=(a,b,tolerance)=>assert.ok(Math.abs(a-b)<tolerance,`${a} vs ${b}`);

test('grams convert to physical mass; material density changes counterweight volume',()=>{
 const sim=new BuildSimulation(STARTER);sim.fire();approx(sim.shot.getMass()*sim.M,.025+sim.pouchMass,1e-9);
 const steel=buildFacts({...STARTER,material:'steel'}),stone=buildFacts(STARTER);assert.ok(steel.counterRadius<stone.counterRadius);assert.equal(steel.payload.grams,25);
});
test('all mechanism families have distinct constrained movement and finite outcomes',()=>{
 const results=['anchored','skids','wheels','walking','floating'].map(chassis=>runBuild(scaledPreset('mouse',chassis),30));
 assert.ok(results.every(s=>['finished','flight'].includes(s.phase)&&Number.isFinite(s.maxX)));
 approx(results[0].real(results[0].frame).x,0,1e-12);
 const rolling=new BuildSimulation(scaledPreset('mouse','wheels'));rolling.fire();let recoil=0;for(let i=0;i<360;i++){rolling.step(1/120);recoil=Math.max(recoil,Math.abs(rolling.real(rolling.frame).x));}assert.ok(recoil>.1,'wheels allow physical recoil during the throw');
 assert.ok(Math.abs(results[2].wheels[0].getAngle())>.01);
 assert.ok(Math.abs(results[3].pivot().x-results[3].initialPivot.x)>.1);
 assert.ok(Math.abs(results[4].pivot().x)>.01);
 assert.ok(new Set(results.map(s=>Math.round(s.maxX*100))).size>=4);
});
test('fixed and hinged counterweights move on different paths; hinge has an independent angle',()=>{
 const a=new BuildSimulation({...STARTER,mount:'fixed'}),b=new BuildSimulation({...STARTER,mount:'hinged',hanger:.2});a.fire();b.fire();for(let i=0;i<200;i++){a.step(1/120);b.step(1/120);}assert.equal(a.counter,a.arm);assert.notEqual(b.counter,b.arm);assert.ok(Math.abs(a.counterPoint().x-b.counterPoint().x)>.005);assert.ok(Math.abs(b.counter.getAngle()-b.arm.getAngle())>1);
});
test('release carries measured velocity directly into ballistic flight under Earth gravity',()=>{
 const s=new BuildSimulation({...STARTER,drag:0,pinAngle:-30});s.fire();while(!s.release&&s.phase==='swing')s.step(1/1000);assert.ok(s.release);const a=s.real(s.shot),time=s.time;for(let i=0;i<20;i++)s.step(1/1000);const dt=s.time-time,b=s.real(s.shot);approx(b.vx,a.vx,1e-8);approx(b.vy,a.vy-GRAVITY*dt,1e-8);approx(b.x,a.x+a.vx*dt,1e-8);assert.equal(s.sling,null);assert.ok(s.emptyCord);assert.ok(s.pouch);
});
test('release angle, pin length and axle loss materially affect the shot',()=>{
 const a=runBuild(STARTER),b=runBuild({...STARTER,pinAngle:25}),c=runBuild({...STARTER,pinLength:.15}),d=runBuild({...STARTER,bearing:'precision'});
 assert.ok(a.maxX>4);assert.ok(b.release.vx<0);assert.notEqual(c.release.time,a.release.time);assert.notEqual(d.release.speed,a.release.speed);
});
test('energy is not created by scale normalization, moving bases or a huge payload',()=>{
 for(const [animal,chassis]of [['mouse','anchored'],['mouse','wheels'],['mouse','walking'],['bear','anchored'],['whale','anchored']]){
  const s=new BuildSimulation(scaledPreset(animal,chassis));s.fire();let max=s.initialEnergy;
  for(let i=0;i<1800&&['swing','flight'].includes(s.phase);i++){s.step(1/120);max=Math.max(max,s.energy());}
  assert.ok(max<=s.initialEnergy*1.01+1,`${animal} ${chassis} gained excess energy`);assert.notEqual(s.phase,'invalid');
 }
});
test('every volunteer has an available supporting example; elephant and whale actually release',()=>{
 for(const animal of CRITTERS){const b=scaledPreset(animal.id);validateBuild(b);const s=runBuild(b,100);assert.ok(s.release,`${animal.id}: ${s.failure}`);assert.ok(Number.isFinite(s.maxX));assert.equal(s.phase,'finished');}
 const elephant=runBuild(scaledPreset('elephant')),whale=runBuild(scaledPreset('whale'));assert.ok(elephant.maxX>100);assert.ok(whale.maxX>500);
});
test('invalid fit is stopped; weak cords fail physically; underpowered builds can stall',()=>{
 const wrong=new BuildSimulation({...STARTER,animal:'whale'});assert.equal(wrong.fire(),false);assert.equal(wrong.phase,'invalid');
 const large=new BuildSimulation({...STARTER,ballast:'continental',counterGrams:1e10});assert.equal(large.fire(),false);
 const snapped=runBuild({...scaledPreset('bear'),rope:'twine'});assert.equal(snapped.failure,'Sling cord snapped');assert.equal(snapped.release.reason,'Cord overload — uncontrolled release');
 const stalled=runBuild({...STARTER,counterGrams:100,pinAngle:-110},20);assert.ok(stalled.maxX<1);
});
test('malformed and out-of-capacity designs are rejected, never silently clamped',()=>{
 for(const b of [{...STARTER,longArm:NaN},{...STARTER,longArm:150},{...STARTER,counterGrams:-1},{...STARTER,sling:'banana'},{...STARTER,frameGrams:1e12},{...STARTER,braceCount:1.5}])assert.throws(()=>validateBuild(b));
});
test('Adventure earns once per shot; purchases are atomic and Creative never pays',()=>{
 const initial=newProgress(),shot={distance:6,height:2,release:true,grams:25,animal:'mouse'};
 assert.throws(()=>buy(initial,'wheels'));assert.equal(initial.bells,0);
 const earned=bank(initial,'shot-1',{...shot,distance:200});assert.ok(earned.bells>=20);assert.equal(bank(earned,'shot-1',shot),earned);assert.equal(bank(earned,'creative',shot,true),earned);
 const bought=buy(earned,'squirrel',true);assert.ok(bought.animals.includes('squirrel'));assert.equal(bought.bells,earned.bells-90);assert.throws(()=>buy(bought,'squirrel',true));
 assert.throws(()=>canBuild(initial,scaledPreset('whale')));assert.equal(canBuild(initial,scaledPreset('whale'),true),true);
});
test('save round trip preserves ownership/build; malformed imports cannot unlock unowned gear',()=>{
 const storage=new Map(),adapter={setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)??null};let state=bank(newProgress(),'abc',{distance:100,height:3,release:true,grams:25});state=buy(state,'skids');state.build={...STARTER,chassis:'skids'};state.blueprints=[scaledPreset('whale')];saveProgress(adapter,state);assert.deepEqual(loadProgress(adapter),state);
 assert.throws(()=>validateProgress({...state,build:scaledPreset('whale')}));assert.throws(()=>validateProgress({...state,bells:-1}));assert.throws(()=>validateProgress({...state,owned:['unknown']}));assert.throws(()=>rewards({distance:NaN}));
});

test('anchored frame ballast does not falsely load the beam bearing',()=>{
 const light=runBuild({...STARTER,frameGrams:1000}),heavy=runBuild({...STARTER,frameGrams:9000});
 approx(light.release.speed,heavy.release.speed,1e-10);approx(light.maxX,heavy.maxX,1e-10);
});
test('strong wheel brakes oppose motion through joint reactions without adding energy',()=>{
 const s=new BuildSimulation({...STARTER,chassis:'wheels',brake:.3});s.fire();let max=s.initialEnergy;
 for(let i=0;i<1200&&['swing','flight'].includes(s.phase);i++){s.step(1/120);max=Math.max(max,s.energy());}
 assert.notEqual(s.phase,'invalid');assert.ok(max<s.initialEnergy*1.01+1);assert.ok(s.release);
});

test('Creative atmosphere cannot enter Adventure through a blueprint or save import',()=>{
 const s=newProgress(),b={...STARTER,wind:20,drag:0};assert.equal(canBuild(s,b,true),true);assert.throws(()=>canBuild(s,b));assert.throws(()=>validateProgress({...s,build:b}));
});
