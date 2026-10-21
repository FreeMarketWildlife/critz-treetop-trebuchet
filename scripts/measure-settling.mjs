/** Bounded physical-settling timeline. No solver/material overrides or benchmarks.
 * Run node scripts/measure-settling.mjs. Outputs JSON; does not read/write saves.
 */
import {BuildSimulation} from '../src/build-physics.js';
import {scaledPreset} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
const round=n=>Number(n.toFixed(6));
function prepared({animal='mouse',height,down=0,spin=0}){
 const sim=new BuildSimulation({...scaledPreset(animal),drag:0},{map:{...createGroveMap(),objects:[]}});sim.fire();
 let bottom=Infinity;for(let f=sim.shot.getFixtureList();f;f=f.getNext())for(const p of f.getShape().m_vertices)bottom=Math.min(bottom,p.y*sim.L);
 const restHeight=-bottom+.01;
 sim.shot.setPosition({x:100/sim.L,y:(sim.groundY+(height??restHeight))/sim.L});sim.shot.setLinearVelocity({x:0,y:-down*sim.T/sim.L});sim.shot.setAngularVelocity(spin*sim.T);sim.detach('Controlled settling timeline');return sim;
}
function measure(name,input,limit=55){
 const s=prepared(input),impacts=[];let seq=0,firstContact=null,lastAboveOne=0,lastAboveSettle=0,lastRimAboveOne=0,highSpinSlowCenterSeconds=0,peak=0,currentImpact=null;
 const radius=Math.hypot(s.animal.length,s.animal.width)*.55;
 for(let i=0;i<limit*240&&s.phase==='flight';i++){
  s.step(1/240);const q=s.real(s.shot),v=s.shot.getLinearVelocity(),speed=Math.hypot(v.x,v.y)*s.L/s.T,rim=Math.abs(s.shot.getAngularVelocity()/s.T)*radius;
  if(speed>1)lastAboveOne=s.time;if(speed>.16)lastAboveSettle=s.time;if(rim>1)lastRimAboveOne=s.time;
  if(speed<.16&&rim>.5)highSpinSlowCenterSeconds+=1/240;
  if(s.contactEvents.length)firstContact??=s.contactEvents[0].time;
  if(s.contactSequence>seq){
   if(currentImpact)currentImpact.nextApexHeight=round(peak);
   seq=s.contactSequence;peak=0;
   const event=s.contactEvents.at(-1);currentImpact={index:seq,time:round(s.time),normalSpeed:round(event.normalSpeed),postContactSpeed:round(speed),omega:round(s.shot.getAngularVelocity()/s.T)};impacts.push(currentImpact);
  }
  if(currentImpact)peak=Math.max(peak,q.y-s.groundY);
 }
 if(currentImpact)currentImpact.nextApexHeight=round(peak);
 return{name,input,phase:s.phase,time:round(s.time),failure:s.failure,firstContact:round(firstContact??0),lastCenterSpeedAboveOne:round(lastAboveOne),lastCenterSpeedAboveSettleThreshold:round(lastAboveSettle),lastRimSpeedAboveOne:round(lastRimAboveOne),aftermathAfterLastOne:round(s.time-lastAboveOne),aftermathAfterLastSettleThreshold:round(s.time-lastAboveSettle),highSpinSlowCenterSeconds:round(highSpinSlowCenterSeconds),restDwell:round(s.elapsedSettled),impacts};
}
console.log(JSON.stringify({limitSeconds:55,tests:[measure('high-fall',{height:599,down:5}),measure('tiny-drop',{down:.3,spin:3}),measure('recoverable-hop',{height:.05,down:-3}),measure('slow-center-spinning-whale',{animal:'whale',spin:.5}),measure('hard-spinning-whale',{animal:'whale',height:10,down:5,spin:4})]},null,2));
