import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {groveTreeCamera,groveOverviewBounds,groveProject} from '../src/grove-camera.js';
import {createGroveMap,createLegacyGroveMap,createV3GroveMap,mapLevels,levelAt,validateGroveMap,readGroveMap,MAP_KEY} from '../src/grove-map.js';
import {jungleLayerAt,jungleLayersFor} from '../src/grove-jungle.js';
const source=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8');
function editor(doc,size={width:390,height:844}){
 const nodes=new Map(),camera={x:5,y:1.7,scale:24};
 const node=(tag='div',text)=>({tag,textContent:text??'',children:[],dataset:{},classList:{toggle(){}},style:{setProperty(){}},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;}});
 const $=id=>{if(!nodes.has(id))nodes.set(id,{...node(),value:0});return nodes.get(id);};
 const canvas={clientWidth:size.width,clientHeight:size.height},mini={getBoundingClientRect:()=>({left:10,top:20,width:180,height:120})};
 const context={doc,camera,$,width:0,height:0,canvas,mini,dpr:1,devicePixelRatio:1,firstSize:true,groveTreeCamera,groveOverviewBounds,levelAt,mapLevels,jungleLayerAt,jungleLayersFor,
  document:{querySelectorAll:()=>[]},root:{querySelectorAll:()=>[]},el:node,iconByLevel:{},requestDraw(){},closePanels(){}};
 vm.createContext(context);
 for(const name of ['cameraChanged','setLevel','levelPalette','miniBounds','resize','launchView','treeView','defaultView']){
  const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name);const next=source.indexOf('\nfunction ',start+1);vm.runInContext(source.slice(start,next<0?undefined:next),context);
 }
 const pointer=source.slice(source.indexOf('mini.onpointerdown=')).split('\n')[0];vm.runInContext(pointer,context);
 return{context,camera,nodes,$,mini};
}
test('V4 overview fits the physical oak floor, crown and width on phone and desktop without changing geometry',()=>{
 const map=createGroveMap(),before=JSON.stringify(map);assert.equal(map.version,4);
 for(const size of [{width:320,height:667},{width:390,height:844},{width:1031,height:738}]){
  const c=groveTreeCamera(map,size),r=map.tree.crownRadius;
  for(const p of [{x:map.tree.trunkX,y:-map.launch.y},{x:map.tree.trunkX,y:map.tree.height-map.launch.y},{x:map.tree.trunkX-r,y:map.tree.height-map.launch.y-map.tree.crownDepth*.5},{x:map.tree.trunkX+r,y:map.tree.height-map.launch.y-map.tree.crownDepth*.5}]){
   const q=groveProject(p,c,size.width,size.height);assert.ok(q.x>=size.width*.04&&q.x<=size.width*.96);assert.ok(q.y>=size.height*.07&&q.y<=size.height*.93);
  }
  const crownPixels=2*r*c.scale,treePixels=map.tree.height*c.scale;
  assert.ok(Math.abs(crownPixels/treePixels-76/110)<1e-12);assert.ok(crownPixels>=size.width*.35,'the camera has no inherited220m empty side');assert.ok(treePixels>=size.height*.53);
 }
 assert.equal(JSON.stringify(map),before);
});
test('V2 and V3 overview snapshots retain their exact inherited framing',()=>{
 const sizes=[{width:390,height:844},{width:1031,height:738}];
 for(const [make,expected]of [[createLegacyGroveMap,[{x:58.8,y:-87.5,scale:1.088709677419355},{x:58.8,y:-87.5,scale:1.2781855670103093}]],[createV3GroveMap,[{x:-145,y:-187.5,scale:.325},{x:-145,y:-187.5,scale:.7004745762711864}]]]){
  const map=make(),before=JSON.stringify(map);sizes.forEach((size,i)=>assert.deepEqual(groveTreeCamera(map,size),expected[i]));assert.equal(JSON.stringify(map),before);
 }
});
test('first editor frame shows the whole V4 tree and readouts derive from the loaded world',()=>{
 for(const make of [createGroveMap,createLegacyGroveMap,createV3GroveMap]){
  const doc=make(),before=JSON.stringify(doc),h=editor(doc);h.context.resize();
  if(doc.version===4){assert.deepEqual(h.camera,groveTreeCamera(doc,{width:390,height:844}));assert.match(h.$('launchLandmark').textContent,/32 m · 110 m TREE/);assert.doesNotMatch(h.$('mapDescription').textContent,/800|600|75%/);}
  else{assert.equal(h.camera.x,3);assert.equal(h.camera.y,2);assert.equal(h.camera.scale,13);}
  assert.equal(h.$('jumpY').min,0);assert.equal(h.$('jumpY').max,doc.height);assert.equal(h.$('jumpX').max,doc.width);
  assert.match(h.$('mapDescription').textContent,new RegExp(String(doc.tree.height)+' m tree'));assert.equal(JSON.stringify(doc),before);
 }
});
test('V4 minimap uses the same proportional bounds and altitude offset for navigation',()=>{
 const doc=createGroveMap(),h=editor(doc);h.context.resize();const b=h.context.miniBounds(),physical=groveOverviewBounds(doc);
 assert.equal(b.minX,physical.minX);assert.equal(b.spanX,physical.maxX-physical.minX);assert.equal(b.minAltitude,physical.minY+doc.launch.y);assert.equal(b.spanY,physical.maxY-physical.minY);
 const navigate=(x,altitude)=>h.mini.onpointerdown({clientX:10+(x-b.minX)/b.spanX*180,clientY:20+(1-(altitude-b.minAltitude)/b.spanY)*120});
 for(const altitude of [0,32,110]){navigate(doc.tree.trunkX,altitude);assert.ok(Math.abs(h.camera.y+doc.launch.y-altitude)<1e-10);assert.ok(Math.abs(h.camera.x-doc.tree.trunkX)<1e-10);}
 for(const layer of [...mapLevels(doc),...jungleLayersFor(doc)]){h.context.setLevel(layer);assert.ok(Number.isFinite(h.camera.scale)&&h.camera.scale>0);assert.ok(h.camera.y+doc.launch.y>=0&&h.camera.y+doc.launch.y<=doc.height);}
});
test('saved custom legacy geometry is unchanged by editor views or navigation',()=>{
 for(const make of [createLegacyGroveMap,createV3GroveMap]){
  const custom=make();custom.name='My preserved grove';custom.objects[0].points[0].x-=.25;const raw=JSON.stringify(custom),storage={getItem:key=>{assert.equal(key,MAP_KEY);return raw;},setItem(){assert.fail('viewing cannot write storage');}};
  const loaded=readGroveMap(storage);assert.deepEqual(loaded,validateGroveMap(custom));const before=JSON.stringify(loaded),h=editor(loaded);h.context.resize();h.context.treeView();h.context.setLevel(mapLevels(loaded)[0]);h.context.launchView();assert.equal(JSON.stringify(loaded),before);
 }
});
test('editor navigation exposes the true-scale comparison without fixed giant-tree labels',()=>{
 const html=readFileSync(new URL('../editor.html',import.meta.url),'utf8');assert.match(html,/href="scale\.html\?author=1"/);assert.match(html,/id="launchLandmark"/);assert.doesNotMatch(html,/800 m tree|STARTING BRANCH · 75% UP|value="600"/);
});

test('editor botanical layer cards use the loaded map helper instead of giant-tree altitude constants',()=>{
 for(const make of [createGroveMap,createV3GroveMap,createLegacyGroveMap]){
  const doc=make(),h=editor(doc);h.context.levelPalette();
  const text=node=>[node.textContent,...(node.children??[]).flatMap(text)],labels=text(h.$('levels'));
  for(const layer of jungleLayersFor(doc))assert.ok(labels.includes(String(layer.low)+'–'+layer.high+' m · bounce routes'));
  if(doc.version===4){assert.ok(labels.includes('0–2 m · bounce routes'));assert.ok(labels.includes('2–20 m · bounce routes'));assert.ok(!labels.includes('340–480 m · bounce routes'));}
 }
});
