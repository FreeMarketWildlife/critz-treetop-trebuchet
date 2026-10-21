import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGroveMap,createV4Revision1GroveMap,createV4Revision2GroveMap,createV4Revision3GroveMap,readGroveMap,saveGroveMap,validateGroveMap,enemyRecipe,objectBounds,MAP_KEY} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {SCALE_BUILDS,createScaleBuild} from '../src/scale-builds.js';
import {createFlightWeapons} from '../src/flight-weapons.js';
const store=raw=>({raw,writes:0,getItem(k){assert.equal(k,MAP_KEY);return this.raw??null;},setItem(k,v){assert.equal(k,MAP_KEY);this.raw=v;this.writes++;}});
const cache=new Map();
// Actual Enter carry, observed support, powered winding, observed support, fire.
// No pose, velocity, draw state or collision fixtures are substituted.
function run(revision,id,draw,weapon='none'){
 const key=[revision,id,draw,weapon].join('/');if(cache.has(key))return cache.get(key);
 const map=revision===1?createV4Revision1GroveMap():revision===2?createV4Revision2GroveMap():revision===3?createV4Revision3GroveMap():createGroveMap(),s=new BuildSimulation(createScaleBuild(id),{map});s.setDraw(0);s.loading=createPayloadLoading(s);
 const support=()=>{let stable=0;for(let i=0;i<720&&stable<30;i++){s.loading.step(1/120);stable=s.loading.loaded?stable+1:0;}assert.equal(stable,30,`${key}: supported for .25s`);};
 assert.equal(s.loading.loadKeyboard(),true);support();
 let winds=0;while(s.drawFraction<draw&&winds++<36000){s.wind(1/120);s.loading.step(1/120);}assert.ok(s.drawFraction>=draw);support();
 assert.equal(s.fire(),true,`${key}: one Enter prepares a real release`);
 const obstructed=[];s.world.on('begin-contact',contact=>{if(s.release)return;for(const[a,b]of[[contact.getFixtureA(),contact.getFixtureB()],[contact.getFixtureB(),contact.getFixtureA()]]){const o=a.getUserData()?.worldObject,role=b.getBody().getUserData()?.role;if(o&&['arm','counter','payload'].includes(role)&&o.id!=='launch-bough')obstructed.push(`${role}/${o.id}`);}});
 const weapons=createFlightWeapons();if(weapon!=='none')weapons.select(weapon);let shots=0;
 for(let i=0;i<7200&&['swing','flight'].includes(s.phase);i++){
  s.step(1/120);weapons.update(1/120);
  if(weapon!=='none'&&s.release&&shots<(weapon==='air'?1:3)&&s.time>=s.release.time+1.6+shots*.7&&weapons.fire(s,[0,0],[0,0]))shots++;
 }
 assert.equal(s.failure,'',key);assert.equal(s.phase,'finished',key);assert.ok(s.release,key);assert.deepEqual(obstructed,[],`${key}: real launcher clearance`);
 assert.equal(s.contactSequence,s.contactEvents.length,`${key}: impact history is complete`);
 const contacts=s.contactEvents.filter(e=>e.time>=s.release.time),props=new Set(contacts.filter(e=>e.id!=='forest-floor'&&!['foliage','sap'].includes(e.material)).map(e=>e.id));
 const times=[s.release.time,...contacts.map(e=>e.time),s.time],maxGap=Math.max(...times.slice(1).map((t,i)=>t-times[i])),result={s,contacts,props,maxGap,shots};cache.set(key,result);return result;
}

