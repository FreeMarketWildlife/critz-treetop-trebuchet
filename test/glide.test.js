import test from 'node:test';
import assert from 'node:assert/strict';
import { aerodynamicForces as aero } from '../src/glide.js';
const body = { vx: 15, vy: 0, mass: .9, area: .22, pitch: 0, input: 0, angularVelocity: 0 };
test('rest and folded membrane produce no aerodynamic force or motor work', () => {
 for(const s of [{...body,vx:0},{...body,area:0}]){
  const f=aero(s);assert.equal(Math.hypot(f.fx,f.fy),0);assert.ok(f.torque===0);assert.equal(f.diagnostic.actuatorPower,0);
 }
});
test('local-airflow lift/drag conserves total power identity for arbitrary tumble and control',()=>{
 let rotationCanGain=false;
 for(let i=0;i<2000;i++){
  const s={...body,vx:Math.sin(i)*40,vy:Math.cos(i*3)*40,pitch:i*.17,input:Math.sin(i*.3),angularVelocity:Math.sin(i*.7)*60};
  const f=aero(s),power=f.fx*s.vx+f.fy*s.vy+f.torque*s.angularVelocity;
  assert.ok(power<=1e-8);assert.ok(Math.abs(power-f.power)<1e-7);
  assert.ok(Math.hypot(f.fx,f.fy)<=s.mass*35+1e-10);
  assert.ok(Math.abs(f.torque)<=s.mass*35*.28+1e-10);
  if(f.diagnostic.rotationalPower>0)rotationCanGain=true;
 }
 // A passive moment can exchange existing rotational/translational energy;
 // requiring each term individually negative would incorrectly forbid it.
 assert.ok(rotationCanGain);
});
test('right creates nose-down moment; left nose-up, stall reduces wing lift',()=>{
 const right=aero({...body,input:1}),left=aero({...body,input:-1});
 assert.ok(right.torque<0);assert.ok(left.torque>0);
 const stalled=aero({...body,pitch:Math.PI/2});assert.ok(stalled.diagnostic.stalled);
 assert.ok(Math.abs(stalled.diagnostic.liftCoefficient)<.01);
});
test('spin at translational rest dissipates angular energy without an actuator',()=>{
 for(const w of [-20,-3,3,20]){
  const f=aero({...body,vx:0,angularVelocity:w});
  assert.ok(f.torque*w<0);assert.ok(f.power<0);assert.ok(f.diagnostic.translationalPower===0);
 }
});
test('uncapped forces and moment scale with area, density and speed squared',()=>{
 const p={maxAcceleration:1000},f=aero(body,p),a=aero({...body,area:body.area*2},p),v=aero({...body,vx:30},p),rho=aero(body,{...p,airDensity:2.45});
 for(const key of ['fx','fy','torque']){assert.ok(Math.abs(a[key]/f[key]-2)<1e-10);assert.ok(Math.abs(v[key]/f[key]-4)<1e-10);assert.ok(Math.abs(rho[key]/f[key]-2)<1e-10);}
 assert.ok(aero(body,{airDensity:0}).fx===0);
});
test('invalid state/coefficient rejects; force and input caps are disclosed',()=>{
 for(const patch of [{mass:0},{area:-1},{vx:Infinity},{pitch:NaN},{angularVelocity:NaN},{area:1e308}])assert.throws(()=>aero({...body,...patch}),RangeError);
 for(const p of [{zeroLiftDrag:-1},{tailAreaFraction:2},{tailArm:-1}])assert.throws(()=>aero(body,p),RangeError);
 const f=aero({...body,vx:1e5,input:2});assert.ok(f.diagnostic.forceLimited&&f.diagnostic.speedLimited&&f.diagnostic.inputLimited);
});
/** Free rigid-body flight, not imposed pitch. RK4 includes translation, rotation,
 * gravity and both aero surfaces; no pitch servo or velocity assignment. */
function fly(dt,{input=0,omega=0,pitch=-.2,inertia=.04,aerodynamics=true}={}){
 let s=[0,100,15,0,pitch,omega],time=0,maxGain=0;
 const energy=s=>body.mass*9.81*s[1]+.5*body.mass*(s[2]**2+s[3]**2)+.5*inertia*s[5]**2;
 const derivative=s=>{
  const f=aerodynamics?aero({...body,vx:s[2],vy:s[3],pitch:s[4],angularVelocity:s[5],input}):{fx:0,fy:0,torque:0};
  return[s[2],s[3],f.fx/body.mass,f.fy/body.mass-9.81,s[5],f.torque/inertia];
 };
 for(;time<60&&s[1]>0;time+=dt){
  const old=energy(s),a=derivative(s),b=derivative(s.map((v,i)=>v+a[i]*dt/2)),c=derivative(s.map((v,i)=>v+b[i]*dt/2)),d=derivative(s.map((v,i)=>v+c[i]*dt));
  s=s.map((v,i)=>v+dt/6*(a[i]+2*b[i]+2*c[i]+d[i]));maxGain=Math.max(maxGain,energy(s)-old);
 }
 return{x:s[0],vx:s[2],vy:s[3],pitch:s[4],omega:s[5],time,maxGain};
}
test('passive tail recovers representative initial tumble, conserves energy, and extends glide',()=>{
 const vacuum=fly(.002,{aerodynamics:false});
 for(const omega of [-3,0,3]){
  const f=fly(.002,{omega});assert.ok(f.x>vacuum.x*3);assert.ok(Math.abs(f.omega)<.01);assert.ok(f.maxGain<1e-5);
 }
});
test('actual rotational dive/flare trajectory and energy budget converge across timesteps',()=>{
 const results=[];
 for(const input of [-1,0,1]){
  const a=fly(.004,{input,omega:3}),b=fly(.002,{input,omega:3}),c=fly(.001,{input,omega:3});
  assert.ok(Math.abs(a.x-c.x)<.1);assert.ok(Math.abs(b.x-c.x)<.05);
  assert.ok(Math.abs(a.pitch-c.pitch)<.01);
  for(const f of [a,b,c])assert.ok(f.maxGain<1e-5);
  results.push(c);
 }
 const [flare,neutral,dive]=results;
 assert.ok(flare.pitch>neutral.pitch&&neutral.pitch>dive.pitch);
 assert.ok(dive.time<neutral.time*.6);assert.ok(flare.time>neutral.time);
 assert.ok(dive.vx>neutral.vx&&neutral.vx>flare.vx);
});
test('pure repeated evaluations do not mutate input or introduce history',()=>{
 const state={...body,angularVelocity:4,input:-.5},copy={...state},a=aero(state),b=aero(state);
 assert.deepEqual(a,b);assert.deepEqual(state,copy);
});
