import test from 'node:test';
import assert from 'node:assert/strict';
import {createGripController} from '../src/input.js';
const event=(pointerId=1,extra={})=>({pointerId,clientX:2,clientY:3,button:0,...extra});
function setup(options={}){const calls=[];const c=createGripController({onStart:p=>{calls.push(['start',p]);return true;},onMove:p=>calls.push(['move',p]),onEnd:r=>calls.push(['end',r]),capture:id=>calls.push(['capture',id]),releaseCapture:id=>calls.push(['release',id]),...options});return {c,calls};}
test('mouse/touch repeated drags own one pointer and end exactly once',()=>{
 const {c,calls}=setup();for(const pointerType of ['mouse','touch']){const e=event(1,{pointerType});assert.equal(c.pointerDown(e),true);assert.equal(c.pointerMove(event(2)),false);assert.equal(c.pointerDown(event(2)),false);assert.equal(c.pointerUp(event(2)),false);assert.equal(c.pointerMove(event(1,{clientX:8})),true);assert.equal(c.pointerUp(e),true);assert.equal(c.pointerUp(e),false);assert.equal(c.active,false);assert.equal(c.pointerId,null);}assert.equal(calls.filter(x=>x[0]==='end').length,2);
});
test('cancel, lost capture, blur, reset and dispose clear grip and permit new drag',()=>{
 for(const reason of ['pointercancel','lostpointercapture','blur','reset','dispose']){const {c,calls}=setup();c.pointerDown(event());if(reason==='pointercancel')c.pointerCancel(event());else if(reason==='lostpointercapture')c.lostPointerCapture(event());else c[reason]();assert.equal(c.active,false);assert.equal(c.snapshot().point,null);assert.deepEqual(calls.at(-1),['end',reason]);c.blur();assert.equal(calls.filter(x=>x[0]==='end').length,1);assert.equal(c.pointerDown(event()),true);}
});
test('tap-hold survives ordinary lost capture, next tap releases; blur still cancels',()=>{
 const {c,calls}=setup({tapHold:true});c.pointerDown(event());c.pointerUp(event());assert.equal(c.active,true);assert.equal(c.snapshot().pressed,false);assert.equal(c.lostPointerCapture(event()),false);c.pointerMove(event(1,{clientX:6}));assert.equal(c.pointerDown(event(2)),true);assert.equal(c.active,false);assert.deepEqual(calls.at(-1),['end','tap-release']);c.pointerDown(event(3));c.pointerUp(event(3));c.blur();assert.deepEqual(calls.at(-1),['end','blur']);
});
test('rejected, secondary and invalid input never captures or injects coordinates',()=>{
 const {c,calls}=setup({onStart:()=>false});assert.equal(c.pointerDown(event()),false);assert.deepEqual(calls,[]);
 const b=setup();assert.equal(b.c.pointerDown(event(1,{button:2})),false);assert.equal(b.c.pointerDown(event(1,{isPrimary:false})),false);assert.equal(b.c.pointerDown(event(1,{clientX:NaN})),false);assert.deepEqual(b.calls,[]);
});
test('coordinate mapping copies targets; capture failures clean up and report end',()=>{
 const shared={x:7,y:9};const {c}=setup({toPoint:()=>shared});c.pointerDown(event());shared.x=100;assert.equal(c.snapshot().point.x,7);const snap=c.snapshot();snap.point.x=200;assert.equal(c.snapshot().point.x,7);
 const f=setup({capture:()=>{throw Error('lost surface');}});assert.throws(()=>f.c.pointerDown(event()),/lost surface/);assert.equal(f.c.active,false);assert.deepEqual(f.calls.at(-1),['end','capture-failed']);
});
test('synchronous capture-loss callback cannot duplicate end',()=>{let c;let ends=0;c=createGripController({onEnd:()=>ends++,releaseCapture:()=>c.lostPointerCapture(event())});c.pointerDown(event());c.pointerUp(event());assert.equal(ends,1);});
test('sticky capture-release failure ends the physical grip and permits another drag',()=>{
 let fail=true;const {c,calls}=setup({tapHold:true,releaseCapture:()=>{if(fail)throw Error('surface removed');}});
 c.pointerDown(event());assert.throws(()=>c.pointerUp(event()),/surface removed/);assert.equal(c.active,false);assert.equal(c.pointerId,null);assert.deepEqual(calls.at(-1),['end','capture-failed']);fail=false;assert.equal(c.pointerDown(event(2)),true);
});
test('foreign cancellation cannot end the owning touch; sticky release tap does not regrab',()=>{
 const {c,calls}=setup({tapHold:true});c.pointerDown(event(4,{pointerType:'touch'}));
 assert.equal(c.pointerCancel(event(5)),false);assert.equal(c.lostPointerCapture(event(5)),false);assert.equal(c.active,true);
 c.pointerUp(event(4));assert.equal(c.pointerDown(event(6,{isPrimary:false})),false);assert.equal(c.active,true);
 c.pointerDown(event(7,{pointerType:'touch',isPrimary:true}));assert.equal(c.active,false);assert.equal(calls.filter(x=>x[0]==='start').length,1);assert.equal(calls.filter(x=>x[0]==='end').length,1);
});
