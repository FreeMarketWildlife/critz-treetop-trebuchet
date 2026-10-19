import test from 'node:test';import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {makeCLink,PhysicalHookScene} from '../src/hook-experiment.js';
import {CritterScene} from '../src/articulated.js';
function contactTrial(direction,dt){const w=new P.World({x:0,y:0}),peg=w.createBody();peg.createFixture(P.Circle(.025),{filterCategoryBits:64,filterMaskBits:128});const link=makeCLink(w,P.Vec2(),0);
 for(let i=0;i<1/dt;i++){link.applyForceToCenter({x:direction*.02,y:0},true);w.step(dt,20,12);}return link.getPosition();}
test('open planar C-link retains inward load and releases through real mouth',()=>{
 const retained=contactTrial(-1,1/600),open=contactTrial(1,1/600);assert.ok(Math.hypot(retained.x,retained.y)<.12);assert.ok(open.x>.2);
 const finer=contactTrial(1,1/1200);assert.ok(Math.abs(finer.x-open.x)<.01);
});
test('physical-hook scene preserves contact fixtures and straps while stepping',()=>{
 const s=new PhysicalHookScene();for(let i=0;i<1200;i++)s.step();assert.equal(s.ropes.length,2);for(let f=s.pouch.getFixtureList();f;f=f.getNext())assert.notEqual(f.getFilterMaskBits(),0);assert.ok(Number.isFinite(s.link.getPosition().y));
 const c=s.clone();assert.equal(c.releaseMode,'physical-hook');assert.equal(c.ropes.length,2);
});

test('hook preview excludes winding and retention state clears after recontact',()=>{
 const s=new PhysicalHookScene({mechanicalWinding:true,initialArm:-3});assert.equal(s.predict(),null);
 s.hookOpen=true;s.freeDuration=.009;const peg=s.arm.getWorldPoint(s.link.getUserData().pegLocal);
 s.link.setPosition(peg);s.step();assert.equal(s.hookOpen,false);assert.equal(s.freeDuration,0);
});

function forceLoad(scene){
 for(let i=0;i<600;i++)scene.step();const torso=scene.parts.find(b=>b.getUserData().id==='torso')??scene.parts[0];
 assert.ok(scene.grab(torso.getWorldCenter()));
 for(let i=0;i<600;i++){scene.move({x:-4.3,y:297});scene.step();}
 for(let i=0;i<1200;i++){const cup=scene.pouch.getPosition();scene.move({x:cup.x,y:cup.y+.85});scene.step();}
 scene.drop();for(let i=0;i<300;i++)scene.step();assert.ok(scene.isLoaded());return scene;
}
test('C-link geometry has overlapping solid beads, initial peg clearance and a real open mouth',()=>{
 const w=new P.World();const link=makeCLink(w,P.Vec2());const beads=[];
 for(let f=link.getFixtureList();f;f=f.getNext()){const shape=f.getShape();beads.push(shape);assert.ok(Math.hypot(shape.m_p.x,shape.m_p.y)-shape.m_radius-.025>.02);}
 beads.sort((a,b)=>Math.atan2(a.m_p.y,a.m_p.x)-Math.atan2(b.m_p.y,b.m_p.x));
 for(let i=1;i<beads.length;i++)assert.ok(Math.hypot(beads[i].m_p.x-beads[i-1].m_p.x,beads[i].m_p.y-beads[i-1].m_p.y)<beads[i].m_radius+beads[i-1].m_radius);
 const first=beads[0],last=beads.at(-1);assert.ok(Math.hypot(first.m_p.x-last.m_p.x,first.m_p.y-last.m_p.y)-first.m_radius-last.m_radius>.06);
 assert.throws(()=>makeCLink(w,P.Vec2(),0,{span:140}),/mouth/);assert.throws(()=>new PhysicalHookScene({hookAngle:NaN}),/hook angle/);
 assert.throws(()=>new PhysicalHookScene({hookAttachmentAngle:180}),/solid C-link/);
});
test('contact release tagging preserves solver velocities and all physical fixtures',()=>{
 for(const overrides of[{}, {releaseHardware:'channel'}]){
 const scene=forceLoad(new PhysicalHookScene(overrides));scene.unlatch();let previous=null;
 for(let i=0;i<3000&&!scene.release;i++){previous=scene.snapshot();scene.step();}
 assert.ok(scene.release);const reference=new PhysicalHookScene(scene.p,scene.rig.id,previous);
 // Run identical dynamics with only the observational release detector omitted.
 CritterScene.prototype.step.call(reference);
 for(const key of Object.keys(scene.center()))assert.ok(Math.abs(scene.center()[key]-reference.center()[key])<1e-9);assert.equal(scene.ropes.length,2);
 for(let i=0;i<scene.parts.length;i++){const a=scene.parts[i].getLinearVelocity(),b=reference.parts[i].getLinearVelocity();assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-9);assert.ok(Math.abs(scene.parts[i].getAngularVelocity()-reference.parts[i].getAngularVelocity())<1e-9);}
 for(let f=scene.pouch.getFixtureList();f;f=f.getNext())assert.notEqual(f.getFilterMaskBits(),0);
 }
});
test('contact hook prediction clones the complete loaded state and matches equivalent launch',()=>{
 const live=forceLoad(new PhysicalHookScene()),before=live.snapshot(),hint=live.predict();assert.deepEqual(live.snapshot(),before);assert.ok(hint.release);assert.ok(hint.points.length>1);
 const actual=live.clone();actual.unlatch();for(let i=0;i<3000&&!actual.release;i++)actual.step();assert.deepEqual(actual.release,hint.release);
});

