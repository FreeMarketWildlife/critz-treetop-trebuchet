import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGroveMap,createV4Revision3GroveMap,readGroveMap,validateGroveMap,objectBounds,MAP_KEY} from '../src/grove-map.js';
import {FOREST_CASES,run,quietMetrics} from '../scripts/measure-forest-corridors.mjs';
const previous=createV4Revision3GroveMap(),current=createGroveMap(),cache=new Map();
const store=raw=>({raw,writes:0,getItem(k){assert.equal(k,MAP_KEY);return this.raw;},setItem(){this.writes++;assert.fail('reading a map must never write');}});
function comparison(c){
 const key=[c.id,c.draw,c.weapon].join('/');if(cache.has(key))return cache.get(key);
 const before=run(previous,c),after=run(current,c,{trackedIds:['corridor-return-fork']}),data={before,after,beforeMetrics:quietMetrics(before),afterMetrics:quietMetrics(after)};cache.set(key,data);return data;
}
test('released revision3 stays byte exact; only untouched defaults migrate without overwriting saved maps',()=>{
 const raw=JSON.stringify(previous);assert.equal(createHash('sha256').update(raw).digest('hex'),'06e741415ebe9f37514fb943a548e0d9e56ac7e11c3a58f7f8fc9a1e07569817');
 const s=store(raw);assert.deepEqual(readGroveMap(s),validateGroveMap(current));assert.equal(s.raw,raw);assert.equal(s.writes,0);assert.equal(current.starterRevision,4);
 for(const edit of[m=>{m.name='My grove';},m=>{m.objects.pop();},m=>{m.objects[0].points[0].x-=.01;},m=>{m.objects[0].bounce=.47;},m=>{m.objects[0].collision=false;}]){const m=structuredClone(previous);edit(m);const bytes=JSON.stringify(m),s=store(bytes);assert.deepEqual(readGroveMap(s),validateGroveMap(m));assert.equal(s.raw,bytes);assert.equal(s.writes,0);}
});
test('the only new map object is a visible tapered passive fork attached inside an existing45m tree',()=>{
 assert.deepEqual(current.objects.slice(0,-1),previous.objects);assert.equal(current.objects.length,378);
 const fork=current.objects.at(-1),trunk=current.objects.find(o=>o.id==='amazon-tree-50-trunk'),a=objectBounds(fork),b=objectBounds(trunk);
 assert.equal(fork.id,'corridor-return-fork');assert.equal(fork.type,'polygon');assert.equal(fork.collision,true);assert.equal(fork.layer,'world');assert.equal(fork.material,'wood');assert.equal(fork.bounce,.5);
 assert.ok(a.maxX>=b.minX&&a.maxX<=b.maxX);assert.ok(a.minY>b.minY&&a.maxY<b.maxY);assert.equal(b.maxY+current.launch.y,45);assert.ok(a.maxX-a.minX<8);assert.ok(a.maxY-a.minY<2);assert.equal(current.tree.height,110);
});
for(const c of FOREST_CASES)test(`${c.id}/${c.draw}/${c.weapon}: forest-return correction preserves a clean launch and does not worsen measured quiet gaps`,()=>{
 const {before,after,beforeMetrics:b,afterMetrics:a}=comparison(c);
 assert.equal(after.phase,'finished');assert.equal(after.failure,'');assert.deepEqual(after.preContacts,[]);assert.equal(after.eventSequence,after.events.length);
 for(const key of['x','y','vx','vy','angle','time','speed','energy'])assert.ok(Math.abs(after.release[key]-before.release[key])<=1e-9*Math.max(1,Math.abs(before.release[key])),key+' release continuity');
 assert.equal(after.release.reason,'Release ring cleared the pin');assert.ok(a.forest<=b.forest+.05);assert.ok(a.whole<=b.whole+.05);
 assert.ok(after.range>=before.range*.8,'do not buy a smaller gap with a collapsed run');assert.ok(after.flight<=before.flight+.05,'do not add prolonged aftermath');
});
test('full Elephant gains an actual passive upward return impact and shorter forest gap without tiny powered targets',()=>{
 const {before,after,beforeMetrics:b,afterMetrics:a}=comparison({id:'elephant',draw:1,weapon:'none'}),hit=after.events.find(e=>e.id==='corridor-return-fork');
 assert.ok(hit);assert.ok(hit.normalSpeed>10);assert.ok(hit.velocityChange>10);assert.ok(hit.normal.y>.9);assert.ok(!hit.power);assert.equal(after.physical.length,1);assert.equal(after.physical[0].part,'trunk');
 assert.ok(a.forest<b.forest-.5);assert.ok(after.range>before.range*.9);assert.ok(after.flight<before.flight);
});
