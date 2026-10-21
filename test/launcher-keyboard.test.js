import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHoldControl} from '../src/hold-control.js';

const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
// Exercise the registered application handlers, including event bubbling and
// focus changes, without opening a browser or creating a second UI runtime.
function setup(){
 const events=[];let modal=false,context;
 function target(tagName){const handlers=new Map();return{tagName,addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);},emit(type,e={}){for(const fn of handlers.get(type)??[])fn(e);}};}
 const stage=target('CANVAS'),launchButton=target('BUTTON'),other=target('BUTTON'),window=target('WINDOW'),document=target('DOCUMENT');
 document.activeElement=stage;document.hidden=false;document.querySelector=()=>modal?{}:null;
 const sim={phase:'ready',loading:{loaded:true,dragging:false,loadKeyboard(){events.push('load');return true;}}};
 const hold=createHoldControl({canStart:()=>!context.paused&&!document.hidden&&!modal&&sim.phase==='ready'&&sim.loading.loaded&&!sim.loading.dragging,
  onStart:()=>events.push('wind'),onRelease:()=>events.push('fire'),onCancel:()=>events.push('cancel')});
 const pause={click(){hold.cancel();modal=true;},setAttribute(){}},dialog={showModal(){modal=true;}};
 context={stage,launchButton,document,window,sim,hold,beginHold:id=>hold.begin(id),paused:false,loadPointer:null,
  sound:{unlock(){},pause(){}},soundQueue:[],weaponHud:{select(){},fire(){}},cancelLoading(){},updateReadouts(){},cue(){},
  $:id=>id==='pause'?pause:dialog};
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf("launchButton.addEventListener('keydown'"),source.indexOf('new ResizeObserver(')),context);
 const openDialog=source.split('\n').find(line=>line.startsWith('function openDialog('));vm.runInContext(openDialog,context);
 const key=(code,repeat=false)=>({code,repeat,preventDefault(){this.defaultPrevented=true;}});
 function focus(next){const before=document.activeElement;if(before===next)return;document.activeElement=next;before.emit('blur',{relatedTarget:next});}
 function dispatch(type,code,repeat=false){const e=key(code,repeat);document.activeElement.emit(type,e);document.emit(type,e);return e;}
 return{events,hold,sim,context,stage,launchButton,other,document,window,focus,down:(code,repeat)=>dispatch('keydown',code,repeat),up:code=>dispatch('keyup',code),closeModal(){modal=false;}};
}
test('Space and Enter each release a fresh launcher-button hold exactly once',()=>{
 for(const code of ['Space','Enter']){const h=setup();h.focus(h.launchButton);
  for(let i=0;i<2;i++){h.down(code);h.down(code,true);assert.equal(h.hold.active,true);h.up(code);h.up(code);assert.equal(h.hold.active,false);}
  assert.deepEqual(h.events,['wind','fire','wind','fire']);
 }
});
test('foreign Space/Enter keyup cannot release the owning launcher key',()=>{
 for(const [owner,foreign] of [['Space','Enter'],['Enter','Space']]){const h=setup();h.focus(h.launchButton);h.down(owner);h.down(foreign);h.up(foreign);
  assert.equal(h.hold.active,true);assert.deepEqual(h.events,['wind']);h.up(owner);assert.deepEqual(h.events,['wind','fire']);
 }
});
test('Tab focus loss cancels keyboard holds; late release and repeat never resurrect them',()=>{
 for(const [surface,code] of [['launchButton','Space'],['launchButton','Enter'],['stage','Space']]){const h=setup();h.focus(h[surface]);h.down(code);h.focus(h.other);
  assert.equal(h.hold.active,false);assert.deepEqual(h.events,['wind','cancel']);h.up(code);h.focus(h[surface]);h.down(code,true);h.up(code);assert.deepEqual(h.events,['wind','cancel']);
  h.down(code);h.up(code);assert.deepEqual(h.events,['wind','cancel','wind','fire']);
 }
});
test('window blur, hidden visibility and opening a modal cancel without a late launch',()=>{
 for(const interrupt of ['blur','hidden','modal'])for(const code of ['Space','Enter']){const h=setup();h.focus(h.launchButton);h.down(code);
  if(interrupt==='blur')h.window.emit('blur');else if(interrupt==='hidden'){h.document.hidden=true;h.document.emit('visibilitychange');}else h.context.openDialog('helpDialog');
  assert.equal(h.hold.active,false);assert.deepEqual(h.events,['wind','cancel']);h.up(code);assert.deepEqual(h.events,['wind','cancel']);
  h.document.hidden=false;h.closeModal();h.down(code,true);h.up(code);assert.deepEqual(h.events,['wind','cancel']);h.down(code);h.up(code);assert.deepEqual(h.events,['wind','cancel','wind','fire']);
 }
});
test('keyboard focus cleanup and keyup preserve a live pointer owner',()=>{
 const h=setup();h.hold.begin(17);h.focus(h.launchButton);h.down('Space');h.up('Space');h.focus(h.other);h.up('Enter');
 assert.equal(h.hold.active,true);assert.deepEqual(h.events,['wind']);h.hold.end(17);assert.deepEqual(h.events,['wind','fire']);
});
test('stage Space remains a launcher control and stage Enter remains an explicit loading action',()=>{
 const h=setup();h.down('Space');h.up('Enter');assert.equal(h.hold.active,true);h.up('Space');assert.deepEqual(h.events,['wind','fire']);
 h.sim.loading.loaded=false;h.down('Enter');h.up('Enter');assert.deepEqual(h.events,['wind','fire','load']);assert.equal(h.hold.active,false);
});
