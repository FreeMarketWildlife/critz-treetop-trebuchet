// Retained V3 world: these archived art/contact/journey regressions deliberately
// keep their original geometry. V4 coverage lives in grove-proportioned and scale tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER,scaledPreset,validateBuild} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';
import {createV3GroveMap as createGroveMap,createLegacyGroveMap,createProportionedGroveMap} from '../src/grove-map.js';
import {escapeAltitude,spaceWorldDescriptor,spaceCrossingFraction,validateSpaceEscape} from '../src/space-policy.js';

const map=createGroveMap();
function nearBoundary({world=map,vy=30,above=-.01,vx=10,x=500,failure=''}={}){
 const sim=new BuildSimulation(STARTER,{map:world});sim.setDraw(1);assert.equal(sim.fire(),true);sim.detach('Released for boundary test');
 sim.failure=failure;
 sim.shot.setTransform({x:x/sim.L,y:(escapeAltitude(world)-world.launch.y+above)/sim.L},.4);
 sim.shot.setLinearVelocity({x:vx*sim.T/sim.L,y:vy*sim.T/sim.L});sim.shot.setAngularVelocity(2*sim.T);
 return sim;
}
function escape(options){const sim=nearBoundary(options);sim.step(1/60);assert.equal(sim.phase,'escaped');return sim;}
const close=(actual,expected,tolerance=1e-8)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);

