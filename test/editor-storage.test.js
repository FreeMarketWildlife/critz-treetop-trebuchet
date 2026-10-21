import test from'node:test';import assert from'node:assert/strict';
import{editorMapStorage}from'../src/editor-storage.js';import{createGroveMap,saveGroveMap,readGroveMap,MAP_KEY}from'../src/grove-map.js';
const store=()=>({values:new Map(),getItem(k){return this.values.get(k)??null;},setItem(k,v){this.values.set(k,v);},removeItem(k){this.values.delete(k);}});
test('QA editor edits survive reload while personal default and authored maps remain untouched',()=>{
 const personal=store(),session=store(),saved=createGroveMap();saved.name='Personal evening map';saveGroveMap(personal,saved);const before=personal.getItem(MAP_KEY);
 let qa=editorMapStorage(personal,session,{qa:true});assert.equal(readGroveMap(qa),null);const edit=createGroveMap();edit.name='QA leaf course';saveGroveMap(qa,edit);
 qa=editorMapStorage(personal,session,{qa:true});assert.equal(readGroveMap(qa).name,'QA leaf course');assert.equal(personal.getItem(MAP_KEY),before);
 saveGroveMap(qa,createGroveMap());assert.deepEqual(readGroveMap(qa),createGroveMap());assert.equal(personal.getItem(MAP_KEY),before);
});
test('normal editor retains the existing local map store',()=>{const personal=store();assert.equal(editorMapStorage(personal,store()),personal);});
