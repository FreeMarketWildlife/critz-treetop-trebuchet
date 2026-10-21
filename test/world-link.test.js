import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{gzipSync}from'node:zlib';
import{createWorldLinkLoader}from'../src/world-link.js';import{encodeMapLink,decodeMapLink}from'../src/map-link-codec.js';
import{createWorldSession}from'../src/world-session.js';import{createGroveMap,createV4Revision1GroveMap,MAP_KEY}from'../src/grove-map.js';import{BuildSimulation}from'../src/build-physics.js';import{STARTER}from'../src/build-catalog.js';
function setup(){const map={...createGroveMap(),name:'My local course'},raw=JSON.stringify(map),values=new Map([[MAP_KEY,raw],['treetop-custom-workshop-v1','saved progress'],['treetop-save-v1','legacy progress']]),writes=[],storage={getItem:k=>values.get(k)??null,setItem(k,v){writes.push([k,v]);values.set(k,v);}};return{world:createWorldSession({storage}),storage,values,writes,raw};}
const shared=()=>({...createGroveMap(),name:'Shared pinball grove'});
test('j1 and g1 links use the same validated canonical geometry and no editor module dependency',async()=>{
 const map={...createV4Revision1GroveMap(),name:'Older portable snapshot'},plain='j1.'+Buffer.from(JSON.stringify(map)).toString('base64url'),compressed=await encodeMapLink(map);
 assert.deepEqual(await decodeMapLink(plain),map);assert.deepEqual(await decodeMapLink(compressed),map);
 for(const path of['../src/world-link.js','../src/map-link-codec.js']){const source=readFileSync(new URL(path,import.meta.url),'utf8');assert.doesNotMatch(source,/from ['"][^'"]*(?:map-editor|editor-entry|world-workshop|grove-editor-tools)/);}
});
test('player snapshots select the current runtime world, stay read-only, and restore the local world without saving',async()=>{
 const h=setup(),links=createWorldLinkLoader(h.world),map=shared();map.objects.push({id:'shared-physical-log',name:'Shared log',type:'polygon',points:[{x:200,y:-25},{x:204,y:-25},{x:204,y:-25.5},{x:200,y:-25.5}],collision:true,layer:'world',material:'wood',bounce:.66});
 const token=await encodeMapLink(map),result=await links.load('#map='+token);assert.equal(result.changed,true);assert.equal(result.selected,true);assert.equal(result.map,h.world.map);assert.equal(h.world.readOnly,true);assert.equal(links.active,true);
 const sim=new BuildSimulation(STARTER,{map:result.map});let found=false;for(const body of sim.mapBodies)for(let f=body.getFixtureList();f;f=f.getNext())if(f.getUserData()?.worldObject?.id==='shared-physical-log'){assert.equal(f.getRestitution(),.66);found=true;}assert.equal(found,true,'selected snapshot feeds actual game fixtures');
 assert.throws(()=>h.world.save(),/Edit a copy/);assert.equal((await links.load('#map='+token)).changed,false);
 const restored=await links.load('');assert.equal(restored.restored,true);assert.equal(h.world.map.name,'My local course');assert.equal(h.world.readOnly,false);assert.equal(links.active,false);assert.equal(h.storage.getItem(MAP_KEY),h.raw);assert.deepEqual(h.writes,[]);assert.equal(h.values.get('treetop-custom-workshop-v1'),'saved progress');assert.equal(h.values.get('treetop-save-v1'),'legacy progress');
});
test('pending reward guard blocks selection and restoration without changing the current authority',async()=>{
 const h=setup();let allowed=false;const links=createWorldLinkLoader(h.world,{decode:async()=>shared(),canApply:()=>allowed}),initial=h.world.map;
 const blocked=await links.load('#map=valid');assert.equal(blocked.blocked,true);assert.equal(h.world.map,initial);assert.equal(links.active,false);allowed=true;assert.equal((await links.load('#map=valid')).selected,true);
 const snapshot=h.world.map;allowed=false;assert.equal((await links.load('')).blocked,true);assert.equal(h.world.map,snapshot);assert.equal(links.active,true);allowed=true;await links.load('');assert.equal(h.world.map.name,'My local course');assert.deepEqual(h.writes,[]);
});
test('a later hash wins over delayed decoding, delayed guards and stale decoder errors',async()=>{
 const h=setup();let firstResolve;const first=new Promise(r=>firstResolve=r),links=createWorldLinkLoader(h.world,{decode:t=>t==='first'?first:Promise.resolve({...shared(),name:'Latest'})});
 const a=links.load('#map=first');await links.load('#map=second');firstResolve({...shared(),name:'Stale'});assert.equal((await a).stale,true);assert.equal(h.world.map.name,'Latest');
 let guardResolve;const guard=new Promise(r=>guardResolve=r),guarded=createWorldLinkLoader(h.world,{decode:async t=>({...shared(),name:t}),canApply:({map})=>map.name==='slow'?guard:true});
 const slow=guarded.load('#map=slow');await Promise.resolve();await Promise.resolve();await guarded.load('#map=fast');guardResolve(true);assert.equal((await slow).stale,true);assert.equal(h.world.map.name,'fast');
 let reject;const failed=new Promise((_,r)=>reject=r),racing=createWorldLinkLoader(h.world,{decode:t=>t==='bad'?failed:Promise.resolve(shared())});const bad=racing.load('#map=bad');await racing.load('#map=good');reject(Error('late malformed link'));assert.equal((await bad).stale,true);assert.equal(h.world.map.name,'Shared pinball grove');
});
test('invalid, malformed, oversized and decompression-bomb links leave current map and stored bytes intact',async()=>{
 const h=setup(),links=createWorldLinkLoader(h.world),initial=h.world.map,badJson='j1.'+Buffer.from('{broken').toString('base64url'),badMap='j1.'+Buffer.from(JSON.stringify({version:99})).toString('base64url'),bomb='g1.'+gzipSync('{"padding":"'+'x'.repeat(2000005)+'"}').toString('base64url');
 for(const token of['x1.abc','j1.'+'a'.repeat(140001),badJson,badMap,bomb]){await assert.rejects(()=>links.load('#map='+token));assert.equal(h.world.map,initial);assert.equal(links.active,false);}
 assert.equal(h.storage.getItem(MAP_KEY),h.raw);assert.deepEqual(h.writes,[]);
});
test('removing a snapshot restores the unsaved local draft and cancellation invalidates pending work',async()=>{
 const h=setup(),draft={...h.world.map,name:'Unsaved course'};h.world.replace(draft,{dirty:true});const links=createWorldLinkLoader(h.world,{decode:async()=>shared()});await links.load('#map=one');await links.load('');assert.equal(h.world.map.name,'Unsaved course');assert.equal(h.world.dirty,true);
 let resolve;const pending=new Promise(r=>resolve=r),cancelled=createWorldLinkLoader(h.world,{decode:()=>pending}),before=h.world.map,p=cancelled.load('#map=late');cancelled.cancel();resolve(shared());assert.equal((await p).stale,true);assert.equal(h.world.map,before);assert.deepEqual(h.writes,[]);
});

test('actual player app applies accepted shared revisions to its existing runtime and retries a blocked link after collection',async()=>{
 const {default:vm}=await import('node:vm'),source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),a=source.indexOf('async function loadPlayerWorld(){'),b=source.indexOf('\n}',a)+2;
 assert.ok(a>=0&&b>a);const h=setup();let pending=true,rebuilds=0,cancels=0;const messages=[],context={playerWorldLinks:createWorldLinkLoader(h.world,{decode:async()=>shared(),canApply:()=>!pending}),location:{hash:'#map=course'},groveMap:h.world.map,runtimeWorldRevision:0,sim:{c:STARTER},cancelLoading(){cancels++;},hold:{cancel(){cancels++;}},applyBuild(){rebuilds++;return true;},toast:message=>messages.push(message)};
 vm.createContext(context);vm.runInContext(source.slice(a,b),context);await context.loadPlayerWorld();assert.equal(rebuilds,0);assert.equal(h.world.map.name,'My local course');assert.equal(cancels,0);
 pending=false;await context.loadPlayerWorld();assert.equal(rebuilds,1);assert.equal(context.groveMap,h.world.map);assert.equal(context.runtimeWorldRevision,h.world.revision);assert.equal(context.groveMap.name,'Shared pinball grove');assert.equal(h.world.readOnly,true);
 await context.loadPlayerWorld();assert.equal(rebuilds,1,'repeated current hash does not reset a throw');context.location.hash='';await context.loadPlayerWorld();assert.equal(rebuilds,2);assert.equal(context.groveMap.name,'My local course');assert.deepEqual(h.writes,[]);assert.equal(h.storage.getItem(MAP_KEY),h.raw);
});
