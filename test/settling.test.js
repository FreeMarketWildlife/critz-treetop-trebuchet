import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {scaledPreset} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';

function restingScene(animal='mouse',{height,up=0,spin=0}={}){
 const s=new BuildSimulation({...scaledPreset(animal),drag:0},{map:{...createGroveMap(),objects:[]}});s.fire();
 let bottom=Infinity;for(let f=s.shot.getFixtureList();f;f=f.getNext())for(const p of f.getShape().m_vertices)bottom=Math.min(bottom,p.y*s.L);
 s.shot.setPosition({x:100/s.L,y:(s.groundY+(height??-bottom+.01))/s.L});
 s.shot.setLinearVelocity({x:0,y:up*s.T/s.L});s.shot.setAngularVelocity(spin*s.T);s.detach('Settling regression');return s;
}
const speed=s=>{const v=s.shot.getLinearVelocity();return Math.hypot(v.x,v.y)*s.L/s.T;};

test('tiny ground contact chatter naturally settles without a prolonged inactive tail',()=>{
 const s=restingScene('mouse',{up:-.3,spin:3});let lastMoving=0;
 for(let i=0;i<3*240&&s.phase==='flight';i++){s.step(1/240);if(speed(s)>.16)lastMoving=s.time;}
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time<2);assert.ok(s.time-lastMoving<1.1);
 assert.ok(Math.abs(s.shot.getAngularVelocity()/s.T)<.01);assert.ok(s.contactEvents.length<3,'quiet support is not a bounce chain');
});
test('a recoverable low-altitude hop stays live through its apex and return to ground',()=>{
 const s=restingScene('mouse',{height:.05,up:3});let peak=0,firstLanding=null;
 for(let i=0;i<.7*240;i++){
  s.step(1/240);peak=Math.max(peak,s.real(s.shot).y-s.groundY);
  if(s.contactEvents.length)firstLanding??=s.time;
  assert.equal(s.phase,'flight','the recoverable hop must not end because its apex briefly has low speed');
 }
 assert.ok(peak>.5);assert.ok(firstLanding>.6,'the first recovery is a real airborne arc');
});
test('a large spinning body can recover from low translation before settling',()=>{
 const s=restingScene('whale',{spin:.5});let slowSpinning=false;
 for(let i=0;i<5*240&&s.phase==='flight';i++){
  s.step(1/240);const rim=Math.abs(s.shot.getAngularVelocity()/s.T)*s.animal.length*.5;
  if(speed(s)<.16&&rim>.5){slowSpinning=true;assert.equal(s.phase,'flight','angular motion still has a meaningful contact path');}
 }
 assert.ok(slowSpinning,'fixture actually exercises slow translation with recoverable rotation');
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time<4);assert.ok(Math.abs(s.shot.getAngularVelocity()/s.T)<.01);
});
test('a 599 m fall retains passive measured rebound energy, decays naturally and ends shortly after rest',()=>{
 const height=599,s=restingScene('mouse',{height,up:-5});let firstContact=null,firstReboundPeak=0,lastAboveOne=0,firstIncomingEnergy=null,firstOutgoingEnergy=null,firstOutgoing=null,previous=s.real(s.shot);const apices=[];
 const kinetic=()=>{const m=s.shot.getMass()*s.M,v=s.shot.getLinearVelocity(),w=s.shot.getAngularVelocity()/s.T,I=(s.shot.getInertia()-s.shot.getMass()*s.shot.getLocalCenter().lengthSquared())*s.M*s.L*s.L;return .5*m*(v.x*v.x+v.y*v.y)*s.L+.5*I*w*w;};
 for(let i=0;i<50*240&&s.phase==='flight';i++){
  const incoming=kinetic();s.step(1/240);const p=s.real(s.shot);
  if(s.contactEvents.length&&firstContact===null){firstContact=s.contactEvents[0].time;firstIncomingEnergy=incoming;firstOutgoingEnergy=kinetic();firstOutgoing=p;}
  if(s.contactEvents.length===1)firstReboundPeak=Math.max(firstReboundPeak,p.y-s.groundY);
  if(previous.vy>0&&p.vy<=0&&p.y-s.groundY>.2)apices.push(p.y-s.groundY);
  if(speed(s)>1)lastAboveOne=s.time;previous=p;
 }
 const freeFall=(-5+Math.sqrt(25+2*GRAVITY*height))/GRAVITY;assert.ok(Math.abs(firstContact-freeFall)<.05,'time to first contact follows the real fall');
 // A compound mouse converts part of its drop into sideways motion and spin.
 // Its body rise need not equal restitution squared times drop height.
 assert.ok(firstOutgoingEnergy>firstIncomingEnergy*.15&&firstOutgoingEnergy<firstIncomingEnergy*.7,'contact retains substantial energy without injecting any');
 assert.ok(firstReboundPeak>height*.1);const ballisticPeak=firstOutgoing.y-s.groundY+firstOutgoing.vy**2/(2*GRAVITY);assert.ok(Math.abs(firstReboundPeak-ballisticPeak)<.1,'the rebound apex follows measured outgoing velocity');
 assert.ok(apices.length>=3);assert.ok(apices[1]<apices[0]);assert.ok(apices.at(-1)<apices[0]*.02,'later recoveries decay instead of becoming infinite micro-bounces');
 assert.equal(s.phase,'finished');assert.equal(s.failure,'');assert.ok(s.time>firstContact);assert.ok(s.time-lastAboveOne<1.5,'duration comes from real rebound and sliding motion, not idle chatter');
});
