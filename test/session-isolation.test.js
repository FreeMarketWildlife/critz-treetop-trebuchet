import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGroveMap,validateGroveMap} from '../src/grove-map.js';
import {newProgress,saveProgress} from '../src/build-progress.js';
import {loadAudioPreferences,saveAudioPreferences} from '../src/audio-preferences.js';
const app=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8'),editor=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8');
const line=(source,prefix)=>{const found=source.split('\n').find(s=>s.startsWith(prefix));assert.ok(found,prefix);return found;};
function ui(){const nodes=new Map();return id=>{if(!nodes.has(id))nodes.set(id,{checked:false,disabled:false,hidden:true,dataset:{},setAttribute(){},focus(){}});return nodes.get(id);};}
function store(initial=[]){return{values:new Map(initial),writes:[],getItem(k){return this.values.get(k)??null;},setItem(k,v){this.writes.push([k,v]);this.values.set(k,v);}};}

test('QA editor play and restart retain isolation while normal play remains a normal editor session',()=>{
 for(const qa of [false,true]){
  const $=ui(),context={$,qa,doc:createGroveMap(),readOnly:false,validateGroveMap,save(){},finish(){},closePanels(){},closeDialog(){},editorInert(){},cue(){},status:message=>assert.fail(message)};
  vm.createContext(context);const urlLine=editor.split('\n').find(s=>s.startsWith('const playtestUrl='));if(urlLine)vm.runInContext(urlLine,context);
  vm.runInContext(line(editor,'function play(){'),context);vm.runInContext('play()',context);
  const check=()=>{const url=new URL($('playFrame').src,'https://example.invalid/');assert.equal(url.searchParams.get('creative'),'1');assert.equal(url.searchParams.get('editor'),'1');assert.equal(url.searchParams.has('qa'),qa);};
  check();$('playFrame').src='about:blank';
  const start=editor.indexOf("$('restartPlay').onclick="),end=editor.indexOf("$('returnEditor').onclick=",start);assert.ok(start>=0&&end>start);
  vm.runInContext(editor.slice(start,end),context);$('restartPlay').onclick();check();
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
