import test from 'node:test';
import assert from 'node:assert/strict';
import {workshopConfig,counterRadius} from '../src/workshop.js';
import {PhysicalHookScene} from '../src/hook-experiment.js';
import {createWindingInput} from '../src/winding-input.js';
import {load,waitForContact} from '../scripts/measure-hook.js';
const base={mechanicalWinding:true,initialArm:-3,releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5};
test('construction produces real counterweight mass, material inertia, frame braces and longer straps',()=>{
 const scenes=['rock','basket','iron'].map(counterKind=>new PhysicalHookScene(workshopConfig({counterKind,slingPieces:2,foundation:2},base)));
 for(const s of scenes){const fixtures=[];for(let f=s.arm.getFixtureList();f;f=f.getNext())if(f.getUserData()?.role==='counterweight')fixtures.push(f);assert.equal(fixtures.length,1);const f=fixtures[0],md={center:{x:0,y:0}};f.getMassData(md);assert.ok(Math.abs(md.mass-140)<1e-9);assert.equal(s.frame.getMass(),60);assert.equal(s.p.sling,2.8);assert.equal(s.p.pouchPanelMass,.62);assert.equal(s.p.slingPieces,2);let count=0;for(let f=s.frame.getFixtureList();f;f=f.getNext())count++;assert.equal(count,6);}
 assert.ok(counterRadius(scenes[1].p)>counterRadius(scenes[0].p));assert.ok(counterRadius(scenes[0].p)>counterRadius(scenes[2].p));assert.notEqual(scenes[0].arm.getInertia(),scenes[2].arm.getInertia());
});
test('Workshop rejects invalid construction without creating broken physics',()=>{for(const choice of [{counterMass:NaN},{counterKind:'unknown'},{foundation:4},{slingPieces:.5},{longArm:20}])assert.throws(()=>workshopConfig(choice));});
test('release fires once for mouse, touch and keyboard; cancellation never fires',()=>{
 for(const mode of ['mouse','touch','keyboard']){let fired=0,armed=false;const c=createWindingInput({onAim:()=>armed=true,onCommit:()=>fired++,onCancel:()=>armed=false}),e={pointerId:4,pointerType:mode,key:' ',button:0};if(mode==='keyboard'){c.keyDown(e);assert.equal(fired,0);c.keyUp(e);c.keyUp(e);}else{c.pointerDown(e);assert.equal(fired,0);c.pointerUp(e);c.pointerUp(e);}assert.ok(armed);assert.equal(fired,1);}
 let fired=0;const c=createWindingInput({onCommit:()=>fired++});const e={pointerId:1,button:0};c.pointerDown(e);c.pointerCancel(e);c.pointerUp(e);c.pointerDown(e);c.cancel();c.pointerUp(e);assert.equal(fired,0);
});
test('rock and customized stone basket wind, load and launch under gravity without release energy injection',()=>{
 for(const choice of [{},{counterKind:'basket',counterMass:180,slingPieces:1,foundation:2,wood:'pine'}]){
  const s=new PhysicalHookScene(workshopConfig(choice,base),'lizard');s.startWinding(.6);for(let i=0;i<7200&&s.phase==='winding';i++)s.step();assert.equal(s.phase,'loading');assert.ok(s.windingWork>100);assert.ok(load(s));waitForContact(s);assert.ok(s.loadingStatus().contacting);const before=s.energy(),t=s.elapsed;s.unlatch();assert.equal(s.phase,'launching');assert.equal(s.elapsed,t);assert.equal(s.energy(),before);for(let i=0;i<3000&&!s.release;i++)s.step();assert.ok(s.release,JSON.stringify(choice));assert.ok(Number.isFinite(s.release.center.vx));
 }
});
