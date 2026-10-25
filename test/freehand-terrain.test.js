import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,validateGroveMap} from '../src/grove-map.js';
import {closeFreehandStroke,createEditorHistory} from '../src/grove-editor-tools.js';
import {triangulatePolygon,polygonArea,pointInPolygon} from '../src/grove-geometry.js';
const mapWith=objects=>({...createGroveMap(),objects});
test('released freehand outline closes a concave solid with matching triangulated interior',()=>{
 const p=closeFreehandStroke([{x:0,y:0},{x:4,y:0},{x:4,y:1},{x:1,y:1},{x:1,y:4},{x:0,y:4},{x:0,y:0}],.01);
 assert.equal(p.length,6);assert.equal(pointInPolygon({x:2,y:2},p),false);assert.equal(pointInPolygon({x:.5,y:2},p),true);
 assert.ok(Math.abs(triangulatePolygon(p).reduce((a,t)=>a+Math.abs(polygonArea(t)),0)-Math.abs(polygonArea(p)))<1e-9);
 const m=mapWith([]),h=createEditorHistory(m);m.objects.push({id:'fill',type:'polygon',points:p,name:'Fill',collision:true,layer:'world',material:'wood',bounce:.3});h.push(validateGroveMap(m));assert.equal(h.undo().objects.length,0);assert.equal(h.redo().objects[0].type,'polygon');
});
test('tiny, straight and crossed strokes reject atomically; large samples simplify to bounded geometry',()=>{
 for(const p of [[{x:0,y:0}], [{x:0,y:0},{x:2,y:0},{x:4,y:0}],[{x:0,y:0},{x:4,y:4},{x:0,y:4},{x:4,y:0}]])assert.throws(()=>closeFreehandStroke(p,.01));
 const p=closeFreehandStroke(Array.from({length:256},(_,i)=>({x:3*Math.cos(i/255*Math.PI*2),y:3*Math.sin(i/255*Math.PI*2)})),.008);assert.ok(p.length<=128);assert.ok(p.length>8);
});
