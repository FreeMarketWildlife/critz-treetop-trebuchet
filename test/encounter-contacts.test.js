import test from 'node:test';import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {createEncounterBody} from '../src/encounter-body.js';import {encounterPools} from '../src/encounters.js';import {CritterScene} from '../src/articulated.js';import {shotReward,economyReducer,createEconomyState} from '../src/economy.js';
const descriptor=(r,extra={})=>({...r,id:'contact',biome:'forestFloor',x:0,y:0,vx:0,vy:0,expiresAt:10,material:r,...extra});
test('capsule mass, friction and conservative radius match actual fixture geometry at every angle',()=>{
 for(const r of [...encounterPools.jungleCanopy,...encounterPools.forestFloor].filter(e=>e.shape==='skid')){
  const w=new P.World(),b=createEncounterBody(w,descriptor(r));assert.ok(Math.abs(b.getMass()-r.mass)<1e-12);let fixtures=0;
  for(let f=b.getFixtureList();f;f=f.getNext()){fixtures++;assert.equal(f.getFriction(),r.friction);assert.equal(f.getRestitution(),r.restitution);const s=f.getShape();if(s.getType()==='circle')assert.ok(s.getCenter().length()+s.getRadius()<=r.radius+1e-12);else for(const v of s.m_vertices)assert.ok(v.length()<=r.radius);}
  assert.equal(fixtures,3);assert.equal(b.getUserData().radius,r.radius);
 }
});
function incoming(recipe){const w=new P.World(P.Vec2(0,0)),b=createEncounterBody(w,descriptor(recipe)),p=w.createDynamicBody({position:P.Vec2(-.25,2),linearVelocity:P.Vec2(3,-8),bullet:true});p.createFixture(P.Circle(.1),{density:.1/(Math.PI*.01),friction:.2,restitution:.1,filterCategoryBits:4,filterMaskBits:32});const before=.5*.1*(3**2+8**2);for(let i=0;i<900;i++)w.step(1/1200);const energy=[p,b].reduce((n,b)=>n+.5*b.getMass()*b.getLinearVelocity().lengthSquared()+.5*b.getInertia()*b.getAngularVelocity()**2,0);assert.ok(energy<=before+1e-8);return p.getLinearVelocity();}
test('passive skid gives a forward low rebound while fungus gives a stronger bounce',()=>{
 const skid=incoming(encounterPools.forestFloor.find(e=>e.shape==='skid')),bounce=incoming(encounterPools.forestFloor.find(e=>e.shape==='cap'));
 assert.ok(skid.x>2.2);assert.ok(skid.y>=0&&skid.y<1);assert.ok(bounce.y>3);assert.ok(Math.hypot(bounce.x,bounce.y)>5);assert.ok(bounce.y>skid.y+3);
});
test('multi-fixture impacts obey shared cooldown, repeated contacts earn once per recorded shot',()=>{
 const s=new CritterScene({},'mouse');s.phase='flight';const r=encounterPools.jungleCanopy.find(e=>e.shape==='skid'),b=createEncounterBody(s.world,descriptor(r,{x:500,y:65,biome:'jungleCanopy'}));s.enemies.set('contact',b);const pose=s.parts.map(b=>({b,p:{...b.getPosition()},a:b.getAngle()})),origin=s.center();
 const drop=()=>{for(const {b,p,a}of pose){b.setPosition(P.Vec2(p.x-origin.x+500,p.y-origin.y+67));b.setAngle(a);b.setLinearVelocity(P.Vec2(3,-8));b.setAngularVelocity(0);}b.setPosition(P.Vec2(500,65));b.setAngle(0);b.setLinearVelocity(P.Vec2(0,0));b.setAngularVelocity(0);};
 const times=[];for(let trial=0;trial<2;trial++){drop();for(let i=0;i<600;i++){s.step();for(const e of s.events.splice(0))if(e.type==='impact'){times.push(s.elapsed);assert.equal(e.material,'leaf');}}assert.equal(s.impactCount,trial+1);}
 assert.equal(times.length,2);assert.ok(times[1]-times[0]>=.08);assert.deepEqual(shotReward({distance:0,impacts:s.impactCount}),{points:50,bells:9});
 const action={type:'record-shot',shotId:'capsule-repeat',distance:0,impacts:s.impactCount},earned=economyReducer(createEconomyState(),action);assert.equal(economyReducer(earned,action),earned);assert.equal(earned.points,50);assert.equal(earned.bells,9);
 assert.deepEqual(shotReward({distance:0,impacts:1000000}),shotReward({distance:0,impacts:50}));
});
test('burst contacts cannot bypass the 80ms impact cooldown with capsule seams or many limbs',()=>{
 const s=new CritterScene({},'mouse');s.phase='flight';const r=encounterPools.jungleCanopy.find(e=>e.shape==='skid'),b=createEncounterBody(s.world,descriptor(r,{x:500,y:65}));s.enemies.set('contact',b);const c=s.center(),pose=s.parts.map(p=>({b:p,p:{...p.getPosition()},a:p.getAngle()})),times=[];
 for(let pulse=0;pulse<40;pulse++){
  for(const {b,p,a}of pose){b.setPosition(P.Vec2(p.x-c.x+500,p.y-c.y+65.4));b.setAngle(a);b.setLinearVelocity(P.Vec2(0,-8));b.setAngularVelocity(0);}b.setPosition(P.Vec2(500,65));b.setAngle(0);b.setLinearVelocity(P.Vec2(0,0));b.setAngularVelocity(0);
  for(let i=0;i<24;i++){s.step();for(const e of s.events.splice(0))if(e.type==='impact')times.push(s.elapsed);}
 }
 assert.ok(times.length>3);assert.ok(times.length<40);for(let i=1;i<times.length;i++)assert.ok(times[i]-times[i-1]>=.08-1e-10);assert.ok(s.impactCount<=Math.ceil(s.elapsed/.08));
});
test('capsule fixtures and warning metadata survive exact snapshot continuation',()=>{
 const s=new CritterScene(),r=encounterPools.forestFloor.find(e=>e.shape==='skid'),b=createEncounterBody(s.world,descriptor(r,{x:500,y:2}));s.enemies.set('contact',b);s.spawnEnergy+=s.bodyEnergy(b);const a=s.clone();assert.equal(a.enemies.size,1);assert.deepEqual(a.enemies.get('contact').getUserData(),b.getUserData());assert.ok(Math.abs(a.enemies.get('contact').getMass()-r.mass)<1e-12);
 for(let i=0;i<300;i++){s.step();a.step();}assert.deepEqual(a.enemies.get('contact').getPosition(),b.getPosition());assert.equal(a.energy(),s.energy());assert.equal(a.spawnEnergy,s.spawnEnergy);
});
test('dense recycling removes only distant receding births early and accounts for their signed energy',()=>{
 for(const [dx,vx,removed]of [[21,10,true],[14,10,false],[21,-10,false]]){const s=new CritterScene();s.phase='flight';s.elapsed=1;s.release={time:0};s.encounters={update:()=>({spawns:[]})};const c=s.center(),r=encounterPools.forestFloor[0],b=createEncounterBody(s.world,descriptor(r,{x:c.x+dx,y:c.y,vx,spawnTime:0,expiresAt:2}));s.enemies.set('contact',b);const before=s.energy(),energy=s.bodyEnergy(b);s.updateEncounters();assert.equal(s.enemies.size,removed?0:1);assert.ok(Math.abs((before-s.energy())-(removed?energy:0))<1e-7);assert.equal(s.despawnEnergy,removed?energy:0);}
});
test('two actual encounter contacts inside one score cooldown both receive post-contact state',()=>{
 const s=new CritterScene({},'mouse');s.phase='flight';const c=s.center();for(const b of s.parts){const p=b.getPosition();b.setPosition(P.Vec2(p.x-c.x+500,p.y-c.y+67));b.setLinearVelocity(P.Vec2(0,-8));}
 for(const [i,x]of [[0,499.8],[1,500.2]]){const b=createEncounterBody(s.world,{id:'target'+i,kind:'test',shape:'circle',radius:.2,mass:100,x,y:65,vx:0,vy:0,expiresAt:10,material:{friction:.2,restitution:.1}});s.enemies.set('target'+i,b);}
 const seen=new Map();s.world.on('post-solve',(contact,impulse)=>{if(impulse.normalImpulses.reduce((a,b)=>a+b,0)>.08)for(const f of [contact.getFixtureA(),contact.getFixtureB()])if(f.getBody().getUserData()?.role==='enemy')seen.set(f.getBody().getUserData().id,s.elapsed);});for(let k=0;k<600&&seen.size<2;k++)s.step();assert.equal(seen.size,2);assert.ok(Math.max(...seen.values())-Math.min(...seen.values())<.08);for(const [id,t]of seen)assert.equal(s.enemies.get(id).getUserData().lastContact,t);assert.equal(s.impactCount,1);
});
test('lighter waxleaf yields under a heavy tilted contact while conserving momentum and losing total energy',()=>{
 const recipe=encounterPools.jungleCanopy.find(r=>r.kind==='waxleaf skid');assert.equal(recipe.mass,1.2);
 function contact(mass){const w=new P.World(P.Vec2()),leaf=createEncounterBody(w,descriptor(recipe,{mass}));leaf.setAngle(.48);const payload=w.createDynamicBody({position:P.Vec2(-.5,2),linearVelocity:P.Vec2(3,-8),bullet:true});payload.createFixture(P.Circle(.25),{density:2.4/(Math.PI*.25**2),friction:.2,restitution:.1,filterCategoryBits:4,filterMaskBits:32});for(let i=0;i<900;i++)w.step(1/1200);const bodies=[leaf,payload],px=bodies.reduce((n,b)=>n+b.getMass()*b.getLinearVelocity().x,0),energy=bodies.reduce((n,b)=>n+.5*b.getMass()*b.getLinearVelocity().lengthSquared()+.5*b.getInertia()*b.getAngularVelocity()**2,0);assert.ok(Math.abs(px-2.4*3)<1e-8);assert.ok(energy<.5*2.4*(3**2+8**2));return payload.getLinearVelocity().x;}
 assert.ok(contact(recipe.mass)>contact(4)+.8);
});
test('a supported heavy payload does not score resting gravity load as repeated impacts',()=>{
 const s=new CritterScene();s.phase='flight';for(const b of s.parts)b.setType('static');const target=createEncounterBody(s.world,{id:'support',kind:'test',shape:'circle',radius:.2,mass:100,x:500,y:.2,vx:0,vy:0,expiresAt:99,material:{friction:.2,restitution:0}});s.enemies.set('support',target);const payload=s.world.createDynamicBody({position:P.Vec2(500,.6)});payload.setUserData({role:'part',id:'test-weight'});payload.createFixture(P.Circle(.2),{density:5/(Math.PI*.2**2),friction:.2,restitution:0,filterCategoryBits:4,filterMaskBits:33});for(let i=0;i<1200;i++)s.step();assert.equal(s.impactCount,0);assert.equal(target.getUserData().lastContact,undefined);let supported=false;for(let e=payload.getContactList();e;e=e.next)if(e.other===target&&e.contact.isTouching())supported=true;assert.ok(supported);assert.ok(payload.getLinearVelocity().length()<.01);
});

test('collision refinement covers rotated multi-fixture encounters beyond the first fixture skin',()=>{
 for(const r of [encounterPools.forestFloor.find(e=>e.geometry==='dome'),encounterPools.jungleCanopy.find(e=>e.shape==='skid')]){
  const s=new CritterScene({collisionSubsteps:true}),c=s.center();s.phase='flight';
  for(const b of s.parts){const p=b.getPosition();b.setPosition(P.Vec2(500+p.x-c.x,65+p.y-c.y));b.setLinearVelocity(P.Vec2(8,0));}
  const b=createEncounterBody(s.world,descriptor(r,{x:500,y:66.1}));b.setAngle(Math.PI/2);s.enemies.set('contact',b);
  assert.ok(b.getFixtureList().getShape().getRadius()<r.radius);assert.equal(s.collisionRegion(1/600),true);
  b.setPosition(P.Vec2(500,70));assert.equal(s.collisionRegion(1/600),false);
 }
});
