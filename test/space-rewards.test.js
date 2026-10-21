import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,CRITTERS,STARTER,critter,scaledPreset} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
import {BuildSimulation} from '../src/build-physics.js';
import {escapeAltitude,spaceWorldDescriptor,validateSpaceEscape} from '../src/space-policy.js';
import {SAVE_KEY,newProgress,rewards,bank,markSpaceEscape,pendingSpaceResult,validateProgress,saveProgress,loadProgress} from '../src/build-progress.js';
const copy=value=>structuredClone(value);
function crossing(changes={}){
 const world=spaceWorldDescriptor(createGroveMap()),threshold=escapeAltitude(world),animal=changes.animal??'mouse',grams=critter(animal).grams;
 const release={x:-1,y:2,vx:10,vy:15,time:1,speed:Math.hypot(10,15),angle:Math.atan2(15,10)*180/Math.PI,energy:.5*grams/1000*(10**2+15**2),reason:'Release ring cleared the pin'};
 return validateSpaceEscape({version:1,world,threshold,altitude:threshold,time:100,payload:{x:120,y:threshold-world.launchY,vx:10,vy:20,angle:.25,omega:2},distance:120,height:threshold-world.launchY,release,failure:'',grams,animal,...changes});
}
const input=event=>pendingSpaceResult({spaceEscape:event});
const normal=event=>{const data=input(event);delete data.spaceEscape;return data;};
const initial=()=>({...newProgress(),bells:89,points:18117,best:500,build:{...STARTER,pinAngle:-42},blueprints:[{...STARTER,name:'Saved experiment'}]});
const completed=(state=initial(),id='escape-1',event=crossing(),build=state.build)=>markSpaceEscape(state,{id,result:input(event),build,spaceEscape:event});
function memory(){const data=new Map();return{data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}

test('ordinary reward values and failure rewards retain their existing meaning',()=>{
 assert.deepEqual(rewards({distance:100,height:10,release:true,grams:25}),{bells:78,points:1020,distance:100,height:10,release:true,failure:''});
 assert.equal(rewards({distance:100,height:10,release:true,grams:25,failure:'Sling cord snapped'}).bells,78);
});
test('escape multiplies the normal rounded Bells, mass bonus and points exactly seven times',()=>{
 for(const animal of ['mouse','rabbit','whale']){const event=crossing({animal,distance:123.456,height:escapeAltitude(createGroveMap())-createGroveMap().launch.y}),base=rewards(normal(event)),reward=rewards(input(event));assert.equal(reward.bells,base.bells*7);assert.equal(reward.points,base.points*7);assert.equal(reward.distance,base.distance);assert.equal(reward.height,base.height);assert.equal(reward.multiplier,7);assert.equal(reward.spaceEscape,true);}
});
test('rewards use the validated frozen crossing rather than later drift or caller totals',()=>{
 const event=crossing(),expected=rewards(input(event));assert.deepEqual(rewards({...input(event),distance:99999,height:99999,grams:100000000,animal:'whale'}),expected);
});
test('marking space grants achievement immediately without crediting wallet or lifetime totals',()=>{
 const state=initial(),before=copy(state),next=completed(state);assert.deepEqual(state,before);assert.equal(next.bells,89);assert.equal(next.points,18117);assert.equal(next.launches,0);assert.equal(next.best,500);assert.deepEqual(next.achievements,['spaceEscape']);assert.deepEqual(next.pendingSpace.build,state.build);assert.deepEqual(next.owned,state.owned);assert.deepEqual(next.blueprints,state.blueprints);
});
test('repeated marking is idempotent and cannot replace an uncollected crossing',()=>{
 const event=crossing(),state=completed(initial(),'first',event);assert.equal(markSpaceEscape(state,{id:'first',result:input(event),build:state.build,spaceEscape:event}),state);
 assert.throws(()=>completed(state,'second',crossing({distance:140})),/Collect/);assert.throws(()=>completed(state,'first',crossing({distance:140})),/Collect/);assert.equal(state.pendingSpace.spaceEscape.distance,120);
});
test('space collection credits only this run, preserves prior ledger and actual best distance',()=>{
 const event=crossing(),state=completed(initial(),'space',event),reward=rewards(input(event)),next=bank(state,'space',input(event));assert.equal(next.bells,state.bells+reward.bells);assert.equal(next.points,state.points+reward.points);assert.equal(next.best,500);assert.equal(next.launches,1);assert.equal(next.pendingSpace,null);assert.deepEqual(next.achievements,['spaceEscape']);assert.deepEqual(next.owned,state.owned);assert.deepEqual(next.blueprints,state.blueprints);assert.equal(next.history[0].multiplier,7);assert.equal(next.history[0].distance,120);
 assert.equal(bank(next,'space',input(event)),next);assert.equal(markSpaceEscape(next,{id:'space',build:state.build,spaceEscape:event}),next);
});
test('matching pending packet is authoritative even if transient UI result data differs',()=>{
 const state=completed(),expected=bank(state,'escape-1',input(state.pendingSpace.spaceEscape)),next=bank(state,'escape-1',{distance:99999,height:99999,grams:100000000,animal:'whale',phase:'invalid'});assert.deepEqual(next,expected);
});
test('later legitimate space runs receive sevenfold rewards but never duplicate achievement',()=>{
 const state=initial(),one=bank(completed(state,'one'),'one',{}),two=bank(completed(one,'two'),'two',{}),reward=rewards(input(crossing()));assert.deepEqual(two.achievements,['spaceEscape']);assert.equal(two.bells,state.bells+reward.bells*2);assert.equal(two.points,state.points+reward.points*2);assert.equal(two.launches,2);assert.deepEqual(two.claimed,['one','two']);
});
test('persistent completion survives reload before collection and reuses its original world descriptor',()=>{
 const store=memory(),state=completed();saveProgress(store,state);const loaded=loadProgress(store);assert.deepEqual(loaded,state);assert.deepEqual(pendingSpaceResult(loaded.pendingSpace),input(crossing()));assert.deepEqual(loaded.pendingSpace.spaceEscape.world,spaceWorldDescriptor(createGroveMap()));
 const next=bank(loaded,loaded.pendingSpace.id,{});saveProgress(store,next);const again=loadProgress(store);assert.equal(again.pendingSpace,null);assert.equal(bank(again,'escape-1',input(crossing())),again);assert.deepEqual(again,next);
});
test('an already claimed stale packet is reconciled on read without paying or writing again',()=>{
 const store=memory(),pending=completed(),paid=bank(pending,'escape-1',{}),stale={...paid,pendingSpace:copy(pending.pendingSpace)};store.setItem(SAVE_KEY,JSON.stringify(stale));const bytes=store.getItem(SAVE_KEY),loaded=loadProgress(store);assert.equal(loaded.pendingSpace,null);assert.equal(loaded.bells,paid.bells);assert.deepEqual(loaded.achievements,['spaceEscape']);assert.equal(store.getItem(SAVE_KEY),bytes);assert.equal(bank(loaded,'escape-1',{}),loaded);
});
test('valid pending completion restores a missing achievement field without changing totals',()=>{
 const raw=completed();delete raw.achievements;const loaded=validateProgress(raw);assert.deepEqual(loaded.achievements,['spaceEscape']);assert.equal(loaded.bells,raw.bells);assert.ok(loaded.pendingSpace);
});
test('old version-one saves receive only empty new defaults and preserve all earned/custom values',()=>{
 const raw=initial();delete raw.achievements;delete raw.pendingSpace;const before=copy(raw),loaded=validateProgress(raw);assert.deepEqual(raw,before);assert.deepEqual(loaded,{...raw,achievements:[],pendingSpace:null});assert.equal(loaded.points,18117);assert.equal(loaded.bells,89);assert.equal(loaded.build.pinAngle,-42);
});
test('Creative does not mutate Adventure achievement, pending completion or wallet',()=>{
 const state=initial(),event=crossing();assert.equal(markSpaceEscape(state,{id:'creative',spaceEscape:event,build:scaledPreset('whale')},true),state);assert.equal(bank(state,'creative',input(event),true),state);assert.equal(state.pendingSpace,null);assert.deepEqual(state.achievements,[]);
});
test('real cord or beam failure that reaches space remains eligible under the existing economy',()=>{
 for(const failure of ['Sling cord snapped','Beam overloaded']){const event=crossing({failure}),state=completed(initial(),'real-failure',event),base=rewards(normal(event)),next=bank(state,'real-failure',{});assert.equal(next.bells,state.bells+base.bells*7);assert.equal(next.points,state.points+base.points*7);assert.deepEqual(next.achievements,['spaceEscape']);}
});
test('invalid phase, numerical/configuration invalidity and unvalidated flags do not qualify',()=>{
 const state=initial(),event=crossing();assert.equal(bank(state,'invalid',{...input(event),phase:'invalid'}),state);assert.throws(()=>markSpaceEscape(state,{id:'invalid',result:{...input(event),phase:'invalid'},spaceEscape:event,build:state.build}));assert.throws(()=>rewards({...normal(event),spaceEscape:true}));
 for(const failure of ['Numerical energy check failed — change the geometry or mass balance','Configuration exceeded the solver’s stable range','No release'])assert.throws(()=>crossing({failure}));
});
test('malformed pending packet, mismatched crossing/build and unowned gear are rejected',()=>{
 const state=completed();for(const pending of [[],{}, {...state.pendingSpace,id:''},{...state.pendingSpace,id:'x'.repeat(121)},{...state.pendingSpace,build:null},{...state.pendingSpace,build:{animal:'mouse'}},{...state.pendingSpace,build:{...state.build,animal:'frog'}},{...state.pendingSpace,build:{...state.build,frame:'leviathan'}}])assert.throws(()=>validateProgress({...state,pendingSpace:pending}));
 for(const patch of [{altitude:100},{threshold:1},{time:NaN},{grams:1},{payload:{...state.pendingSpace.spaceEscape.payload,vy:-1}},{release:null}])assert.throws(()=>validateProgress({...state,pendingSpace:{...state.pendingSpace,spaceEscape:{...state.pendingSpace.spaceEscape,...patch}}}));
 assert.throws(()=>markSpaceEscape(initial(),{id:'mismatch',result:{...input(crossing()),distance:999},build:STARTER,spaceEscape:crossing()}));
});
test('all persisted achievements are validated and pending packet retains only known minimal fields',()=>{
 const state=completed();for(const achievements of [null,'spaceEscape',['unknown'],['spaceEscape','spaceEscape']])assert.throws(()=>validateProgress({...state,achievements}));
 const raw=copy(state);raw.pendingSpace.unrelated={test:true};raw.pendingSpace.build.unrelated={test:true};raw.pendingSpace.spaceEscape.unrelated={test:true};const loaded=validateProgress(raw);assert.equal(loaded.pendingSpace.unrelated,undefined);assert.equal(loaded.pendingSpace.build.unrelated,undefined);assert.equal(loaded.pendingSpace.spaceEscape.unrelated,undefined);
});
test('completion owns cloned data and cannot drift when simulation or caller objects change',()=>{
 const event=crossing(),build={...STARTER},state=markSpaceEscape(initial(),{id:'frozen',result:input(event),build,spaceEscape:event}),before=copy(state.pendingSpace);event.payload.x+=999;event.distance+=999;build.pinAngle=70;assert.deepEqual(state.pendingSpace,before);
});
test('unrelated ordinary banking preserves an uncollected space packet',()=>{
 const state=completed(),next=bank(state,'ordinary',{distance:1,height:1,grams:25,release:true});assert.deepEqual(next.pendingSpace,state.pendingSpace);assert.deepEqual(next.achievements,['spaceEscape']);assert.equal(next.bells,state.bells+rewards({distance:1,height:1,grams:25,release:true}).bells);
});
test('storage failure leaves the old uncredited packet recoverable and cannot multiply previous wallet',()=>{
 const store=memory(),pending=completed();saveProgress(store,pending);const before=store.getItem(SAVE_KEY),paid=bank(pending,'escape-1',{});assert.throws(()=>saveProgress({...store,setItem(){throw Error('quota');}},paid));assert.equal(store.getItem(SAVE_KEY),before);const recovered=bank(loadProgress(store),'escape-1',{});assert.deepEqual(recovered,paid);saveProgress(store,recovered);assert.equal(bank(loadProgress(store),'escape-1',{}).bells,paid.bells);
});
test('reward cap and ledger overflow remain bounded without partially consuming a completion',()=>{
 const event=crossing({distance:100000,height:999999}),base=rewards(normal(event)),reward=rewards(input(event));assert.equal(reward.distance,20000);assert.equal(reward.bells,base.bells*7);assert.equal(reward.points,base.points*7);
 const state=completed({...initial(),bells:Number.MAX_SAFE_INTEGER-1}),before=copy(state);assert.throws(()=>bank(state,'escape-1',{}),/range/);assert.deepEqual(state,before);
});

function actualCrossing(build=STARTER){
 const map=createGroveMap(),sim=new BuildSimulation(build,{map});assert.equal(sim.fire(),true);sim.detach('Boundary persistence review');
 sim.shot.setTransform({x:500/sim.L,y:(escapeAltitude(map)-map.launch.y-.01)/sim.L},0);sim.shot.setLinearVelocity({x:10*sim.T/sim.L,y:30*sim.T/sim.L});sim.step(1/60);
 assert.equal(sim.phase,'escaped');return validateSpaceEscape(sim.spaceEscape);
}
const staleError=error=>error?.name==='StaleProgressError'&&/Reload/.test(error.message);
test('a stale normal tab cannot erase a newer unclaimed solver-crossing packet or achievement',()=>{
 const store=memory();saveProgress(store,initial());const a=loadProgress(store),b=loadProgress(store),event=actualCrossing(a.build);
 const pending=completed(a,'two-tab-space',event);saveProgress(store,pending);const bytes=store.getItem(SAVE_KEY);
 const stale=bank(b,'stale-normal',{distance:10,height:2,release:true,grams:25,animal:'mouse'}),before=copy(stale);
 assert.throws(()=>saveProgress(store,stale),staleError);assert.deepEqual(stale,before);assert.equal(store.getItem(SAVE_KEY),bytes);assert.deepEqual(loadProgress(store),pending);
});
test('a stale duplicate collector cannot overwrite a space payment and later legitimate earnings',()=>{
 const store=memory(),event=actualCrossing(initial().build),pending=completed(initial(),'two-tab-collect',event);saveProgress(store,pending);
 const a=loadProgress(store),b=loadProgress(store),paid=bank(a,'two-tab-collect',{});saveProgress(store,paid);
 const later=bank(paid,'later-normal',{distance:20,height:2,release:true,grams:25,animal:'mouse'});saveProgress(store,later);const bytes=store.getItem(SAVE_KEY);
 const stale=bank(b,'two-tab-collect',{});assert.throws(()=>saveProgress(store,stale),staleError);assert.equal(store.getItem(SAVE_KEY),bytes);assert.deepEqual(loadProgress(store),later);
 saveProgress(store,loadProgress(store));assert.deepEqual(loadProgress(store),later,'a current idempotent save still succeeds');
});
test('stale uncollected UI cannot resurrect an already claimed packet',()=>{
 const store=memory(),pending=completed(initial(),'already-paid',actualCrossing(initial().build));saveProgress(store,pending);const stale=loadProgress(store),paid=bank(pending,'already-paid',{});saveProgress(store,paid);const bytes=store.getItem(SAVE_KEY);
 assert.throws(()=>saveProgress(store,stale),staleError);assert.equal(store.getItem(SAVE_KEY),bytes);assert.equal(loadProgress(store).pendingSpace,null);
});
test('normal sequential saves after space retain the achievement and allow the bounded claim window to roll',()=>{
 const store=memory();let state=bank(completed(initial(),'old-space'),'old-space',{});saveProgress(store,state);
 for(let i=0;i<110;i++){state=bank(state,'normal-'+i,{distance:1,height:1,release:true,grams:25,animal:'mouse'});saveProgress(store,state);}
 const loaded=loadProgress(store);assert.deepEqual(loaded,state);assert.equal(loaded.claimed.length,100);assert.deepEqual(loaded.achievements,['spaceEscape']);assert.equal(loaded.launches,111);
});
