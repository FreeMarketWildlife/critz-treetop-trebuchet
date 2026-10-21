import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGroveMap,validateGroveMap,MAP_KEY} from '../src/grove-map.js';
import {createWorldSession} from '../src/world-session.js';
import {editorMapStorage} from '../src/editor-storage.js';
import {newProgress,saveProgress} from '../src/build-progress.js';
import {loadAudioPreferences,saveAudioPreferences} from '../src/audio-preferences.js';
const app=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),editor=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8');
const line=(source,prefix)=>{const found=source.split('\n').find(s=>s.startsWith(prefix));assert.ok(found,prefix);return found;};
function ui(){const nodes=new Map();return id=>{if(!nodes.has(id))nodes.set(id,{checked:false,disabled:false,hidden:true,dataset:{},setAttribute(){},focus(){}});return nodes.get(id);};}
function store(initial=[]){return{values:new Map(initial),writes:[],getItem(k){return this.values.get(k)??null;},setItem(k,v){this.writes.push([k,v]);this.values.set(k,v);}};}

test('actual unified editor Save and Play handlers share the current world while preserving QA and read-only isolation',async()=>{
 for(const qa of [false,true])for(const readOnly of [false,true]){
  const personal=store([['treetop-custom-workshop-v1','personal progress'],['treetop-custom-save-enabled','false']]),session=store(),world=createWorldSession({storage:editorMapStorage(personal,session,{qa})}),doc={...createGroveMap(),name:'Current edited world'};
  world.replace(doc,{readOnly,dirty:!readOnly});let played=0;const messages=[],$=ui(),context={$,qa,world,doc,readOnly,knownRevision:world.revision,unsaved:false,clone:structuredClone,validateGroveMap,finish(){},cancelDrawing(){},closePanels(){},closeDialog(){},status:message=>messages.push(message),onPlay(){played++;assert.equal(world.map.name,'Current edited world');}};
  vm.createContext(context);vm.runInContext(line(editor,'function save(){'),context);vm.runInContext(line(editor,'function play(){'),context);vm.runInContext('play()',context);await Promise.resolve();
  assert.equal(played,1);assert.equal(personal.getItem('treetop-custom-workshop-v1'),'personal progress');assert.equal(personal.getItem('treetop-custom-save-enabled'),'false');
  assert.equal(personal.writes.length,qa||readOnly?0:1);assert.equal(session.writes.length,qa&&!readOnly?1:0);if(readOnly)assert.equal(personal.getItem(MAP_KEY),null);
 }
});

test('QA and embedded editor save controls cannot change personal saving consent or progress',()=>{
 for(const [qa,editorSession]of [[true,false],[false,true],[true,true],[false,false]]){
  const personal=store([['treetop-custom-save-enabled','false'],['unrelated-save','kept']]),$=ui(),context={$,qa,editorSession,saving:!qa,localStorage:personal,state:newProgress(),saveProgress,toast(){},exportJSON(){}};
  vm.createContext(context);vm.runInContext(line(app,'function persist(){'),context);vm.runInContext(line(app,"$('saveEnabled').checked="),context);
  const isolated=qa||editorSession;assert.equal($('saveEnabled').disabled,isolated);
  $('saveEnabled').checked=true;$('saveEnabled').onchange();
  if(isolated){assert.equal($('saveEnabled').checked,false);assert.equal(context.saving,false);assert.deepEqual(personal.writes,[]);assert.equal(personal.getItem('treetop-custom-save-enabled'),'false');}
  else{assert.equal(personal.getItem('treetop-custom-save-enabled'),'true');assert.ok(personal.writes.some(([k])=>k==='treetop-custom-workshop-v1'));}
  assert.equal(personal.getItem('unrelated-save'),'kept');
 }
});

test('audio startup renders preferences without replacing stored bytes; only normal user changes save them',async()=>{
 for(const qa of [false,true])for(const raw of ['{malformed',JSON.stringify({muted:true,volume:.61})]){
  const key='critz-prototype-audio-v1',personal=store([[key,raw]]),$=ui(),prefs=loadAudioPreferences(personal),sound={unlock:()=>Promise.resolve(),setMuted(){},setVolume(){}};
  const context={$,qa,localStorage:personal,audioPrefs:prefs,sound,saveAudioPreferences,cue(){}};vm.createContext(context);
  vm.runInContext(line(app,'function saveSound('),context);vm.runInContext(line(app,"$('volume').value="),context);vm.runInContext(line(app,"$('soundToggle').onclick="),context);
  assert.deepEqual(personal.writes,[]);assert.equal(personal.getItem(key),raw,'startup keeps valid or malformed audio bytes');
  $('soundToggle').onclick();await Promise.resolve();$('volume').value='.42';$('volume').oninput();
  if(qa){assert.deepEqual(personal.writes,[]);assert.equal(personal.getItem(key),raw);}
  else{assert.equal(personal.writes.length,2);assert.deepEqual(JSON.parse(personal.getItem(key)),{muted:!loadAudioPreferences(store([[key,raw]])).muted,volume:.42});}
 }
});
