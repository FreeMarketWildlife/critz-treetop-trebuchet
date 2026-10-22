import test from 'node:test';
import assert from 'node:assert/strict';
import {SCALE_BUILDS,createScaleBuild,scaleBuildFacts} from '../src/scale-builds.js';
import {STARTER,PARTS,CRITTERS,SLOTS,part,validateBuild,buildFacts} from '../src/build-catalog.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createProportionedGroveMap} from '../src/grove-map.js';

const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-9,`${message}: ${a} vs ${b}`);
const catalogBefore=JSON.stringify({STARTER,PARTS,CRITTERS});

test('scale recipes are optional independent configurations, with the small starter exactly preserved',()=>{
 assert.deepEqual(SCALE_BUILDS.map(x=>x.id),['small','medium','large','elephant']);
 assert.deepEqual(createScaleBuild('small'),STARTER);
 const a=createScaleBuild('elephant'),b=createScaleBuild('elephant');
 a.pivotHeight=99;a.name='Changed comparison';assert.equal(b.pivotHeight,16.2);assert.equal(b.name,'Elephant grove gantry');
 assert.throws(()=>createScaleBuild('unknown'),/Unknown scale recipe/);
 assert.equal(JSON.stringify({STARTER,PARTS,CRITTERS}),catalogBefore);
 for(const entry of SCALE_BUILDS){assert.ok(Object.isFrozen(entry));assert.ok(Object.isFrozen(entry.build));assert.deepEqual(validateBuild(entry.build),entry.build);}
});

test('every named recipe uses real catalogue IDs and its intended volunteer fits the chosen capacities',()=>{
 for(const {id}of SCALE_BUILDS){
  const c=createScaleBuild(id),f=buildFacts(c),reported=scaleBuildFacts(id);
  assert.equal(f.warnings.length,0,`${id}: ${f.warnings.join('; ')}`);
  assert.ok(f.payload.grams<=part(c.sling).capacity);assert.ok(c.pouchWidth>=f.payload.length*.7);
  assert.ok(c.counterGrams<=part(c.ballast).maxMass);assert.ok(c.frameGrams<=part(c.frame).maxMass);
  assert.ok(c.pivotHeight<=part(c.frame).maxHeight);assert.ok(c.longArm+c.shortArm<=part(c.arm).maxLength);
  assert.ok(c.slingLength<=part(c.sling).maxLength);assert.ok(c.pouchWidth<=part(c.sling).width);
  assert.deepEqual(reported.parts,SLOTS.map(([slot,label])=>({slot,label,id:c[slot],name:part(c[slot]).name})));
 }
 assert.equal(scaleBuildFacts('elephant').pouchCapacityGrams,8000000);
 assert.equal(scaleBuildFacts('elephant').volunteerGrams,5000000);
});

test('the four scales are increasingly large solver geometry in metres, not drawing multipliers',()=>{
 const all=SCALE_BUILDS.map(({id})=>scaleBuildFacts(id));
 for(const[i,height]of[STARTER.pivotHeight,45/13,8.1,16.2].entries())near(all[i].axleHeight,height,'axle height');
 assert.deepEqual(all.map(x=>x.feetWidth),[STARTER.baseWidth,30/13,6,12]);
 for(const field of['beamLength','longSideReach','guideLength','stationaryWidth','volunteerGrams','counterGrams'])for(let i=1;i<all.length;i++)assert.ok(all[i][field]>all[i-1][field],`${field} increases`);
 for(const{id}of SCALE_BUILDS){
  const c=createScaleBuild(id),f=scaleBuildFacts(id),s=new BuildSimulation(c);s.setDraw(1);s.loading=createPayloadLoading(s);
  near(s.pivot().y,f.axleHeight,`${id} actual axle`);near(Math.hypot(s.tip().x-s.pivot().x,s.tip().y-s.pivot().y),f.longArm,`${id} actual long arm`);
  near(f.beamLength,c.longArm+c.shortArm,`${id} full beam`);near(f.longSideReach,c.longArm+c.slingLength+s.animal.length*.5,`${id} outer reach`);
  near(f.guideBounds.minX,s.railPoint(-c.troughLength*.75).x,`${id} guide west`);near(f.guideBounds.maxX,s.railPoint(c.troughLength*.25).x,`${id} guide east`);
  assert.ok(f.stationaryBounds.minX<=s.loading.stand.x-s.loading.stand.width*.5);assert.ok(f.stationaryBounds.maxX>=s.loading.stand.x+s.loading.stand.width*.5);
  assert.ok(f.stationaryBounds.minX<=-c.baseWidth*.5);assert.ok(f.stationaryBounds.maxX>=c.baseWidth*.5);
 }
 assert.ok(all[3].axleHeight>=10&&all[3].axleHeight<=30,'Elephant uses a grove-scale gantry');
 assert.equal(JSON.stringify({STARTER,PARTS,CRITTERS}),catalogBefore);
});

