import test from 'node:test';import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';import {CRITTERS,scaledPreset,STARTER} from '../src/build-catalog.js';
import {critterBodyProfile} from '../src/critter-body.js';import {createCritterPerformance} from '../src/critter-performance.js';
import {createPayloadLoading} from '../src/payload-loading.js';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);

test('every species has its own compound collision silhouette, center of mass and distributed inertia',()=>{
 const shapes=new Set(),massCenters=new Set();
 for(const animal of CRITTERS){const sim=new BuildSimulation(scaledPreset(animal.id));sim.fire();const p=critterBodyProfile(animal),center=sim.shot.getLocalCenter();shapes.add(JSON.stringify(p));massCenters.add((center.x*sim.L/animal.length).toFixed(5));near(sim.shot.getMass()*sim.M,animal.grams/1000+sim.pouchMass);assert.ok(sim.shot.getInertia()>0);let count=0;for(let f=sim.shot.getFixtureList();f;f=f.getNext()){count++;assert.ok(f.getUserData().critterPart);}assert.equal(count,p.length);}
 assert.equal(shapes.size,CRITTERS.length);assert.ok(massCenters.size>=9);
});
test('free flight conserves angular momentum and follows center-of-mass ballistics across full rotations',()=>{
 for(const animal of ['mouse','frog','chipmunk','elephant','whale']){const s=new BuildSimulation({...scaledPreset(animal),drag:0});s.fire();s.shot.setTransform({x:20/s.L,y:1000/s.L},.7);s.shot.setLinearVelocity({x:12*s.T/s.L,y:8*s.T/s.L});s.shot.setAngularVelocity(3*s.T);s.detach('test free flight');s.initialEnergy=s.energy();const I=s.shot.getInertia(),momentum=I*s.shot.getAngularVelocity(),a=s.shot.getAngle();
  for(let i=0;i<240;i++)s.step(1/240);
  near(I*s.shot.getAngularVelocity(),momentum,1e-8);near(s.shot.getAngle()-a,3*s.time,1e-8);
 }
});
test('continuous artwork follows the body angle through impacts and never rounds to held cels',()=>{
 let angle=0;const sim={time:0,T:1,shot:{getAngularVelocity:()=>2},release:{time:0},contactEvents:[],real:()=>({angle,vx:3,vy:9})},actor=createCritterPerformance();let previous=actor.update(sim);
 for(let i=1;i<=240;i++){sim.time=i/240;angle=sim.time*2;const current=actor.update(sim);near(current.angle,-angle);near(current.angle-previous.angle,-2/240);previous=current;}
 sim.contactEvents.push({seq:1,time:sim.time,id:'branch',strength:1});const impact=actor.update(sim);near(impact.angle,-angle);sim.time+=1/60;angle+=2/60;const flex=actor.update(sim);assert.ok(flex.squashX>1.05);assert.ok(Math.abs(flex.flex.head)>0);near(flex.squashX*flex.squashY,1);near(flex.angle,-angle);
 const paused=actor.update(sim);assert.deepEqual(actor.update(sim),paused);
});
test('a basket drop remains a loose jointed pose during winding and transfers existing motion on release',()=>{
 for(const animal of ['mouse','frog','chipmunk']){const s=new BuildSimulation({...STARTER,animal});s.setDraw(0);const l=s.loading=createPayloadLoading(s);l.loadKeyboard();for(let i=0;i<240;i++)l.step(1/120);assert.equal(l.loaded,true);for(let i=0;i<361;i++){s.wind(1/120);l.step(1/120);}assert.equal(s.drawFraction,1);assert.ok(l.loaded,animal);assert.ok(l.parts.some(p=>Math.abs(p.angle)>1e-6));const position=l.position,motion=l.motion;assert.ok(s.fire());near(s.real(s.shot).x,position.x);near(s.real(s.shot).y,position.y);near(s.real(s.shot).vx,motion.vx);near(s.real(s.shot).vy,motion.vy);near(s.shot.getAngularVelocity()/s.T,motion.omega);for(let i=0;i<1800&&!s.release;i++)s.step(1/600);assert.ok(s.release,animal);assert.equal(s.failure,'');}
});

test('basket guidance stays absent during idle play and paused scenes',async()=>{
 const {createBuildRenderer}=await import('../src/build-art.js'),ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:50})},{get:(target,key)=>target[key]??(()=>{}),set:(target,key,value)=>{target[key]=value;return true;}}),canvas={dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>({width:390,height:844})};
 const original=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});
 try{const s=new BuildSimulation(STARTER);s.setDraw(0);s.loading=createPayloadLoading(s);const r=createBuildRenderer(canvas);r.draw(s,{labels:false});assert.equal(canvas.dataset.loadingHint,'false');for(let i=0;i<730;i++)s.loading.step(1/120);assert.equal(s.loading.hint,false);r.draw(s,{labels:false});assert.equal(canvas.dataset.loadingHint,'false');r.draw(s,{labels:false,paused:true});assert.equal(canvas.dataset.loadingHint,'false');}finally{if(original)Object.defineProperty(globalThis,'devicePixelRatio',original);else delete globalThis.devicePixelRatio;}
});

test('flight gestures react to rise and dive while recovering expressions without losing bruises or body angle',()=>{
 let velocity={vx:18,vy:8,angle:1.2};const s={time:0,T:1,phase:'flight',shot:{getAngularVelocity:()=>2},release:{time:0},contactEvents:[],real:()=>({...velocity})},actor=createCritterPerformance();let cel=actor.update(s);assert.equal(cel.airPose,'rise');assert.equal(cel.angle,-1.2);
 for(let i=1;i<=3;i++){s.time=i;s.contactEvents.push({seq:i,id:'branch-'+i,time:i,strength:.7});cel=actor.update(s);}assert.equal(cel.tier,2);assert.ok(cel.pose.startsWith('bonk'));
 velocity={vx:20,vy:-9,angle:4.7};s.time=4;cel=actor.update(s);assert.equal(cel.airPose,'dive');assert.equal(cel.pose,'flying');assert.equal(cel.tier,2);assert.equal(cel.angle,-4.7);assert.deepEqual(actor.update(s),cel,'paused gestures remain exactly frozen');
});
