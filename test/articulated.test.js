import test from 'node:test';import assert from 'node:assert/strict';
import {CritterScene,cockedConfig,gripParameters} from '../src/articulated.js';
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

test('cocking height respects beam/sling clearance and rejects impossible setups',()=>{
 const p=cockedConfig({longArm:3.6,sling:2.9},.95);assert.ok(-Math.sin(p.initialArm)<.8);
 assert.doesNotThrow(()=>new CritterScene(p));assert.throws(()=>cockedConfig({longArm:20,sling:5},.95));
});
test('winding supplies bounded motor work and latches without assigning pose',()=>{
 const s=new CritterScene({mechanicalWinding:true,initialArm:-3});for(let i=0;i<600;i++)s.step();
 const E=s.energy();s.startWinding(.6);let maximumTorque=0,lastAngle=s.arm.getAngle();
 for(let i=0;i<7200 && s.phase==='winding';i++){s.step();maximumTorque=Math.max(maximumTorque,Math.abs(s.pivot.getMotorTorque(600)));assert.ok(Math.abs(s.arm.getAngle()-lastAngle)<.01);lastAngle=s.arm.getAngle();}
 assert.equal(s.phase,'loading');assert.ok(maximumTorque<=1800+1e-6);assert.ok(s.windingInput>100);assert.ok(s.windingBraking>=0);
 assert.ok(s.energy()-E<=s.windingWork+3);assert.ok(Math.abs(s.energy()-E-s.windingWork)<10);
 assert.ok(Math.abs(-s.p.shortArm*Math.sin(s.arm.getAngle())-.48)<.01);
});
test('insufficient motor torque cannot fake the requested winding height',()=>{
 const s=new CritterScene({mechanicalWinding:true,initialArm:-3,windingTorque:10});s.startWinding(.9);for(let i=0;i<1800;i++)s.step();assert.notEqual(s.phase,'loading');assert.ok(Math.abs(-s.p.shortArm*Math.sin(s.arm.getAngle())-.72)>.05);
});

test('motor inputs reject unbounded or invalid actuator settings',()=>{
 for(const windingTorque of [-10,NaN,Infinity,10001])assert.throws(()=>new CritterScene({windingTorque}));
 assert.throws(()=>new CritterScene({mechanicalWinding:'yes'}));
 assert.doesNotThrow(()=>new CritterScene({windingTorque:0,mechanicalWinding:true}));
});

test('deliberate damping and drag work are separate from unexplained solver/contact residual',()=>{
 const s=new CritterScene({armDamping:2,flightDrag:.02});s.pivot.enableLimit(false);
 s.arm.setAngularVelocity(.1);for(const b of s.parts)b.setLinearVelocity({x:3,y:0});
 for(let i=0;i<30;i++)s.step();assert.ok(s.dampingWork<0);assert.ok(s.dragWork<0);
 const clone=s.clone();assert.equal(clone.dampingWork,s.dampingWork);assert.equal(clone.dragWork,s.dragWork);
});

test('axle damping reacts on frame and uses relative angular motion',()=>{
 const s=new CritterScene({armDamping:3}),jointSpeed=.7;
 s.arm.setAngularVelocity(jointSpeed);s.frame.setAngularVelocity(jointSpeed);
 s.step();assert.ok(Math.abs(s.dampingWork)<1e-12,'rigid co-rotation should not incur axle work');
});

test('heavy armadillo physically loads and settles with mass-aware finite hand effort',()=>{
 const s=physicalLoad(new CritterScene({},'armadillo'));assert.ok(s.isLoaded());assert.equal(gripParameters(s.center().mass).maxForce,300);
 assert.ok(s.handWork>0);assert.equal(s.hand,null);
 for(let i=0;i<600;i++)s.step();assert.ok(s.isLoaded());assert.ok(Math.hypot(s.center().vx,s.center().vy)<.2);
 const predicted=s.predict();assert.ok(predicted.release);const actual=s.clone();actual.unlatch();for(let i=0;i<3000&&!actual.release;i++)actual.step();assert.deepEqual(actual.release,predicted.release);
});
test('heavy payload release converges from identical loaded snapshots across hardware',()=>{
 for(const hardware of [{},{counterMass:150},{longArm:3.4}]){
  const loaded=physicalLoad(new CritterScene(hardware,'armadillo'));for(let i=0;i<600;i++)loaded.step();const saved=loaded.snapshot(),releases=[];
  for(const hz of [300,600,1200]){const s=new CritterScene(loaded.p,'armadillo',saved);s.unlatch();for(let i=0;i<hz*5&&!s.release;i++)s.step(1/hz);assert.ok(s.release);assert.ok(s.release.center.vx>0&&s.release.center.vy>0);releases.push(s.release.center);}
  assert.ok(Math.hypot(releases[2].vx-releases[1].vx,releases[2].vy-releases[1].vy)<.25);
 }
});
test('articulated squirrel recovers launch tumble through passive torso forces and torque',()=>{
 const loaded=physicalLoad(new CritterScene({},'flying-squirrel')),s=loaded.clone();s.unlatch();for(let i=0;i<3000&&!s.release;i++)s.step();assert.ok(s.release);
 const torso=s.parts.find(b=>b.getUserData().id==='torso'),initial=Math.abs(torso.getAngularVelocity());assert.ok(initial>1);
 for(let i=0;i<6000;i++)s.step();assert.ok(Math.abs(torso.getAngularVelocity())<initial*.1);assert.ok(s.assistWork<0);assert.ok(s.center().y< s.release.center.y);
});
test('loading diagnostics distinguish proximity from actual contact without changing state',()=>{
 const initial=new CritterScene(),before=initial.snapshot(),status=initial.loadingStatus();assert.equal(status.contacting,false);assert.deepEqual(initial.snapshot(),before);
 const heavy=physicalLoad(new CritterScene({},'armadillo'));for(let i=0;i<600;i++)heavy.step();const ready=heavy.loadingStatus();assert.ok(ready.withinEnvelope);assert.ok(ready.contacting);assert.ok(ready.relativeSpeed<.35);
});
test('solver research iteration options reject unsafe values without changing production defaults',()=>{
 for(const key of ['solverVelocityIterations','solverPositionIterations'])for(const value of[0,-1,1.5,101,NaN,Infinity])assert.throws(()=>new CritterScene({[key]:value}));
 const scene=new CritterScene({solverVelocityIterations:40,solverPositionIterations:30});for(let i=0;i<30;i++)scene.step();assert.ok(Number.isFinite(scene.energy()));
});
