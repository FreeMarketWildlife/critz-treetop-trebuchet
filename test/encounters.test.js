import test from 'node:test';
import assert from 'node:assert/strict';
import {createEncounterDirector,encounterPools,hasArrivalClearance} from '../src/encounters.js';
test('seeded active schedule is reproducible and independent of update history',()=>{
 const a=createEncounterDirector('abc'),b=createEncounterDirector('abc'),p={x:30,y:200};
 a.update(1,p);a.update(40,p);assert.deepEqual(a.update(8,p).active,b.update(8,p).active);
 assert.notDeepEqual(a.update(8,p).active,createEncounterDirector('other').update(8,p).active);
});
test('all four biome pools yield passive harmless bounded descriptors',()=>{
 for(const biome of Object.keys(encounterPools))for(let t=0;t<100;t+=.37){
  const {active}=createEncounterDirector(4).update(t,{x:20,y:200},biome);assert.ok(active.length<=8);
  assert.equal(new Set(active.map(e=>e.id)).size,active.length);
  for(const e of active){assert.equal(e.biome,biome);assert.ok(e.harmless);assert.ok(e.mass>0&&e.radius>0);assert.ok(e.material.restitution>=0&&e.material.restitution<=1);assert.ok(e.material.friction>=0);assert.ok([e.x,e.y,e.vx,e.vy].every(Number.isFinite));assert.ok(encounterPools[biome].some(r=>r.kind===e.kind));}
 }
});
test('analytic descriptor velocities match motion and spatial continuity',()=>{
 const d=createEncounterDirector(9),p={x:30,y:80},a=d.update(8,p).active,b=d.update(8.00001,p).active;
 for(const e of a){const n=b.find(x=>x.id===e.id);if(n){assert.ok(Math.abs((n.x-e.x)/.00001-e.vx)<.0001);assert.ok(Math.abs((n.y-e.y)/.00001-e.vy)<.0001);}}
});
test('visibility events occur once, snapshots do not leak mutable state, reset re-enters',()=>{
 const d=createEncounterDirector(1),p={x:0,y:280},first=d.update(8,p);assert.ok(first.active.length>0);assert.equal(first.events.length,first.active.length);
 first.active[0].material.restitution=9;assert.equal(d.update(8,p).events.length,0);assert.ok(d.update(8,p).active.every(e=>e.material.restitution<=1));
 d.reset();assert.ok(d.update(8,p).events.length>0);assert.ok(d.update(30,p).events.some(e=>e.type==='encounter-exit'));
});
test('invalid input is rejected and region inference covers fixed height bands',()=>{
 assert.throws(()=>createEncounterDirector(NaN));const d=createEncounterDirector(0);
 for(const t of [NaN,-1,Infinity])assert.throws(()=>d.update(t,{x:0,y:0}));assert.throws(()=>d.update(0,{x:NaN,y:0}));
 for(const [y,biome] of [[300,'grandfatherTree'],[200,'openSky'],[80,'jungleCanopy'],[0,'forestFloor']])assert.ok(d.update(8,{x:0,y}).active.every(e=>e.biome===biome));
});
test('fresh spawn stream never replays stale observations or rewinds',()=>{
 const d=createEncounterDirector(11),p={x:20,y:200},seen=new Set();let count=0;
 for(let i=0;i<1800;i++){
  const time=i/60,r=d.update(time,p);assert.ok(r.spawns.length<=8);
  for(const e of r.spawns){assert.ok(time-e.spawnTime<=.25);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)>e.radius+1.5);assert.ok(!seen.has(e.id));seen.add(e.id);count++;}
  assert.deepEqual(d.update(time,p).spawns,[]);
 }
 assert.ok(count>0);assert.deepEqual(d.update(.2,p).spawns,[]);
 assert.deepEqual(createEncounterDirector(11).update(3.4,p).spawns,[]);
});
test('spawns respect overlap clearance and arrival sound rate limit',()=>{
 const d=createEncounterDirector(8);let last=-Infinity;
 for(let i=0;i<1200;i++){
  const t=i/120,r=d.update(t,{x:0,y:280});const audible=r.events.filter(e=>e.sound);assert.ok(audible.length<=1);
  if(audible.length){assert.ok(t-last>=.4-1e-12);last=t;}
 }
 const probe=createEncounterDirector(5);let found;
 for(let t=0;t<6&&!found;t+=.01){const r=probe.update(t,{x:0,y:200});if(r.spawns.length)found={time:t,enemy:r.spawns[0]};}
 assert.ok(found);const {time,enemy}=found,r=createEncounterDirector(5).update(time,{x:enemy.x,y:enemy.y},enemy.biome);
 assert.ok(!r.spawns.some(e=>e.id===enemy.id));
});
test('JSON snapshot restores exact mid-run spawns/events through travel and rewind',()=>{
 const seed='continued',a=createEncounterDirector(seed),position=t=>({x:t*12,y:300-t*6});
 for(let i=0;i<600;i++)a.update(i/60,position(i/60));
 const saved=JSON.parse(JSON.stringify(a.snapshot())),copy=structuredClone(saved),b=createEncounterDirector(seed,saved);
 assert.deepEqual(a.snapshot(),b.snapshot());assert.deepEqual(saved,copy);
 // Include biome/cell crossings, expiry, a rewind, and repeated identical time.
 for(const t of [...Array.from({length:1800},(_,i)=>10+i/60),5,5,41,41,42])assert.deepEqual(a.update(t,position(t)),b.update(t,position(t)));
 assert.deepEqual(a.snapshot(),b.snapshot());
 saved.previous.length=0;saved.observed.length=0;assert.deepEqual(a.snapshot(),b.snapshot());
});
test('initial snapshots are JSON-safe detached state and reject invalid restoration',()=>{
 const a=createEncounterDirector(2),saved=JSON.parse(JSON.stringify(a.snapshot()));assert.equal(saved.lastSound,null);
 assert.deepEqual(createEncounterDirector(2,saved).snapshot(),a.snapshot());
 for(const bad of [{...saved,seed:3},{...saved,version:2},{...saved,latestTime:NaN},{...saved,lastSound:Infinity},{...saved,observed:[['id',NaN]]},{...saved,previous:['x',2]}])assert.throws(()=>createEncounterDirector(2,bad));
 a.update(3,{x:0,y:200});a.reset();assert.deepEqual(a.snapshot(),saved);
});
test('seeded long canopy and floor travel reveal every regional kind with clear births',()=>{
 const seen=Object.fromEntries(Object.keys(encounterPools).map(k=>[k,new Set()]));
 for(let seed=0;seed<12;seed++)for(const [biome,y]of [['grandfatherTree',280],['openSky',180],['jungleCanopy',65],['forestFloor',1]]){const d=createEncounterDirector(seed);for(let i=0;i<1800;i++){const t=i/30,p={x:t*9,y,vx:9,vy:0},r=d.update(t,p,biome);assert.ok(r.active.length<=8);for(const e of r.spawns){seen[biome].add(e.kind);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)>e.radius+1.5);}}}
 for(const [biome,pool]of Object.entries(encounterPools))assert.deepEqual([...seen[biome]].sort(),pool.map(e=>e.kind).sort());
});