test('arcade boundary comes from actual world top, above reduced gravity and custom crown',()=>{
 assert.equal(escapeAltitude(map),3000);assert.equal(escapeAltitude(createLegacyGroveMap()),1500);
 assert.equal(escapeAltitude({...map,height:600,tree:{...map.tree,height:1800}}),2000);
 assert.equal(escapeAltitude({...createLegacyGroveMap(),height:1500,tree:{height:1800}}),1900);
 const descriptor=spaceWorldDescriptor(map);assert.deepEqual(descriptor,{version:3,height:3000,treeHeight:800,launchY:600});assert.equal(escapeAltitude(descriptor),3000);
 assert.throws(()=>escapeAltitude({...descriptor,launchY:300}),/Invalid space world/);
});
test('only a finite upward crossing qualifies, including an exact boundary endpoint',()=>{
 assert.equal(spaceCrossingFraction({y:2399},{y:2401,vy:3},3000,600),.5);
 assert.equal(spaceCrossingFraction({y:2399},{y:2400,vy:3},3000,600),1);
 for(const [a,b]of[[{y:2401},{y:2399,vy:-3}],[{y:2401},{y:2402,vy:3}],[{y:2399},{y:2401,vy:0}],[{y:NaN},{y:2401,vy:3}]])assert.equal(spaceCrossingFraction(a,b,3000,600),null);
 const seated=new BuildSimulation(STARTER,{map});seated.shot.setTransform({x:0,y:2500/seated.L},0);seated.step(.1);assert.equal(seated.phase,'ready');assert.equal(seated.spaceEscape,null);
 for(const options of[{vy:-30,above:.01},{vy:30,above:1}]){const sim=nearBoundary(options);sim.step(1/60);assert.equal(sim.phase,'flight');assert.equal(sim.spaceState,'bound');}
 const invalid=nearBoundary();invalid.phase='invalid';const before=invalid.real(invalid.shot);invalid.step(.1);assert.equal(invalid.spaceEscape,null);assert.deepEqual(invalid.real(invalid.shot),before);
});
test('real solver crossing latches once at the exact boundary before pending fields or powers',()=>{
 for(const world of[map,createLegacyGroveMap()]){
  const sim=nearBoundary({world});sim.pendingEncounters.push({kind:'pod'});sim.pendingImpacts.set('old',{});
  sim.flushImpacts=()=>assert.fail('No queued impact after completion');sim.applyEncounters=()=>assert.fail('No queued encounter after completion');sim.environment.step=()=>assert.fail('No environmental push after completion');
  sim.step(1/60);const e=sim.spaceEscape;
  assert.equal(sim.phase,'escaped');assert.equal(sim.spaceState,'escaped');assert.equal(sim.gravityFactor,0);assert.equal(sim.shot.getGravityScale(),0);
  assert.equal(e.altitude,escapeAltitude(world));assert.equal(e.payload.y+world.launch.y,e.altitude);assert.ok(e.time>0&&e.time<sim.T/480);assert.ok(e.payload.vy>0);
  assert.equal(sim.maxX,e.distance);assert.equal(sim.maxY,e.height);assert.equal(e.height,e.payload.y);
  assert.deepEqual(validateSpaceEscape(e),e);for(const item of[e,e.payload,e.release,e.world])assert.ok(Object.isFrozen(item));
  assert.equal(sim.pendingEncounters.length,0);assert.equal(sim.pendingImpacts.size,0);assert.equal(sim.shotContacts.size,0);
  for(let f=sim.shot.getFixtureList();f;f=f.getNext())assert.equal(f.getFilterMaskBits(),0);
  assert.equal(sim.events.filter(e=>e.type==='space-escape').length,1);
 }
});
test('zero-gravity drift preserves velocity and rotation but cannot inflate frozen result or retrigger',()=>{
 const sim=escape(),start=sim.real(sim.shot),stats={distance:sim.maxX,height:sim.maxY,packet:structuredClone(sim.spaceEscape)},events=sim.events.length,contacts=sim.contactEvents.length;
 const hardware=sim.counterPoint(),startTime=sim.time;
 for(let i=0;i<4001;i++)sim.step(.1);
 const end=sim.real(sim.shot),elapsed=sim.time-startTime;
 close(end.x,start.x+start.vx*elapsed,1e-6);close(end.y,start.y+start.vy*elapsed,1e-5);close(end.vx,start.vx);close(end.vy,start.vy);close(end.angle,start.angle+2*elapsed,1e-6);
 close(Math.sin(sim.shot.getAngle()),Math.sin(end.angle));
 assert.ok(sim.time>400,'completion drifts past the ordinary flight timeout');assert.equal(sim.phase,'escaped');assert.equal(sim.maxX,stats.distance);assert.equal(sim.maxY,stats.height);assert.deepEqual(sim.spaceEscape,stats.packet);
 assert.equal(sim.events.length,events);assert.equal(sim.contactEvents.length,contacts);assert.deepEqual(sim.counterPoint(),hardware);assert.ok(sim.trail.length<=1200);
 const before=sim.snapshot();for(const dt of[0,-1,NaN,Infinity])sim.step(dt);assert.deepEqual(sim.snapshot(),before);
 const x=sim.real(sim.shot).x;sim.step(1000);close(sim.real(sim.shot).x-x,start.vx*.1,1e-6,'oversized dt is bounded');
});
test('completed high-speed drift bypasses ordinary coordinate failure without changing eligible stats',()=>{
 const sim=escape({x:99999}),packet=structuredClone(sim.spaceEscape);
 for(let i=0;i<20;i++)sim.step(.1);
 assert.ok(sim.real(sim.shot).x>100000);assert.equal(sim.phase,'escaped');assert.equal(sim.failure,'');assert.deepEqual(sim.spaceEscape,packet);
});
test('actual cord/beam failures can escape; invalid configuration and numerical results cannot restore',()=>{
 for(const failure of['Sling cord snapped','Beam overloaded'])assert.equal(escape({failure}).spaceEscape.failure,failure);
 const record=escape().spaceEscape;
 for(const failure of['Configuration exceeded the solver’s stable range','Numerical energy check failed — change the geometry or mass balance','The pouch opening is too small for this volunteer.'])assert.throws(()=>validateSpaceEscape({...record,failure}),/invalid flight/i);
 const sim=nearBoundary();sim.shot.setTransform({x:100001/sim.L,y:2400/sim.L},0);sim.step(1/60);assert.equal(sim.phase,'invalid');assert.equal(sim.spaceEscape,null);
});
test('restore uses the captured world, preserves absolute altitude after a map change and is idempotent',()=>{
 const source=escape(),record=structuredClone(source.spaceEscape),changed=createLegacyGroveMap(),restored=new BuildSimulation(STARTER,{map:changed});
 assert.equal(restored.restoreSpaceEscape(record),true);assert.equal(restored.phase,'escaped');assert.equal(restored.gravityFactor,0);close(restored.real(restored.shot).y+changed.launch.y,record.altitude);
 assert.deepEqual(restored.spaceEscape,record);assert.equal(restored.maxX,record.distance);assert.equal(restored.maxY,record.height);assert.equal(restored.shot.getGravityScale(),0);
 restored.step(.1);const before=restored.snapshot(),eventCount=restored.events.length;
 assert.equal(restored.restoreSpaceEscape(record),false);assert.deepEqual(restored.snapshot(),before);assert.equal(restored.events.length,eventCount);
 assert.throws(()=>restored.restoreSpaceEscape({...record,distance:record.distance+1}),/different space run/);assert.deepEqual(restored.snapshot(),before);
 const foreign=new BuildSimulation({...STARTER,animal:'frog'},{map});const foreignBefore=foreign.snapshot();assert.throws(()=>foreign.restoreSpaceEscape(record),/volunteer/);assert.deepEqual(foreign.snapshot(),foreignBefore);
 const active=nearBoundary();assert.throws(()=>active.restoreSpaceEscape(record),/before starting/);assert.equal(active.phase,'flight');
});
test('malformed crossing packets are rejected before simulation or caller data changes',()=>{
 const record=structuredClone(escape().spaceEscape),changes=[r=>r.version=2,r=>r.threshold++,r=>r.altitude++,r=>r.world.launchY=300,r=>r.payload.y++,r=>r.payload.vy=-1,r=>r.payload.omega=Infinity,r=>r.distance=NaN,r=>r.height=0,r=>r.release.speed++,r=>r.release.time=r.time+1,r=>r.animal='frog',r=>r.grams++];
 for(const mutate of changes){const invalid=structuredClone(record);mutate(invalid);const before=structuredClone(invalid),sim=new BuildSimulation(STARTER,{map}),snapshot=sim.snapshot();assert.throws(()=>sim.restoreSpaceEscape(invalid));assert.deepEqual(sim.snapshot(),snapshot);assert.deepEqual(invalid,before);}
 const extra={...record,unrelated:'private'};assert.equal('unrelated' in validateSpaceEscape(extra),false);
 const copy=validateSpaceEscape(record);copy.payload.x++;assert.notEqual(copy.payload.x,record.payload.x);
});
test('ordinary weak through full launches retain the pre-space release and journey measurements',()=>{
 // Recorded against catalogue checkpoint before the space change, no loading
 // overrides, boost impulses or flight-state mutations in these ordinary runs.
 const fixtures=[
  [.2,1.032825367978916,2.4700103870809422,-173.23341933447875,1.339450687509251,2.2137457315044897,3.091116303214673,'Sling cord snapped'],
  [.5,.4783870469260915,9.62447767257058,43.172540708093344,12.100185448783122,5.1119103065364175,4.439186468783265,''],
  [.75,.47961368037974816,17.780290111413475,29.943092711793653,40.18153220414628,6.123813944003376,10.896184968831552,''],
  [1,.5262257516187019,22.00489271100042,38.9447744404875,75.10968158531033,9.039132998945039,16.47491391606241,'']
 ];
 for(const[draw,time,speed,angle,distance,height,end,failure]of fixtures){const sim=new BuildSimulation(STARTER,{map});sim.setDraw(draw);sim.fire();for(let i=0;i<90*120&&['swing','flight'].includes(sim.phase);i++)sim.step(1/120);assert.equal(sim.phase,'finished');assert.equal(sim.spaceEscape,null);assert.equal(sim.spaceState,'bound');for(const[a,b]of[[sim.release.time,time],[sim.release.speed,speed],[sim.release.angle,angle],[sim.maxX,distance],[sim.maxY,height],[sim.time,end]])close(a,b,1e-9);assert.equal(sim.failure,failure);}
});

