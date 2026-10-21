import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BuildSimulation} from '../src/build-physics.js';
import {CRITTERS,STARTER,scaledPreset} from '../src/build-catalog.js';
import {createScaleBuild} from '../src/scale-builds.js';
// Expose references only in this in-memory test module. No test-only controller,
// forces, transforms, support flags or alternative solver replace production.
const file=new URL('../src/payload-loading.js',import.meta.url),marker='};basketPoint();sync();return api;';
let source=readFileSync(file,'utf8');assert.ok(source.includes(marker));
source=source.replace(/from (['"])(\.[^'"]+)\1/g,(_,q,path)=>'from '+q+new URL(path,file).href+q);
source=source.replace(marker,"};Object.defineProperty(api,'testPhysics',{value:{world,bodies,basket}});basketPoint();sync();return api;");
const {createPayloadLoading}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function setup(c){const s=new BuildSimulation(c);s.setDraw(0);const l=s.loading=createPayloadLoading(s),audit=l.testPhysics,writes=[];for(const b of audit.bodies){const original=b.setTransform.bind(b);b.setTransform=(...args)=>{writes.push(args);return original(...args);};}return{s,l,audit,writes};}
function settle(l,maximum=18){let stable=0;for(let t=0;t<maximum&&stable<.25;t+=1/120){l.step(1/120);assert.ok(!(l.assisting&&l.loaded),'a keyboard grab cannot certify basket support');stable=l.loaded?stable+1/120:0;}assert.ok(stable>=.25,'the released critter settles by actual contact');}
function assertFree(audit){for(const b of audit.bodies)assert.equal(b.getType(),'dynamic');for(let j=audit.world.getJointList();j;j=j.getNext()){assert.notEqual(j.getBodyA(),audit.basket);assert.notEqual(j.getBodyB(),audit.basket);}assert.equal(audit.world.getJointCount(),2,'only head/body/tail joints remain');}
test('all eleven keyboard loads preserve instantaneous pose and move by forces without capture or a basket joint',()=>{
 for(const animal of CRITTERS){const {s,l,audit,writes}=setup(scaledPreset(animal.id)),before=l.parts,motion=l.motion;
  assert.equal(l.loadKeyboard(),true);assert.deepEqual(l.parts,before,animal.id);assert.deepEqual(l.motion,motion);assert.equal(l.loaded,false);assert.equal(l.assisting,true);assert.equal(s.fire(),false);settle(l);
  assert.equal(l.assisting,false);assert.equal(l.grip,null);assert.deepEqual(writes,[],animal.id+' never repositions physical regions');assertFree(audit);
  assert.ok(l.parts.some((p,i)=>Math.abs(p.angle-before[i].angle)>.001),animal.id+' jointed regions actually move');
  assert.ok(Math.hypot(l.position.x-l.target().x,l.position.y-l.target().y)>1e-6,'support does not center the volunteer');
 }
});
test('manual release cannot reactivate penetrated basket edges and pop the mouse upward',()=>{
 const {l,audit,writes}=setup(STARTER);for(let i=0;i<60;i++)l.step(1/120);assert.equal(l.begin(l.position),true);
 const target=l.target();l.move({x:target.x+.03,y:target.y-STARTER.pouchWidth*.14});for(let i=0;i<180;i++)l.step(1/120);
 for(let f=audit.basket.getFixtureList();f;f=f.getNext())assert.equal(f.isSensor(),false,'basket remains solid while held');
 const pose=l.parts,point=l.position;l.drop();assert.deepEqual(l.parts,pose);assert.equal(l.grip,null);assertFree(audit);l.step(1/120);
 assert.ok(l.position.y-point.y<.003,'no reproduced 1–3cm upward penetration correction on release');assert.deepEqual(writes,[]);
});
test('loaded critters stay dynamic during winding and an off-centre pickup releases every constraint again',()=>{
 for(const id of ['small','medium','large','elephant']){const {s,l,audit,writes}=setup(createScaleBuild(id));l.loadKeyboard();settle(l);
  s.beginWinding();for(let t=0;t<30&&s.drawFraction<.7;t+=1/120){s.wind(1/120);l.step(1/120);assertFree(audit);}settle(l,6);const before=l.parts,tail=before.at(-1);
  assert.equal(l.begin(tail),true);assert.deepEqual(l.parts,before);l.move({x:tail.x,y:l.basketShape.rim+s.animal.length});for(let i=0;i<120;i++)l.step(1/120);
  assert.equal(l.loaded,false);assert.ok(Math.hypot(l.position.x-before[0].x,l.position.y-before[0].y)>.01);const held=l.parts;l.drop();assert.deepEqual(l.parts,held);assertFree(audit);assert.deepEqual(writes,[],id);
 }
});
test('repeated keyboard assistance and cancellation never reset a moving critter',()=>{
 const {l,audit,writes}=setup(STARTER);l.loadKeyboard();for(let i=0;i<45;i++)l.step(1/120);const moving=l.parts,motion=l.motion;
 assert.equal(l.loadKeyboard(),true);assert.deepEqual(l.parts,moving);assert.deepEqual(l.motion,motion);l.cancel();assert.deepEqual(l.parts,moving);assert.equal(l.assisting,false);assertFree(audit);assert.deepEqual(writes,[]);
});
