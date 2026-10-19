import test from 'node:test';import assert from 'node:assert/strict';import {PhysicalHookScene} from '../src/hook-experiment.js';import {drawMechanismDetails} from '../src/mechanism-art.js';
test('weight and sling annotations read real anchors/mass/slack without changing the mechanism',()=>{const s=new PhysicalHookScene({counterMass:140,releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5}),before=JSON.stringify(s.snapshot()),calls=[],ctx=new Proxy({},{get:(_,k)=>(...args)=>calls.push([k,...args]),set:()=>true});drawMechanismDetails(ctx,s,p=>[240+p.x*45,560-(p.y-294)*45]);assert.equal(JSON.stringify(s.snapshot()),before);assert.ok(calls.length<80);assert.ok(calls.some(c=>c[0]==='fillText'&&c[1].includes('140 kg fixed weight')));assert.ok(calls.some(c=>c[0]==='fillText'&&c[1].includes('Sling')));assert.equal(calls.at(-1)[0],'restore');});

test('both strap ends are drawn at current constraint anchors with no flight labels',()=>{
 const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5}),calls=[],ctx=new Proxy({},{get:(_,k)=>(...args)=>calls.push([k,...args]),set:()=>true}),project=p=>[p.x*42,-p.y*42];
 const before=JSON.stringify(s.snapshot());drawMechanismDetails(ctx,s,project,{labels:false});
 for(const rope of s.ropes)for(const p of [rope.getAnchorA(),rope.getAnchorB()]){const q=project(p);assert.ok(calls.some(c=>c[0]==='arc'&&c[1]===q[0]&&c[2]===q[1]&&c[3]===2.5));}
 assert.equal(calls.some(c=>c[0]==='fillText'),false);assert.equal(JSON.stringify(s.snapshot()),before);
});

test('sling summary distinguishes a taut fixed strand from a slack free strand',()=>{
 const s=new PhysicalHookScene({releaseHardware:'channel',stoppedSplitPouch:true,pouchPanelMass:.5}),r=s.ropes[1];r.setMaxLength(r.getMaxLength()+.7);const calls=[],ctx=new Proxy({},{get:(_,k)=>(...a)=>calls.push([k,...a]),set:()=>true}),before=JSON.stringify(s.snapshot());drawMechanismDetails(ctx,s,p=>[p.x,p.y]);assert.ok(calls.some(c=>c[0]==='fillText'&&c[1].includes('fixed taut / free slack 0.70 m')));assert.equal(JSON.stringify(s.snapshot()),before);
});