test('finite channel releases force-loaded masses without deleting its material or straps',()=>{
 for(const species of['lizard','turtle','armadillo']){
  const scene=forceLoad(new PhysicalHookScene({releaseHardware:'channel'},species));scene.unlatch();
  for(let i=0;i<3000&&!scene.release;i++)scene.step();assert.ok(scene.release,`${species} release`);assert.equal(scene.ropes.length,2);
  assert.equal(scene.link.getUserData().id,'channel-bead');assert.ok(Object.values(scene.release.center).every(Number.isFinite));
  if(species==='lizard'){assert.ok(scene.release.center.vx>10);assert.ok(scene.release.center.vy>5);}
  for(let f=scene.pouch.getFixtureList();f;f=f.getNext())assert.notEqual(f.getFilterMaskBits(),0);
 }
});
test('channel launch converges across substeps and prediction preserves its exact loaded state',()=>{
 const scene=forceLoad(new PhysicalHookScene({releaseHardware:'channel'})),saved=scene.snapshot(),hint=scene.predict();assert.deepEqual(scene.snapshot(),saved);assert.ok(hint.release);
 const results=[];for(const dt of[1/600,1/1200]){const live=scene.clone();live.unlatch();for(let i=0;i<5/dt&&!live.release;i++)live.step(dt);assert.ok(live.release);results.push(live.release);}
 assert.deepEqual(results[0],hint.release);const a=results[0].center,b=results[1].center;
 assert.ok(Math.abs(results[0].time-results[1].time)<.01);assert.ok(Math.hypot(a.vx-b.vx,a.vy-b.vy)<.6);
 assert.ok(Math.abs(Math.hypot(a.vx,a.vy)-Math.hypot(b.vx,b.vy))<.1);
});

test('channel exit diagnostic uses actual axial mouth position for each channel length',()=>{
 for(const channelLength of[.12,.4]){
  const scene=new PhysicalHookScene({releaseHardware:'channel',channelLength}),data=scene.link.getUserData();
  const place=axial=>scene.link.setPosition(scene.arm.getWorldPoint({x:data.pegLocal.x+axial*Math.cos(data.channelAlpha),y:data.pegLocal.y+axial*Math.sin(data.channelAlpha)}));
  place(channelLength-.01);assert.equal(scene.hardwareHasEscaped(),false);
  place(channelLength+data.beadRadius+.001);assert.equal(scene.hardwareHasEscaped(),true);
  place(-.4);assert.equal(scene.hardwareHasEscaped(),false);
  const clone=scene.clone();assert.equal(clone.link.getUserData().channelLength,channelLength);
 }
});