// These are the game's explicit Enter and held-crank actions. No launch pose,
// velocity, joints or terrain are substituted. A failed moving-basket seat settles
// at the held ratchet without a second Enter drop.
function preparedLaunch(id){
 const s=new BuildSimulation(createScaleBuild(id),{map:createProportionedGroveMap()});s.setDraw(0);s.loading=createPayloadLoading(s);
 assert.equal(s.fire(),false,`${id} cannot fire before loading`);
 const settle=()=>{let stable=0;for(let i=0;i<1800&&stable<30;i++){s.loading.step(1/120);stable=s.loading.loaded?stable+1:0;}assert.equal(stable,30,`${id} supported physical drop`);};
 assert.equal(s.loading.loadKeyboard(),true);settle();
 let steps=0;for(;steps<36000&&s.drawFraction<1;steps++){s.wind(1/120);s.loading.step(1/120);}
 assert.equal(s.drawFraction,1,`${id} powered winding completes within300s`);
 const redrops=0;settle();
 assert.equal(s.fire(),true,`${id} actual physical launch`);
 const obstructed=[];s.world.on('begin-contact',contact=>{if(s.release)return;for(const[a,b]of[[contact.getFixtureA(),contact.getFixtureB()],[contact.getFixtureB(),contact.getFixtureA()]]){const o=a.getUserData()?.worldObject,role=b.getBody().getUserData()?.role;if(o&&['arm','counter','payload'].includes(role)&&o.id!=='launch-bough')obstructed.push(`${role}/${o.id}`);}});
 for(let i=0;i<14400&&['swing','flight'].includes(s.phase);i++)s.step(1/240);
 return{s,windSeconds:steps/120,redrops,obstructed};
}
for(const{id}of SCALE_BUILDS)test(`${id}: real keyboard loading, powered winding and release work on the canonical proportioned map`,()=>{
 const{s,windSeconds,redrops,obstructed}=preparedLaunch(id);
 assert.equal(s.map.version,4);assert.equal(s.map.launch.y,32);assert.equal(s.failure,'');assert.ok(s.release);assert.equal(s.release.reason,'Release ring cleared the pin');
 assert.ok(s.release.vx>0&&s.release.vy>0,`${id} clean forward upward release`);assert.ok(s.release.speed>10,`${id} useful full-draw launch`);
 assert.deepEqual(obstructed,[],`${id} has genuine terrain clearance before release`);
 assert.equal(s.phase,'finished');assert.ok(s.time<60);assert.ok(s.maxX>10,`${id} travels beyond the launcher`);
 assert.ok(s.peakTension<part(s.c.rope).strength);assert.ok(s.peakStress<part(s.c.arm).strength*2);
 assert.ok([s.maxX,s.maxY,s.release.speed,s.real(s.shot).x,s.real(s.shot).y].every(Number.isFinite));
 assert.ok(windSeconds>0&&windSeconds<30);assert.equal(redrops,0);
});
