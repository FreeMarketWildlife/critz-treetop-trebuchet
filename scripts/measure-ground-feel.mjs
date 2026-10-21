/** Bounded game-balance comparison, not a real-material or device benchmark.
 * Run: node scripts/measure-ground-feel.mjs
 * Controls disable only the released-critter forest-floor contact override.
 */
import {BuildSimulation,GRAVITY,FOREST_FLOOR_RESPONSE} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
const rounded=n=>Number(n.toFixed(6));
function payloadEnergy(s){
 const b=s.shot,v=b.getLinearVelocity(),p=b.getWorldCenter(),m=b.getMass(),I=b.getInertia()-m*b.getLocalCenter().lengthSquared();
 return .5*m*s.M*(v.x*v.x+v.y*v.y)*s.L+.5*I*s.M*s.L*s.L*(b.getAngularVelocity()/s.T)**2+m*s.M*GRAVITY*(p.y*s.L-s.groundY);
}
function simulate(s,{originX,seconds=30}={}){
 let first=null,peak=0,lastSeq=0,initial=null,maxEnergy=0;const bounceEnergy=[];
 for(let i=0;i<seconds*240&&['swing','flight'].includes(s.phase);i++){
  s.step(1/240);const p=s.real(s.shot);
  if(s.release){initial??=payloadEnergy(s);maxEnergy=Math.max(maxEnergy,payloadEnergy(s));}
  if(s.contactEvents.length===1)peak=Math.max(peak,p.y-s.groundY);
  if(s.contactSequence>lastSeq){lastSeq=s.contactSequence;bounceEnergy.push(rounded(payloadEnergy(s)/initial));first??={time:rounded(s.time),vx:rounded(p.vx),vy:rounded(p.vy)};}
 }
 return{phase:s.phase,time:rounded(s.time),failure:s.failure,release:s.release?{time:rounded(s.release.time),angle:rounded(s.release.angle),speed:rounded(s.release.speed)}:null,
  distance:rounded(originX===undefined?s.maxX:s.real(s.shot).x-originX),contacts:s.contacts??0,first,firstReboundHeight:rounded(peak),maxPayloadEnergyRatio:rounded(maxEnergy/initial),bounceEnergyRatios:bounceEnergy};
}
const output={profile:FOREST_FLOOR_RESPONSE,limitSeconds:30,arrivals:[],mechanismDraws:[]};
for(const [name,vx,vy]of[['weak',4,3],['medium',12,7],['strong',24,12]])for(const baseline of[true,false]){
 const s=new BuildSimulation({...STARTER,drag:0},{map:{...createGroveMap(),objects:[]}});
 if(baseline)s.configureFlightContact=()=>{};
 s.fire();s.shot.setPosition({x:100/s.L,y:(s.groundY+.6)/s.L});s.shot.setLinearVelocity({x:vx*s.T/s.L,y:-vy*s.T/s.L});s.detach('Controlled ground arrival');
 output.arrivals.push({name,baseline,initial:{vx,vy:-vy,height:.6},...simulate(s,{originX:100})});
}
for(const [name,draw]of[['weak',.5],['medium',.75],['strong',1],['poor-quarter-draw',.25]])for(const baseline of[true,false]){
 const s=new BuildSimulation(STARTER);if(baseline)s.configureFlightContact=()=>{};s.setDraw(draw);s.fire();
 output.mechanismDraws.push({name,draw,baseline,...simulate(s)});
}
console.log(JSON.stringify(output,null,2));