test('visible light/medium/heavy hardware matrix clears launch branch from contact-settled snapshots',async()=>{
 const {physicalMatrix,load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js');
 for(const entry of physicalMatrix){
  const scene=new PhysicalHookScene(entry.parameters,entry.species);assert.ok(load(scene));const settled=waitForContact(scene);
  assert.ok(settled.status.contacting&&settled.status.withinEnvelope&&settled.status.relativeSpeed<.35);assert.ok(settled.quiet>=.1);
  const saved=scene.snapshot(),samples=[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,scene.p,entry.species,dt));
  for(const r of samples){assert.ok(r.released);assert.ok(r.center.vx>0&&r.center.vy>0);assert.ok(r.speed>10);assert.equal(r.firstWorldImpact?.surface,'ground');assert.ok(r.maximumEnergyGain<1);assert.ok(r.energyChange<0);assert.equal(r.explicitWork,0);}
  const a=samples[1].center,b=samples[2].center;assert.ok(Math.hypot(a.vx-b.vx,a.vy-b.vy)<.65,entry.class);
 }
});
test('each visible channel setup works after actual torque-limited winding and contacted loading',async()=>{
 const {physicalMatrix,load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js');
 for(const entry of physicalMatrix){const scene=new PhysicalHookScene({...entry.parameters,mechanicalWinding:true,initialArm:-3},entry.species);scene.startWinding(.6);
  for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();assert.equal(scene.phase,'loading');assert.ok(scene.windingWork>100);assert.ok(load(scene));const settled=waitForContact(scene);assert.ok(settled.status.contacting&&settled.quiet>=.1);
  const result=measureSnapshot(scene.snapshot(),scene.p,entry.species,1/600);assert.ok(result.center.vx>0&&result.center.vy>0);assert.ok(['ground','bumper'].includes(result.firstWorldImpact?.surface),'clear the launch branch and reach an authored obstacle');assert.ok(result.maximumEnergyGain<1);assert.equal(result.explicitWork,0);
 }
});

test('stopped V starts with coincident hinges, equal unstretched strands and finite geometry',()=>{
 for(const splitHalfAngle of[Math.PI/36,Math.PI/9,7*Math.PI/36]){
  const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,splitHalfAngle}),a=s.pouchHinge.getAnchorA(),b=s.pouchHinge.getAnchorB();
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-10);assert.ok(Math.abs(s.pouchHinge.getJointAngle())<1e-12);
  for(const rope of s.ropes){const p=rope.getAnchorA(),q=rope.getAnchorB();assert.ok(Math.abs(Math.hypot(q.x-p.x,q.y-p.y)-rope.getMaxLength())<1e-10);assert.equal(rope.getMaxLength(),Math.hypot(s.p.sling,.65));}
  const clone=s.clone();assert.ok(clone.pouchHinge.isLimitEnabled());assert.equal(clone.pouchHinge.getUpperLimit(),0);assert.equal(clone.pouchHinge.getLowerLimit(),-Math.PI);
 }
 for(const p of[{stoppedSplitPouch:'yes'},{splitHalfAngle:NaN},{splitHalfAngle:0},{splitHalfAngle:Math.PI/2}])assert.throws(()=>new PhysicalHookScene(p));
});
test('permanent V stop resists gravity collapse without an actuator or starting stretch impulse',()=>{
 const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true}),initial=s.energy();let peak=0;
 for(let i=0;i<1200;i++){s.step();peak=Math.max(peak,s.energy()-initial);assert.ok(s.pouchHinge.getJointAngle()<.005);assert.ok(s.pouchHinge.getJointAngle()>-.01);}
 assert.ok(peak<.01);assert.ok(s.energy()<initial);assert.equal(s.hookOpen,false);assert.equal(s.ropes.length,2);
});
test('stopped light pouch opens physically after bead exit and preserves permanent contact hardware',async()=>{
 const {stoppedMatrix,load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js'),entry=stoppedMatrix[0];
 const source=new PhysicalHookScene({...entry.parameters,mechanicalWinding:true,initialArm:-3},entry.species);source.startWinding(.6);for(let i=0;i<7200&&source.phase==='winding';i++)source.step();assert.ok(load(source));waitForContact(source);
 const saved=source.snapshot(),results=[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,source.p,entry.species,dt));
 for(const r of results){assert.ok(r.firstHardwareExit<r.firstPanelOpening);assert.equal(r.escapedAtPanelOpening,true);assert.ok(r.panelOpeningAtDeparture>.2);assert.equal(r.firstWorldImpact?.surface,'ground');assert.ok(r.maximumEnergyGain<.01);assert.equal(r.explicitWork,0);}
 const a=results[1].center,b=results[2].center;assert.ok(Math.hypot(a.vx-b.vx,a.vy-b.vy)<.1);
 const s=source.clone(),fixtures=body=>{let n=0;for(let f=body.getFixtureList();f;f=f.getNext())n++;return n;};const before=[fixtures(s.pouch),fixtures(s.flap)];s.unlatch();for(let i=0;i<3000&&!s.release;i++)s.step();assert.ok(s.release);assert.equal(s.ropes.length,2);assert.deepEqual([fixtures(s.pouch),fixtures(s.flap)],before);assert.equal(s.pouchHinge.getUpperLimit(),0);assert.equal(s.pouchHinge.getLowerLimit(),-Math.PI);
});

