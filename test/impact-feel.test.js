import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';

const bough={id:'bounce-bough',name:'Bounce bough',type:'polygon',points:[{x:15,y:0},{x:160,y:0},{x:160,y:-.5},{x:15,y:-.5}],material:'leaf',layer:'world',collision:true,bounce:.8};
function flying({x=30,y=2,vx=10,vy=-7,objects=[bough]}={}){
 const s=new BuildSimulation({...STARTER,drag:0},{map:{...createGroveMap(),objects}});s.fire();
 s.shot.setPosition({x:x/s.L,y:y/s.L});s.shot.setLinearVelocity({x:vx*s.T/s.L,y:vy*s.T/s.L});s.detach('impact fixture');return s;
}
function advance(s,seconds){for(let i=0;i<seconds*600;i++)s.step(1/600);return s;}

test('a compound-body bounce emits one cue at the resolved surface with real normal speed',()=>{
 const s=advance(flying(),.65),hits=s.contactEvents.filter(e=>e.id===bough.id);
 assert.equal(hits.length,1);assert.equal(s.contacts,1);assert.ok(s.real(s.shot).vy>3,'the authored elastic bough produces a genuine rebound');
 const hit=hits[0];assert.ok(Math.abs(hit.y)<.01,'feedback sits at the branch surface, not the body center');
 assert.ok(Math.abs(hit.normal.x)<1e-12&&Math.abs(hit.normal.y-1)<1e-12);assert.ok(hit.normalSpeed>8&&hit.normalSpeed<11);assert.ok(hit.velocityChange>7);assert.ok(hit.strength>.6&&hit.strength<1);
});
test('fast sliding and resting support cannot count fixture seams as new bounce chains',()=>{
 const s=advance(flying({y:.043,vx:18,vy:0}),.65);
 assert.ok(s.real(s.shot).x>40,'the body really slid at speed along the branch');assert.ok(s.shotContacts.size>0);
 assert.equal(s.contacts??0,0);assert.equal(s.contactEvents.length,0);
 advance(s,5);assert.equal(s.contactEvents.length,0,'quiet support remains quiet after long sliding');
});
test('impact observation leaves physical motion, angular momentum and energy unchanged',()=>{
 const observed=flying(),silent=flying();silent.observeImpact=()=>{};silent.resolveImpact=()=>{};
 for(let i=0;i<600;i++){
  observed.step(1/600);silent.step(1/600);
  assert.deepEqual(observed.snapshot(),silent.snapshot());
  assert.equal(observed.shot.getAngularVelocity(),silent.shot.getAngularVelocity());
 }
 assert.ok(observed.contactEvents.length>0);assert.equal(silent.contactEvents.length,0);
});
test('pre-release mechanism and exact measured release do not depend on impact observation',()=>{
 const a=new BuildSimulation(STARTER,{map:createGroveMap()}),b=new BuildSimulation(STARTER,{map:createGroveMap()});
 b.observeImpact=()=>{};b.resolveImpact=()=>{};a.setDraw(1);b.setDraw(1);a.fire();b.fire();
 for(let i=0;i<2400&&!a.release;i++){a.step(1/600);b.step(1/600);assert.deepEqual(a.snapshot(),b.snapshot());}
 assert.ok(a.release);assert.deepEqual(a.release,b.release);assert.equal(a.contactEvents.length,0);assert.equal(b.contactEvents.length,0);
});

test('a gentle encounter touch still punctuates its explicit arcade power exactly once',()=>{
 const hopper={id:'hopper',name:'Leaf hopper',type:'enemy',kind:'hopper',x:30,y:0,radius:.07,material:'bumper',layer:'world',collision:true,bounce:.88};
 const s=advance(flying({y:.105,vx:0,vy:-.1,objects:[hopper]}),.15);
 assert.ok(s.real(s.shot).vy>7,'the established encounter power still fires');
 assert.equal(s.contactEvents.length,1);assert.equal(s.contacts,1);assert.equal(s.contactEvents[0].kind,'hopper');
 assert.equal(s.contactEvents[0].power,true);assert.ok(s.contactEvents[0].velocityChange>8);assert.ok(s.contactEvents[0].strength>.6);
});

function floorArrival(vx,vy,baseline=false){
 const s=flying({y:-599.4,vx,vy:-vy,objects:[]});
 if(baseline)s.configureFlightContact=()=>{};
 return s;
}
function payloadEnergy(s){
 const b=s.shot,v=b.getLinearVelocity(),p=b.getWorldCenter(),m=b.getMass(),I=b.getInertia()-m*b.getLocalCenter().lengthSquared();
 return .5*m*s.M*(v.x*v.x+v.y*v.y)*s.L+.5*I*s.M*s.L*s.L*(b.getAngularVelocity()/s.T)**2+m*s.M*GRAVITY*(p.y*s.L-s.groundY);
}

test('weak, medium and strong forest-floor arrivals rebound farther while dissipating energy and settling',()=>{
 for(const [vx,vy]of [[4,3],[12,7],[24,12]]){
  const a=floorArrival(vx,vy,true),b=floorArrival(vx,vy),startX=b.real(b.shot).x,initial=payloadEnergy(b);
  let oldPeak=0,newPeak=0,previous=initial,seq=0;
  for(let i=0;i<3600&&(a.phase==='flight'||b.phase==='flight');i++){
   a.step(1/240);b.step(1/240);
   if(a.contactEvents.length===1)oldPeak=Math.max(oldPeak,a.real(a.shot).y-a.groundY);
   if(b.contactEvents.length===1)newPeak=Math.max(newPeak,b.real(b.shot).y-b.groundY);
   const energy=payloadEnergy(b);assert.ok(energy<=initial*1.001,'a passive bounce cannot create payload energy');
   if(b.contactSequence>seq){seq=b.contactSequence;assert.ok(energy<=previous*1.001,'successive impacts decay');previous=energy;}
  }
  assert.ok(newPeak>oldPeak*1.15,`${vx} m/s: clear rebound height improvement`);
  assert.ok(b.real(b.shot).x-startX>(a.real(a.shot).x-startX)*1.5,`${vx} m/s: retain travel through ground contacts`);
  assert.equal(b.phase,'finished');assert.ok(b.time<12);assert.equal(b.failure,'');assert.ok(b.contacts>=a.contacts);
 }
});
test('the released forest-floor material leaves all pre-release mechanism states and launch records exact',()=>{
 for(const draw of [.5,.75,1]){
  const a=new BuildSimulation(STARTER),b=new BuildSimulation(STARTER);b.configureFlightContact=()=>{};
  a.setDraw(draw);b.setDraw(draw);a.fire();b.fire();
  for(let i=0;i<2400&&!a.release;i++){a.step(1/600);b.step(1/600);assert.deepEqual(a.snapshot(),b.snapshot());}
  assert.ok(a.release);assert.deepEqual(a.release,b.release);
 }
});
test('a player-authored surface keeps its bounce, friction and complete physical motion',()=>{
 const authored={...bough,bounce:.21},a=flying({objects:[authored]}),b=flying({objects:[authored]});b.configureFlightContact=()=>{};
 for(let i=0;i<1200;i++){a.step(1/600);b.step(1/600);assert.deepEqual(a.snapshot(),b.snapshot());assert.equal(a.shot.getAngularVelocity(),b.shot.getAngularVelocity());}
 assert.ok(a.contactEvents.length>0);assert.deepEqual(a.contactEvents,b.contactEvents);
});
