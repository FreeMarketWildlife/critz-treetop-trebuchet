import {config,geometry,initialState} from './physics.js';
// The arm remains latched while loading. A short inelastic radial seating assist
// places the pouch on the sling radius, retaining measured tangential velocity only.
export function seatLoad(overrides,position,velocity={x:0,y:0}) {
  const p=config(overrides),tip=geometry(initialState(p),p).tip;
  if(![position.x,position.y,velocity.x,velocity.y].every(Number.isFinite))throw new Error('Invalid loading input');
  const dx=position.x-tip.x,dy=position.y-tip.y,r=Math.hypot(dx,dy),phi=Math.atan2(dy,dx);
  if(Math.abs(r-p.sling)>.35 || phi< -2.3 || phi>-.8)
    throw new Error('Place critter within 0.35 m of the lower sling arc');
  const speed=Math.hypot(velocity.x,velocity.y);
  if(speed>50)throw new Error('Loading speed exceeds 50 m/s input validity limit; place more slowly');
  const rawTangent=-velocity.x*Math.sin(phi)+velocity.y*Math.cos(phi),tangent=Math.max(-2,Math.min(2,rawTangent)),radial=velocity.x*Math.cos(phi)+velocity.y*Math.sin(phi);
  const omega=tangent/p.sling;
  const contributed=p.projectileMass*p.gravity*p.sling*(Math.sin(phi)+1)+.5*p.projectileMass*tangent*tangent;
  return {phi,omega,inputEnergy:contributed,speedCapped:Math.abs(rawTangent)>2,discardedCapEnergy:.5*p.projectileMass*(rawTangent*rawTangent-tangent*tangent),seatingWork:p.projectileMass*p.gravity*(tip.y+p.sling*Math.sin(phi)-position.y),discardedRadialEnergy:.5*p.projectileMass*radial*radial,
    seatingDistance:Math.abs(r-p.sling)};
}
// Fixed-duration physical pendulum settling with locked beam; no pose reset.
export function settleLoad(overrides,load,duration=.25) {
  const p=config(overrides);if(!(duration>=0 && duration<=2))throw new Error('Invalid settling duration');
  let q=[load.phi,load.omega];
  const f=([a,w])=>[w,-p.gravity/p.sling*Math.cos(a)-p.flightDrag/p.projectileMass*p.sling*Math.abs(w)*w];
  for(let t=0;t<duration-1e-12;t+=.001){
    const dt=Math.min(.001,duration-t),add=(v,h)=>q.map((x,i)=>x+h*v[i]);
    const a=f(q),b=f(add(a,dt/2)),c=f(add(b,dt/2)),d=f(add(c,dt));
    q=q.map((x,i)=>x+dt/6*(a[i]+2*b[i]+2*c[i]+d[i]));
    const tension=p.projectileMass*(p.sling*q[1]**2-p.gravity*Math.sin(q[0]));
    if(tension<0 || !q.every(Number.isFinite))throw new Error('Load loses sling tension while settling');
  }
  return {...load,phi:q[0],omega:q[1],remainingEnergy:p.projectileMass*p.gravity*p.sling*(Math.sin(q[0])+1)+.5*p.projectileMass*p.sling**2*q[1]**2};
}
export const loadedSettings=(base,load)=>({...base,initialSling:load.phi,initialSlingSpeed:load.omega});
