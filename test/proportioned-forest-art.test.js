import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {drawGroveBackdrop} from '../src/grove-backdrop.js';
import {drawProportionedForestBackdrop,proportionedForestCrowns} from '../src/proportioned-forest-art.js';
import {oakCrownCommands,oakTrunkCommands,oakRootCommands} from '../src/grove-tree-art.js';
import {createProportionedGroveMap,createV4Revision7GroveMap} from '../src/grove-map.js';
import {jungleLayerAt,jungleLayersFor,JUNGLE_LAYERS} from '../src/grove-jungle.js';
function recorder(){
 const calls=[],styles={globalAlpha:1},stack=[];
 const ctx=new Proxy({}, {get(_,k){if(k in styles)return styles[k];
  if(k==='save')return()=>{stack.push({...styles});calls.push(['save']);};
  if(k==='restore')return()=>{assert.ok(stack.length,'balanced Canvas state');for(const key of Object.keys(styles))delete styles[key];Object.assign(styles,stack.pop());calls.push(['restore']);};
  if(String(k).startsWith('create')&&String(k).endsWith('Gradient'))return(...a)=>{calls.push([k,...a]);return{addColorStop:(...a)=>calls.push(['stop',...a])};};
  return(...a)=>{for(const n of a.flat())if(typeof n==='number')assert.ok(Number.isFinite(n),`${k} finite geometry`);calls.push([k,...a]);};
 },set(_,k,v){if(typeof v==='number')assert.ok(Number.isFinite(v),`${k} finite style`);styles[k]=v;calls.push([k,v]);return true;}});
 return{ctx,calls,get balance(){return stack.length;},hash:()=>createHash('sha256').update(JSON.stringify(calls)).digest('hex')};
}
const legacyMaps=[
 {version:2,launch:{y:300},tree:{height:400,trunkX:-12,trunkWidth:14,doorX:-8}},
 {version:3,launch:{y:600},tree:{height:800,trunkX:-120,trunkWidth:240,crownRadius:500,crownDepth:350,doorX:-8}}
];
test('V2 and V3 forest draw commands remain byte-for-byte identical at overview and close scale',()=>{
 const expected=[['b8089e84c8277ba2e3d229dda1cdcc3883546ca334f40b1f1d561804e8154799','e2bd92131e71cf55f27e3460265c588edf599fd0b39a30b6f5730f6cbb49b9b4'],['07ad0c604297dc67432bab5d92312c0234fa2370cd2f2ebc1ca60f6bf0c09c3c','ed760818ab4ad93282172b5682b1e4f2f57f8d09ae723a33b348821302fdc829']];
 for(const[i,map]of legacyMaps.entries())for(const[j,camera]of[{x:-100,y:-100,scale:.7},{x:0,y:2,scale:180}].entries()){
  const r=recorder();drawGroveBackdrop(r.ctx,{map,camera,width:1200,height:900});assert.equal(r.hash(),expected[i][j]);assert.equal(r.balance,0);
 }
});
const points=commands=>commands.flatMap(([, ...a])=>Array.from({length:a.length/2},(_,i)=>({x:a[i*2],y:a[i*2+1]})));
test('the shared oak vectors obey the actual 75 m height, 72 m crown and 7 m basal trunk',()=>{
 const map=createProportionedGroveMap(),t=map.tree,origin=map.launch.y,crown=points(oakCrownCommands(t,origin)),trunk=points(oakTrunkCommands(t,origin)),roots=oakRootCommands(t,origin).flatMap(points);
 assert.equal(Math.max(...crown.map(p=>p.y))+origin,75);assert.equal(Math.min(...crown.map(p=>p.y))+origin,30);
 assert.equal(Math.max(...crown.map(p=>p.x))-Math.min(...crown.map(p=>p.x)),72);
 assert.equal(trunk.filter(p=>p.y===-origin).reduce((range,p)=>[Math.min(range[0],p.x),Math.max(range[1],p.x)],[Infinity,-Infinity]).reduce((a,b)=>b-a),7);
 assert.ok(Math.max(...roots.map(p=>p.x))-Math.min(...roots.map(p=>p.x))<=9.81,'root spread is about ten metres, not giant old fins');
 for(const p of[...crown,...trunk,...roots])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
});
test('V4 tree masses derive only from canonical 25–30 m forest props and track editor edits',()=>{
 const map=createProportionedGroveMap(),bounds=proportionedForestCrowns(map);assert.equal(bounds.length,map.objects.filter(o=>/^amazon-tree-\d+-crown$/.test(o.id)&&o.collision===false).length);
 assert.deepEqual(bounds.slice(0,4).map(b=>b.maxY+map.launch.y),[25,28.5,26.5,30]);
 for(const b of bounds)assert.ok(b.maxY+map.launch.y>=25&&b.maxY+map.launch.y<=30,b.id);
 bounds.slice(0,4).forEach((b,i)=>assert.ok(Math.abs(b.maxX-b.minX-[9,9.9,10.8,11.7][i])<1e-12));
 const crown=map.objects.find(o=>o.id==='amazon-tree-1-crown');for(const p of crown.points)p.y+=3;
 assert.equal(proportionedForestCrowns(map)[1].maxY+map.launch.y,31.5,'mutable editor props do not retain cached old heights');
});
test('V4 botanical strata match real canopy heights while legacy palette and labels stay unchanged',()=>{
 const map=createProportionedGroveMap();assert.deepEqual(jungleLayersFor(map).map(l=>[l.low,l.high]),[[25,30],[15,25],[2,15],[0,2]]);
 assert.equal(jungleLayerAt(21,map).id,'canopy');assert.equal(jungleLayerAt(28,map).id,'emergent');assert.equal(jungleLayerAt(32,map),undefined);
 const historic=createV4Revision7GroveMap();assert.deepEqual(jungleLayersFor(historic).map(l=>[l.low,l.high]),[[45,60],[20,45],[2,20],[0,2]]);
 assert.deepEqual(proportionedForestCrowns(historic).slice(0,4).map(b=>b.maxY+historic.launch.y),[40,35,45,60]);
 assert.equal(jungleLayersFor({version:3}),JUNGLE_LAYERS);assert.equal(jungleLayersFor({version:2}),JUNGLE_LAYERS);assert.equal(jungleLayerAt(32,{version:2}),undefined);
});
test('V4 actual backdrop is finite and bounded on phone/desktop, close/overview/floor/space and edited maps',()=>{
 const map=createProportionedGroveMap(),before=JSON.stringify(map);
 for(const size of[{width:390,height:844},{width:1726,height:875}])for(const camera of[{x:-8,y:23,scale:3},{x:0,y:2,scale:180},{x:52,y:-7,scale:90},{x:10,y:-34,scale:50},{x:0,y:1500,scale:1},{x:0,y:30000,scale:.001}]){
  const r=recorder();drawGroveBackdrop(r.ctx,{map,camera,...size});assert.equal(r.balance,0);assert.ok(r.calls.length<4000,`bounded art ${r.calls.length}`);
  const direct=recorder();drawProportionedForestBackdrop(direct.ctx,{map,camera,...size});assert.equal(r.hash(),direct.hash(),'V4 bypasses old giant forest generator');
 }
 assert.equal(JSON.stringify(map),before,'rendering never edits canonical geometry');
});
