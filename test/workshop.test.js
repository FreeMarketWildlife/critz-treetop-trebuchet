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

test('braces add physical mass without inventing a change in foot material',()=>{
 assert.equal(workshopConfig({foundation:3}).frameFriction,.65);
 assert.equal(workshopConfig({foundation:3},{frameFriction:.85}).frameFriction,.85);
 assert.ok(Math.abs(workshopConfig({hookDegrees:210}).hookAngle-210*Math.PI/180)<1e-12);
 for(const c of [{counterMount:'fake'},{counterMount:'hinged',hangerLength:0},{hookDegrees:NaN}])assert.throws(()=>workshopConfig(c));
});

test('hinged basket winds and releases with a free joint, finite mass and no trigger energy injection',async()=>{
 const {counterCenter}=await import('../src/workshop.js');
 const {createPredictionJob}=await import('../src/prediction.js');
 const s=new PhysicalHookScene(workshopConfig({counterMount:'hinged',counterKind:'basket'},base),'lizard');
 assert.equal(s.counterWeight.getMass(),140);assert.equal(s.counterHinge.isMotorEnabled(),false);assert.equal(s.counterHinge.isLimitEnabled(),false);
 const p=counterCenter(s);assert.ok(Math.abs(p.y-(s.arm.getWorldPoint({x:-s.p.shortArm,y:0}).y-.65))<1e-10);
 s.startWinding(.6);let maxAnchor=0;
 for(let i=0;i<7200&&s.phase==='winding';i++){s.step();const a=s.counterHinge.getAnchorA(),b=s.counterHinge.getAnchorB();maxAnchor=Math.max(maxAnchor,Math.hypot(a.x-b.x,a.y-b.y));}
 assert.equal(s.phase,'loading');assert.ok(maxAnchor<.005);assert.ok(load(s));waitForContact(s);assert.ok(s.loadingStatus().contacting);
 const snapshot=JSON.stringify(s.snapshot()),clone=s.clone();assert.ok(clone.counterWeight);assert.ok(clone.counterHinge);assert.deepEqual(counterCenter(clone),counterCenter(s));assert.equal(clone.counterWeight.getMass(),140);
 const job=createPredictionJob(s);while(!job.done)job.advance({maxSteps:500,budgetMs:100});assert.ok(job.result.release);assert.equal(JSON.stringify(s.snapshot()),snapshot);
 const energy=s.energy(),time=s.elapsed;s.unlatch();assert.equal(s.energy(),energy);assert.equal(s.elapsed,time);
 for(let i=0;i<3000&&!s.release;i++)s.step();assert.ok(s.release);assert.ok(s.energy()<energy+1);assert.ok(Math.abs(s.counterWeight.getAngle()-s.arm.getAngle())>.1);
});

test('counterweight readout follows actual rock centroid rather than the nominal attachment',async()=>{
 const {counterCenter}=await import('../src/workshop.js');const s=new PhysicalHookScene(workshopConfig({},base));
 const nominal=s.arm.getWorldPoint({x:-s.p.shortArm,y:0}),actual=counterCenter(s);assert.ok(Math.hypot(actual.x-nominal.x,actual.y-nominal.y)>.001);
});
