import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {CURRENT_OAK,oakBranchPlan,curvePoint,curvedBranch} from '../src/oak-world.js';
import {createGroveMap,createV4Revision7GroveMap,createV4Revision8GroveMap,validateGroveMap,readGroveMap,MAP_KEY,objectBounds} from '../src/grove-map.js';
import {createWorldSession} from '../src/world-session.js';import {jungleLayerAt} from '../src/grove-jungle.js';
import {BuildSimulation} from '../src/build-physics.js';import {STARTER} from '../src/build-catalog.js';import {createPayloadLoading} from '../src/payload-loading.js';
test('fresh game and editor authority share the 75 m oak and 25–30 m jungle canopy',()=>{
 const map=createGroveMap(),world=createWorldSession({storage:{getItem:()=>null}});assert.deepEqual(world.map,validateGroveMap(map));assert.deepEqual(map.tree,CURRENT_OAK);assert.equal(map.starterRevision,10);assert.equal(map.tree.crownRadius*2,72);assert.equal(map.tree.crownDepth,45);
 const crowns=map.objects.filter(o=>/^amazon-tree-\d+-crown$/.test(o.id));assert.ok(crowns.length>=20);
 for(const crown of crowns){const top=objectBounds(crown).maxY+map.launch.y;assert.ok(top>=25&&top<=30,`${crown.id}: ${top}`);}
 assert.equal(jungleLayerAt(28,map).name,'Jungle canopy crowns');assert.equal(jungleLayerAt(31,map),undefined);
});
test('oak limbs are curved tapered polygons attached to trunks or parent branches',()=>{
 const plan=oakBranchPlan(),byId=new Map(plan.map(b=>[b.id,b]));
 for(const b of plan){assert.ok(b.width>b.tipWidth);const shape=curvedBranch(b.points,b.width,b.tipWidth);assert.equal(shape.length,26);
  if(!b.parent)assert.equal(b.points[0].x,CURRENT_OAK.trunkX);
  else{const parent=byId.get(b.parent);assert.ok(parent);let distance=Infinity;for(let i=0;i<=1000;i++){const q=curvePoint(parent.points,i/1000);distance=Math.min(distance,Math.hypot(q.x-b.points[0].x,q.y-b.points[0].y));}assert.ok(distance<.05,b.id);}
 }
 assert.ok(plan.filter(b=>b.parent).length>20);assert.doesNotThrow(()=>validateGroveMap(createGroveMap()));
});
test('untouched previous defaults migrate in memory; saved custom geometry and bytes survive',()=>{
 const old=createV4Revision7GroveMap(),raw=JSON.stringify(old),store={getItem:key=>key===MAP_KEY?raw:null,setItem:()=>assert.fail('startup never writes')};
 assert.deepEqual(readGroveMap(store),validateGroveMap(createGroveMap()));
 const custom=structuredClone(old);custom.objects[0].bounce=.51;const bytes=JSON.stringify(custom);assert.deepEqual(readGroveMap({getItem:()=>bytes}),validateGroveMap(custom));assert.equal(store.getItem(MAP_KEY),raw);
});
test('the protected launch contacts remain exact and the smaller starter still physically loads/releases',()=>{
 const map=createGroveMap(),old=createV4Revision7GroveMap();assert.deepEqual(map.objects.find(o=>o.id==='launch-bough'),old.objects.find(o=>o.id==='launch-bough'));
 const sim=new BuildSimulation(STARTER,{map});sim.setDraw(0);const loading=sim.loading=createPayloadLoading(sim);loading.loadKeyboard();for(let i=0;i<1000&&!loading.loaded;i++)loading.step(1/120);assert.ok(loading.loaded);
 for(let i=0;i<400;i++){sim.wind(1/120);loading.step(1/120);}assert.ok(sim.fire());for(let i=0;i<2400&&!sim.release;i++)sim.step(1/120);assert.ok(sim.release);assert.equal(sim.failure,'');assert.ok(sim.release.vx>0&&sim.release.vy>0);
});
test('editor has no private starting-map factory and always mounts the active authority',()=>{
 const editor=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8'),workshop=readFileSync(new URL('../src/world-workshop.js',import.meta.url),'utf8');assert.match(editor,/let doc=clone\(world.map\)/);assert.match(editor,/if\(world.revision!==knownRevision\)\{doc=clone\(world.map\)/);assert.match(workshop,/mountMapEditor\(\{root:shadow,world,/);
});

test('previous crown upgrades only when untouched, preserving authored revision eight maps',()=>{
 const old=createV4Revision8GroveMap();assert.equal(old.starterRevision,8);
 assert.deepEqual(readGroveMap({getItem:()=>JSON.stringify(old)}),validateGroveMap(createGroveMap()));
 old.objects.find(o=>o.id==='oak-limb-west-low').points[0].x-=.1;
 assert.deepEqual(readGroveMap({getItem:()=>JSON.stringify(old)}),validateGroveMap(old));
});
