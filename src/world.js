import {flightStep} from './physics.js';
// One authored layout. Test dimensions/material coefficients are not lore.
const surfaces=[
  {id:'launch branch',y:294,minX:-8,maxX:5,restitution:.2,tangentRetention:.7},
  {id:'canopy branch',y:105,minX:170,maxX:230,restitution:.35,tangentRetention:.8},
  {id:'ground',y:0,minX:-10000,maxX:10000,restitution:.3,tangentRetention:.8}
];
export const world=Object.freeze({bumpers:Object.freeze([{x:32,y:255,radius:1.2},{x:48,y:165,radius:1.1},{x:75,y:260,radius:1.2},{x:110,y:215,radius:1.5},{x:145,y:165,radius:1.4},{x:180,y:90,radius:1.2},{x:230,y:18,radius:1.3}].map(Object.freeze)),launchHeight:300,canopyTop:120,ground:0,
  groundDeceleration:2, surfaces:Object.freeze(surfaces.map(Object.freeze)),
  regions:Object.freeze(['Grandfather Tree branches/leaves → open-air freefall','Long jungle-canopy descent','Ground travel while horizontal momentum remains'])});
export function regionAt(y){return y>world.canopyTop?'Branches / open air':y>world.ground?'Jungle canopy':'Ground';}
// Point projectile against authored, one-way horizontal surfaces; swept crossing avoids tunneling.
export function firstCollision(a,b,layout=world) {
  if(b.y>=a.y)return null;
  const hits=[];
  for(const surface of layout.surfaces){
    if(a.y<surface.y || b.y>surface.y)continue;
    const fraction=(a.y-surface.y)/(a.y-b.y),x=a.x+(b.x-a.x)*fraction;
    if(x>=surface.minX && x<=surface.maxX)hits.push({surface,fraction,x});
  }
  return hits.sort((a,b)=>a.fraction-b.fraction)[0]??null;
}
export function impact(shot,surface) {
  if(surface.restitution<0 || surface.restitution>1 || surface.tangentRetention<0 || surface.tangentRetention>1)
    throw new Error('Passive collision coefficients must lie in [0,1]');
  return {...shot,y:surface.y,vx:shot.vx*surface.tangentRetention,vy:Math.abs(shot.vy)*surface.restitution};
}
export function worldStep(shot,p,dt,layout=world) {
  if(!(dt>0 && dt<=.02))throw new Error('World timestep must be <= 0.02 s');
  if(shot.y<=layout.ground && Math.abs(shot.vy)<.3){
    const speed=Math.abs(shot.vx),sign=Math.sign(shot.vx),duration=Math.min(dt,speed/layout.groundDeceleration);
    return {shot:{x:shot.x+sign*(speed*duration-.5*layout.groundDeceleration*duration**2),y:layout.ground,
      vx:sign*Math.max(0,speed-layout.groundDeceleration*dt),vy:0},collision:null};
  }
  const next=flightStep(shot,p,dt),hit=firstCollision(shot,next,layout);
  if(!hit)return {shot:next,collision:null};
  // Refine time on ballistic/drag path rather than use the chord's approximate crossing time.
  let lo=0,hi=dt;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(flightStep(shot,p,mid||Number.EPSILON).y>=hit.surface.y)lo=mid;else hi=mid;}
  const at=flightStep(shot,p,hi),x=at.x;
  if(x<hit.surface.minX || x>hit.surface.maxX)return {shot:next,collision:null};
  const bounced=impact(at,hit.surface),remaining=dt-hi;
  const result=remaining>1e-10?flightStep(bounced,p,remaining):bounced;
  // Low bounces settle into dissipative ground travel; no extra launch energy.
  if(hit.surface.id==='ground' && bounced.vy<.3){result.y=layout.ground;result.vy=0;}
  return {shot:result,collision:hit.surface.id};
}
export function worldFlight(release,p,{dt=.001,duration=30,layout=world}={}) {
  if(!(dt>0 && dt<=.02) || !(duration>0 && duration<=60))throw new Error('Invalid world time domain');
  let shot={...release};const frames=[{time:0,...shot}],collisions=[];
  for(let i=1;i<=Math.round(duration/dt);i++){
    const next=worldStep(shot,p,dt,layout);shot=next.shot;
    if(!Object.values(shot).every(Number.isFinite))throw new Error('Invalid world flight');
    if(next.collision)collisions.push({time:i*dt,id:next.collision});
    frames.push({time:i*dt,...shot});
    if(shot.y===layout.ground && shot.vx===0 && shot.vy===0)break;
  }
  return {frames,collisions};
}
