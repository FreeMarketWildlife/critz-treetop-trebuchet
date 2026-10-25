import test from 'node:test';import assert from 'node:assert/strict';
import {drawDenseJungle} from '../src/forest-depth-art.js';
import {oakLeafVolumes} from '../src/oak-canopy-art.js';
import {createGroveMap,objectBounds} from '../src/grove-map.js';
import {oakBranchPlan,curvePoint} from '../src/oak-world.js';
test('an opaque forest interior covers every pixel below 25m at all horizontal positions and zooms',()=>{
 for(const x of[-9500,-48,0,137,9700])for(const scale of[.1,3,90,180])for(const altitude of[3,20,30]){
  const W=900,H=700,origin=32,camera={x,y:altitude-origin,scale},rects=[];
  const project=(x,y)=>[W/2+(x-camera.x)*scale,H/2-(y-camera.y)*scale];
  const c=new Proxy({},{get:(_,key)=>String(key).startsWith('create')?()=>({addColorStop(){}}):key==='fillRect'?(...p)=>rects.push(p):()=>{},set:()=>true});
  drawDenseJungle(c,{project,camera,scale,width:W,height:H,origin});
  const roof=project(0,25-origin)[1];if(roof>=H)continue;
  assert.ok(rects.some(([x,y,w,h])=>x===0&&w===W&&y<=Math.max(0,roof)&&y+h>=H));
 }
});
test('oak leaf volumes track moved editor leaf geometry without stale cached positions',()=>{
 const map=createGroveMap(),before=oakLeafVolumes(map)[0],leaf=map.objects.find(o=>o.id.endsWith('-leaves')&&o.id.startsWith('oak-limb-'));
 for(const p of leaf.points)p.x+=4;assert.equal(oakLeafVolumes(map)[0].x,before.x+4);
});
test('the new oak has wandering main limbs, unequal splits and a bounded physical crown',()=>{
 const branches=oakBranchPlan(),main=branches.filter(b=>!b.id.includes('-fork-'));
 assert.ok(main.filter(b=>b.points.length>4).length>=6);
 for(const b of main.filter(b=>b.points.length>4)){
  const samples=Array.from({length:9},(_,i)=>curvePoint(b.points,i/8)),turns=[];
  for(let i=1;i<samples.length-1;i++){const a=samples[i-1],q=samples[i],z=samples[i+1];turns.push((q.x-a.x)*(z.y-q.y)-(q.y-a.y)*(z.x-q.x));}
  assert.ok(turns.some(v=>v>.05)&&turns.some(v=>v<-.05),b.id+' has bends in both directions');
 }
 const map=createGroveMap();for(const o of map.objects.filter(o=>o.id.startsWith('oak-limb-')))assert.ok(objectBounds(o).maxY+map.launch.y<=75.1,o.id);
});
