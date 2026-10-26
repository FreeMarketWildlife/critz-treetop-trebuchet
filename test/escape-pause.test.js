import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
function keyboard({dialog=false,dragging=false,winding=false}={}){
 let handler,open=dialog,cancelled=0,holds=0,defaultPrevented=false;
 const stage={tagName:'CANVAS'},context={editingWorld:false,stage,loadPointer:dragging?7:null,hold:{active:winding,cancel(){holds++;}},sim:{phase:'ready',loading:{loaded:false,dragging:false}},paused:false,dirty:false,cue(){},updateReadouts(){},cancelLoading(){cancelled++;},weaponHud:{},document:{activeElement:stage,querySelector(){return open?{}:null;},addEventListener(type,fn){assert.equal(type,'keydown');handler=fn;}},$(){return{click(){open=true;}}}};
 const start=source.indexOf("document.addEventListener('keydown',e=>{\n if(editingWorld)"),end=source.indexOf("\ndocument.addEventListener('keyup'",start);vm.runInNewContext(source.slice(start,end),context);
 function press(){const event={code:'Escape',repeat:false,preventDefault(){defaultPrevented=true;}};handler(event);if(open&&!defaultPrevented)open=false;return{open,defaultPrevented,cancelled,holds};}
 return{press};
}
test('real Escape default action cannot cancel the pause dialog opened by that same keydown',()=>{assert.deepEqual(keyboard().press(),{open:true,defaultPrevented:true,cancelled:0,holds:0});});
test('Escape cancellation consumes the key without opening Pause or launching while dragging/winding',()=>{for(const options of [{dragging:true},{winding:true}]){const result=keyboard(options).press();assert.equal(result.open,false);assert.equal(result.defaultPrevented,true);assert.equal(result.cancelled+result.holds,1);}});
test('an already-open native dialog retains normal Escape-to-close behavior',()=>{assert.deepEqual(keyboard({dialog:true}).press(),{open:false,defaultPrevented:false,cancelled:0,holds:0});});
