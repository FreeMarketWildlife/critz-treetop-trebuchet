import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTER,EQUIPMENT_SLOTS,PARTS,shopPart,validateBuild} from '../src/build-catalog.js';
import {fitEquipment} from '../src/build-equipment.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {newProgress,canBuild,validateProgress} from '../src/build-progress.js';
import {visitShop} from '../src/build-shop.js';
import {GUILLOTINE} from '../src/guillotine.js';
const kit=()=>fitEquipment(STARTER,{kind:'part',id:'guillotine'});
test('a single user-generated item includes the blade, holder and mount while retaining starter dimensions',()=>{
 const c=kit();assert.equal(c.material,'steel');assert.equal(c.mount,'hinged');assert.equal(c.counterGrams,1600);
 for(const key of ['pivotHeight','baseWidth','longArm','shortArm','beamWidth','slingLength','pouchWidth'])assert.equal(c[key],STARTER[key]);
 const state={...newProgress(),owned:[...newProgress().owned,'guillotine'],build:c};assert.equal(canBuild(state,c),true);assert.deepEqual(validateProgress(state).build,c);
 assert.equal(GUILLOTINE.height,.58);assert.equal(GUILLOTINE.bladeWidth,.17);assert.equal(PARTS.find(p=>p.id==='guillotine').ideaSource,'user');
 assert.equal(EQUIPMENT_SLOTS.length,10);assert.deepEqual(EQUIPMENT_SLOTS.filter(([slot])=>['ballast','material','mount'].includes(slot)),[['ballast','Counterweight']]);
 assert.throws(()=>validateBuild({...c,material:'stone'}),/steel blade/);
});
test('winding raises an initially still blade; release transfers gravitational energy through the cable and stops the blade',()=>{
 const sim=new BuildSimulation(kit());sim.setDraw(0);const low=sim.counterPoint().y;
 for(let i=0;i<200;i++)sim.wind(1/60);
 const high=sim.counterPoint().y;assert.ok(high>low+.2);assert.equal(sim.real(sim.counter).vy,0);assert.equal(sim.real(sim.shot).vx,0);
 assert.equal(sim.fire(),true);assert.equal(sim.real(sim.shot).vx,0);
 let maxEnergy=sim.energy();
 for(let i=0;i<240;i++){sim.step(1/120);const local=sim.frame.getLocalPoint(sim.counter.getPosition());assert.ok(Math.abs(local.x*sim.L-GUILLOTINE.x)<1e-5);const angle=Math.PI-1+(local.y*sim.L-GUILLOTINE.restY)/GUILLOTINE.drumRadius;assert.ok(Math.abs(Math.sin(sim.arm.getAngle()-angle))<.02,'cable transfer stays coupled');maxEnergy=Math.max(maxEnergy,sim.energy());}
 assert.ok(sim.counterPoint().y>=GUILLOTINE.lowerY-.003);assert.ok(sim.counterPoint().y<high-.2);assert.ok(sim.guillotineCut);assert.equal(sim.failure,'');assert.ok(sim.release.speed>2);assert.ok(maxEnergy<=sim.initialEnergy*1.05+.01);
});
test('all three starter animals load loosely and preserve their pose/motion at release with the compact blade',()=>{
 for(const animal of ['mouse','frog','chipmunk']){
  const sim=new BuildSimulation({...kit(),animal,...(animal==='chipmunk'?{pouchWidth:.19}:{})});sim.setDraw(0);const loading=sim.loading=createPayloadLoading(sim);assert.equal(loading.loadKeyboard(),true);
  for(let i=0;i<360;i++)loading.step(1/60);
  for(let i=0;i<240;i++){sim.wind(1/60);loading.step(1/60);}
  assert.equal(loading.loaded,true);const pose=loading.position,motion=loading.motion,angle=loading.angle,parts=loading.parts;
  assert.equal(sim.fire(),true);assert.deepEqual(loading.parts,parts);const shot=sim.real(sim.shot);
  for(const [got,want]of [[shot.x,pose.x],[shot.y,pose.y],[shot.vx,motion.vx],[shot.vy,motion.vy],[Math.sin(shot.angle-angle),0]])assert.ok(Math.abs(got-want)<1e-9,animal);
  for(let i=0;i<1200&&['swing','flight'].includes(sim.phase);i++)sim.step();
  assert.equal(sim.failure,'',animal);assert.ok(sim.release,animal);assert.ok(sim.guillotineCut,animal);
 }
});
test('fresh stock uses complete counterweights and preserves legacy save IDs',()=>{
 assert.equal(shopPart(PARTS.find(p=>p.id==='guillotine')),true);assert.equal(shopPart(PARTS.find(p=>p.id==='hinged')),false);
 for(let seed=0;seed<60;seed++){const s=visitShop(newProgress(),seed);for(const o of [...s.shop.offers,...s.shop.pack])assert.notEqual(PARTS.find(p=>p.id===o.id).slot,'mount');}
 const legacy={...newProgress(),build:{...STARTER,mount:'fixed',material:'sand'},owned:[...newProgress().owned,'sand']};assert.deepEqual(validateProgress(legacy).build,legacy.build);
});
