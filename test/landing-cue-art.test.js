import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutLandingCue,createLandingCue,drawLandingCue} from '../src/landing-cue-art.js';
import {flightMotionCaption} from '../src/weapon-hud.js';
const size={width:390,height:844},p=[125,290];
test('one tentative surface or edge mark stays inside phone/desktop view without covering HUD or critter',()=>{
 for(const {width,height}of[size,{width:1726,height:819}]){
  const options={width,height},animal=[width*.35,height*.35];
  const below=layoutLandingCue([width*.7,height+300],animal,options);assert.equal(below.mode,'edge');assert.ok(below.x>=24&&below.x<=width-24);assert.equal(below.y,height-28);
  const far=layoutLandingCue([width*5,height*.6],animal,options);assert.equal(far.mode,'edge');assert.equal(far.x,width-24);
  const visible=layoutLandingCue([width*.65,height*.7],animal,options);assert.equal(visible.mode,'surface');
 }
 assert.equal(layoutLandingCue([34,180],p,size),null,'the weapon tray occludes this point');
 assert.equal(layoutLandingCue([120,30],p,size),null,'top stats occlude this point');
 assert.equal(layoutLandingCue([130,295],p,size),null,'a marker must not obscure the small volunteer');
 for(const target of[[NaN,20],[20,Infinity],null])assert.equal(layoutLandingCue(target,p,size),null);
});
const sim=()=>({phase:'flight',release:{time:0},shot:{},real:()=>({x:125,y:290,vx:7,vy:-5})});
const target={id:'log',x:280,y:620,eta:.7,advisory:true,normal:{x:.4,y:.9}};
const opts={...size,project:p=>[p.x,p.y],dt:1/60};
test('tentative cue requires a stable current target and immediately clears after loss, boost, pause or retry',()=>{
 const s=sim(),before=JSON.stringify(s),model=createLandingCue();let cue;
 for(let i=0;i<15;i++)cue=model.update(s,target,opts);assert.equal(cue.id,'log');assert.equal(cue.mode,'surface');assert.ok(cue.alpha>0);
 assert.equal(model.update(s,null,opts),null);assert.equal(model.update(s,target,opts),null);
 for(let i=0;i<15;i++)cue=model.update(s,target,opts);assert.ok(cue);
 model.clear();assert.equal(model.update(s,{...target,x:320},opts),null,'a boost cannot reuse the old target');
 for(let i=0;i<15;i++)model.update(s,target,opts);
 assert.equal(model.update(s,target,{...opts,paused:true}),null);assert.ok(model.update(s,target,{...opts,dt:0}),'pause does not age or erase the current acquisition');
 assert.equal(model.update(sim(),target,opts),null,'a new throw starts without the previous cue');
 assert.equal(model.update(s,{...target,eta:.05},opts),null,'contact itself needs no advisory');
 assert.equal(model.update(s,{...target,advisory:false},opts),null);
 assert.equal(JSON.stringify(s),before,'render state cannot change physical state');
});
test('cue drawing is hollow, bounded and leaves canvas state balanced',()=>{
 let depth=0;const calls=[],c=new Proxy({},{get:(_,key)=>(...args)=>{calls.push([key,...args]);for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n));if(key==='save')depth++;if(key==='restore')depth--;},set:()=>true});
 for(const mode of['edge','surface'])drawLandingCue(c,{mode,x:320,y:600,angle:.5,alpha:.7,normal:{x:.4,y:.9}});
 assert.equal(depth,0);assert.ok(calls.length<100);assert.ok(!calls.some(([k])=>['fill','fillText','fillRect'].includes(k)),'no filled target, instruction or countdown');
});
test('weapon caption describes current motion without claiming an optimal future action',()=>{
 const p={vx:8,vy:5},s={phase:'flight',release:{},real:()=>p};
 assert.equal(flightMotionCaption(s),'Rising · speed');p.vy=-5;assert.equal(flightMotionCaption(s),'Falling · lift');p.vy=0;assert.equal(flightMotionCaption(s),'Level · lift');
 p.vx=0;assert.equal(flightMotionCaption(s),'Lift + speed');s.phase='ready';assert.equal(flightMotionCaption(s),'Lift + speed');
});
