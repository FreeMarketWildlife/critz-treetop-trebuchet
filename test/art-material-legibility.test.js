import test from 'node:test';
import assert from 'node:assert/strict';
import {drawMaterialPolygon,GROVE_MATERIALS} from '../src/grove-material-art.js';

const rgb=hex=>hex.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));
const luminance=hex=>rgb(hex).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
function canvas(){
 const calls=[],strokes=[],fills=[];let path=[],depth=0,clips=0;
 const methods=new Set(['save','restore','beginPath','closePath','moveTo','lineTo','bezierCurveTo','ellipse','fill','stroke','fillRect','clip']);
 const ctx=new Proxy({},{get(target,key){if(!methods.has(key))return target[key];return(...args)=>{
  calls.push([key,...args]);for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${key} must stay finite`);
  if(key==='save')depth++;if(key==='restore')assert.ok(--depth>=0);if(key==='clip')clips++;
  if(key==='beginPath')path=[];if(['moveTo','lineTo','bezierCurveTo','ellipse'].includes(key))path.push([key,...args]);
  if(key==='fill')fills.push({color:target.fillStyle,path:[...path]});if(key==='stroke')strokes.push({color:target.strokeStyle,path:[...path]});
 };},set(target,key,value){if(['fillStyle','strokeStyle'].includes(key))assert.match(value,/^#[0-9a-f]{6}$/i);target[key]=value;return true;}});
 return{ctx,calls,strokes,fills,get depth(){return depth;},get clips(){return clips;}};
}
function render(material,points,scale=43,x=9){
 const c=canvas(),object={material,points},before=JSON.stringify(object),b={minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))};
 const project=(px,py)=>[195+(px-x)*scale,422-py*scale];
 drawMaterialPolygon(c.ctx,object,b,project,{width:390,height:844,scale});
 assert.equal(JSON.stringify(object),before,'art never edits the canonical polygon');assert.equal(c.depth,0,'canvas state is balanced');
 assert.deepEqual(c.fills[0].path,points.map((p,i)=>[i?'lineTo':'moveTo',...project(p.x,p.y)]),'base fill keeps the exact collision silhouette');
 return c;
}

test('leaf faces remain visibly distinct from timber at small scale',()=>{
 const wood=rgb(GROVE_MATERIALS.wood[0]),leaf=rgb(GROVE_MATERIALS.leaf[0]);
 assert.ok(wood[0]>wood[1]&&leaf[1]>leaf[0],'warm timber and green leaf have different hue families');
 assert.ok(Math.hypot(...leaf.map((v,i)=>v-wood[i]))>60,'the entire face, not only a thin edge, distinguishes leaf');
 for(const material of ['wood','leaf'])assert.ok((luminance(GROVE_MATERIALS[material][0])+.05)/(luminance('#302d2b')+.05)>2.5,'the collision outline stays legible against either face');
});

test('material art preserves finite bounded drawing for thin, sloping and edited polygons',()=>{
 const shapes=[[[0,0],[18,0],[18,-.3],[0,-.3]],[[0,0],[18,3],[18,2.5],[0,-.5]],[[0,3],[6,5],[18,3],[14,-2],[1,-3]]].map(shape=>shape.map(([x,y])=>({x,y})));
 for(const material of Object.keys(GROVE_MATERIALS))for(const points of shapes)for(const scale of [.3,4,43,210]){
  const c=render(material,points,scale);assert.ok(c.calls.length<500,`${material}/${scale} has bounded cost: ${c.calls.length}`);
  assert.equal(c.clips,scale<3?0:1,'all surface illustration is clipped to the polygon');
  if(material==='leaf')assert.ok(c.calls.length<140,`leaf face has no extra detail noise: ${c.calls.length}`);
 }
});

test('leaf ribs stay anchored to the map as the camera moves',()=>{
 const points=[{x:0,y:0},{x:18,y:3},{x:18,y:2.5},{x:0,y:-.5}],scale=80;
 const ribs=x=>render('leaf',points,scale,x).strokes.filter(s=>s.color==='#425f42').map(s=>s.path.map(([op,px,py])=>[op,Math.round(((px-195)/scale+x)*1e6)/1e6,Math.round(((422-py)/scale)*1e6)/1e6]));
 const a=ribs(4),b=ribs(5);assert.ok(a.length&&b.length);assert.ok(a.some(p=>b.some(q=>JSON.stringify(p)===JSON.stringify(q))),'overlapping views retain an identical physical rib');
});

test('wide bark faces remain bounded and fissures stay fixed under camera movement',()=>{
 const points=[{x:-500,y:0},{x:20000,y:0},{x:20000,y:-3},{x:-500,y:-3}],scale=80;
 const fissures=x=>{const c=render('wood',points,scale,x);assert.ok(c.calls.length<220,`wide bark stays bounded: ${c.calls.length}`);return c.strokes.filter(s=>s.color==='#513a2e').map(s=>s.path.map(([op,...v])=>[op,...v.map((n,i)=>Math.round((i%2?(422-n)/scale:(n-195)/scale+x)*1e6)/1e6)]));};
 const a=fissures(4),b=fissures(5);assert.ok(a.length&&b.length);assert.ok(a.some(p=>b.some(q=>JSON.stringify(p)===JSON.stringify(q))),'bark scales do not slide with the camera');
});