for(const world of[map,createProportionedGroveMap()])test(`a catalogue-valid endgame machine reaches space with one physical drop on V${world.version}`,()=>{
 const build=validateBuild({...scaledPreset('whale'),name:`Continental elephant space V${world.version}`,animal:'elephant',counterGrams:15e9,pivotHeight:220,beamWidth:3,pinAngle:world.version===4?5:-15});
 const sim=new BuildSimulation(build,{map:world});assert.deepEqual(sim.facts.warnings,[]);sim.setDraw(0);sim.loading=createPayloadLoading(sim);assert.equal(sim.loading.loadKeyboard(),true);
 let frames=0;while(!sim.loading.loaded&&frames++<1800)sim.loading.step(1/60);assert.equal(sim.loading.loaded,true);
 frames=0;while(sim.drawFraction<1&&frames++<3600){sim.wind(1/60);sim.loading.step(1/60);}assert.equal(sim.drawFraction,1);
 assert.equal(sim.loading.loaded,true,'gentle cargo motion preserves loose support after winding');
 let supported=0;frames=0;
 while(supported<30&&frames++<360){sim.loading.step(1/60);supported=sim.loading.loaded?supported+1:0;}
 assert.equal(supported,30);assert.equal(sim.fire(),true);
 frames=0;while(['swing','flight'].includes(sim.phase)&&frames++<60*60)sim.step(1/60);
 assert.equal(sim.phase,'escaped');assert.equal(sim.failure,'');assert.equal(sim.spaceEscape.altitude,3000);assert.ok(world.version===4?sim.release.speed>180&&sim.release.angle>60&&sim.release.angle<70:sim.release.speed>200&&sim.release.angle>35&&sim.release.angle<50);
 assert.ok(sim.spaceEscape.payload.vy>(world.version===4?20:100));assert.equal(sim.gravityFactor,0);assert.equal(sim.contactEvents.length,0);assert.deepEqual(validateSpaceEscape(sim.spaceEscape),sim.spaceEscape);
});