test('revision-one default stays exact and only untouched copies migrate without writes',()=>{
 const previous=createV4Revision1GroveMap(),raw=JSON.stringify(previous),storage=store(raw);
 assert.equal(createHash('sha256').update(raw).digest('hex'),'2ed10782a59f071793c0e734bfa0b373b8b25a1d34528e41486f94e26b7a2b94');
 assert.equal(previous.objects.length,93);assert.equal(createGroveMap().starterRevision,4);assert.deepEqual(readGroveMap(storage),validateGroveMap(createGroveMap()));assert.equal(storage.raw,raw);assert.equal(storage.writes,0);
 for(const edit of[m=>{m.name='My authored grove';},m=>{m.objects[0].points[0].x-=.01;},m=>{m.objects[0].bounce=.42;},m=>{m.objects[0].collision=false;},m=>{m.objects.pop();},m=>{m.tree.height=105;}]){const changed=structuredClone(previous);edit(changed);const s=store(JSON.stringify(changed)),before=s.raw;assert.deepEqual(readGroveMap(s),validateGroveMap(changed));assert.equal(s.raw,before);assert.equal(s.writes,0);}
 const invalid=store('{broken');assert.equal(readGroveMap(invalid),null);assert.equal(invalid.raw,'{broken');assert.equal(invalid.writes,0);
 const saved=store();saveGroveMap(saved,createGroveMap());assert.deepEqual(readGroveMap(saved),validateGroveMap(createGroveMap()));
});

test('new route uses short real boughs, ordinary forest scales and unchanged species sizes',()=>{
 const m=validateGroveMap(createGroveMap()),oldIds=new Set(createV4Revision1GroveMap().objects.map(o=>o.id));
 assert.equal(m.tree.height,110);assert.equal(m.tree.trunkWidth,7);assert.equal(m.launch.y,32);
 for(const o of m.objects){assert.ok(objectBounds(o).minY>=-32-1e-9);if(o.type==='enemy')assert.equal(o.radius,enemyRecipe(o.kind).radius);if(!oldIds.has(o.id)&&o.collision&&o.type==='polygon'){assert.ok(Math.hypot(o.points[1].x-o.points[0].x,o.points[1].y-o.points[0].y)<8);assert.ok(o.bounce<=.81);}}
 for(const o of m.objects.filter(o=>/^amazon-tree-\d+-trunk$/.test(o.id)&&!oldIds.has(o.id))){const height=objectBounds(o).maxY+32;assert.ok((height>=30&&height<=45)||height===60||(/^amazon-tree-(55|56|57|58)-trunk$/.test(o.id)&&height<=88.5));assert.equal(o.collision,false);}
 assert.ok(m.objects.some(o=>o.id==='route-upper-bay-10-a'));assert.ok(!m.objects.some(o=>o.id.startsWith('route-cloud-bank-')));
});

for(const {id,minimumDraw}of SCALE_BUILDS)for(const draw of[...new Set([minimumDraw,.75,1])])test(`${id}/${draw}: actual carried launch keeps clearance and reaches a natural finish`,()=>{const r=run(4,id,draw);assert.ok(r.s.time-r.s.release.time<45);});

for(const draw of[.75,1])test(`starter/${draw}: early top landings and continued contacts replace the empty opening`,()=>{
 const before=run(1,'small',draw),after=run(4,'small',draw);
 assert.ok(after.contacts[0].time-after.s.release.time<1.5);assert.ok(after.props.size>=5);assert.ok(after.props.size>before.props.size);assert.ok(after.maxGap<2.75);assert.ok(after.s.maxX>50);
});

for(const id of['medium','large'])for(const draw of[.75,1])test(`${id}/${draw}: upgraded flight encounters the authored forest instead of bare floor`,()=>{
 const before=run(1,id,draw),after=run(4,id,draw);assert.ok(after.props.size>=3);assert.ok(after.props.size>=before.props.size);assert.ok(after.maxGap<4);assert.ok(after.maxGap<before.maxGap);
});

for(const id of['small','medium','large','elephant'])for(const draw of[.75,1])for(const weapon of['air','staff'])test(`${id}/${draw}/${weapon}: bounded flight interventions still finish`,()=>{
 const r=run(4,id,draw,weapon);assert.equal(r.shots,weapon==='air'?1:3);assert.ok(r.s.time-r.s.release.time<50);
});


