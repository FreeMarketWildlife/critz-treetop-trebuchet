import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as G from '../../src/grove-map.js';
import {createEditorHistory,encodeMapLink,decodeMapLink} from '../../src/grove-editor-tools.js';
const results=[];
const store=raw=>({raw,writes:0,getItem(k){assert.equal(k,G.MAP_KEY);return this.raw??null;},setItem(k,v){assert.equal(k,G.MAP_KEY);this.raw=v;this.writes++;}});
const expected=G.validateGroveMap(G.createGroveMap());
const read=(s)=>G.readGroveMap(s)??G.createGroveMap();
const fresh=store();assert.deepEqual(read(fresh),expected);assert.equal(fresh.writes,0);results.push({case:'fresh storage',revision:read(fresh).starterRevision,objects:read(fresh).objects.length,writes:fresh.writes});
const creators=[G.createLegacyGroveMap,G.createCrownGroveMap,G.createAncientGroveMap,G.createOpeningGroveMap,G.createLandmarkedGroveMap,G.createGroveMap];
for(let i=0;i<creators.length;i++){
 const original=creators[i](),raw=JSON.stringify(original),s=store(raw);assert.deepEqual(read(s),expected);assert.equal(s.raw,raw);assert.equal(s.writes,0);
 const edits=[['map name',m=>m.name='My route'],['geometry',m=>m.objects.find(o=>o.points).points[0].x-=.01],['bounce',m=>m.objects[0].bounce=.41],['layer',m=>m.objects[0].layer='back'],['collision',m=>m.objects[0].collision=false],['enemy kind',m=>m.objects.find(o=>o.type==='enemy').kind='bird'],['object name',m=>m.objects[0].name='My branch'],['delete',m=>m.objects.pop()],['add',m=>m.objects.push({id:'custom-circle',type:'circle',name:'My stone',x:19000,y:20,radius:1,collision:true,layer:'world',material:'stone',bounce:.25})],['tree',m=>m.tree.trunkX-=.01]];
 let preserved=0;
 for(const[label,edit]of edits){const m=structuredClone(original);edit(m);const s=store(JSON.stringify(m)),before=s.raw;assert.deepEqual(read(s),G.validateGroveMap(m),`revision ${i+2}, ${label}`);assert.equal(s.raw,before);assert.equal(s.writes,0);preserved++;}
 results.push({case:`revision ${i+2}`,untouchedReturnsRevision7:true,untouchedRawUnchanged:true,editedCasesPreserved:preserved,writes:0});
}
const invalid=['{broken','{}','null','[]','true',JSON.stringify({...expected,version:99}),JSON.stringify({...expected,starterRevision:101}),JSON.stringify({...expected,objects:[{...expected.objects[0],id:''}]}),JSON.stringify({...expected,objects:[{...expected.objects[0],points:[{x:0,y:0},{x:3,y:3},{x:0,y:3},{x:3,y:0}]}]})];
for(const raw of invalid){const s=store(raw);assert.equal(G.readGroveMap(s),null);assert.deepEqual(read(s),expected);assert.equal(s.raw,raw);assert.equal(s.writes,0);assert.throws(()=>G.saveGroveMap(s,{...expected,version:99}));assert.equal(s.raw,raw);assert.equal(s.writes,0);}
const malformed=store('{broken');G.saveGroveMap(malformed,read(malformed));assert.deepEqual(JSON.parse(malformed.raw),expected);assert.equal(malformed.writes,1);
results.push({case:'invalid/unsupported raw bytes',cases:invalid.length,readWrites:0,invalidSaveWrites:0,explicitValidSaveReplacesRaw:true});
const forbidden={getItem(){throw Error('storage unavailable');},setItem(){throw Error('must never write');}};assert.equal(G.readGroveMap(forbidden),null);results.push({case:'denied read',fallback:true});
// Execute only actual save/history/reset/share source functions against fake
// element records and a Map-free in-memory string store. No browser/storage/UI.
const source=await readFile(new URL('../../src/map-editor.js',import.meta.url),'utf8');
const line=prefix=>source.split('\n').find(s=>s.startsWith(prefix));
const local={...expected,name:'My local map'},localRaw=JSON.stringify(local),s=store(localRaw),elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{hidden:true,textContent:'',dataset:{},src:'',close(){},showModal(){},classList:{add(){},remove(){}}});return elements.get(id);};
const context=vm.createContext({...G,qa:false,createEditorHistory,decodeMapLink,structuredClone,mapStore:s,document:{body:{classList:{add(){},remove(){}}}},location:{hash:'',pathname:'/editor.html',search:''},window:{history:{replaceState(){}}},URLSearchParams,$:element,clone:structuredClone,finish(){},cancelDrawing(){},closeDialog(){},launchView(){},refresh(){},cue(){},editorInert(){},status(t){element('status').textContent=t;}});
vm.runInContext('let doc=readGroveMap(mapStore),stable=clone(doc),history=createEditorHistory(doc),selected=null,readOnly=false,unsaved=false,mapLoadGeneration=0,localBeforeShared=null;',context);
for(const prefix of['function writable()','function save()','function commit(','function undo()'])vm.runInContext(line(prefix),context);
vm.runInContext(line("$('restore').onclick="),context);vm.runInContext(line("$('editCopy').onclick="),context);
vm.runInContext(source.slice(source.indexOf('async function loadLocationMap(){'),source.indexOf("window.addEventListener('hashchange'")),context);
const evaluate=code=>vm.runInContext(code,context),snapshot=()=>structuredClone(evaluate('({doc,stable,readOnly,unsaved,canUndo:history.canUndo,canRedo:history.canRedo})'));
// Cancel is non-writing; confirm saves the canonical map; Undo saves local again.
element('restore').onclick();element('cancelReset').onclick();assert.equal(s.writes,0);assert.equal(s.raw,localRaw);
element('confirmReset').onclick();assert.equal(snapshot().unsaved,false);assert.deepEqual(snapshot().doc,expected);assert.equal(s.writes,1);evaluate('undo()');assert.deepEqual(snapshot().doc,local);assert.deepEqual(JSON.parse(s.raw),local);evaluate('redo()');assert.deepEqual(snapshot().doc,expected);evaluate('undo()');
results.push({case:'reset/cancel/undo/redo actual handlers',cancelWrites:0,confirmedCanonical:true,undoRestoresLocal:true,redoRestoresDefault:true});
const shared={...expected,name:'Shared scene',objects:expected.objects.slice(0,3)},token=await encodeMapLink(shared);context.location.hash='#map='+token;const beforeShare=s.raw,writesBeforeShare=s.writes;await evaluate('loadLocationMap()');assert.equal(snapshot().readOnly,true);assert.deepEqual(snapshot().doc,G.validateGroveMap(shared));assert.equal(evaluate('save()'),false);element('confirmReset').onclick();evaluate('undo()');assert.equal(s.raw,beforeShare);assert.equal(s.writes,writesBeforeShare);
context.location.hash='';await evaluate('loadLocationMap()');assert.equal(snapshot().readOnly,false);assert.deepEqual(snapshot().doc,local);assert.equal(s.raw,beforeShare);
// A pre-existing unsaved local draft wins over old durable storage on return.
evaluate("doc.name='Unsaved draft';unsaved=true;");context.location.hash='#map='+token;await evaluate('loadLocationMap()');context.location.hash='';await evaluate('loadLocationMap()');assert.equal(snapshot().doc.name,'Unsaved draft');assert.equal(snapshot().unsaved,true);assert.equal(s.raw,beforeShare);
// Edit a copy is explicit replacement and retains Undo to prior local draft.
context.location.hash='#map='+token;await evaluate('loadLocationMap()');element('editCopy').onclick();assert.equal(snapshot().readOnly,false);assert.deepEqual(JSON.parse(s.raw),G.validateGroveMap(shared));evaluate('undo()');assert.equal(snapshot().doc.name,'Unsaved draft');assert.equal(JSON.parse(s.raw).name,'Unsaved draft');
results.push({case:'shared actual handlers',openSaveResetUndoWrites:0,returnRestoresLocal:true,unsavedDraftRestored:true,editCopyExplicitlyWrites:true,editCopyUndoRestoresPriorLocal:true});
// Invalid links cannot replace the editor's current draft or durable bytes.
const beforeInvalid=s.raw;context.location.hash='#map=bad';await evaluate('loadLocationMap()');assert.equal(s.raw,beforeInvalid);assert.equal(snapshot().doc.name,'Unsaved draft');
results.push({case:'invalid shared token',currentDraftUnchanged:true,rawUnchanged:true});
// Delayed decoders are isolated promises; exercise actual generation checks.
const pending=new Map();context.decodeMapLink=token=>new Promise(resolve=>pending.set(token,resolve));
const raceRaw=s.raw,raceWrites=s.writes;
context.location.hash='#map=slow';const slow=evaluate('loadLocationMap()');
context.location.hash='#map=fast';const fast=evaluate('loadLocationMap()');
pending.get('fast')({...expected,name:'Latest snapshot'});await fast;
pending.get('slow')({...expected,name:'Stale snapshot'});await slow;
assert.equal(snapshot().doc.name,'Latest snapshot');assert.equal(s.raw,raceRaw);assert.equal(s.writes,raceWrites);
context.location.hash='';await evaluate('loadLocationMap()');assert.equal(snapshot().doc.name,'Unsaved draft');
context.location.hash='#map=late';const late=evaluate('loadLocationMap()');
context.location.hash='';await evaluate('loadLocationMap()');pending.get('late')({...expected,name:'Cancelled snapshot'});await late;
assert.equal(snapshot().doc.name,'Unsaved draft');assert.equal(snapshot().readOnly,false);assert.equal(s.raw,raceRaw);
results.push({case:'shared generation races actual handler',latestWins:true,removedHashCancelsPendingDecode:true,writes:0});
// Current supported future revision tags are custom maps, not migration targets.
for(const revision of[undefined,8,100]){const custom={...expected};if(revision===undefined)delete custom.starterRevision;else custom.starterRevision=revision;const s=store(JSON.stringify(custom));assert.deepEqual(G.readGroveMap(s),G.validateGroveMap(custom));assert.equal(s.writes,0);}
results.push({case:'custom revision metadata',missingAnd8And100Preserved:true,writes:0});
console.log(JSON.stringify(results,null,2));
