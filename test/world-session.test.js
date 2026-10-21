import test from'node:test';import assert from'node:assert/strict';
import{createWorldSession,WorldMapConflictError}from'../src/world-session.js';
import{MAP_KEY,createGroveMap,createV3GroveMap,validateGroveMap}from'../src/grove-map.js';
import{editorMapStorage}from'../src/editor-storage.js';
const store=(initial=[])=>({values:new Map(initial),writes:[],getItem(k){return this.values.get(k)??null;},setItem(k,v){this.writes.push([k,v]);this.values.set(k,v);}});
test('one current world reads/migrates in memory without startup writes or modifying saved custom geometry',()=>{
 for(const raw of[null,'{broken',JSON.stringify(createV3GroveMap()),JSON.stringify({...createGroveMap(),name:'My afternoon map'})]){
  const storage=store(raw===null?[]:[[MAP_KEY,raw]]),world=createWorldSession({storage});
  assert.equal(world.revision,0);assert.equal(world.dirty,false);assert.equal(world.map.version,4);assert.deepEqual(storage.writes,[]);assert.equal(storage.getItem(MAP_KEY),raw);
  if(raw?.includes('afternoon'))assert.equal(world.map.name,'My afternoon map');
  assert.throws(()=>{world.map.objects[0].points[0].x=99;},TypeError,'only validated transactions can replace the authority');
 }
});
test('all modes observe validated atomic edits; invalid edits do not alter the current world',()=>{
 const storage=store(),world=createWorldSession({storage}),events=[];world.subscribe(e=>events.push(e));
 const edit=structuredClone(world.map);edit.objects[0].points[0].y-=.25;world.replace(edit);assert.equal(world.revision,1);assert.equal(world.dirty,true);assert.equal(events[0].map,world.map);assert.deepEqual(storage.writes,[]);
 const before=world.map,bad=structuredClone(edit);bad.objects[0].points[0].y=NaN;assert.throws(()=>world.replace(bad));assert.equal(world.map,before);assert.equal(world.revision,1);
 world.replace(structuredClone(world.map));assert.equal(world.revision,1,'identical geometry does not restart a throw');world.save();assert.equal(world.dirty,false);assert.deepEqual(JSON.parse(storage.getItem(MAP_KEY)),validateGroveMap(edit));
});
test('a concurrently changed local map is never silently overwritten, and draft remains exportable',()=>{
 const storage=store(),world=createWorldSession({storage}),edit=structuredClone(world.map);edit.name='Local draft';world.replace(edit);
 const external=JSON.stringify({...createGroveMap(),name:'Other tab edit'});storage.values.set(MAP_KEY,external);
 assert.throws(()=>world.save(),WorldMapConflictError);assert.equal(storage.getItem(MAP_KEY),external);assert.equal(world.map.name,'Local draft');assert.equal(world.dirty,true);assert.deepEqual(storage.writes,[]);
});
test('QA and shared snapshots keep personal maps/progress untouched until explicit editable copy save',()=>{
 const raw=JSON.stringify({...createGroveMap(),name:'Personal'}),personal=store([[MAP_KEY,raw],['treetop-custom-workshop-v1','private progress'],['treetop-save-v1','legacy save']]),session=store(),world=createWorldSession({storage:editorMapStorage(personal,session,{qa:true})});
 const shared={...createGroveMap(),name:'Shared challenge'};world.replace(shared,{readOnly:true,dirty:false});assert.throws(()=>world.save(),/Edit a copy/);assert.equal(world.readOnly,true);
 world.replace(shared,{readOnly:false,dirty:true});world.save();assert.equal(world.readOnly,false);assert.deepEqual(personal.writes,[]);assert.equal(personal.getItem(MAP_KEY),raw);assert.equal(personal.getItem('treetop-custom-workshop-v1'),'private progress');assert.equal(session.writes.length,1);assert.ok(session.writes[0][0].startsWith('treetop-editor-qa:'));
});
