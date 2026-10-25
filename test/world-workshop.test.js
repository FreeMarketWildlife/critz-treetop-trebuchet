import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{installWorldWorkshop}from'../src/world-workshop.js';import{createWorldSession}from'../src/world-session.js';import{editorAppUrl}from'../src/editor-entry.js';
import{BuildSimulation}from'../src/build-physics.js';import{STARTER}from'../src/build-catalog.js';
function ui(){const nodes=new Map(),listeners=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:true,inert:false,dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){this.focused=true;}});return nodes.get(id);};const document={body:{dataset:{}},getElementById:node},window={location:{href:'https://game.invalid/index.html?qa=1',search:'?qa=1',hash:''},addEventListener(k,fn){listeners.set(k,fn);}};return{document,window,node,listeners};}
const storage=()=>({getItem:()=>null,setItem(){assert.fail('mode switching never saves');}});
test('Edit/Play shares one current map and retains the exact running simulation/camera when no edit occurred',async()=>{
 const h=ui(),world=createWorldSession({storage:storage()});let sim=new BuildSimulation(STARTER,{map:world.map}),runtimeRevision=world.revision,paused=false,loads=0,enters=0,leaves=0;
 const camera={x:22,y:-3,scale:91},original=sim,controller=installWorldWorkshop({...h,author:true,world,loadEditor:async()=>{loads++;return{ready:Promise.resolve(),enter(){enters++;},leave(){leaves++;}};},onEnterEdit(){paused=true;},onReturnToPlay({map,revision}){if(revision!==runtimeRevision){sim=new BuildSimulation(STARTER,{map});runtimeRevision=revision;}paused=false;}});
 assert.equal(await controller.setMode('edit'),true);assert.equal(controller.editing,true);assert.equal(paused,true);assert.equal(h.node('worldEditor').hidden,false);
 assert.equal(await controller.setMode('play'),true);assert.equal(controller.editing,false);assert.equal(paused,false);assert.equal(sim,original);assert.deepEqual(camera,{x:22,y:-3,scale:91});
 await controller.setMode('edit');const edit=structuredClone(world.map);edit.objects[0].bounce=.81;world.replace(edit);assert.equal(sim,original,'editing does not run a second simulation');await controller.setMode('play');
 assert.notEqual(sim,original);assert.equal(sim.c.name,STARTER.name);assert.deepEqual(sim.map,world.map);assert.equal(sim.map.objects[0].bounce,.81);assert.equal(loads,1);assert.equal(enters,2);assert.equal(leaves,2);
});
test('entry guard runs before lazy editor/shared-map loading; failed load returns safely to existing game',async()=>{
 const h=ui(),world=createWorldSession({storage:storage()});let allowed=false,paused=false,loads=0,resumes=0;const errors=[];
 const controller=installWorldWorkshop({...h,author:true,world,onError:e=>errors.push(e),onEnterEdit(){if(!allowed)return false;paused=true;},onReturnToPlay({aborted}){assert.equal(aborted,true);paused=false;resumes++;},loadEditor:async()=>{loads++;throw Error('Missing tools');}});
 assert.equal(await controller.setMode('edit'),false);assert.equal(loads,0);assert.equal(controller.mode,'play');allowed=true;
 assert.equal(await controller.setMode('edit'),false);assert.equal(controller.mode,'play');assert.equal(paused,false);assert.equal(resumes,1);assert.equal(errors[0].message,'Missing tools');assert.equal(h.node('worldEdit').disabled,false);
});
test('rapid edit requests share one load, then Play invokes the existing runtime callback once',async()=>{
 const h=ui(),world=createWorldSession({storage:storage()});let resolve,loads=0,plays=0;const ready=new Promise(r=>resolve=r);
 const controller=installWorldWorkshop({...h,author:true,world,onEnterEdit(){},onReturnToPlay(){plays++;},loadEditor:async()=>{loads++;await ready;return{enter(){},leave(){}};}});
 const a=controller.setMode('edit'),b=controller.setMode('edit');assert.equal(a,b);resolve();await a;assert.equal(loads,1);await controller.setMode('play');assert.equal(plays,1);
});
test('old editor links and new app shell preserve QA/shared map state without a second game frame',()=>{
 const old='https://game.invalid/path/editor.html?qa=1&creative=1#map=abc',url=new URL(editorAppUrl(old));assert.equal(url.pathname,'/path/index.html');assert.equal(url.searchParams.get('author'),'1');assert.equal(url.searchParams.get('mode'),'edit');assert.equal(url.searchParams.get('qa'),'1');assert.equal(url.hash,'#map=abc');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),editor=readFileSync(new URL('../editor.html',import.meta.url),'utf8'),source=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8');
 assert.doesNotMatch(html,/id="worldEdit"|data-open-world-editor|href="editor.html"/);assert.match(html,/id="worldModeSwitch"[^>]*hidden/);assert.match(html,/id="altitudeStrip"/);assert.doesNotMatch(editor,/<iframe|playFrame|creative=1&editor=1/);assert.match(editor,/editor-entry\.js/);assert.doesNotMatch(source,/postMessage|playFrame|playtestUrl/);assert.match(source,/export function mountMapEditor/);
});

