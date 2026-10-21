import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';

function transientSupportLoss(){
 const sim=new BuildSimulation(STARTER);sim.setDraw(0);
 const loading=sim.loading=createPayloadLoading(sim),schedule=[.05,.001,.001,.001,.05];
 loading.loadKeyboard();let index=0,age=0;
 while(!loading.loaded&&age<3){const dt=schedule[index++%schedule.length];loading.step(dt);age+=dt;}
 assert.equal(loading.loaded,true,'start winding at first actual basket contact');
 for(let t=0;t<.8;){const dt=Math.min(.8-t,schedule[index++%schedule.length]);sim.wind(dt);loading.step(dt);t+=dt;}
 assert.equal(loading.loaded,false,'irregular frame scheduling briefly separates the loose volunteer from basket contact');
 assert.ok(Math.abs(sim.drawFraction-4/15)<1e-10);
 return {sim,loading};
}
const state=loading=>({parts:loading.parts,position:loading.position,angle:loading.angle,motion:loading.motion});
function reseat(sim,loading){
 for(let i=0;i<240;i++){loading.step(1/120);assert.equal(sim.phase,'ready','a later support contact cannot launch without fresh input');}
 assert.equal(loading.loaded,true);
}
test('transient partial-draw contact loss refuses unsupported launch without replacing pose, then accepts a fresh supported release',()=>{
 const {sim,loading}=transientSupportLoss(),before=state(loading),shot=sim.real(sim.shot),draw=sim.drawFraction;
 assert.equal(sim.fire(),false);assert.equal(sim.phase,'ready');assert.equal(sim.release,null);
 assert.deepEqual(state(loading),before);assert.deepEqual(sim.real(sim.shot),shot);assert.equal(sim.drawFraction,draw);
 reseat(sim,loading);const supported=state(loading);
 assert.equal(sim.fire(),true);assert.equal(sim.phase,'swing');assert.deepEqual(state(loading),supported);
 const transferred=sim.real(sim.shot);
 assert.ok(Math.abs(transferred.x-supported.position.x)<1e-12);
 assert.ok(Math.abs(transferred.y-supported.position.y)<1e-12);
 assert.ok(Math.abs(transferred.angle-supported.angle)<1e-12);
 assert.ok(Math.abs(transferred.vx-supported.motion.vx)<1e-12);
 assert.ok(Math.abs(transferred.vy-supported.motion.vy)<1e-12);
 assert.ok(Math.abs(sim.shot.getAngularVelocity()/sim.T-supported.motion.omega)<1e-12);
});
test('actual release handler explains a rejected partial draw and later support does not silently launch',()=>{
 const {sim,loading}=transientSupportLoss(),source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
 const start=source.indexOf(' onRelease(){'),end=source.indexOf('\n onCancel(){',start);
 assert.ok(start>0&&end>start);
 const messages=[],cues=[],classes=new Set(['holding']);
 const context={sim,qa:true,stage:{dataset:{}},performance:{now:()=>650},holdStart:0,winding:true,dirty:false,
 document:{body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}}},
 toast:x=>messages.push(x),cue:x=>cues.push(x),updateReadouts(){}};
 vm.createContext(context);
 const handler=vm.runInContext('({'+source.slice(start,end)+'})',context).onRelease;
 const before=state(loading),draw=sim.drawFraction;
 handler();
 assert.equal(context.winding,false);assert.equal(context.dirty,true);assert.equal(classes.has('holding'),false);assert.equal(classes.has('in-flight'),false);
 assert.equal(messages.length,1);assert.match(messages[0],/still settling/i);assert.deepEqual(cues,[]);
 assert.equal(JSON.parse(context.stage.dataset.launchAttempt).accepted,false);
 assert.equal(sim.drawFraction,draw);assert.deepEqual(state(loading),before);
 reseat(sim,loading);assert.equal(messages.length,1);assert.deepEqual(cues,[]);
 context.winding=true;handler();
 assert.equal(sim.phase,'swing');assert.equal(classes.has('in-flight'),true);
 assert.deepEqual(cues,['unlatch']);assert.equal(messages.length,1);
 assert.equal(JSON.parse(context.stage.dataset.launchAttempt).accepted,true);
});