test('explicit panel mass preserves fixture COM and scales rotational inertia at construction',()=>{
 const base=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true});
 for(const pouchPanelMass of[.25,.5,1]){const scene=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass});
  for(const[left,right]of[[base.pouch,scene.pouch],[base.flap,scene.flap]]){const a={center:P.Vec2()},b={center:P.Vec2()};left.getMassData(a);right.getMassData(b);assert.equal(b.mass,pouchPanelMass);assert.deepEqual(b.center,a.center);assert.ok(Math.abs(b.I-a.I*pouchPanelMass/a.mass)<1e-12);}
  assert.equal(scene.clone().pouch.getMass(),pouchPanelMass);
 }
 for(const p of[{pouchPanelMass:0},{pouchPanelMass:NaN},{pouchPanelMass:3},{pouchPanelMass:.5}])assert.throws(()=>new PhysicalHookScene({...p,stoppedSplitPouch:p.pouchPanelMass===.5?false:true}));
});
test('half-kilogram heavy panels have a bounded causal reference throw at two launch timesteps',async()=>{
 const {stoppedMatrix,load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js'),entry=stoppedMatrix[2];
 const source=new PhysicalHookScene({...entry.parameters,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3,solverVelocityIterations:20,solverPositionIterations:12},entry.species);source.startWinding(.6);for(let i=0;i<7200&&source.phase==='winding';i++)source.step();assert.ok(load(source));waitForContact(source);
 const saved=source.snapshot(),results=[1/600,1/1200].map(dt=>measureSnapshot(saved,source.p,entry.species,dt));
 for(const r of results){assert.ok(r.center.vx>0&&r.center.vy>0);assert.equal(r.firstWorldImpact?.surface,'ground');assert.ok(r.firstHardwareExit<r.firstPanelOpening);assert.equal(r.escapedAtPanelOpening,true);assert.ok(r.maximumEnergyGain<.01);assert.equal(r.explicitWork,0);}
 const a=results[0].center,b=results[1].center;assert.ok(Math.hypot(a.vx-b.vx,a.vy-b.vy)<.5);
});

test('explicit half-kilogram panel matrix retains causal release and passive energy for all three masses',async()=>{
 const {stoppedMatrix,load,waitForContact,measureSnapshot}=await import('../scripts/measure-hook.js');
 for(const entry of stoppedMatrix){const source=new PhysicalHookScene({...entry.parameters,pouchPanelMass:.5,mechanicalWinding:true,initialArm:-3},entry.species);source.startWinding(.6);for(let i=0;i<7200&&source.phase==='winding';i++)source.step();assert.ok(load(source));waitForContact(source);
  const saved=source.snapshot(),samples=[1/300,1/600,1/1200].map(dt=>measureSnapshot(saved,source.p,entry.species,dt));
  for(const r of samples){assert.ok(r.center.vx>0&&r.center.vy>0,entry.class);assert.equal(r.firstWorldImpact?.surface,'ground');assert.ok(r.firstHardwareExit<r.firstPanelOpening);assert.equal(r.escapedAtPanelOpening,true);assert.ok(r.maximumEnergyGain<.01);assert.ok(r.maximumStepEnergyGain<.01);assert.equal(r.explicitWork,0);}
  const a=samples[1].center,b=samples[2].center;assert.ok(Math.hypot(a.vx-b.vx,a.vy-b.vy)<.5);
 }
});
