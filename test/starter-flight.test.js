import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTER,PREVIOUS_STARTER,LEGACY_STARTER,CRITTERS,PARTS,SLOTS,buildFacts,scaledPreset} from '../src/build-catalog.js';
import {BuildSimulation,runBuild} from '../src/build-physics.js';
import {newProgress,validateProgress,canBuild} from '../src/build-progress.js';
import {fitEquipment} from '../src/build-equipment.js';
import {visitShop,purchaseOffer,openPack,choosePack} from '../src/build-shop.js';
import {RopeVisual} from '../src/rope-visual.js';

test('the complete 0.48 m starter with explicit chipmunk widening flies all starter-sized volunteers at useful upward angles',()=>{
 assert.equal(STARTER.pivotHeight,.48);assert.equal(canBuild(newProgress(),STARTER),true);assert.ok(buildFacts(STARTER).capacity>=100);
 for(const animal of CRITTERS.filter(a=>a.grams<=100)){
  const sim=new BuildSimulation({...STARTER,animal:animal.id,...(animal.id==='chipmunk'?{pouchWidth:.19}:{})});sim.setDraw(0);for(let i=0;i<110;i++)sim.wind(1/60);
  assert.equal(sim.drawFraction,1);assert.ok(sim.fire());assert.equal(sim.real(sim.shot).vx,0);
  for(let i=0;i<2400&&['swing','flight'].includes(sim.phase);i++)sim.step(1/60);
  assert.equal(sim.failure,'',animal.id);assert.equal(sim.phase,'finished');assert.ok(sim.release.angle>30&&sim.release.angle<65,`${animal.id}: ${sim.release.angle}`);assert.ok(sim.release.speed>2);assert.ok(sim.maxX>1);
 }
});
test('a ground-loaded pouch winds and fires without penetrating the rail or ending immediately',()=>{
 const s=new BuildSimulation({...PREVIOUS_STARTER,longArm:4,shortArm:.65,cockAngle:80,slingLength:3});
 for(let i=0;i<=100;i++){s.setDraw(i/100);const p=s.real(s.shot);assert.ok(p.y-s.payloadRadius>=s.supportHeight(p.x));assert.ok(s.tip().y>=s.c.troughHeight+s.c.beamWidth/2);}
 const before=s.real(s.shot);assert.ok(s.fire());assert.deepEqual(s.real(s.shot),before);s.step(1/60);assert.equal(s.phase,'swing');assert.equal(s.release,null);
 for(let i=0;i<1800;i++)s.step(1/60);
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.release.time>.1);assert.ok(s.maxX>5);
});
test('payload collision extents use the same metre dimensions as the art',()=>{
 for(const a of CRITTERS){const s=new BuildSimulation(scaledPreset(a.id));let min=Infinity,max=-Infinity;for(let f=s.shot.getFixtureList();f;f=f.getNext()){const sh=f.getShape();if(sh.getType()==='polygon'){for(const p of sh.m_vertices){min=Math.min(min,p.x*s.L);max=Math.max(max,p.x*s.L);}}}
 assert.ok(Math.abs(max-min-a.length)<1e-8,a.id);assert.equal(s.payloadRadius*2,a.width);}
});
test('trough supports the loaded projectile; changing its friction changes the physical shot',()=>{
 const a=runBuild(STARTER),b=runBuild({...STARTER,trough:'waxedRunway'});assert.ok(a.troughFixture);assert.notEqual(a.release.speed,b.release.speed);assert.equal(a.failure,'');assert.equal(b.failure,'');
});
test('slack cords drape, taut cords hold length, and the released end is free to fall',()=>{
 const rope=new RopeVisual(),a={x:0,y:2},b={x:1,y:1};for(let i=0;i<90;i++)rope.update(a,b,2,1/60);
 assert.ok(rope.points[9].y<1.5);assert.deepEqual({x:rope.points[0].x,y:rope.points[0].y},a);
 let length=0;for(let i=1;i<rope.points.length;i++)length+=Math.hypot(rope.points[i].x-rope.points[i-1].x,rope.points[i].y-rope.points[i-1].y);assert.ok(Math.abs(length-2)<.08);
 for(let i=0;i<30;i++)rope.update(a,b,2,1/60,()=>0,{pinA:false});assert.ok(rope.points[0].y<1.9);
});
test('old default rigs receive the tuned kit once without losing progress or replacing custom builds',()=>{
 const raw={...newProgress(),starterRevision:undefined,bells:127,best:18,owned:PARTS.filter(p=>p.price===0).map(p=>p.id),build:{...LEGACY_STARTER},blueprints:[{...LEGACY_STARTER,name:'My first design'}]};
 const migrated=validateProgress(raw);assert.equal(migrated.bells,127);assert.equal(migrated.best,18);assert.equal(migrated.build.pivotHeight,STARTER.pivotHeight);assert.equal(migrated.blueprints[0].pivotHeight,1.05);assert.equal(canBuild(migrated,migrated.build),true);
 const custom=validateProgress({...raw,build:{...LEGACY_STARTER,pinAngle:-57}});assert.equal(custom.build.pivotHeight,1.05);assert.equal(custom.build.pinAngle,-57);assert.deepEqual(validateProgress(migrated),migrated);
});
test('shop and parcel choices can be atomically equipped and saved with unchanged physics dimensions',()=>{
 let s=visitShop({...newProgress(),bells:10000},43);const offer=s.shop.offers.find(o=>o.kind==='part'),next=purchaseOffer(s,offer),build=fitEquipment(s.build,offer);const fitted=validateProgress({...next,build});assert.equal(fitted.build[PARTS.find(p=>p.id===offer.id).slot],offer.id);assert.equal(fitted.build.pivotHeight,STARTER.pivotHeight);assert.equal(fitted.build.counterGrams,STARTER.counterGrams);
 const open=openPack(fitted),chosen=open.shop.pack.find(o=>!open.owned.includes(o.id));const packed=choosePack(open,chosen.id);assert.equal(canBuild(packed,fitEquipment(packed.build,chosen)),true);
 const animal={kind:'animal',id:'chipmunk'},b=fitEquipment(STARTER,animal);assert.equal(b.animal,'chipmunk');assert.equal(b.pinAngle,STARTER.pinAngle);
});
test('switching to smaller owned parts fits their dimensions without granting new parts',()=>{
 const b=fitEquipment(STARTER,{kind:'part',id:'twig'});assert.ok(b.longArm+b.shortArm<=2.200001);assert.equal(b.arm,'twig');assert.equal(b.counterGrams,STARTER.counterGrams);assert.equal(SLOTS.length,12);
});
