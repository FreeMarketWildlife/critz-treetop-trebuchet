import test from 'node:test';
import assert from 'node:assert/strict';
import {altitudeStripState,drawAltitudeStrip} from '../src/altitude-strip.js';
import {createV3GroveMap as createGroveMap,createGroveMap as createCurrentGroveMap,createLegacyGroveMap,gravityScaleAt,validateGroveMap} from '../src/grove-map.js';
import {escapeAltitude} from '../src/space-policy.js';
import {CRITTERS} from '../src/build-catalog.js';

const current=createGroveMap(),legacy=createLegacyGroveMap(),mouse=CRITTERS[0];
const state=(altitude,map=current,extra={})=>altitudeStripState({map,altitude,animal:mouse,...extra});

test('retained V3 height strip uses actual floor, tree centre, crown, starlight and map top',()=>{
 const s=state(600);assert.equal(s.landmarks.floor.altitude,0);assert.equal(s.landmarks.floor.fraction,.94);
 assert.equal(s.landmarks.tree.altitude,400);assert.equal(s.landmarks.tree.fraction,.5);
 assert.equal(s.landmarks.crown.altitude,800);assert.equal(s.landmarks.space.altitude,960);assert.equal(s.landmarks.top.altitude,3000);
 assert.ok(s.fraction<.5&&s.fraction>.24,'600m launch sits above the centre of the 800m tree');
 assert.match(s.label,/Height only/);assert.match(s.label,/Nonlinear scale: upper sky compressed/);
 assert.match(s.label,/Grandfather Tree centre 400 m, crown 800 m/);
});
test('piecewise height positions are continuous, monotonic and explicitly compress upper sky',()=>{
 for(const map of[current,legacy]){
  let last=Infinity;
  for(let y=-100;y<=4000;y+=5){const s=state(y,map);assert.ok(Number.isFinite(s.fraction));assert.ok(s.fraction<=last);assert.ok(s.fraction>=.065&&s.fraction<=.94);last=s.fraction;}
  const s=state(0,map);
  for(const a of s.anchors){assert.equal(state(a.altitude,map).fraction,a.fraction);const left=state(a.altitude-1e-6,map).fraction,right=state(a.altitude+1e-6,map).fraction;assert.ok(Math.abs(left-right)<1e-7);}
  const lowDelta=state(0,map).fraction-state(100,map).fraction,highDelta=state(1100,map).fraction-state(1200,map).fraction;assert.ok(lowDelta>highDelta*5);
 }
});
test('legacy and tall custom maps keep actual tree dimensions and preserve authored input',()=>{
 const tall=validateGroveMap({...legacy,tree:{...legacy.tree,height:1800}}),before=structuredClone(tall),s=state(900,tall);
 assert.equal(s.fraction,.5);assert.equal(s.landmarks.crown.altitude,1800);assert.ok(s.landmarks.top.altitude>1800);assert.ok(s.landmarks.space.fraction>.5,'starlight begins below this user-authored tall tree centre');
 assert.deepEqual(tall,before);assert.equal(state(200,legacy).fraction,.5);assert.equal(state(0,legacy).landmarks.top.altitude,1500);
});
test('below floor, extreme height and missing readings have honest bounded marker states',()=>{
 assert.equal(state(-20).edge,'below');assert.equal(state(-20).fraction,.94);assert.match(state(-20).label,/pinned below the floor/);
 for(const y of[3001,1e300,Infinity]){const s=state(y);assert.equal(s.edge,'above');assert.equal(s.fraction,.065);assert.match(s.label,/pinned above the map/);}
 assert.equal(state(-Infinity).altitudeLabel,'Below floor');assert.equal(state(NaN).fraction,null);assert.equal(state(undefined).edge,'unknown');assert.match(state(NaN).label,/Altitude unavailable/);
});
test('height alone never claims escape while ordinary or reduced gravity remains active',()=>{
 for(const y of[600,960,1040,3000,1e6]){const s=state(y);assert.equal(s.spaceState,'bound');assert.equal(s.gravityFactor,gravityScaleAt(y,current));assert.doesNotMatch(s.label,/Free drift|escaped/);}
 assert.equal(state(600).status,'In the grove');assert.equal(state(1040).status,'Low gravity');assert.ok(Math.abs(state(1040).gravityFactor-.14)<1e-12);
 const escaped=state(3000,current,{spaceState:'escaped'});assert.equal(escaped.spaceState,'escaped');assert.equal(escaped.status,'Free drift');assert.match(escaped.label,/Free drift/);
});
test('actual solver gravity overrides the height field for seated and released volunteers',()=>{
 const seated=state(960,current,{gravityFactor:1});assert.equal(seated.gravityFactor,1);assert.equal(seated.status,'In the grove');assert.match(seated.label,/gravity 100 percent/);
 const released=state(960,current,{gravityFactor:.6});assert.equal(released.gravityFactor,.6);assert.equal(released.status,'Low gravity');assert.match(released.label,/gravity 60 percent/);
 const escaped=state(3000,current,{spaceState:'escaped',gravityFactor:0});assert.equal(escaped.gravityFactor,0);assert.equal(escaped.status,'Free drift');
 for(const gravityFactor of[NaN,Infinity,-.1,1.1,undefined])assert.equal(state(960,current,{gravityFactor}).gravityFactor,gravityScaleAt(960,current),'invalid solver overrides fall back to the authored field');
 const canvas=recordingCanvas(),painted=drawAltitudeStrip(canvas.ctx,{map:current,altitude:960,animal:mouse,gravityFactor:1});assert.equal(painted.gravityFactor,1,'drawing forwards the actual solver override');
});
test('pause, retry, animal changes and unrelated X never add a second position coordinate',()=>{
 const one=state(600,current,{phase:'flight',x:10}),paused=state(600,current,{phase:'paused',x:90000});assert.deepEqual(paused,one);
 assert.equal(state(1500).fraction<one.fraction,true);assert.deepEqual(state(600),one,'retry immediately returns to the actual launch-height reading');
 for(const animal of CRITTERS){const s=state(600,current,{animal});assert.equal(s.fraction,one.fraction);assert.equal(s.animalId,animal.id);assert.match(s.label,new RegExp(animal.name));}
});
function recordingCanvas(){
 let balance=0,count=0;const calls=[];
 const ctx=new Proxy({},{get(_,key){if(key==='createLinearGradient')return(...args)=>{calls.push([key,...args]);return{addColorStop(){}};};return(...args)=>{count++;for(const x of args)if(typeof x==='number')assert.ok(Number.isFinite(x),`${String(key)} finite coordinate`);if(key==='save')balance++;if(key==='restore')balance--;calls.push([key,...args]);};},set(_,key,value){if(typeof value==='number')assert.ok(Number.isFinite(value),`${String(key)} finite setting`);return true;}});
 return{ctx,calls,get balance(){return balance;},get count(){return count;}};
}
test('narrow desktop and phone drawing reuses species portraits with finite bounded work',()=>{
 for(const [width,height]of[[38,420],[44,540],[32,180],[44,120]])for(const altitude of[-10,0,400,600,1040,3000,1e300,Infinity,NaN])for(const animal of CRITTERS){
  const c=recordingCanvas(),markers=[];const result=drawAltitudeStrip(c.ctx,{width,height,map:current,altitude,animal,drawMarker:(ctx,a,x,y,size)=>{assert.equal(ctx,c.ctx);markers.push({a,x,y,size});}});
  assert.equal(c.balance,0);assert.ok(c.count<180,'one tiny fixed-cost strip, no object scanning');assert.deepEqual(result,altitudeStripState({map:current,altitude,animal}));
  assert.equal(markers.length,Number(!Number.isNaN(altitude)));if(markers.length){assert.equal(markers[0].a,animal);assert.equal(markers[0].x,width/2);assert.ok(markers[0].y>=0&&markers[0].y<=height);assert.ok(markers[0].size<=23);}
  assert.ok(c.calls.some(a=>a[0]==='fillText'&&a[1]==='COMP.'),'compression is visibly labelled');
 }
});
test('invalid canvas dimensions cannot produce invalid geometry',()=>{
 for(const dimensions of[{width:0},{height:0},{width:NaN},{height:Infinity}])assert.throws(()=>drawAltitudeStrip(recordingCanvas().ctx,{map:current,altitude:600,...dimensions}),/Finite positive/);
 assert.throws(()=>altitudeStripState({altitude:600}),/authored Grove map/);
});