test('fresh encounters leave a short reaction corridor for fast, descending and reverse travel',()=>{
 const e={x:6,y:0,radius:.6,vx:0,vy:0};assert.equal(hasArrivalClearance(e,{x:0,y:0,vx:20,vy:0}),false);assert.equal(hasArrivalClearance(e,{x:0,y:0,vx:-20,vy:0}),true);assert.equal(hasArrivalClearance({...e,x:0,y:-6},{x:0,y:0,vx:0,vy:-20}),false);assert.equal(hasArrivalClearance({...e,y:4},{x:0,y:0,vx:20,vy:0}),true);assert.equal(hasArrivalClearance({...e,vx:20},{x:0,y:0,vx:20,vy:0}),true);assert.equal(hasArrivalClearance(e,{x:0,y:0,vx:NaN}),false);
});

test('revised encounter catalog remains deterministic across cache eviction and rewind',async()=>{
 const {createHash}=await import('node:crypto'),h=createHash('sha256'),d=createEncounterDirector('eviction-baseline');
 for(let i=0;i<2500;i++){const t=i/15;h.update(JSON.stringify(d.update(t,{x:t*23,y:320-t*3,vx:23,vy:-3})));}
 for(const t of [0,1,2,100,100,200])h.update(JSON.stringify(d.update(t,{x:t*23,y:320-t*3,vx:23,vy:-3})));
 // Iteration 30 sky-specific spacing baseline; includes births/events and cache eviction.
 assert.equal(h.digest('hex'),'8d79f91500b2385e9c90f8c4c9b38de0d73c9c71d2b0ecd5cb2e8b3653f7fe28');
});

test('scheduled silhouettes and motion stay inside their birth biome; skid kinds are regional',()=>{
 const bands={grandfatherTree:[245,320],openSky:[120,245],jungleCanopy:[5,120],forestFloor:[.8,5]};
 assert.equal(encounterPools.grandfatherTree.some(e=>e.shape==='skid'),false);assert.equal(encounterPools.openSky.some(e=>e.shape==='skid'),false);
 for(const [biome,[low,high]]of Object.entries(bands))for(let seed=0;seed<8;seed++){const d=createEncounterDirector(seed);for(let i=0;i<1000;i++){const r=d.update(i/30,{x:i,y:(low+high)/2},biome);for(const e of r.active){assert.ok(e.y-e.radius>=low-1e-10);assert.ok(e.y+e.radius<=high+1e-10);}}}
});

test('dense schedule observes a fixed seeded neighborhood rather than moving recipes with the player',()=>{const a=createEncounterDirector('dense'),b=createEncounterDirector('dense'),p={x:30,y:200};const first=a.update(8,p).active,second=b.update(8,{x:31,y:201}).active;let common=0;for(const e of first){const other=second.find(x=>x.id===e.id);if(other){common++;assert.deepEqual(e,other);}}assert.ok(common>0);});
