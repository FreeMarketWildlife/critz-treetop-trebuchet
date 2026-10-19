import test from 'node:test';
import assert from 'node:assert/strict';
import { aerodynamicForces as aero } from '../src/glide.js';
const body = { vx: 15, vy: 0, mass: .9, area: .18, pitch: 0, input: 0 };
test('rest and folded membrane produce no aerodynamic force or motor work', () => {
  for (const s of [{...body,vx:0}, {...body,area:0}]) {
    const f=aero(s); assert.equal(Math.hypot(f.fx,f.fy),0); assert.equal(f.torque,0); assert.equal(f.diagnostic.actuatorPower,0);
  }
});
test('lift is perpendicular and drag dissipative for all orientations and controls', () => {
  for(let i=0;i<1000;i++) {
    const s={...body,vx:Math.sin(i)*40,vy:Math.cos(i*3)*40,pitch:i*.17,input:Math.sin(i*.3)};
    const f=aero(s), power=f.fx*s.vx+f.fy*s.vy;
    assert.ok(power<=1e-9); assert.ok(Math.abs(power-f.power)<1e-8);
    assert.ok(Math.hypot(f.fx,f.fy)<=s.mass*35+1e-10);
  }
});
test('right dives and left flares in attached forward flight; stall prevents unlimited lift', () => {
  const right=aero({...body,input:1}),left=aero({...body,input:-.5});
  assert.ok(right.fy<0); assert.ok(left.fy>0);
  const stall=aero({...body,pitch:Math.PI/2}); assert.ok(stall.diagnostic.stalled);
  assert.ok(Math.abs(stall.diagnostic.liftCoefficient)<.01);
});
test('uncapped forces scale with area, density, and speed squared', () => {
  const p={maxAcceleration:1000};
  const f=aero(body,p), a=aero({...body,area:body.area*2},p), v=aero({...body,vx:30},p);
  assert.ok(Math.abs(a.fx/f.fx-2)<1e-10);assert.ok(Math.abs(v.fx/f.fx-4)<1e-10);
  assert.ok(aero(body,{airDensity:0}).fx===0);
});
test('invalid states reject; extreme speed remains bounded and reports limits', () => {
  for(const patch of [{mass:0},{area:-1},{vx:Infinity},{pitch:NaN}])assert.throws(()=>aero({...body,...patch}),RangeError);
  assert.throws(()=>aero(body,{zeroLiftDrag:-1}),RangeError);
  assert.throws(()=>aero({...body,area:1e308}),RangeError);
  const f=aero({...body,vx:1e5,input:2});assert.ok(f.diagnostic.forceLimited&&f.diagnostic.speedLimited&&f.diagnostic.inputLimited);
});
function fly(dt,withAero=true) {
 let x=0,y=100,vx=15,vy=0,energy=9.81*body.mass*y+.5*body.mass*vx*vx,maxGain=0;
 for(let t=0;t<50&&y>0;t+=dt){
  const f=withAero?aero({...body,vx,vy,pitch:-.2}):{fx:0,fy:0};
  // Midpoint integration avoids forward-Euler lift spuriously adding energy.
  const ax=f.fx/body.mass,ay=f.fy/body.mass-9.81;
  const mid=withAero?aero({...body,vx:vx+ax*dt/2,vy:vy+ay*dt/2,pitch:-.2}):{fx:0,fy:0};
  x+=(vx+ax*dt/2)*dt;y+=(vy+ay*dt/2)*dt;vx+=mid.fx/body.mass*dt;vy+=(mid.fy/body.mass-9.81)*dt;
  const next=9.81*body.mass*y+.5*body.mass*(vx*vx+vy*vy);maxGain=Math.max(maxGain,next-energy);energy=next;
 }
 return{x,maxGain,energy};
}
test('fixed-pitch glide extends range over ballistic flight without creating energy; timestep converges',()=>{
 const a=fly(.002),b=fly(.001),vacuum=fly(.001,false);
 assert.ok(a.x>vacuum.x*1.15,`${a.x} vs ballistic ${vacuum.x}`);
 assert.ok(a.maxGain<1e-5);assert.ok(Math.abs(a.x-b.x)<.1);
});
