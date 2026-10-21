import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER,validateBuild,grams} from '../src/build-catalog.js';
import {createGroveMap,createV3GroveMap,levelAt,enemyRecipe} from '../src/grove-map.js';
import {jungleLayerAt} from '../src/grove-jungle.js';
import {escapeAltitude} from '../src/space-policy.js';
import {newProgress,canBuild,rewards,bank,markSpaceEscape,pendingSpaceResult,validateProgress,saveProgress,loadProgress,SAVE_KEY} from '../src/build-progress.js';
import {visitShop} from '../src/build-shop.js';
import {createSandboxShop} from '../src/shop-sandbox.js';
import {createLaunchFeel} from '../src/launch-feel.js';
import {createPayloadLoading} from '../src/payload-loading.js';

import {createWorldSession} from '../src/world-session.js';
import {createWorldLinkLoader} from '../src/world-link.js';

const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
const copy=value=>structuredClone(value);
function functionSource(name){
 const start=source.indexOf('function '+name+'('),lineEnd=source.indexOf('\n',start);
 // App functions use either one line or a closing brace at column zero.
 // Stop at that function boundary, never execute adjacent UI registrations.
 const end=source.slice(start,lineEnd).trimEnd().endsWith('}')?lineEnd:source.indexOf('\n}',lineEnd)+2;
 assert.ok(start>=0&&end>start,'extract actual '+name);
 return source.slice(start,end);
}
function memory(){
 const data=new Map();let failing=false,writes=0;
 return{data,getItem:key=>data.get(key)??null,setItem(key,value){if(failing)throw Error('quota');data.set(key,value);writes++;},get writes(){return writes;},set failing(value){failing=value;}};
}
// A controlled real solver crossing, not a user save or a forged reward flag.
function escaped({build=STARTER,x=500}={}){
 const map=createGroveMap(),sim=new BuildSimulation(build,{map});sim.setDraw(1);assert.equal(sim.fire(),true);sim.detach('Boundary fixture release');
 sim.shot.setTransform({x:x/sim.L,y:(escapeAltitude(map)-map.launch.y-.01)/sim.L},.4);
 sim.shot.setLinearVelocity({x:10*sim.T/sim.L,y:30*sim.T/sim.L});sim.shot.setAngularVelocity(2*sim.T);sim.step(1/60);
 assert.equal(sim.phase,'escaped');sim.loading={loaded:true,dragging:false,hint:false,animating:false,step:()=>false};return sim;
}
function setup({state={...newProgress(),bells:89,points:18117},sim=escaped(),creative=false,qa=false,editorSession=false}={}){
 const nodes=new Map(),classes=new Set(creative?['creative']:[]),messages=[],cues=[],chimes=[],storage=memory();
 const classList=()=>{const set=new Set();return{set,add(...xs){xs.forEach(x=>set.add(x));},remove(...xs){xs.forEach(x=>set.delete(x));},toggle(x,on){if(on===undefined)on=!set.has(x);on?set.add(x):set.delete(x);return on;}};};
 const bodyClasses={add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},toggle(x,on){if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x);return on;}};
 function $(id){if(!nodes.has(id))nodes.set(id,{textContent:'',value:'',hidden:true,disabled:false,style:{},dataset:{},attributes:{},classList:classList(),setAttribute(k,v){this.attributes[k]=v;},focus(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(id);}
 $('stage').clientWidth=1726;$('stage').clientHeight=819;$('stage').offsetWidth=1;$('speed').value='1';$('quality').value='auto';$('workshopDialog').open=false;
 const initial=copy(state);saveProgress(storage,initial);
 const context={state:initial,draft:{...initial.build},adventureBuild:{...initial.build},creativeBuild:{...STARTER},sim,creative,qa,editorSession,saving:true,groveMap:createGroveMap(),shotId:'escape-ui',banked:false,resultShown:false,spaceRecorded:false,spaceAchievementNew:false,
  paused:false,editingWorld:false,winding:false,dirty:false,seenRelease:false,seenContacts:0,soundedHits:0,seenContactSequence:0,combo:0,lastBumperAt:-Infinity,scoreStep:0,ratchetStep:-1,readyCue:false,
  lastTime:0,lastDraw:0,drawCount:0,refreshAt:0,lastZone:'grandfatherTree',labels:false,follow:true,landingMarks:true,previewSim:null,sessionLog:[],soundQueue:[],currentCel:{hits:0,pose:'flying'},
  BuildSimulation,GRAVITY,STARTER,validateBuild,canBuild,bank,rewards,pendingSpaceResult,validateProgress,saveProgress,localStorage:storage,createPayloadLoading,grams,levelAt,jungleLayerAt,enemyRecipe,
  visitShop:(s,seed)=>visitShop(s,seed??73),creativeShop:createSandboxShop(73),
  markCalls:0,markSpaceEscape(...args){context.markCalls++;return markSpaceEscape(...args);},
  $ ,stage:$('stage'),crypto:{randomUUID:()=> 'retry-'+(++context.ids)},ids:0,hold:{cancel(){}},
  renderer:{clearLandingCue(){context.clearCount++;},needsAnimation:()=>false,draw(){}},previewRenderer:{needsAnimation:()=>false,draw(){},fit(){}},clearCount:0,
  launchFeel:createLaunchFeel(),weaponHud:{reset(){},draw(){}},sound:{getStatus:()=>({contextState:'running'}),play(){},pause(){},unlock(){}},
  document:{hidden:false,body:{classList:bodyClasses},querySelector:()=>null},requestAnimationFrame(){},drawHeightMap(){},drawHudCritter(){},
  hudPerformance:{update:()=>({hits:0,pose:'flying'})},critterPoseName:()=> 'Flying',cancelLoading(){},cue:name=>cues.push(name),chime:names=>chimes.push([...names]),toast:message=>messages.push(message),
  linkRetries:0,loadPlayerWorld:async()=>{context.linkRetries++;},populate(){context.populateCount++;$('buildName').value=context.draft.name;},populateCount:0};
 context.launchFeel.reset(sim);context.feelFrame=context.launchFeel.state();
 vm.createContext(context);
 for(const name of['persist','pendingCollection','protectSpaceResult','applyBuild','updateModeUi','switchMode','updateReadouts','recordSpaceEscape','resultData','showResult','resumePendingSpace','collect','openWorkshop','frame'])vm.runInContext(functionSource(name),context);
 const resetStart=source.indexOf("$('reset').onclick="),resetEnd=source.indexOf(";$('collect').onclick",resetStart);vm.runInContext(source.slice(resetStart,resetEnd)+';',context);
 const importStart=source.indexOf("$('importSave').onchange="),importEnd=source.indexOf('\n',importStart);vm.runInContext(source.slice(importStart,importEnd),context);
 return{c:context,$,nodes,classes,messages,cues,chimes,storage};
}
function display(h){h.c.updateReadouts();assert.equal(h.c.resultShown,true);}
function pendingFixture({build={...STARTER,name:'Incoming escape',pinAngle:-42}}={}){
 const sim=escaped({build}),state=markSpaceEscape({...newProgress(),bells:89,points:18117,build:{...build}},{id:'incoming-space',build,spaceEscape:sim.spaceEscape});
 return{sim,state};
}

test('actual readout records one escape/achievement without crediting wallet and shows the sevenfold result once',()=>{
 const h=setup(),before=copy(h.c.state);display(h);
 assert.equal(h.c.markCalls,1);assert.equal(h.c.spaceRecorded,true);assert.equal(h.c.spaceAchievementNew,true);assert.equal(h.c.state.pendingSpace.id,'escape-ui');
 assert.equal(h.c.state.bells,before.bells);assert.equal(h.c.state.points,before.points);assert.equal(h.c.state.launches,before.launches);
 assert.deepEqual(h.c.state.achievements,['spaceEscape']);assert.equal(h.$('resultTitle').textContent,'Beyond the Moon!');assert.equal(h.$('resultEyebrow').textContent,'ACHIEVEMENT UNLOCKED');
 assert.equal(h.$('spaceRewardBadge').hidden,false);assert.equal(h.$('collect').textContent,'Collect & retry');assert.equal(h.classes.has('space-escaped'),true);
 const writes=h.storage.writes,chimes=h.chimes.length;
 for(let i=0;i<5;i++){h.c.sim.step(.1);h.c.updateReadouts();}
 assert.equal(h.c.markCalls,1);assert.equal(h.storage.writes,writes);assert.equal(h.chimes.length,chimes);assert.deepEqual(loadProgress(h.storage),h.c.state);
});
test('actual result data and visible reward totals stay bound to crossing even if live drift totals change',()=>{
 const h=setup();display(h);const expected=copy(h.c.resultData()),numbers=h.$('resultNumbers').textContent,note=h.$('resultNote').textContent;
 h.c.sim.maxX=99999;h.c.sim.maxY=99999;h.c.sim.step(.1);
 assert.deepEqual(h.c.resultData(),expected);h.c.showResult();assert.equal(h.$('resultNumbers').textContent,numbers);assert.equal(h.$('resultNote').textContent,note);
 const r=rewards(expected);assert.equal(numbers,'+'+r.bells.toLocaleString()+' Bells · +'+r.points.toLocaleString()+' points');
});
test('actual Collect credits the frozen run once, clears pending and retries without losing prior progress',()=>{
 const h=setup();display(h);const before=copy(h.c.state),reward=rewards(h.c.resultData());
 h.c.collect();assert.equal(h.c.state.bells,before.bells+reward.bells);assert.equal(h.c.state.points,before.points+reward.points);assert.equal(h.c.state.launches,1);assert.equal(h.c.state.pendingSpace,null);
 assert.deepEqual(h.c.state.claimed,['escape-ui']);assert.deepEqual(h.c.state.owned,before.owned);assert.deepEqual(h.c.state.blueprints,before.blueprints);
 assert.equal(h.c.sim.phase,'ready');assert.equal(h.c.sim.spaceState,'bound');assert.equal(h.c.resultShown,false);assert.equal(h.$('spaceRewardBadge').hidden,true);assert.equal(h.classes.has('space-escaped'),false);
 assert.equal(h.c.linkRetries,1);const paid=copy(h.c.state);h.c.collect();assert.deepEqual(copy(h.c.state),paid);assert.deepEqual(loadProgress(h.storage),paid);
});
test('failed space-collection persistence rolls back ledger/log, keeps the result and permits one later successful collection',()=>{
 const h=setup();display(h);h.c.sessionLog=[{existing:'kept'}];const before=copy(h.c.state),log=copy(h.c.sessionLog),bytes=h.storage.getItem(SAVE_KEY),sim=h.c.sim,reward=rewards(h.c.resultData());
 h.storage.failing=true;h.c.collect();assert.deepEqual(h.c.state,before);assert.deepEqual(copy(h.c.sessionLog),log);assert.equal(h.storage.getItem(SAVE_KEY),bytes);assert.equal(h.c.sim,sim);assert.equal(h.c.resultShown,true);assert.equal(h.c.banked,false);assert.equal(h.c.pendingCollection(),true);
 assert.match(h.messages.at(-1),/unavailable/i);h.storage.failing=false;h.c.collect();
 assert.equal(h.c.state.bells,before.bells+reward.bells);assert.equal(h.c.state.points,before.points+reward.points);assert.equal(h.c.state.launches,1);assert.equal(h.c.state.pendingSpace,null);assert.equal(h.c.sim.phase,'ready');
});
test('actual rebuild/reset/mode/workshop paths protect an uncollected Adventure escape',()=>{
 const h=setup();display(h);const sim=h.c.sim,state=copy(h.c.state),draft=copy(h.c.draft);
 assert.equal(h.c.applyBuild({quiet:true}),false);h.$('reset').onclick();h.c.switchMode(true);h.c.openWorkshop('shop');
 assert.equal(h.c.sim,sim);assert.deepEqual(h.c.state,state);assert.deepEqual(h.c.draft,draft);assert.equal(h.c.creative,false);assert.equal(h.c.pendingCollection(),true);assert.equal(h.$('workshopDialog').open,false);assert.ok(h.messages.every(m=>/Collect your space rewards/.test(m)));
});
test('Creative space reports free drift but never marks or banks Adventure achievement, totals or pending state',()=>{
 const h=setup({creative:true}),before=copy(h.c.state);display(h);assert.equal(h.c.markCalls,0);assert.deepEqual(h.c.state,before);assert.equal(h.$('spaceRewardBadge').hidden,true);
 assert.equal(h.$('resultEyebrow').textContent,'CREATIVE · SPACE REACHED');assert.equal(h.$('collect').textContent,'Retry experiment');assert.match(h.$('resultNote').textContent,/Adventure progress stays untouched/);
 h.c.collect();assert.deepEqual(h.c.state,before);assert.equal(h.c.sim.phase,'ready');assert.equal(h.c.creative,true);assert.equal(h.c.pendingCollection(),false);
});
test('restoring a pending completion replaces an old Creative escaped simulation, restores mode and emits no release pop',()=>{
 const incoming=pendingFixture(),old=escaped({x:900}),h=setup({state:incoming.state,sim:old,creative:true});const before=copy(h.c.state);
 assert.equal(h.c.resumePendingSpace(),true);assert.notEqual(h.c.sim,old);assert.deepEqual(h.c.sim.spaceEscape,incoming.sim.spaceEscape);assert.equal(h.c.shotId,'incoming-space');
 assert.equal(h.c.creative,false);assert.equal(h.classes.has('creative'),false);assert.equal(h.$('adventureMode').attributes['aria-pressed'],'true');assert.equal(h.$('creativeMode').attributes['aria-pressed'],'false');
 assert.equal(h.c.state.bells,before.bells);assert.equal(h.c.state.points,before.points);assert.equal(h.c.markCalls,0);assert.equal(h.c.spaceAchievementNew,false);assert.equal(h.$('resultEyebrow').textContent,'SPACE REACHED');
 assert.equal(h.c.seenRelease,true);assert.equal(h.c.feelFrame.releaseKick,0);assert.deepEqual(h.c.feelFrame.events,[]);
 h.c.frame(1000);h.c.frame(1017);assert.equal(h.c.feelFrame.releaseKick,0);assert.ok(!h.cues.includes('releasePop'));assert.ok(!h.cues.includes('launch'));assert.deepEqual(h.c.resultData(),pendingSpaceResult(h.c.state.pendingSpace));
});
test('QA and embedded editor sessions cannot rehydrate a real pending completion',()=>{
 for(const mode of[{qa:true},{editorSession:true}]){const incoming=pendingFixture(),sim=new BuildSimulation(STARTER,{map:createGroveMap()}),h=setup({state:incoming.state,sim,...mode}),before=copy(h.c.state),writes=h.storage.writes;
  assert.equal(h.c.resumePendingSpace(),false);assert.equal(h.c.sim,sim);assert.deepEqual(h.c.state,before);assert.equal(h.storage.writes,writes);assert.equal(h.c.populateCount,0);}
});
async function importInto(h,state){
 const raw=JSON.stringify(state),target={value:'backup.json',files:[{size:raw.length,text:async()=>raw}]};await h.$('importSave').onchange({target});assert.equal(target.value,'');
}
test('Creative to ordinary-save import always restores imported recipe and Adventure UI',async()=>{
 const build={...STARTER,name:'Imported tower',frame:'timber',pivotHeight:2.5,pinAngle:-41},state={...newProgress(),bells:321,points:12345,owned:[...newProgress().owned,'timber'],build};
 const h=setup({creative:true,sim:escaped({x:900})});await importInto(h,state);
 assert.equal(h.c.creative,false);assert.equal(h.classes.has('creative'),false);assert.equal(h.$('adventureMode').attributes['aria-pressed'],'true');assert.equal(h.$('creativeMode').attributes['aria-pressed'],'false');
 assert.equal(h.c.sim.phase,'ready');assert.equal(h.c.sim.c.name,build.name);assert.equal(h.c.sim.c.frame,'timber');assert.equal(h.c.sim.c.pivotHeight,2.5);assert.equal(h.c.sim.c.pinAngle,-41);assert.equal(h.c.state.bells,321);assert.equal(h.c.state.points,12345);assert.match(h.messages.at(-1),/imported/);
});
test('Creative escaped to pending-save import restores completed crossing instead of the old escaped run',async()=>{
 const incoming=pendingFixture(),old=escaped({x:900}),h=setup({creative:true,sim:old});await importInto(h,incoming.state);
 assert.equal(h.c.creative,false);assert.notEqual(h.c.sim,old);assert.equal(h.c.sim.phase,'escaped');assert.deepEqual(h.c.sim.spaceEscape,incoming.sim.spaceEscape);assert.equal(h.c.shotId,'incoming-space');assert.equal(h.c.state.pendingSpace.id,'incoming-space');
 assert.equal(h.c.state.bells,89);assert.equal(h.c.state.points,18117);assert.equal(h.c.markCalls,0);assert.equal(h.c.seenRelease,true);assert.equal(h.c.feelFrame.releaseKick,0);assert.equal(h.$('resultTitle').textContent,'Beyond the Moon!');
});
test('an existing Adventure pending result blocks import before reading replacement bytes',async()=>{
 const h=setup();display(h);const before=copy(h.c.state),sim=h.c.sim,target={value:'backup.json',files:[{size:1,text:async()=>assert.fail('pending collection must block replacement read')}]};
 await h.$('importSave').onchange({target});assert.equal(target.value,'');assert.deepEqual(h.c.state,before);assert.equal(h.c.sim,sim);assert.match(h.messages.at(-1),/Collect your space rewards/);
});

test('ordinary collection also preserves the run and ledger when its durable save fails',()=>{
 const s=new BuildSimulation(STARTER,{map:createGroveMap()});s.phase='finished';s.maxX=40;s.maxY=8;
 s.loading=createPayloadLoading(s);const h=setup({sim:s});display(h);const before=copy(h.c.state),log=copy(h.c.sessionLog),bytes=h.storage.getItem(SAVE_KEY),reward=rewards(h.c.resultData());
 h.storage.failing=true;h.c.collect();assert.deepEqual(h.c.state,before);assert.deepEqual(copy(h.c.sessionLog),log);assert.equal(h.storage.getItem(SAVE_KEY),bytes);assert.equal(h.c.banked,false);assert.equal(h.c.resultShown,true);assert.equal(h.c.sim,s);
 h.storage.failing=false;h.c.collect();assert.equal(h.c.state.bells,before.bells+reward.bells);assert.equal(h.c.state.points,before.points+reward.points);assert.equal(h.c.sim.phase,'ready');
});

test('shared world changes use the applied valid rig and preserve an invalid pending fine-tune draft',async()=>{
 const local=createGroveMap(),world=createWorldSession({map:local}),s=new BuildSimulation(STARTER,{map:local}),h=setup({sim:s});
 h.c.draft={...STARTER,pivotHeight:NaN};h.$('buildName').value='Unfinished experiment';h.c.location={hash:'#map=older'};h.c.runtimeWorldRevision=0;
 h.c.playerWorldLinks=createWorldLinkLoader(world,{decode:async()=>createV3GroveMap(),canApply:()=>!h.c.protectSpaceResult()});
 const start=source.indexOf('async function loadPlayerWorld(){'),end=source.indexOf('\n}',start)+2;vm.runInContext(source.slice(start,end),h.c);
 await h.c.loadPlayerWorld();assert.equal(h.c.sim.map.version,3);assert.equal(h.c.groveMap.launch.y,h.c.sim.map.launch.y);assert.equal(h.c.runtimeWorldRevision,world.revision);assert.equal(h.c.sim.c.pivotHeight,STARTER.pivotHeight);assert.ok(Number.isNaN(h.c.draft.pivotHeight));assert.equal(h.$('buildName').value,'Unfinished experiment');
 h.c.location.hash='';await h.c.loadPlayerWorld();assert.equal(h.c.sim.map.version,4);assert.equal(h.c.groveMap.launch.y,h.c.sim.map.launch.y);assert.equal(h.c.runtimeWorldRevision,world.revision);assert.ok(Number.isNaN(h.c.draft.pivotHeight));
});

test('Collect retries the applied rig while preserving an unfinished invalid build draft',()=>{
 const h=setup();display(h);const original=h.c.sim.c,reward=rewards(h.c.resultData()),before=h.c.state.bells;h.c.draft={...original,pivotHeight:NaN};h.$('buildName').value='Work in progress';h.c.collect();
 assert.equal(h.c.state.bells,before+reward.bells);assert.equal(h.c.sim.phase,'ready');assert.equal(h.c.sim.c.pivotHeight,original.pivotHeight);assert.equal(h.c.state.pendingSpace,null);assert.ok(Number.isNaN(h.c.draft.pivotHeight));assert.equal(h.$('buildName').value,'Work in progress');const paid=copy(h.c.state);h.c.collect();assert.deepEqual(copy(h.c.state),paid);
});
