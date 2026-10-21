import test from 'node:test';import assert from 'node:assert/strict';
import {BuildSimulation} from '../src/build-physics.js';import {STARTER,CRITTERS,scaledPreset,PREVIOUS_STARTER} from '../src/build-catalog.js';import {createPayloadLoading} from '../src/payload-loading.js';import{newProgress,validateProgress}from'../src/build-progress.js';
const setup=(animal='mouse')=>{const s=new BuildSimulation(scaledPreset(animal));s.setDraw(0);s.loading=createPayloadLoading(s);return s;};
const advance=(l,t)=>{for(let i=0;i<t*120;i++)l.step(1/120);};
test('every volunteer can be picked by body or head and has stable physical drop seating',()=>{
 for(const a of CRITTERS){const s=setup(a.id),l=s.loading;advance(l,.6);assert.ok(l.stand.x<0);assert.equal(s.fire(),false);const head=l.parts.find(p=>p.id==='head');assert.ok(l.begin({x:head.x,y:head.y}));assert.equal(l.grip.part,'head');const before=l.position;l.move({...l.target(),y:l.target().y+a.width*2});assert.deepEqual(l.position,before,'pointer movement does not teleport the body');advance(l,1.4);assert.ok(Math.abs(l.angle)>.02,'off-center pickup rotates the body');assert.equal(l.loaded,false);l.drop();advance(l,3);assert.ok(l.parts.every(p=>[p.x,p.y,p.angle].every(Number.isFinite)),a.id);
 // A centered hold gives every species a reliable basket drop.
 l.reset();advance(l,.4);assert.ok(l.begin(l.position));l.move({...l.target(),y:l.target().y+a.width*1.6});advance(l,2.5);l.drop();assert.equal(l.loaded,false);advance(l,5);assert.equal(l.loaded,true,a.id);assert.equal(s.real(s.shot).vx,0);assert.equal(s.real(s.shot).vy,0);
 }
});
test('a tail grip stays at the picked point, swings about it and cancellation restores the stand',()=>{
 const s=setup(),l=s.loading;advance(l,.5);const tail=l.parts.find(p=>p.id==='tail'),point={x:tail.x-.015,y:tail.y};assert.ok(l.begin(point));assert.equal(l.grip.part,'tail');assert.ok(Math.hypot(l.grip.x-point.x,l.grip.y-point.y)<1e-9);l.move({x:0,y:1.5});advance(l,1);assert.ok(Math.abs(l.angle)>.25);assert.ok(Math.hypot(l.grip.x-l.position.x,l.grip.y-l.position.y)>.01);l.cancel();assert.equal(l.loaded,false);assert.equal(l.dragging,false);assert.deepEqual(l.position,l.home());assert.equal(s.fire(),false);
});
test('missed drops fall physically; no proximity snap, and keyboard assist is explicit',()=>{
 const s=setup(),l=s.loading;l.begin(l.position);l.move({x:-.9,y:1});advance(l,.8);const p=l.position;l.drop();assert.deepEqual(l.position,p);advance(l,.15);assert.equal(l.loaded,false);assert.ok(l.position.y<p.y);assert.equal(s.fire(),false);assert.ok(l.loadKeyboard());assert.equal(l.loaded,true);assert.deepEqual(l.position,l.target());
});
test('drag tip starts after five active seconds, stops while dragging and can be requested by an empty launch',()=>{
 const l=setup().loading;advance(l,4.9);assert.equal(l.hint,false);advance(l,.2);assert.equal(l.hint,true);l.begin(l.position);assert.equal(l.hint,false);l.cancel();assert.equal(l.hint,false);l.requestHint();assert.equal(l.hint,true);l.loadKeyboard();assert.equal(l.hint,false);
});
test('only untouched previous towers migrate to the compact starter; custom geometry and progress survive',()=>{
 const raw={...newProgress(),starterRevision:3,bells:123,build:{...PREVIOUS_STARTER},blueprints:[{...PREVIOUS_STARTER,name:'My tower'}]};const a=validateProgress(raw);assert.equal(a.build.pivotHeight,1.2);assert.equal(a.bells,123);assert.equal(a.blueprints[0].pivotHeight,3);assert.equal(a.starterRevision,5);const b=validateProgress({...raw,build:{...PREVIOUS_STARTER,pinAngle:-43}});assert.equal(b.build.pivotHeight,3);assert.equal(b.build.pinAngle,-43);assert.deepEqual(validateProgress(a),a);
});

test('the earlier free geared starter also shrinks, retaining its wheel and earned balance',()=>{const raw={...newProgress(),starterRevision:4,bells:41,owned:[...newProgress().owned,'geared'],build:{...PREVIOUS_STARTER,winch:'geared'}};const s=validateProgress(raw);assert.equal(s.build.pivotHeight,1.2);assert.equal(s.build.winch,'geared');assert.equal(s.bells,41);assert.deepEqual(s.owned,raw.owned);});
