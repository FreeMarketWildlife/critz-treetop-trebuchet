import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGroveMap,createV4Revision5GroveMap,createV4Revision6GroveMap,createV4Revision7GroveMap,createV4Revision9GroveMap,readGroveMap,validateGroveMap,MAP_KEY,objectBounds} from '../src/grove-map.js';
import {oakTrunkCommands} from '../src/grove-tree-art.js';
import {RETURN_CASES} from '../scripts/measure-forest-return.mjs';
import {run,quietMetrics} from '../scripts/measure-forest-corridors.mjs';
const old=createV4Revision6GroveMap(),map=createV4Revision7GroveMap(),currentMap=createGroveMap(),cache=new Map();
function pair(c){const key=[c.id,c.draw,c.weapon].join('/');if(!cache.has(key))cache.set(key,{healthy:run(createV4Revision5GroveMap(),c),current:run(currentMap,c)});return cache.get(key);}
test('the74m launch-bay revision retains exact prior defaults and never rewrites edited map saves',()=>{
 assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),'456ce26016c95781b0eb50b7c8863d231074a7ba696762f721bc93e7a668fd53');assert.equal(map.starterRevision,7);assert.deepEqual(map.tree,old.tree);assert.deepEqual(map.launch,old.launch);assert.equal(map.objects.length,old.objects.length);
 const stored=raw=>({getItem(k){assert.equal(k,MAP_KEY);return raw;},setItem(){assert.fail('startup must not write saved maps');}}),raw=JSON.stringify(old);
 assert.deepEqual(readGroveMap(stored(raw)),validateGroveMap(currentMap));assert.equal(JSON.stringify(old),raw);
 for(const edit of[m=>{m.name='My74m oak';},m=>{m.objects[0].points[0].x-=.01;},m=>{m.objects.pop();},m=>{m.tree.height=73;},m=>{m.objects[0].collision=false;}]){const m=structuredClone(old);edit(m);assert.deepEqual(readGroveMap(stored(JSON.stringify(m))),validateGroveMap(m));}
});
test('a real opening uses solid west limbs below the deck and solid east limbs above the beam, rooted in the visible trunk',()=>{
 const leader=Math.max(...oakTrunkCommands(map.tree,0).flatMap(([, ...coords])=>coords.filter((_,i)=>i%2))),changed=map.objects.filter((o,i)=>JSON.stringify(o)!==JSON.stringify(old.objects[i]));assert.equal(changed.length,32);
 for(const o of map.objects){const prior=old.objects.find(p=>p.id===o.id);if(!o.id.startsWith('oak-'))assert.deepEqual(o,prior);else{assert.equal(o.collision,prior.collision);assert.equal(o.layer,prior.layer);assert.equal(o.material,prior.material);assert.equal(o.bounce,prior.bounce);assert.ok(objectBounds(o).maxY+map.launch.y<=map.tree.height);}}
 for(const side of['west','east'])for(let row=0;row<4;row++){
  const o=map.objects.find(o=>o.id===`oak-scaffold-${row}-${side}`),root={x:(o.points[0].x+o.points.at(-1).x)/2,y:(o.points[0].y+o.points.at(-1).y)/2};assert.equal(o.collision,true);assert.equal(o.layer,'world');assert.ok(Math.abs(root.x-map.tree.trunkX)<1e-10);assert.ok(root.y+map.launch.y<leader);
  if(side==='west')assert.ok(objectBounds(o).maxY<0);else assert.ok(objectBounds(o).minY+map.launch.y>65);
 }
});
for(const c of RETURN_CASES)test(`${c.id}/${c.draw}/${c.weapon}:75m connected oak clears actual moving hardware and keeps its healthy pin release`,()=>{
 const{healthy,current:s}=pair(c);assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.deepEqual(s.preContacts,[]);assert.equal(s.release.reason,'Release ring cleared the pin');assert.ok(s.release.vx>0&&s.release.vy>0);assert.equal(s.eventSequence,s.events.length);
 for(const key of['x','y','vx','vy','angle','time','speed','energy'])assert.ok(Math.abs(s.release[key]-healthy.release[key])<=1e-9*Math.max(1,Math.abs(healthy.release[key])),key+' real release');
 const conservative=quietMetrics(s),authored=quietMetrics(s,{forestTop:currentMap.tree.height});assert.ok(authored.forest<=conservative.forest+1e-9,'report authored75m and conservative110m bands separately');
});
test('the untouched compressed roof reproduces the Elephant failure while the authored bay releases normally',()=>{
 const c={id:'elephant',draw:.75,weapon:'none'},bad=run(old,c),good=pair(c).current;assert.equal(bad.failure,'Beam overloaded');assert.ok(bad.preContacts.some(c=>c.role==='arm'&&c.id==='oak-scaffold-0-west'));assert.equal(good.failure,'');assert.deepEqual(good.preContacts,[]);assert.ok(good.range>100);
});

test('the retained natural crown migrates only when every saved object is untouched',()=>{
 const old=createV4Revision9GroveMap(),bytes=JSON.stringify(old),store={getItem:()=>bytes,setItem(){assert.fail('read must not write');}};
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'bc857428579c0fa836206c39855c18b2a1ae0a101fb7e73b2d5a1ddc069d188e');
 assert.deepEqual(readGroveMap(store),validateGroveMap(currentMap));assert.equal(JSON.stringify(old),bytes);
 for(const edit of[m=>m.name='My natural crown',m=>m.objects[0].points[0].x+=.01,m=>m.objects[1].collision=!m.objects[1].collision]){const custom=structuredClone(old);edit(custom);assert.deepEqual(readGroveMap({getItem:()=>JSON.stringify(custom)}),validateGroveMap(custom));}
 assert.deepEqual(currentMap.tree,old.tree);assert.equal(currentMap.objects.length,old.objects.length);
 for(const o of currentMap.objects){const prior=old.objects.find(p=>p.id===o.id);for(const k of['collision','layer','material','bounce','radius','kind'])assert.equal(o[k],prior[k],o.id+'/'+k);if(!o.id.startsWith('oak-'))assert.deepEqual(o,prior);}
});
