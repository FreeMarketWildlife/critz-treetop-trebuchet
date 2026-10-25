import test from 'node:test';import assert from 'node:assert/strict';
import {World} from '../vendor/planck/planck.mjs';
import {critterBodyProfile,addCritterFixtures,critterHitboxBounds} from '../src/critter-body.js';
import {critter,STARTER,COMPACT_STARTER} from '../src/build-catalog.js';
import {newProgress,validateProgress} from '../src/build-progress.js';
import {BuildSimulation} from '../src/build-physics.js';import {createPayloadLoading} from '../src/payload-loading.js';
const mouse=critter('mouse'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} versus ${b}`);
test('mouse has nine centimetres of head/body and nine of thin tail in an eighteen centimetre envelope',()=>{
 const p=critterBodyProfile(mouse),tail=p.find(p=>p.id==='tail'),body=p.filter(p=>p.id!=='tail');
 near((Math.max(...body.map(p=>p.x+p.rx))-Math.min(...body.map(p=>p.x-p.rx)))*mouse.length,.09);
 near(tail.rx*2*mouse.length,.09);near(critterHitboxBounds(mouse).longestSide,.18);assert.equal(mouse.width,.035);
 assert.ok(tail.ry*2*mouse.width<.002);
});
test('compound fixture densities give each mouse section its own mass and tail only 0.05 g',()=>{
 const body=new World().createDynamicBody();addCritterFixtures(body,mouse);const masses={};
 for(let f=body.getFixtureList();f;f=f.getNext()){const md={mass:0,center:{x:0,y:0},I:0};f.getMassData(md);masses[f.getUserData().critterPart]=md.mass*1000;}
 near(body.getMass()*1000,25);near(masses.tail,.05);near(masses.torso,19.7);near(masses.head,5);near(masses.ear,.25);
 assert.ok(masses.tail/masses.torso<.003);
});
test('jointed mouse uses matching weighted sections and the nearly weightless tail remains grabbable',()=>{
 const s=new BuildSimulation(STARTER),l=s.loading=createPayloadLoading(s),parts=l.parts;
 near(parts.find(p=>p.id==='tail').mass,.002);near(parts.find(p=>p.id==='head').mass,.21);near(parts.reduce((sum,p)=>sum+p.mass,0),1);
 const tail=parts.find(p=>p.id==='tail');assert.ok(l.begin(tail));assert.equal(l.grip.part,'tail');l.move({x:tail.x,y:tail.y+.2});for(let i=0;i<120;i++)l.step(1/120);assert.ok(l.parts.every(p=>[p.x,p.y,p.angle].every(Number.isFinite)));l.cancel();assert.equal(s.phase,'ready');
});
test('only an untouched old compact starter migrates to forty-eight centimetres; custom geometry survives',()=>{
 const raw={...newProgress(),starterRevision:5,bells:123,build:{...COMPACT_STARTER},blueprints:[{...COMPACT_STARTER,name:'Keep this'}]};
 const migrated=validateProgress(raw);assert.equal(migrated.build.pivotHeight,.48);assert.equal(migrated.bells,123);assert.equal(migrated.blueprints[0].pivotHeight,1.2);assert.equal(migrated.starterRevision,7);
 const custom=validateProgress({...raw,build:{...COMPACT_STARTER,pivotHeight:1.1}});assert.equal(custom.build.pivotHeight,1.1);
 near(STARTER.longArm,COMPACT_STARTER.longArm*.4);near(STARTER.slingLength,COMPACT_STARTER.slingLength*.4);
});
