import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {CRITTERS,STARTER} from '../src/build-catalog.js';
import {createGroveMap,createV3GroveMap,createV4Revision7GroveMap,ENEMIES,objectBounds} from '../src/grove-map.js';
import {scaleInventory,shapeBounds,rigScaleShapes,scalePanelSVG,comparisonPanels,authoredMapSVG} from '../src/world-scale.js';
import {critterScaleMarkup} from '../src/critter-scale-art.js';
import {SCALE_BUILDS,createScaleBuild,scaleBuildFacts} from '../src/scale-builds.js';
import {BuildSimulation} from '../src/build-physics.js';
import {spaceWorldDescriptor,escapeAltitude,validateSpaceEscape} from '../src/space-policy.js';
import {newProgress,markSpaceEscape,saveProgress,loadProgress,bank} from '../src/build-progress.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} vs ${b}`);

test('the sorted guide inventories every canonical object, catalogue volunteer, encounter and named machine',()=>{
 const map=createGroveMap(),before=JSON.stringify(map),rows=scaleInventory(map),byId=new Map(rows.map(e=>[e.id,e]));
 assert.equal(byId.size,rows.length);assert.equal(rows.length,map.objects.length+CRITTERS.length+ENEMIES.length+SCALE_BUILDS.length+rows.filter(e=>e.category==='Trees').length+2);
 for(const o of map.objects){const e=byId.get('object-'+o.id),b=objectBounds(o);assert.ok(e,o.id);near(e.width,b.maxX-b.minX);near(e.height,b.maxY-b.minY);assert.equal(e.objectId,o.id);}
 for(const a of CRITTERS){const e=byId.get('animal-'+a.id);near(e.width,a.length);near(e.height,a.width);const b=shapeBounds(e.shapes);assert.ok(b.minX>=e.bounds.minX-1e-8&&b.maxX<=e.bounds.maxX+1e-8);assert.ok(b.minY>=e.bounds.minY-1e-8&&b.maxY<=e.bounds.maxY+1e-8);}
 for(let i=1;i<rows.length;i++)assert.ok(rows[i].extent>=rows[i-1].extent);
 for(const e of rows)assert.ok([e.width,e.height,e.extent].every(v=>Number.isFinite(v)&&v>0),e.id);
 assert.equal(JSON.stringify(map),before);
});
test('leaf resistance fields are not mislabelled as rigid landing faces or inert scenery',()=>{
 // Resistance-field semantics remain relevant to saved revision-seven worlds;
 // the current oak's decorative leaves deliberately have no resistance field.
 const historic=scaleInventory(createV4Revision7GroveMap()),leaves=historic.find(e=>e.id==='object-oak-leaves-0-west-0');
 assert.equal(leaves.category,'World fields');assert.match(leaves.notes,/without a rigid landing face/);
 const map=createGroveMap(),rows=scaleInventory(map),byId=new Map(rows.map(e=>[e.objectId,e]));
 assert.equal(byId.get('oak-limb-west-low').category,'World solids');
 for(const o of map.objects.filter(o=>o.material==='foliage'&&!o.collision)){const e=byId.get(o.id);assert.equal(e.category,'World scenery');assert.match(e.notes,/no collision/);}
 assert.equal(byId.get('amazon-tree-0-trunk').category,'World scenery');
});
test('machine comparisons use real fixture metres and preserve the starter catalogue',()=>{
 const before=JSON.stringify(STARTER),rows=scaleInventory(),rigs=SCALE_BUILDS.map(({id})=>rows.find(e=>e.id==='rig-'+id));
 for(const e of rigs){const c=createScaleBuild(e.recipeId),b=shapeBounds(rigScaleShapes(c)),f=scaleBuildFacts(c);near(e.width,b.width);near(e.height,b.height);assert.equal(e.facts.axleHeight,f.axleHeight);assert.equal(e.facts.pouchCapacityGrams,f.pouchCapacityGrams);}
 for(let i=1;i<rigs.length;i++){assert.ok(rigs[i].width>rigs[i-1].width);assert.ok(rigs[i].height>rigs[i-1].height);}
 near(rigs.at(-1).facts.axleHeight,16.2);near(rigs.at(-1).facts.beamLength,20.4);assert.equal(JSON.stringify(STARTER),before);
});
test('tree figures have the same 75 m oak and 25–30 m forest bounds as the editable map',()=>{
 const map=createGroveMap(),rows=scaleInventory(map),oak=rows.find(e=>e.id==='grandfather-oak');near(oak.height,75);near(oak.width,72);
 const trees=rows.filter(e=>e.category==='Trees'&&e.id!=='grandfather-oak');assert.deepEqual(trees.filter(e=>/^tree-amazon-tree-[0-3]$/.test(e.id)).map(e=>e.height).sort((a,b)=>a-b),[25,26.5,28.5,30]);assert.ok(trees.every(e=>e.height>=25&&e.height<=30));
 // Current connected limbs must appear in the combined oak silhouette, not
 // just the old scaffold IDs or its unchanged outer envelope.
 for(const limb of map.objects.filter(o=>o.id.startsWith('oak-limb-')&&o.collision)){
  assert.ok(oak.shapes.some(shape=>shape.kind==='polygon'&&shape.points.length===limb.points.length&&shape.points.every((p,i)=>p.x===limb.points[i].x&&p.y===limb.points[i].y+map.launch.y)),limb.id);
 }
 const svg=authoredMapSVG(map),visible=map.objects.filter(o=>objectBounds(o).minY+map.launch.y<=120);
 for(const o of visible)assert.ok(svg.includes(`data-object-id="${o.id}"`),o.id);
 assert.equal(visible.length,map.objects.length-2);assert.ok(svg.includes(`${visible.length} of ${map.objects.length}`));const maxX=Number(svg.match(/data-max-x="([^"]+)/)[1]);assert.ok(maxX>Math.max(...visible.map(o=>objectBounds(o).maxX)),'whole extended forest stays inside the figure');assert.match(svg,/Wandering yokai at 1032 m; Ring fragment at 1432 m/);assert.doesNotMatch(svg,/NaN|Infinity/);
});
test('every comparison panel has a single common metre transform and explicit envelopes',()=>{
 const rows=scaleInventory();for(const panel of comparisonPanels(rows)){
  const svg=scalePanelSVG(panel.entries,{height:panel.height,title:panel.title,subtitle:panel.subtitle});
  assert.doesNotMatch(svg,/NaN|Infinity|undefined/);assert.match(svg,/Uniform linear metre scale · every object uses the same ruler/);
  const scales=[...svg.matchAll(/scale\(([-.\d]+) ([-.\d]+)\)/g)].map(m=>[+m[1],+m[2]]);assert.equal(scales.length,panel.entries.length);assert.ok(scales.every(([x,y])=>x===scales[0][0]&&y===-x));
  for(const entry of panel.entries)assert.ok(svg.includes(`data-id="${entry.id}"`));
 }
 const e=rows.find(e=>e.animalId==='mouse'),svg=scalePanelSVG([e],{title:'<Unsafe & "title">'});assert.match(svg,/&lt;Unsafe &amp; &quot;title&quot;&gt;/);assert.doesNotMatch(svg,/<Unsafe/);assert.match(svg,/stroke-dasharray/);
});
test('all 11 actual ready-pose illustrations export finite paths without a second illustration catalogue',()=>{
 for(const a of CRITTERS){const e=scaleInventory().find(e=>e.animalId===a.id),svg=critterScaleMarkup(a,e.bounds);assert.match(svg,/<path d=/);assert.doesNotMatch(svg,/NaN|Infinity|undefined|<script/);assert.equal(svg,critterScaleMarkup(a,e.bounds));assert.match(svg,/stroke-linejoin="round"/);assert.throws(()=>critterScaleMarkup(a,e.bounds,'bad"id'),/identifier/);}
});

