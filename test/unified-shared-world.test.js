import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';
import{createWorldSession}from'../src/world-session.js';import{createGroveMap,MAP_KEY,readGroveMap}from'../src/grove-map.js';import{createEditorHistory}from'../src/grove-editor-tools.js';
const source=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8'),handler=source.slice(source.indexOf('async function loadLocationMap(){'),source.indexOf('function init(){'));
function setup(decodeMapLink){
 const local={...createGroveMap(),name:'Personal world'},raw=JSON.stringify(local),storage={getItem:()=>raw,setItem(){assert.fail('opening shared map must not save');}},world=createWorldSession({storage}),nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,textContent:''});return nodes.get(id);};
 const context={URLSearchParams,world,doc:structuredClone(world.map),stable:structuredClone(world.map),mapStore:storage,readOnly:false,unsaved:false,knownRevision:0,mapLoadGeneration:0,localBeforeShared:null,selected:null,history:createEditorHistory(local),location:{hash:''},host:{classList:{add(){},remove(){}}},$,clone:structuredClone,readGroveMap,createEditorHistory,decodeMapLink,closeDialog(){},finish(){},cancelDrawing(){},refresh(){},defaultView(){},status(){}};
 vm.createContext(context);vm.runInContext(handler,context);return{context,world,storage,raw,load:()=>vm.runInContext('loadLocationMap()',context)};
}
test('shared map is the same current play world without saving it; removing shared link restores an unsaved local draft',async()=>{
 const shared={...createGroveMap(),name:'Shared snapshot'},h=setup(async()=>shared);h.context.doc.name='Unsaved local course';h.context.unsaved=true;h.world.replace(h.context.doc,{dirty:true});
 h.context.location.hash='#map=shared';await h.load();assert.equal(h.world.map.name,'Shared snapshot');assert.equal(h.world.readOnly,true);assert.equal(h.context.readOnly,true);assert.equal(h.storage.getItem(MAP_KEY),h.raw);
 h.context.location.hash='';await h.load();assert.equal(h.world.map.name,'Unsaved local course');assert.equal(h.world.readOnly,false);assert.equal(h.world.dirty,true);assert.equal(h.context.unsaved,true);assert.equal(h.storage.getItem(MAP_KEY),h.raw);
});
test('a later shared navigation wins over a slower decode in the same world session',async()=>{
 let firstResolve;const first=new Promise(r=>firstResolve=r),h=setup(token=>token==='first'?first:Promise.resolve({...createGroveMap(),name:'Second snapshot'}));
 h.context.location.hash='#map=first';const a=h.load();h.context.location.hash='#map=second';await h.load();firstResolve({...createGroveMap(),name:'Stale snapshot'});await a;assert.equal(h.world.map.name,'Second snapshot');assert.equal(h.context.doc.name,'Second snapshot');assert.equal(h.world.revision,1);
});

test('author shortcuts ignore Play mode and respect composed input targets inside the scoped panel',()=>{
 let handler,active=false,tools=0,prevented=0;const context={window:{addEventListener(type,fn){if(type==='keydown')handler=fn;}},isActive:()=>active,root:{querySelector:()=>null},setTool(){tools++;},palette(){},closePanels(){}};vm.createContext(context);
 const line=source.split('\n').find(s=>s.startsWith("window.addEventListener('keydown'"));vm.runInContext(line,context);
 const event={target:{closest(){throw Error('shadow host is not the real input target');}},composedPath:()=>[{closest:()=>false}],key:'f',code:'KeyF',preventDefault(){prevented++;}};
 handler(event);assert.equal(tools,0,'Play retains ownership of F');active=true;handler({...event,composedPath:()=>[{closest:()=>true}]});assert.equal(tools,0,'typing into editor inputs does not trigger tools');handler(event);assert.equal(tools,1);assert.equal(prevented,0);
});
