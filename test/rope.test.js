import test from 'node:test';import assert from 'node:assert/strict';
import{config,simulate}from'../src/physics.js';
import{ropeState,ropeConfig,ropeGeometry,ropeEnergy,ropeStep,ropeLaunch,handForce,ropeImpact,ropePredict}from'../src/rope.js';
test('slack cable transmits no compression and stays attached',()=>{
 const p=ropeConfig(),s=ropeState(p),tip=ropeGeometry(s,p).tip;s.x=tip.x;s.y=tip.y-1;
 const r=ropeStep(s,p,.001,{locked:true});assert.equal(r.tensionImpulse,0);assert.equal(r.state.attached,true);assert.equal(r.state.released,false);
 assert.ok(r.state.y<s.y);assert.equal(r.state.theta,s.theta);
});
test('taut solution converges toward independently derived coupled equations',()=>{
 const p=config(),reference=simulate(),a=ropeLaunch(ropeState(p),p,{dt:.001}),b=ropeLaunch(ropeState(p),p,{dt:.0005});
 const distance=r=>Math.hypot(r.release.vx-reference.release.vx,r.release.vy-reference.release.vy);
 assert.ok(distance(b)<distance(a));assert.ok(distance(b)<.02);
 assert.ok(Math.abs(a.time-b.time)<.00002);
});
test('taut lossless energy error decreases with timestep; no rope stretch',()=>{
 const p=config(),initial=ropeState(p),e=ropeEnergy(initial,p);let errors=[];
 for(const dt of [.001,.0005]){let s={...initial};for(let t=0;t<.8-1e-8;t+=dt){const r=ropeStep(s,p,dt);s=r.state;assert.ok(r.extension<1e-8);assert.ok(r.tensionImpulse>=0);}
 errors.push(Math.abs(ropeEnergy(s,p)-e));}assert.ok(errors[1]<errors[0]);assert.ok(errors[1]<.005);
});
test('capture preserves coordinates and motion and never snaps an outside particle',()=>{
 const p=config(),s=ropeState(p),tip=ropeGeometry(s,p).tip;s.attached=false;s.x=tip.x;s.y=tip.y-p.sling+.15;
 const r=ropeStep(s,p,.001,{locked:true,capture:true});const free=ropeStep(s,p,.001,{locked:true});
 assert.equal(r.captured,true);assert.equal(r.state.x,free.state.x);assert.equal(r.state.y,free.state.y);assert.equal(r.state.vy,free.state.vy);
 const outside={...s,y:tip.y-p.sling-.1};assert.equal(ropeStep(outside,p,.001,{locked:true,capture:true}).captured,false);
});
test('hand is finite and work is reported, with no pointer-velocity injection',()=>{
 const p=config(),s=ropeState(p),F=handForce(s,{x:1e6,y:1e6},p);assert.ok(Math.hypot(F.fx,F.fy)<=80+1e-10);
 const r=ropeStep(s,p,.001,{locked:true,hand:F});assert.ok(Number.isFinite(r.handWork));assert.ok(Math.abs(r.energyChange-r.handWork+r.lossEstimate)<.01);
});
test('prediction via cloned launch state does not mutate the live snapshot',()=>{
 const p=config(),s=ropeState(p),copy={...s};s.y+=.2;s.vx=.5;const saved={...s};
 const a=ropeLaunch(s,p),b=ropeLaunch({...s},p);assert.deepEqual(a,b);assert.deepEqual(s,saved);assert.notDeepEqual(s,copy);
});

test('rope impact removes analytic kinetic energy and transfers impulse to beam',()=>{
 const p=config(),s=ropeState(p),g=ropeGeometry(s,p);s.vx=g.ex*2;s.vy=g.ey*2;
 const before=ropeEnergy(s,p),r=ropeImpact(s,p);assert.ok(r.impulse>0);assert.notEqual(r.state.w,0);
 assert.ok(Math.abs(before-ropeEnergy(r.state,p)-r.loss)<1e-10);
 const inward={...s,vx:-g.ex,vy:-g.ey};assert.equal(ropeImpact(inward,p).impulse,0);
});
test('different force-driven loading histories remain varied and reproducible',()=>{
 const p=config(),initial=ropeState(p);initial.y+=.2;
 const evolve=x=>{let s={...initial};for(let i=0;i<150;i++)s=ropeStep(s,p,.001,{locked:true,hand:handForce(s,{x:s.x+x,y:s.y},p)}).state;return s;};
 const a=evolve(.1),b=evolve(-.1);assert.notDeepEqual(a,b);assert.deepEqual(a,evolve(.1));
 assert.notDeepEqual(ropeLaunch(a,p).release,ropeLaunch(b,p).release);
});
test('mass extremes remain finite or reject explicitly without cable compression',()=>{
 for(const opts of [{counterMass:1000,projectileMass:.1},{counterMass:1,projectileMass:100}]){
  const p=config(opts);let s=ropeState(p);for(let i=0;i<600;i++){const r=ropeStep(s,p,.001);s=r.state;assert.ok(r.extension<1e-7);assert.ok(r.tensionImpulse>=0);}
 }
});
test('locked pendulum numerical residual converges with timestep',()=>{
 const p=config(),initial=ropeState(p);let errors=[];
 for(const dt of [.001,.0005]){let s={...initial};for(let t=0;t<.5-1e-9;t+=dt)s=ropeStep(s,p,dt,{locked:true}).state;
 errors.push(Math.abs(ropeEnergy(s,p)-ropeEnergy(initial,p)));}assert.ok(errors[1]<=errors[0]+1e-10);
});

test('rope preview matches actual release and remains read-only with live free flight',()=>{
 const p=config({flightDrag:.02}),s=ropeState(p);s.y+=.15;s.vx=.4;const copy={...s};
 const preview=ropePredict(s,p),actual=ropeLaunch(s,p);assert.deepEqual(s,copy);assert.deepEqual(preview.release,actual.release);
 assert.equal(preview.points.length,17);assert.equal(ropePredict(s,p,()=>true).points.length,1);
});
