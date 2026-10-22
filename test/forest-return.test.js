import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGroveMap,createV4Revision4GroveMap,createV4Revision5GroveMap,readGroveMap,saveGroveMap,validateGroveMap,objectBounds,MAP_KEY} from '../src/grove-map.js';
import {RETURN_CASES,RETURN_IDS,comparison} from '../scripts/measure-forest-return.mjs';
const previous=createV4Revision4GroveMap(),current=createV4Revision5GroveMap(),cache=new Map();
function data(c){const key=[c.id,c.draw,c.weapon].join('/');if(!cache.has(key))cache.set(key,comparison(c));return cache.get(key);}
const store=raw=>({raw,writes:0,getItem(k){assert.equal(k,MAP_KEY);return this.raw;},setItem(k,v){assert.equal(k,MAP_KEY);this.raw=v;this.writes++;}});
test('released revision4 remains byte exact; only its untouched default migrates, without writing saved bytes',()=>{
 const bytes=JSON.stringify(previous);assert.equal(createHash('sha256').update(bytes).digest('hex'),'fc21db583254fe54d2b96474707609949887ab9834082eab0a153b2627b88d15');assert.equal(current.starterRevision,5);
 const s=store(bytes);assert.deepEqual(readGroveMap(s),validateGroveMap(createGroveMap()));assert.equal(s.raw,bytes);assert.equal(s.writes,0);
 for(const edit of[m=>{m.name='My return map';},m=>{m.objects[0].points[0].x+=.01;},m=>{m.objects.pop();},m=>{m.objects[0].collision=false;},m=>{m.objects[0].bounce=.5;},m=>{m.tree.height=105;}]){const m=structuredClone(previous);edit(m);const raw=JSON.stringify(m),s=store(raw);assert.deepEqual(readGroveMap(s),validateGroveMap(m));assert.equal(s.raw,raw);assert.equal(s.writes,0);}
 const saved=store(null);saveGroveMap(saved,current);assert.deepEqual(readGroveMap(saved),validateGroveMap(createGroveMap()));assert.equal(saved.writes,1);
});
test('the return adds five visible passive tapered limbs rooted in existing proportionate trees, without opposing recovery roofs',()=>{
 assert.deepEqual(current.objects.slice(0,previous.objects.length),previous.objects);assert.equal(current.objects.length,383);assert.deepEqual(current.tree,previous.tree);assert.deepEqual(current.launch,previous.launch);
 const roots=[['amazon-tree-25-trunk',93,46],['amazon-tree-25-trunk',93,46],['amazon-tree-26-trunk',116,43],['amazon-tree-3-trunk',120,28],['amazon-tree-7-trunk',130,20]];
 current.objects.slice(previous.objects.length).forEach((o,i)=>{assert.equal(o.id,RETURN_IDS[i]);assert.equal(o.type,'polygon');assert.equal(o.collision,true);assert.equal(o.layer,'world');assert.ok(['wood','leaf'].includes(o.material));assert.ok(o.bounce<=.61);const[id,x,h]=roots[i],b=objectBounds(current.objects.find(o=>o.id===id));assert.ok(x>=b.minX&&x<=b.maxX);assert.ok(h-32>=b.minY&&h-32<=b.maxY);assert.ok(Math.hypot(o.points[1].x-o.points[0].x,o.points[1].y-o.points[0].y)<7.3);});
 assert.ok(!current.objects.some(o=>o.id.startsWith('connected-route-')));assert.deepEqual(validateGroveMap(JSON.parse(JSON.stringify(current))),validateGroveMap(current));
});
for(const c of RETURN_CASES)test(`${c.id}/${c.draw}/${c.weapon}: open forest return preserves launch, completion, quiet gaps and useful progress`,()=>{
 const{before,after,metrics:m,terminalSlow}=data(c);assert.equal(after.phase,'finished');assert.equal(after.failure,'');assert.deepEqual(after.preContacts,[]);assert.equal(after.eventSequence,after.events.length);
 for(const key of['x','y','vx','vy','angle','time','speed','energy'])assert.ok(Math.abs(after.release[key]-before.release[key])<=1e-9*Math.max(1,Math.abs(before.release[key])),key+' actual release');
 assert.ok(m.forestDelta<=.05);assert.ok(m.wholeDelta<=.05);assert.ok(after.range>=before.range*.8,'reject a nearly halved run');assert.ok(terminalSlow.after<=terminalSlow.before+.75,'reject a prolonged low-speed terminal tail');
});
test('Medium Air reaches three distinct upward passive receivers instead of its six-second floor fall',()=>{
 const{before,after,metrics:m,terminalSlow}=data({id:'medium',draw:.75,weapon:'air'}),ids=['forest-return-crown-west','forest-return-lower','forest-return-exit'];assert.ok(m.before.forest>6);assert.ok(m.after.forest<3.4);assert.ok(after.range>=before.range);assert.ok(terminalSlow.after<terminalSlow.before);
 for(const id of ids){const e=after.events.find(e=>e.id===id),p=after.physical.find(p=>p.id===id);assert.ok(e,id);assert.ok(!e.power);assert.ok(e.normal.y>.9);assert.ok(e.velocityChange>1);assert.ok(p);assert.ok(p.normal.y>.9);assert.ok(p.closingNormalSpeed>3);}
});
test('intermediate Bear routes also gain shorter forest transfers without losing distance',()=>{
 for(const[draw,weapon]of[[.5,'slingshot'],[.625,'none']]){const{before,after,metrics:m}=data({id:'large',draw,weapon});assert.ok(m.after.forest<m.before.forest-1.5);assert.ok(after.range>=before.range);assert.ok(after.flight<before.flight);}
});