test('released revision-two stays exact; only untouched copies migrate and reads preserve raw bytes',()=>{
 const previous=createV4Revision2GroveMap(),raw=JSON.stringify(previous),storage=store(raw);
 assert.equal(createHash('sha256').update(raw).digest('hex'),'14b1519ec2191432a6109472fcb9698d553d6132f1478c513f08f9c7953565c2');
 assert.equal(previous.objects.length,356);assert.deepEqual(readGroveMap(storage),validateGroveMap(createGroveMap()));assert.equal(storage.raw,raw);assert.equal(storage.writes,0);
 for(const edit of[m=>{m.name='My emergent route';},m=>{m.objects[0].points[0].x-=.02;},m=>{m.objects[0].bounce=.42;},m=>{m.objects[0].collision=false;},m=>{m.objects[0].layer='back';},m=>{m.tree.height=105;},m=>{m.objects.pop();}]){const changed=structuredClone(previous);edit(changed);const saved=store(JSON.stringify(changed)),bytes=saved.raw;assert.deepEqual(readGroveMap(saved),validateGroveMap(changed));assert.equal(saved.raw,bytes);assert.equal(saved.writes,0);}
});

test('four rare rooted emergents add only short visible upper boughs below the Grandfather crown',()=>{
 const before=createV4Revision2GroveMap(),m=validateGroveMap(createV4Revision3GroveMap()),oldIds=new Set(before.objects.map(o=>o.id)),added=m.objects.filter(o=>!oldIds.has(o.id));
 assert.deepEqual(m.objects.filter(o=>oldIds.has(o.id)),before.objects);assert.equal(m.objects.length,377);assert.equal(added.length,21);
 const trunks=added.filter(o=>o.id.endsWith('-trunk')),crowns=added.filter(o=>o.id.endsWith('-crown')),boughs=added.filter(o=>o.id.startsWith('route-rare-bough-'));
 assert.equal(trunks.length,4);assert.equal(crowns.length,4);assert.equal(boughs.length,13);assert.deepEqual(trunks.map(o=>objectBounds(o).maxY+32),[88.5,88.5,88.5,85]);
 for(const o of[...trunks,...crowns]){assert.equal(o.collision,false);assert.equal(o.layer,'back');assert.ok(objectBounds(o).maxY+32<110);}
 for(const o of trunks)assert.equal(objectBounds(o).minY,-32);
 for(const o of boughs){assert.equal(o.type,'polygon');assert.equal(o.collision,true);assert.equal(o.layer,'world');assert.ok(['wood','leaf'].includes(o.material));assert.ok(o.bounce<=.72);assert.ok(Math.hypot(o.points[1].x-o.points[0].x,o.points[1].y-o.points[0].y)<8);assert.ok(objectBounds(o).minY>36);assert.ok(objectBounds(o).maxY+32<=88.5);}
});

test('starter and Medium flights stay exact when the upper-canopy landmarks are irrelevant',()=>{
 for(const{id,minimumDraw}of SCALE_BUILDS.filter(b=>['small','medium'].includes(b.id)))for(const draw of[minimumDraw,.75,1])for(const weapon of(draw===minimumDraw?['none']:['none','air','staff'])){
  const before=run(2,id,draw,weapon),after=run(3,id,draw,weapon);assert.deepEqual(after.s.release,before.s.release);assert.deepEqual(after.contacts,before.contacts);assert.deepEqual(after.s.real(after.s.shot),before.s.real(before.s.shot));assert.equal(after.s.time,before.s.time);assert.equal(after.s.maxX,before.s.maxX);
 }
});

for(const[id,draw,weapon]of[['large',1,'none'],['large',1,'air'],['large',1,'staff'],['elephant',1,'none'],['elephant',1,'air'],['elephant',.75,'air'],['elephant',.75,'staff']])test(`${id}/${draw}/${weapon}: rare upper boughs shorten the measured high-arc gap`,()=>{
 const before=run(2,id,draw,weapon),after=run(3,id,draw,weapon);assert.deepEqual(after.s.release,before.s.release);assert.ok(after.maxGap<before.maxGap);assert.ok([...after.props].some(id=>id.startsWith('route-rare-bough-')));
});
