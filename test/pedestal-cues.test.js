import test from 'node:test';import assert from 'node:assert/strict';
import {pedestalCues} from '../src/pedestal-cues.js';
import {BuildSimulation} from '../src/build-physics.js';import {scaledPreset} from '../src/build-catalog.js';import {createPayloadLoading} from '../src/payload-loading.js';
const advance=(l,t)=>{for(let i=0;i<t*120;i++)l.step(1/120);};
const setup=(options={})=>{const s=new BuildSimulation(scaledPreset('mouse'));s.setDraw(0);s.loading=createPayloadLoading(s,options);return s;};
test('attention is delayed, ordered and intermittent rather than constant',()=>{
 for(const t of[0,2,6,7.99])assert.equal(pedestalCues(t).hint||pedestalCues(t).bubble,false);
 assert.equal(pedestalCues(8.2).bubble,true);assert.equal(pedestalCues(8.2).hint,false);
 assert.equal(pedestalCues(14).hint,true);assert.equal(pedestalCues(16).hintPhase,.5);
 for(const t of[18,24,36,47.9])assert.equal(pedestalCues(t).hint||pedestalCues(t).bubble,false);
 assert.equal(pedestalCues(56.2).bubble,true);assert.equal(pedestalCues(62.2).hint,true);
 assert.equal(pedestalCues(16,{available:false}).hint,false);
});
test('reduced motion removes waving and hopping while retaining a short static instruction',()=>{
 assert.equal(pedestalCues(2,{reducedMotion:true}).wave,0);assert.equal(pedestalCues(3.55,{reducedMotion:true}).hop,false);assert.equal(pedestalCues(16,{reducedMotion:true}).hint,true);
});
test('door entrance has a quiet beat, slower physical walk, jump and completed pedestal arrival',()=>{
 const s=setup({door:{x:-1}}),l=s.loading,start=l.position;
 advance(l,.5);assert.ok(Math.abs(l.position.x-start.x)<.02,'creature waits for the door before walking');assert.equal(l.returning,true);assert.equal(l.hint,false);
 advance(l,1);assert.ok(l.position.x>start.x+.03);assert.ok(l.position.x<l.home().x-.15,'approach is deliberately slower than the old dash');
 let jumped=false;for(let i=0;i<12*120;i++){l.step(1/120);if(l.position.y>l.stand.y+l.stand.height*.15)jumped=true;}
 assert.ok(jumped);assert.equal(l.returning,false);assert.ok(Math.abs(l.position.x-l.home().x)<l.stand.width*.3);assert.equal(s.phase,'ready');assert.equal(l.loaded,false);
});
test('pedestal cues clear on pickup and never disturb a supported basket pose',()=>{
 const s=setup(),l=s.loading;advance(l,14.5);assert.equal(l.hint,true);const pose=l.parts;assert.ok(l.begin(l.position));assert.deepEqual(l.parts,pose);assert.equal(l.hint,false);assert.equal(l.pedestal.bubble,false);l.cancel();l.loadKeyboard();advance(l,5);assert.equal(l.loaded,true);advance(l,20);assert.equal(l.loaded,true);assert.equal(l.hint,false);assert.equal(l.pedestal.wave,0);assert.equal(l.pedestal.hop,false);
});
test('reduced motion keeps settled pedestal physics still',()=>{const l=setup({reducedMotion:true}).loading;advance(l,2);const p=l.parts;advance(l,5);assert.deepEqual(l.parts,p);});

test('small frog finishes the physical pedestal approach despite contact friction',()=>{const s=new BuildSimulation(scaledPreset('frog')),l=createPayloadLoading(s,{door:{x:-.7}});advance(l,12);assert.equal(l.returning,false);assert.ok(Math.abs(l.position.x-l.home().x)<l.stand.width*.3);});

test('cancelled entrance returns home and repeated idle hops do not ratchet off the stand',()=>{const s=setup({door:{x:-2}}),l=s.loading;advance(l,4);assert.ok(l.begin(l.position));l.cancel();advance(l,30);assert.ok(Math.abs(l.position.x-l.home().x)<.03);for(let i=0;i<8;i++){advance(l,12);assert.equal(l.returning,false);assert.ok(Math.abs(l.position.x-l.home().x)<.03,'small hops retain the physical home position');}assert.equal(s.phase,'ready');assert.equal(l.loaded,false);});