test('top landmark is the exact simulation escape boundary for every supported world descriptor',()=>{
 for(const base of[current,legacy])for(const height of[600,1500,3000])for(const treeHeight of[350,800,1800]){
  const map={...base,height,tree:{...base.tree,height:treeHeight}},top=escapeAltitude(map),s=state(top,map);
  assert.equal(s.landmarks.top.altitude,top);assert.equal(s.fraction,.065);assert.match(s.label,/free-drift boundary/);
  assert.equal(s.spaceState,'bound','height alone still cannot create the success state');
 }
});

test('V4 strip expands the real 110m oak and keeps its55m centre in the middle below compressed sky',()=>{
 const map=createCurrentGroveMap(),centre=state(55,map),crown=state(110,map);
 assert.equal(centre.landmarks.tree.altitude,55);assert.equal(centre.fraction,.5);assert.equal(crown.landmarks.crown.altitude,110);assert.equal(crown.fraction,.26);
 assert.equal(centre.landmarks.top.altitude,3000);assert.equal(centre.landmarks.space.altitude,960);
 assert.equal(state(32,map).spaceState,'bound');assert.equal(state(3000,map,{spaceState:'escaped',gravityFactor:0}).status,'Free drift');
 let previous=Infinity;for(let y=-10;y<=3500;y+=.5){const value=state(y,map).fraction;assert.ok(value<=previous&&value>=.065&&value<=.94);previous=value;}
});
