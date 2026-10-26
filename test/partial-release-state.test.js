import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BuildSimulation} from '../src/build-physics.js';
import {SIXTY_CM_STARTER as STARTER} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';
function transientSupportLoss(){
 const sim=new BuildSimulation(STARTER);sim.setDraw(0);const loading=sim.loading=createPayloadLoading(sim),schedule=[.05,.001,.001,.001,.05];loading.loadKeyboard();let index=0,age=0;
 while(!loading.loaded&&age<3){const dt=schedule[index++%schedule.length];loading.step(dt);age+=dt;}
 assert.equal(loading.loaded,true);for(let t=0;t<.8;){const dt=Math.min(.8-t,schedule[index++%schedule.length]);sim.wind(dt);loading.step(dt);t+=dt;}
 const head=loading.parts.find(p=>p.id==='head');assert.equal(loading.begin(head),true);loading.move({x:head.x,y:head.y+.15});for(let i=0;i<18;i++)loading.step(1/120);loading.drop();assert.equal(loading.loaded,false);assert.ok(Math.abs(sim.drawFraction-4/15)<1e-10);return{sim,loading};
}
const state=l=>({parts:l.parts,position:l.position,angle:l.angle,motion:l.motion});
function reseat(sim,l){for(let i=0;i<240;i++){l.step(1/120);assert.equal(sim.phase,'ready','settling cannot launch automatically');}assert.equal(l.loaded,true);}
test('unsupported partial draw refuses release; a fresh supported weak release transfers the actual pose unchanged',()=>{
 const {sim,loading}=transientSupportLoss(),before=state(loading),shot=sim.real(sim.shot),draw=sim.drawFraction;
 assert.equal(sim.fire(),false);assert.equal(sim.phase,'ready');assert.equal(sim.release,null);assert.deepEqual(state(loading),before);assert.deepEqual(sim.real(sim.shot),shot);assert.equal(sim.drawFraction,draw);
 reseat(sim,loading);assert.equal(sim.preparationStatus().code,'ready');const supported=state(loading);assert.equal(sim.fire(),true);assert.equal(sim.drawFraction,draw);assert.deepEqual(state(loading),supported);
 const transferred=sim.real(sim.shot);for(const[k,value]of Object.entries({x:supported.position.x,y:supported.position.y,angle:supported.angle,vx:supported.motion.vx,vy:supported.motion.vy}))assert.ok(Math.abs(k==='angle'?Math.atan2(Math.sin(transferred[k]-value),Math.cos(transferred[k]-value)):transferred[k]-value)<1e-12,k);
 assert.ok(Math.abs(sim.shot.getAngularVelocity()/sim.T-supported.motion.omega)<1e-12);
});
test('actual release handler explains unsupported settling, then accepts a fresh weak release without a percentage refusal',()=>{
 const {sim,loading}=transientSupportLoss(),source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),start=source.indexOf(' onRelease(){'),end=source.indexOf('\n onCancel(){',start);
 const messages=[],cues=[],classes=new Set(['holding']),context={sim,qa:true,stage:{dataset:{}},performance:{now:()=>650},holdStart:0,winding:true,dirty:false,document:{body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}}},toast:x=>messages.push(x),cue:x=>cues.push(x),updateReadouts(){}};
 vm.createContext(context);const handler=vm.runInContext('({'+source.slice(start,end)+'})',context).onRelease,before=state(loading),draw=sim.drawFraction;
 handler();assert.equal(classes.has('in-flight'),false);assert.match(messages[0],/settling/i);assert.deepEqual(cues,[]);assert.equal(JSON.parse(context.stage.dataset.launchAttempt).accepted,false);assert.equal(sim.drawFraction,draw);assert.deepEqual(state(loading),before);
 reseat(sim,loading);context.winding=true;handler();assert.equal(sim.phase,'swing');assert.equal(sim.drawFraction,draw);assert.equal(classes.has('in-flight'),true);assert.deepEqual(cues,['unlatch']);assert.equal(messages.length,1);assert.equal(JSON.parse(context.stage.dataset.launchAttempt).accepted,true);
});
