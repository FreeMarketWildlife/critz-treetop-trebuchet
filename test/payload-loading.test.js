import test from 'node:test';import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';import {STARTER,CRITTERS,scaledPreset,PREVIOUS_STARTER} from '../src/build-catalog.js';import {createPayloadLoading} from '../src/payload-loading.js';import{newProgress,validateProgress}from'../src/build-progress.js';
const setup=(animal='mouse')=>{const s=new BuildSimulation(scaledPreset(animal));s.setDraw(0);s.loading=createPayloadLoading(s);return s;};
const advance=(l,t)=>{for(let i=0;i<t*120;i++)l.step(1/120);};
test('every volunteer can be picked by body or head and has stable physical drop seating',()=>{
 for(const a of CRITTERS){const s=setup(a.id),l=s.loading;advance(l,.6);assert.ok(l.stand.x<0);assert.equal(s.fire(),false);const head=l.parts.find(p=>p.id==='head');assert.ok(l.begin({x:head.x,y:head.y}));assert.equal(l.grip.part,'head');const before=l.position;l.move({...l.target(),y:l.target().y+a.width*2});assert.deepEqual(l.position,before,'pointer movement does not teleport the body');advance(l,1.4);assert.ok(Math.abs(l.angle)>.02,'off-center pickup rotates the body');assert.equal(l.loaded,false);l.drop();advance(l,3);assert.ok(l.parts.every(p=>[p.x,p.y,p.angle].every(Number.isFinite)),a.id);
 // A centered hold gives every species a reliable basket drop.
 l.reset();advance(l,.4);assert.ok(l.begin(l.position));const lift=l.basketShape.rim+Math.max(a.width*2.5,a.length);l.move({x:l.position.x,y:lift});advance(l,2.5);l.move({x:l.target().x,y:lift});advance(l,2.5);l.drop();assert.equal(l.loaded,false);advance(l,10);assert.equal(l.loaded,true,a.id);assert.equal(s.real(s.shot).vx,0);assert.equal(s.real(s.shot).vy,0);
 }
});
test('a tail grip stays at the picked point, swings about it and cancellation releases it without teleporting',()=>{
 const s=setup(),l=s.loading;advance(l,.5);const tail=l.parts.find(p=>p.id==='tail'),point={x:tail.x-.015*Math.cos(tail.angle),y:tail.y-.015*Math.sin(tail.angle)};assert.ok(l.begin(point));assert.equal(l.grip.part,'tail');assert.ok(Math.hypot(l.grip.x-point.x,l.grip.y-point.y)<1e-9);l.move({x:0,y:1.5});advance(l,1);assert.ok(Math.abs(l.angle)>.25);assert.ok(Math.hypot(l.grip.x-l.position.x,l.grip.y-l.position.y)>.01);const released=l.position;l.cancel();assert.equal(l.loaded,false);assert.equal(l.dragging,false);assert.deepEqual(l.position,released);assert.equal(l.grip,null);advance(l,.8);assert.ok(l.position.y<released.y);assert.equal(s.phase,'ready','cancel never triggers a launch, even if the critter lands in the basket');
});
test('missed drops fall physically; no proximity snap, and keyboard assist is explicit',()=>{
 const s=setup(),l=s.loading;l.begin(l.position);l.move({x:-.9,y:1});advance(l,.8);const p=l.position;l.drop();assert.deepEqual(l.position,p);advance(l,.15);assert.equal(l.loaded,false);assert.ok(l.position.y<p.y);assert.equal(s.fire(),false);assert.ok(l.loadKeyboard());assert.equal(l.loaded,false);assert.equal(l.assisting,true);advance(l,4);assert.equal(l.loaded,true);assert.ok(Math.hypot(l.position.x-l.target().x,l.position.y-l.target().y)>1e-6);
});
test('loading stays quiet during idle and empty launch attempts',()=>{const l=setup().loading;advance(l,8);assert.equal(l.hint,false);l.requestHint();assert.equal(l.hint,false);});
test('only untouched previous towers migrate to the compact starter; custom geometry and progress survive',()=>{
 const raw={...newProgress(),starterRevision:3,bells:123,build:{...PREVIOUS_STARTER},blueprints:[{...PREVIOUS_STARTER,name:'My tower'}]};const a=validateProgress(raw);assert.equal(a.build.pivotHeight,STARTER.pivotHeight);assert.equal(a.bells,123);assert.equal(a.blueprints[0].pivotHeight,3);assert.equal(a.starterRevision,7);const b=validateProgress({...raw,build:{...PREVIOUS_STARTER,pinAngle:-43}});assert.equal(b.build.pivotHeight,3);assert.equal(b.build.pinAngle,-43);assert.deepEqual(validateProgress(a),a);
});

test('the earlier free geared starter also shrinks, retaining its wheel and earned balance',()=>{const raw={...newProgress(),starterRevision:4,bells:41,owned:[...newProgress().owned,'geared'],build:{...PREVIOUS_STARTER,winch:'geared'}};const s=validateProgress(raw);assert.equal(s.build.pivotHeight,STARTER.pivotHeight);assert.equal(s.build.winch,'geared');assert.equal(s.bells,41);assert.deepEqual(s.owned,raw.owned);});

test('settling never centers or freezes the ragdoll and a supported critter can be grabbed again',()=>{
 const s=setup(),l=s.loading;l.loadKeyboard();let transition=false;
 for(let i=0;i<600;i++){const before=l.parts;l.step(1/120);if(l.loaded&&!transition){transition=true;assert.notDeepEqual(l.position,l.target());assert.ok(l.parts.some((p,j)=>Math.abs(p.angle)>1e-5||p.x!==before[j].x));}}
 assert.ok(transition);assert.ok(l.parts.some(p=>Math.abs(p.angle)>.02));const pose=l.parts,tail=l.parts.find(p=>p.id==='tail');assert.ok(l.begin({x:tail.x,y:tail.y}));assert.deepEqual(l.parts,pose,'grabbing a settled critter preserves every jointed pose');l.move({x:tail.x+.2,y:tail.y+.5});advance(l,.4);assert.equal(l.loaded,false);assert.ok(l.position.y>l.target().y);l.drop();advance(l,.1);assert.equal(l.dragging,false);
});
