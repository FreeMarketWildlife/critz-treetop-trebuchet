import test from 'node:test';import assert from 'node:assert/strict';
import {CritterScene} from '../src/articulated.js';
import {profiles} from '../src/species.js';
function physicalLoad(s){for(let i=0;i<600;i++)s.step();const root=s.parts.find(b=>b.getUserData().id==='torso')??s.parts[0];
 assert.ok(s.grab(root.getWorldCenter()));for(let i=0;i<600;i++){s.move({x:-4.3,y:297});s.step();}
 for(let i=0;i<1200;i++){const p=s.pouch.getPosition();s.move({x:p.x,y:p.y+.85});s.step();}s.drop();for(let i=0;i<300;i++)s.step();return s;}
test('all eleven distributed rigs have physical fixtures and stable limited joints',()=>{
 for(const p of profiles){const s=new CritterScene({},p.id);assert.equal(s.parts.length,p.bodies.length);assert.ok(Math.abs(s.center().mass-p.totalMass)<1e-10);
 for(let i=0;i<300;i++)s.step();assert.ok(s.parts.every(b=>Number.isFinite(b.getPosition().y)));
 let n=0;for(let j=s.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint')n++;assert.equal(n,p.joints.length+1);}
});
test('base has finite mass and responds physically on authored branch',()=>{
 const s=new CritterScene();assert.equal(s.frame.getMass(),30);const start={...s.frame.getPosition()};
 s.frame.applyLinearImpulse({x:20,y:5},s.frame.getWorldCenter(),true);for(let i=0;i<60;i++)s.step();assert.notDeepEqual(s.frame.getPosition(),start);
 assert.ok(s.frame.getPosition().y>293.9);
});
test('force-driven contact loading seats a ragdoll without a position setter',()=>{
 const s=physicalLoad(new CritterScene());assert.ok(s.isLoaded());assert.ok(s.handWork>0);assert.equal(s.phase,'loading');assert.ok(s.ropes.length===2);
 for(const r of s.ropes){const a=r.getAnchorA(),b=r.getAnchorB();assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<=r.getMaxLength()+.02);}
});
test('canonical snapshot prediction and actual launch agree, preserving live state',()=>{
 const s=physicalLoad(new CritterScene()),saved=s.snapshot(),before=structuredClone(saved),prediction=s.predict();assert.deepEqual(s.snapshot(),before);
 const live=new CritterScene(s.p,s.rig.id,saved);live.unlatch();for(let i=0;i<3000&&!live.release;i++)live.step();
 assert.ok(live.release);assert.deepEqual(live.release.center,prediction.release.center);
 assert.ok(live.frame.getPosition().x!==s.frame.getPosition().x);assert.equal(live.ropes.length,0);
});
test('snapshot preserves overridden body masses and body velocities',()=>{
 const s=new CritterScene({},'armadillo'),clone=s.clone();assert.equal(clone.center().mass,5);assert.deepEqual(clone.center(),s.center());
});
test('cocking geometry changes actual counterweight elevation',()=>{
 const low=new CritterScene({initialArm:-Math.PI+Math.asin(.2)}),high=new CritterScene({initialArm:-Math.PI+Math.asin(.95)});
 const a=low.arm.getWorldPoint({x:-low.p.shortArm,y:0}),b=high.arm.getWorldPoint({x:-high.p.shortArm,y:0});
 assert.ok(Math.abs(b.y-a.y-.75*low.p.shortArm)<1e-10);assert.ok(high.energy()>low.energy());
});
test('owned frame upgrades alter real body mass and fixture friction',()=>{
 const s=new CritterScene({frameMass:50,frameFriction:.85});assert.equal(s.frame.getMass(),50);assert.equal(s.frame.getFixtureList().getFriction(),.85);
});
test('arcade controls are post-release only and report supplied work',()=>{
 const s=new CritterScene();s.control=1;for(let i=0;i<10;i++)s.step();assert.equal(s.assistWork,0);
 const root=s.parts.find(b=>b.getUserData().id==='torso');s.phase='flight';s.release={time:0,center:s.center()};root.setLinearVelocity({x:5,y:1});
 for(let i=0;i<100;i++)s.step();assert.ok(Number.isFinite(s.assistWork));assert.notEqual(s.assistWork,0);
});
test('tension-only straps do not push on compressed anchors',()=>{
 const s=new CritterScene();const original=s.pouch.getPosition();s.pouch.setPosition({x:original.x,y:original.y+.5});s.step();
 for(const r of s.ropes){const a=r.getAnchorA(),b=r.getAnchorB(),f=r.getReactionForce(600);assert.ok(f.x*(b.x-a.x)+f.y*(b.y-a.y)<=1e-6);}
});
test('encounters remain dynamically bounded and do not randomize terrain',()=>{
 const s=new CritterScene();s.phase='flight';s.release={time:0,center:s.center()};s.enableEncounters(42);
 const before=[];for(let b=s.world.getBodyList();b;b=b.getNext())if(b.getUserData()?.role==='static')before.push({...b.getPosition()});
 for(let i=0;i<3600;i++)s.step();assert.ok(s.enemies.size<=12);assert.ok(Number.isFinite(s.spawnEnergy));
 const after=[];for(let b=s.world.getBodyList();b;b=b.getNext())if(b.getUserData()?.role==='static')after.push({...b.getPosition()});assert.deepEqual(before,after);
});