test('ordinary player entry exposes no author controls and never loads the editor or attaches its handlers',async()=>{
 let touched=0;const controller=installWorldWorkshop({world:createWorldSession({storage:storage()}),document:{getElementById(){touched++;throw Error('public entry must not construct editor UI');}},window:{addEventListener(){touched++;}},loadEditor(){touched++;}});
 assert.equal(controller.mode,'play');assert.equal(await controller.setMode('edit'),false);assert.equal(controller.editing,false);assert.equal(touched,0);
 const source=readFileSync(new URL('../src/world-workshop.js',import.meta.url),'utf8');assert.doesNotMatch(source,/^import .*map-editor/m,'editor module is imported only inside authorized author mount');
});

test('the maintained author template supplies every static tool control needed by the scoped mount',()=>{
 const html=readFileSync(new URL('../editor.html',import.meta.url),'utf8'),source=readFileSync(new URL('../src/map-editor.js',import.meta.url),'utf8'),ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const[,id]of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(id),'missing editor control '+id);
 assert.doesNotMatch(source,/document\.querySelector|document\.getElementById|document\.body/,'tools query only their scoped root');
});

// Sites canonicalizes /editor.html to /editor before JavaScript executes.
test('hosted clean editor URLs leave the editor route once and preserve isolated author state',()=>{
 for(const prefix of['/','/project/'])for(const entry of['editor.html','editor','editor/']){
  const href=`https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site${prefix}${entry}?qa=1&editor=1&creative=1#map=abc`,url=new URL(editorAppUrl(href));
  assert.equal(url.pathname,prefix+'index.html');assert.notEqual(url.pathname,new URL(href).pathname);assert.equal(url.searchParams.get('author'),'1');assert.equal(url.searchParams.get('mode'),'edit');assert.equal(url.searchParams.get('qa'),'1');assert.equal(url.searchParams.get('creative'),'1');assert.equal(url.searchParams.has('editor'),false);assert.equal(url.hash,'#map=abc');
 }
});

test('editor receives the exact active world, equipped build and door references',async()=>{
 const h=ui(),world=createWorldSession({storage:storage()}),build={...STARTER,pivotHeight:.8},door={height:.15};let received;
 const controller=installWorldWorkshop({...h,author:true,world,getBuild:()=>build,getDoor:()=>door,getRigOrigin:()=>-5.3,loadEditor:async args=>{received=args;return{enter(){},leave(){}};}});
 await controller.setMode('edit');assert.equal(received.world,world);assert.equal(received.world.map,world.map);assert.equal(received.getBuild(),build);assert.equal(received.getDoor(),door);assert.equal(received.getRigOrigin(),-5.3);
});