test('Creative recipe links respect pending Adventure collection and cannot apply in Adventure mode',()=>{
 const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),lines=source.split('\n'),start=lines.findIndex(s=>s.startsWith('if(!resumePendingSpace()'));
 assert.ok(start>0);const code=lines.slice(start,start+2).join('\n');assert.match(code,/scaleBuild/);
 for(const pending of[false,true])for(const creativeQuery of[false,true])for(const recipe of['elephant','unknown',null]){
  const calls=[],params=new URLSearchParams(creativeQuery?'creative=1':'');if(recipe)params.set('scaleBuild',recipe);
  const context={creative:false,draft:{...STARTER},params,resumePendingSpace:()=>pending,switchMode(next){context.creative=next;calls.push('switch');},createScaleBuild,populate(){calls.push('populate');},applyBuild(){calls.push('apply');},toast(message){calls.push('error:'+message);}};
  vm.runInNewContext(code,context);
  if(!pending&&creativeQuery&&recipe==='elephant'){assert.equal(context.draft.pivotHeight,16.2);assert.ok(calls.includes('apply'));}
  else{assert.deepEqual(context.draft,STARTER);assert.ok(!calls.includes('apply'));}
  if(pending){assert.equal(context.creative,false);assert.deepEqual(calls,[]);}
 }
});

