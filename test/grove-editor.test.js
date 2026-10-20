import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,validateGroveMap,saveGroveMap,readGroveMap,MAP_KEY,objectBounds} from '../src/grove-map.js';
import {createEditorHistory,translateObject,resizeObject,insertVertex,removeVertex,simplifyStroke,pointInside,encodeMapLink,decodeMapLink} from '../src/grove-editor-tools.js';
const shape={id:'concave',type:'polygon',name:'An inward branch',points:[{x:2,y:3},{x:7,y:3},{x:7,y:7},{x:4,y:5},{x:2,y:7}],collision:true,material:'wood',layer:'world',bounce:.5};
test('concave shape edits preserve its hollow and do not mutate the previous map',()=>{
 const original=structuredClone(shape),moved=translateObject(shape,8,-10),resized=resizeObject(moved,10,8);
 assert.deepEqual(shape,original);assert.deepEqual(objectBounds(resized),{minX:10,maxX:20,minY:-7,maxY:1});
 assert.equal(pointInside({x:14,y:-3},resized.points),true);assert.equal(pointInside({x:14,y:0},resized.points),false);
 assert.doesNotThrow(()=>validateGroveMap({...createGroveMap(),objects:[resized]}));
});
test('point insertion and removal are reversible with minimum geometry enforced',()=>{
 const inserted=insertVertex(shape,2);assert.equal(inserted.points.length,6);assert.deepEqual(inserted.points[3],{x:5.5,y:6});assert.deepEqual(removeVertex(inserted,3),shape);
 const triangle={...shape,points:shape.points.slice(0,3)};assert.throws(()=>removeVertex(triangle,0),/at least 3/);
 const path={...shape,type:'chain',points:[{x:0,y:0},{x:3,y:3}]};assert.throws(()=>insertVertex(path,1),/segment/);assert.throws(()=>removeVertex(path,0),/at least 2/);
});
test('freehand simplification preserves ends and the shape of a turn',()=>{
 const stroke=Array.from({length:61},(_,i)=>({x:i/10,y:i<30?0:(i-30)/10}));const simple=simplifyStroke(stroke,.01);
 assert.deepEqual(simple,[{x:0,y:0},{x:3,y:0},{x:6,y:3}]);assert.equal(stroke.length,61);
});
test('circle resizing keeps its centre and radius positive',()=>{
 const circle={id:'a',type:'circle',x:5,y:9,radius:2};assert.deepEqual(resizeObject(circle,10,300),{...circle,radius:5});assert.equal(resizeObject(circle,-8,0).radius,.05);assert.equal(circle.radius,2);
});
test('undo restores imported shapes and branches correctly after a new edit',()=>{
 const initial=createGroveMap(),h=createEditorHistory(initial,3),next={...initial,objects:[shape]};h.push(next);next.objects[0]={...shape,name:'after snapshot'};assert.deepEqual(h.undo(),initial);assert.equal(h.redo().objects[0].name,'An inward branch');h.undo();h.push({...initial,name:'New route'});assert.equal(h.canRedo,false);assert.equal(h.undo().name,'Grandfather Tree');
});
test('portable map link carries geometry, off-plane pieces and enemy behavior without local files',async()=>{
 const map=createGroveMap();map.name='A pocket world';map.objects.push(shape);map.objects[0].collision=false;map.objects[0].layer='back';
 const token=await encodeMapLink(map);assert.match(token,/^[gj]1\.[A-Za-z0-9_-]+$/);assert.ok(token.length<140000);assert.deepEqual(await decodeMapLink(token),validateGroveMap(map));
 await assert.rejects(decodeMapLink('not-a-map'));await assert.rejects(decodeMapLink('j1.'+'a'.repeat(140001)),/oversized/);
});
test('invalid imported maps cannot overwrite the existing saved layout',()=>{
 const values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)},map=createGroveMap();saveGroveMap(storage,map);const before=values.get(MAP_KEY);
 assert.throws(()=>saveGroveMap(storage,{...map,objects:[{...shape,points:[{x:0,y:0},{x:2,y:2},{x:0,y:2},{x:2,y:0}]}]}));assert.equal(values.get(MAP_KEY),before);assert.deepEqual(readGroveMap(storage),validateGroveMap(map));
});

test('inspector accepts quarter-metre snapped positions without native step mismatch',async()=>{
 const {readFile}=await import('node:fs/promises');const html=await readFile(new URL('../editor.html',import.meta.url),'utf8');
 for(const id of ['propX','propY','propWidth','propHeight','vertexX','vertexY']){const input=html.match(new RegExp(`<input[^>]+id="${id}"[^>]*>`))?.[0];assert.ok(input,`${id} exists`);assert.match(input,/step="any"/,`${id} accepts imported and snapped decimals`);}
});
