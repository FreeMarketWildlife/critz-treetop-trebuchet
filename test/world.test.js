import test from 'node:test';
import assert from 'node:assert/strict';
import {config,simulate,predict,flightStep} from '../src/physics.js';
import {world,worldStep,worldFlight,firstCollision,impact} from '../src/world.js';
test('swept point collision detects a thin branch crossed in one step',()=>{
 const hit=firstCollision({x:200,y:130},{x:201,y:90});assert.equal(hit.surface.id,'canopy branch');
 assert.equal(firstCollision({x:250,y:130},{x:251,y:90}),null);
});
test('passive impact removes energy and rejects active materials',()=>{
 const s={x:200,y:105,vx:20,vy:-30},surface=world.surfaces[1],r=impact(s,surface);
 assert.ok(r.vx*r.vx+r.vy*r.vy<s.vx*s.vx+s.vy*s.vy);assert.ok(r.vy>0);
 assert.throws(()=>impact(s,{...surface,restitution:1.1}));
});
test('default flight is deterministic, reaches ground and continues horizontally',()=>{
 const r=simulate(),a=worldFlight(r.release,r.p),b=worldFlight(r.release,r.p);assert.deepEqual(a,b);
 assert.ok(a.collisions.some(c=>c.id==='ground'));
 const first=a.frames.findIndex(f=>f.y===0);assert.ok(first>=0);
 assert.ok(a.frames.slice(first+1).some(f=>f.y===0 && f.x>a.frames[first].x));
 assert.ok(a.frames.every(f=>f.y>=-1e-7));
});
test('ground sliding decelerates without reversing or adding energy',()=>{
 const p=config(),a={x:0,y:0,vx:5,vy:0},b=worldStep(a,p,.01).shot;
 assert.ok(b.x>0 && b.vx<5 && b.vx>0);assert.equal(b.y,0);assert.equal(b.vy,0);
});
test('short hint uses the same dragged flight as live stepping and clips before obstacles',()=>{
 const opts={flightDrag:.02},r=simulate(opts),hint=predict(opts),copy={...r.release};let s={...r.release};
 for(let i=0;i<800;i++)s=flightStep(s,r.p,.001);
 assert.deepEqual(hint.points.at(-1),s);assert.deepEqual(r.release,copy);
 const clipped=predict(opts,()=>true);assert.equal(clipped.points.length,1);
 const ordinary=predict(opts,(a,b)=>Boolean(firstCollision(a,b)));assert.deepEqual(ordinary.points,hint.points);
});
test('quadratic drag reduces vacuum horizontal momentum; world timestep converges',()=>{
 const p=config({flightDrag:.02}),s={x:0,y:200,vx:20,vy:0};assert.ok(flightStep(s,p,.01).vx<20);
 const r=simulate(),a=worldFlight(r.release,r.p,{dt:.002,duration:12}),b=worldFlight(r.release,r.p,{dt:.001,duration:12});
 assert.ok(Math.abs(a.frames.at(-1).x-b.frames.at(-1).x)<.1);
 assert.ok(Math.abs(a.frames.at(-1).y-b.frames.at(-1).y)<.1);
});
test('fixed map preserves the launch corridor and authors staggered canopy opportunities with fall-through gaps',()=>{
 assert.ok(world.bumpers.every(p=>p.x-p.radius>25&&p.radius<2));
 const canopy=world.surfaces.find(s=>s.id==='canopy branch');assert.equal(canopy.y,105);assert.ok(canopy.maxX-canopy.minX<=60);assert.ok(canopy.minX>100);assert.ok(world.canopyTop>100);assert.equal(world.surfaces.filter(s=>s.id==='ground').length,1);const added=world.surfaces.filter(s=>s.id.startsWith('canopy ')&&s.id!=='canopy branch');assert.equal(added.length,7);assert.ok(added.every(s=>s.y>5&&s.y<120&&s.minX>=42&&s.maxX-s.minX<=13));assert.ok(added.every(s=>Object.isFrozen(s)));assert.ok(!added.some(s=>s.minX<30));
});