function crossing(map){const sim=new BuildSimulation(STARTER,{map});assert.equal(sim.fire(),true);sim.detach('Scale migration boundary test');sim.shot.setTransform({x:500/sim.L,y:(escapeAltitude(map)-map.launch.y-.01)/sim.L},0);sim.shot.setLinearVelocity({x:10*sim.T/sim.L,y:30*sim.T/sim.L});sim.step(1/60);assert.equal(sim.phase,'escaped');return validateSpaceEscape(sim.spaceEscape);}
test('new physical world descriptors and saved V3 space completions restore into V4 without losing money or multiplying twice',()=>{
 const map=createGroveMap();assert.deepEqual(spaceWorldDescriptor(map),{version:4,height:3000,treeHeight:75,launchY:32});assert.equal(escapeAltitude(map),3000);for(const height of[600,1500,2999])assert.throws(()=>spaceWorldDescriptor({...map,height}),/Invalid space world/);
 for(const old of[createV3GroveMap(),createV4Revision7GroveMap(),map]){
  const event=crossing(old),state={...newProgress(),bells:89,points:18117},pending=markSpaceEscape(state,{id:'scale-escape-'+old.version,spaceEscape:event,build:STARTER});
  const memory=new Map(),store={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};saveProgress(store,pending);const loaded=loadProgress(store),sim=new BuildSimulation(STARTER,{map});sim.restoreSpaceEscape(loaded.pendingSpace.spaceEscape);
  near(sim.real(sim.shot).y+map.launch.y,event.altitude);assert.equal(sim.gravityFactor,0);assert.equal(loaded.bells,89);assert.equal(loaded.points,18117);assert.deepEqual(loaded.pendingSpace.spaceEscape.world,event.world);
  const paid=bank(loaded,loaded.pendingSpace.id,{});assert.ok(paid.bells>89);assert.equal(bank(paid,loaded.pendingSpace.id,{}),paid);assert.deepEqual(paid.achievements,['spaceEscape']);
 }
});

test('valid custom scenery edits and zero-height chains remain inspectable without a stalled ruler',()=>{
 const map=createGroveMap();map.objects=map.objects.filter(o=>o.id!=='amazon-tree-0-crown');map.tree.height=105;
 map.objects.push({id:'horizontal-custom',name:'My horizontal chain',type:'chain',points:[{x:20,y:3},{x:25,y:3}],material:'wood',collision:true,layer:'world',bounce:.3});
 const rows=scaleInventory(map);assert.ok(!rows.some(e=>e.id==='tree-amazon-tree-0'));assert.match(rows.find(e=>e.id==='grandfather-oak').measure,/105 m/);
 const horizontal=rows.find(e=>e.objectId==='horizontal-custom');assert.equal(horizontal.height,0);assert.equal(horizontal.width,5);
 const svg=scalePanelSVG([horizontal]);assert.doesNotMatch(svg,/NaN|Infinity/);assert.ok(svg.length<10000);assert.match(svg,/polyline/);
 assert.ok(rows.some(e=>e.objectId==='amazon-tree-0-trunk'),'unpaired trunk remains individually inventoried');
});

test('current world comparison shows the authored jungle while saved historic worlds retain rare emergents',()=>{
 const rows=scaleInventory(),trees=rows.filter(e=>e.category==='Trees'&&e.id!=='grandfather-oak'),panel=comparisonPanels(rows).find(p=>p.id==='world');
 assert.ok(trees.length>=20);assert.ok(trees.every(e=>e.height>=25&&e.height<=30));assert.ok(panel.entries.some(e=>e.category==='Trees'&&e.height===30));
 assert.match(panel.subtitle,/75 m fantasy oak; 25–30 m jungle canopy/);assert.doesNotMatch(panel.subtitle,/rare emergents/);assert.doesNotMatch(scalePanelSVG(panel.entries,{height:panel.height}),/NaN|Infinity/);
 const historic=scaleInventory(createV4Revision7GroveMap()),rare=historic.filter(e=>e.category==='Trees'&&e.id!=='grandfather-oak'&&e.height>60),oldPanel=comparisonPanels(historic).find(p=>p.id==='world');
 assert.equal(rare.length,4);assert.ok(rare.every(e=>e.height<=88.5));assert.ok(oldPanel.entries.some(e=>e.category==='Trees'&&e.height===88.5));assert.match(oldPanel.subtitle,/rare emergents/);assert.doesNotMatch(scalePanelSVG(oldPanel.entries,{height:oldPanel.height}),/NaN|Infinity/);
});
