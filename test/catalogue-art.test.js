import test from 'node:test';
import assert from 'node:assert/strict';
import {createBuildRenderer} from '../src/build-art.js';
import {BuildSimulation} from '../src/build-physics.js';
import {PARTS,SLOTS,STARTER} from '../src/build-catalog.js';
import {createPayloadLoading} from '../src/payload-loading.js';

// Record real Canvas commands, not a parallel list of nominal part appearances.
// This catches a fitted ID that is lost before reaching the mechanism painter.
function recording(size){
 const calls=[],styles={},stack=[];let depth=0;
 const record=(name,args)=>{for(const n of args.flat())if(typeof n==='number')assert.ok(Number.isFinite(n),`${name}: finite geometry`);calls.push([name,...args]);};
 const ctx=new Proxy({}, {get(_,key){
  if(key in styles)return styles[key];
  if(key==='createLinearGradient'||key==='createRadialGradient')return(...args)=>{record(key,args);return{addColorStop(...a){record('addColorStop',a);}};};
  if(key==='measureText')return text=>({width:String(text).length*5});
  if(key==='save')return()=>{depth++;stack.push({...styles});record(key,[]);};
  if(key==='restore')return()=>{assert.ok(depth>0,'balanced Canvas restore');depth--;const prior=stack.pop();for(const k of Object.keys(styles))delete styles[k];Object.assign(styles,prior);record(key,[]);};
  return(...args)=>record(key,args);
 },set(_,key,value){styles[key]=value;record(`set:${String(key)}`,[value]);return true;}});
 const canvas={dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>size};
 return{canvas,calls,get depth(){return depth;}};
}
function signature(build,{size={width:390,height:844},loading=false,preview=false,mutate}={}){
 const sim=new BuildSimulation(build);if(loading)sim.loading=createPayloadLoading(sim);if(mutate)mutate(sim);
 const before=JSON.stringify(sim.snapshot()),c=recording(size),renderer=createBuildRenderer(c.canvas);
 renderer.draw(sim,{labels:false,pixelRatio:1,preview});
 assert.equal(JSON.stringify(sim.snapshot()),before,'painting does not change the simulation');assert.equal(c.depth,0,'Canvas state is restored');assert.ok(c.calls.length<6500,`bounded mechanism draw: ${c.calls.length}`);
 // Exclude colours from this signature. Distinct line width, weave, cage,
 // fitting count and actual geometry must distinguish tiers too.
 const geometry=c.calls.filter(row=>!['set:fillStyle','set:strokeStyle'].includes(row[0]));
 return{all:JSON.stringify(c.calls),geometry:JSON.stringify(geometry),calls:c.calls,sim,canvas:c.canvas,renderer};
}
function stableClock(run){const old=Object.getOwnPropertyDescriptor(globalThis,'performance'),dpr=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');Object.defineProperty(globalThis,'performance',{value:{now:()=>0},configurable:true});Object.defineProperty(globalThis,'devicePixelRatio',{value:1,configurable:true});try{return run();}finally{Object.defineProperty(globalThis,'performance',old);if(dpr)Object.defineProperty(globalThis,'devicePixelRatio',dpr);else delete globalThis.devicePixelRatio;}}
const baseline={...STARTER,counterGrams:4000};

test('all 48 catalogue entries reach distinct finite mechanism artwork at unchanged chosen dimensions',()=>stableClock(()=>{
 assert.equal(PARTS.length,48,'update the complete visual audit when the catalogue changes');
 for(const [slot]of SLOTS){const items=PARTS.filter(p=>p.slot===slot),seen=new Map();
  for(const p of items){const drawn=signature({...baseline,[slot]:p.id});assert.ok(!seen.has(drawn.geometry),`${slot}/${p.id} is geometrically distinct from ${seen.get(drawn.geometry)}`);seen.set(drawn.geometry,p.id);}
  assert.equal(seen.size,items.length,slot);
 }
}));

test('all pouch fabrics remain distinct with the real loading basket and workshop preview',()=>stableClock(()=>{
 for(const loading of [false,true]){const seen=new Set();for(const p of PARTS.filter(p=>p.slot==='sling')){const r=signature({...baseline,sling:p.id},{loading});seen.add(r.geometry);}assert.equal(seen.size,6);}
 for(const size of [{width:390,height:844},{width:300,height:220},{width:1726,height:875}])for(const p of PARTS){signature({...baseline,[p.slot]:p.id},{size,preview:size.width===300});}
}));

test('frame finishes and bearing fittings follow moved and leaning bodies without changing fixtures',()=>stableClock(()=>{
 for(const chassis of ['skids','wheels','walking','floating'])for(const frame of ['timber','braced','giant','leviathan']){
  const r=signature({...baseline,chassis,frame},{mutate(sim){sim.frame.setTransform({x:.7/sim.L,y:.2/sim.L},-.18);}});
  assert.ok(r.calls.some(row=>row[0]==='clip'),'finish remains clipped to real fixtures');
  const center=r.renderer.project(r.sim.pivot()),pivots=r.calls.filter(row=>row[0]==='ellipse'&&Math.abs(row[1]-center[0])<1e-9&&Math.abs(row[2]-center[1])<1e-9);
  assert.ok(pivots.length>=2,'visible axle cap shares the actual moving pivot');
 }
}));

test('capacity artwork identifies the tier while selected weight and dimensions remain unchanged',()=>stableClock(()=>{
 for(const slot of ['frame','ballast']){const fixtureCounts=[],masses=[];
  for(const p of PARTS.filter(p=>p.slot===slot)){const r=signature({...baseline,[slot]:p.id});masses.push(r.sim.c.counterGrams);let count=0;for(let f=r.sim.frame.getFixtureList();f;f=f.getNext())count++;fixtureCounts.push(count);assert.equal(r.sim.c.pivotHeight,baseline.pivotHeight);assert.equal(r.sim.c.baseWidth,baseline.baseWidth);}
  assert.equal(new Set(masses).size,1);assert.equal(new Set(fixtureCounts).size,1,'surface variants do not fabricate support fixtures');
 }
}));
