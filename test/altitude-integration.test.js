import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {drawAltitudeStrip} from '../src/altitude-strip.js';
import {createGroveMap,createV3GroveMap} from '../src/grove-map.js';
import {spaceWorldDescriptor} from '../src/space-policy.js';
import {CRITTERS} from '../src/build-catalog.js';

// Run the actual application adapter, including its DPR, hidden-panel and
// captured-world handling. This does not emulate CSS or certify native pixels.
const app=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),start=app.indexOf('function drawHeightMap(){'),end=app.indexOf('\nfunction drawHudCritter()',start);
assert.ok(start>=0&&end>start,'game height-map adapter exists');
const adapter=app.slice(start,end);
function harness({width=44,height=540,dpr=1}={}){
 let position={y:.2};const box={width,height},attributes={},calls=[],map=createGroveMap();
 const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]??((...args)=>calls.push([key,...args])),set:(target,key,value)=>(target[key]=value,true)});
 const canvas={width:0,height:0,dataset:{},getBoundingClientRect:()=>box,getContext:()=>{calls.push(['getContext']);return context;},setAttribute:(key,value)=>attributes[key]=value};
 const sim={shot:{},real:()=>position,animal:CRITTERS[0],release:null,gravityFactor:1,spaceState:'bound',spaceEscape:null};
 const scope={$:id=>{assert.equal(id,'altitudeStrip');return canvas;},window:{devicePixelRatio:dpr},drawAltitudeStrip,drawCritter(){},sim,groveMap:map};
 const draw=vm.runInNewContext('('+adapter+')',scope);
 return{canvas,box,attributes,calls,sim,map,draw,setPosition:y=>position={y}};
}

test('shared normal/editor Play adapter paints at desktop and phone sizes with bounded DPR',()=>{
 for(const [width,height]of[[44,540],[38,510],[38,298]])for(const dpr of[1,2,3]){
  const h=harness({width,height,dpr});h.draw();
  assert.equal(h.canvas.width,Math.round(width*Math.min(2,dpr)));assert.equal(h.canvas.height,Math.round(height*Math.min(2,dpr)));
  assert.ok(h.calls.some(c=>c[0]==='clearRect'&&c[3]===width&&c[4]===height),'real strip paints in CSS pixels');
  assert.match(h.attributes['aria-label'],/Grandfather Tree centre 55 m, crown 110 m/);assert.match(h.attributes['aria-label'],/free-drift boundary 3,000 m/);
  assert.match(h.attributes['aria-label'],/Height only; horizontal distance is not shown/);assert.ok(h.calls.some(c=>c[0]==='fillText'&&c[1]==='COMP.'));
  assert.equal(h.canvas.dataset.spaceState,'bound');assert.equal(Number(h.canvas.dataset.altitude),h.map.launch.y+.2);
 }
});
test('hidden editor/game panels skip zero-size paint and recover when Play becomes visible',()=>{
 for(const [width,height]of[[0,540],[44,0],[0,0]]){
  const h=harness({width,height});h.draw();assert.equal(h.calls.length,0);assert.deepEqual(h.canvas.dataset,{});
  h.box.width=38;h.box.height=510;h.draw();assert.ok(h.calls.some(c=>c[0]==='getContext'));assert.equal(h.canvas.width,38);assert.equal(h.canvas.height,510);assert.ok(Number.isFinite(Number(h.canvas.dataset.position)));
 }
});
test('actual altitude adapter keeps paused readings stable and resets its Y marker on retry',()=>{
 const h=harness({width:38,height:510});h.draw();const first={...h.canvas.dataset};
 h.draw();assert.deepEqual(h.canvas.dataset,first,'drawing cannot independently advance a paused marker');
 h.setPosition(90-h.map.launch.y);h.draw();assert.equal(Number(h.canvas.dataset.altitude),90);assert.ok(Number(h.canvas.dataset.position)<Number(first.position));
 h.setPosition(.2);h.draw();assert.deepEqual(h.canvas.dataset,first,'retry returns to the actual launcher altitude');
});
test('restored completion uses its captured world scale while tracking current absolute body altitude',()=>{
 const h=harness(),captured=createV3GroveMap();h.sim.spaceEscape={world:spaceWorldDescriptor(captured)};h.sim.spaceState='escaped';h.sim.release={};h.sim.gravityFactor=0;
 h.setPosition(3000-h.map.launch.y);h.draw();
 assert.equal(h.canvas.dataset.spaceState,'escaped');assert.equal(Number(h.canvas.dataset.altitude),3000);assert.equal(Number(h.canvas.dataset.position),.065);
 assert.match(h.attributes['aria-label'],/Free drift/);assert.match(h.attributes['aria-label'],/Grandfather Tree centre 400 m, crown 800 m/);
 h.setPosition(3100-h.map.launch.y);h.draw();assert.equal(Number(h.canvas.dataset.position),.065);assert.match(h.attributes['aria-label'],/pinned above the map/);
});
