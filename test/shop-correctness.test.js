import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';
import{newProgress,saveProgress,loadProgress,validateProgress,canBuild,SAVE_KEY}from'../src/build-progress.js';
import{visitShop,purchaseOffer,priceFor,rerollShop,rerollPrice,openPack,choosePack,packPrice,product,shopView,VOUCHERS}from'../src/build-shop.js';
import{fitEquipment,purchaseFit}from'../src/build-equipment.js';
import{createSandboxShop,sandboxTransaction}from'../src/shop-sandbox.js';
import{STARTER,SLOTS,PARTS,CRITTERS,part,critter,grams,dimensions,buildFacts}from'../src/build-catalog.js';
import{createScaleBuild}from'../src/scale-builds.js';import{equipmentSpec}from'../src/equipment-summary.js';
const copy=x=>JSON.parse(JSON.stringify(x)),memory=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
const stocked=(patch={})=>visitShop({...newProgress(),bells:10000,...patch},42);

test('two loaded clients cannot erase each other’s purchases, rerolls or ordinary earned balances',()=>{
 for(const action of['purchase','reroll']){
  const store=memory(),initial=stocked();saveProgress(store,initial);const a=loadProgress(store),b=loadProgress(store),offers=a.shop.offers.filter(o=>o.kind==='part');
  const nextA=action==='purchase'?purchaseOffer(a,offers[0]):rerollShop(a),nextB=action==='purchase'?purchaseOffer(b,offers[1]):rerollShop(b);
  saveProgress(store,nextA);const bytes=store.getItem(SAVE_KEY),before=copy(nextB);
  assert.throws(()=>saveProgress(store,nextB),error=>error.name==='StaleProgressError');assert.equal(store.getItem(SAVE_KEY),bytes);assert.deepEqual(nextB,before);assert.deepEqual(loadProgress(store),nextA);
 }
});
test('legacy saves retain all progress and receive a revision only on a successful changed write',()=>{
 const store=memory(),legacy=stocked();delete legacy.saveRevision;store.setItem(SAVE_KEY,JSON.stringify(legacy));
 const loaded=loadProgress(store);assert.equal(loaded.saveRevision,0);assert.equal(store.getItem(SAVE_KEY),JSON.stringify(legacy));
 const next=purchaseOffer(loaded,loaded.shop.offers[0]),before=copy(next),set=store.setItem;store.setItem=()=>{throw Error('quota');};
 assert.throws(()=>saveProgress(store,next),/quota/);assert.deepEqual(next,before);store.setItem=set;saveProgress(store,next);assert.equal(next.saveRevision,1);assert.deepEqual(loadProgress(store),next);
 saveProgress(store,next);assert.equal(next.saveRevision,1,'idempotent saves do not bump revision');
 assert.throws(()=>validateProgress({...next,saveRevision:-1}),/revision/);
});
test('an explicit validated import can replace normal progress while normal stale writes are refused',()=>{
 const store=memory(),a=stocked();saveProgress(store,a);const imported=stocked({bells:123,points:18117});
 assert.throws(()=>saveProgress(store,imported),/Reload/);saveProgress(store,imported,{replace:true});assert.equal(loadProgress(store).bells,123);assert.equal(loadProgress(store).points,18117);
});
test('incompatible volunteer and smaller-capacity purchases retain the full working machine and inventory',()=>{
 const b=purchaseFit(STARTER,{kind:'animal',id:'elephant'});assert.equal(b.fitted,false);assert.deepEqual(b.build,STARTER);assert.match(b.reason,/capacity/);
 const large=createScaleBuild('elephant'),fit=purchaseFit(large,{kind:'part',id:'timber'});assert.equal(fit.fitted,false);assert.deepEqual(fit.build,large);assert.match(fit.reason,/dimensions/);
 const owned={...newProgress(),owned:PARTS.map(p=>p.id),animals:CRITTERS.map(a=>a.id),build:large},older=fitEquipment(large,{kind:'part',id:'timber'});assert.equal(canBuild(owned,older),true);assert.equal(older.frame,'timber');assert.equal(older.pivotHeight,10);assert.ok(owned.owned.includes('giant'));assert.equal(owned.owned.length,48);
 assert.equal(purchaseFit(STARTER,{kind:'part',id:'timber'}).fitted,true);
});

class Node{
 constructor(tag,text,cls=''){this.tagName=tag.toUpperCase();this.textContent=text??'';this.className=cls;this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.attributes={};this.parentElement=null;}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getContext(){return{clearRect(){}};}
 scrollIntoView(){}
}
const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
function app({state=stocked(),creative=false}={}){
 const nodes=Object.fromEntries(['shopWallet','shopRound','shopMessage','shopkeeper','voucherSlot','packSlot','shopItems','packChoices','packCards','rerollShop'].map(id=>[id,new Node('div')]));
 const root=new Node('section'),special=new Node('div');special.append(nodes.voucherSlot,nodes.packSlot);nodes.packChoices.append(nodes.packCards);root.append(nodes.shopItems,special,nodes.packChoices);
 const storage=memory();saveProgress(storage,state);const calls={persist:0,apply:0,fitted:[],toasts:[],cues:[]};let failSave=false,failApply=false;
 const c={state,draft:{...state.build},adventureBuild:{...state.build},creative,creativeShop:createSandboxShop(42),$:id=>nodes[id],el:(...args)=>new Node(...args),SLOTS,PARTS,CRITTERS,part,critter,grams,dimensions,product,priceFor,purchaseOffer,choosePack,rerollShop,rerollPrice,openPack,packPrice,shopView,purchaseFit,fitEquipment,canBuild,equipmentSpec,sandboxTransaction,matchMedia:()=>({matches:true}),drawCritter(){},drawShopArt(){},
  persist(){calls.persist++;try{if(failSave)throw Error('quota');saveProgress(storage,c.state);return true;}catch(error){calls.toasts.push('Save failed: '+error.message);return false;}},
  populate(){c.renderShop();},applyBuild(){calls.apply++;if(failApply)return false;if(!c.creative)c.state={...c.state,build:{...c.draft}};c.renderShop();return true;},fitted(name){calls.fitted.push(name);},toast(message){calls.toasts.push(message);},cue(name){calls.cues.push(name);},chime(){},shopLedger(){return c.creative?c.creativeShop:c.state;}
 };
 vm.createContext(c);const start=source.indexOf('let shopPage='),end=source.indexOf('function renderBlueprints()',start);assert.ok(start>0&&end>start);vm.runInContext(source.slice(start,end),c);c.renderShop();
 const all=(n=root)=>[n,...n.children.flatMap(x=>all(x))],visible=(n=root)=>n.hidden?[]:[n,...n.children.flatMap(x=>visible(x))],cards=()=>visible().filter(n=>n.className.split(' ').includes('shop-card'));
 const button=(node,label)=>all(node).find(n=>n.tagName==='BUTTON'&&(!label||n.textContent===label));
 return{c,nodes,root,storage,calls,all,cards,button,failSaving(value=true){failSave=value;},failApplying(){failApply=true;}};
}
test('actual shop renderer limits every page to three unowned cards, including voucher and parcel; purchased shelf survives reload',()=>{
 for(const vouchers of[[],['extraShelf']]){
  const h=app({state:stocked({vouchers})}),expected=shopView(h.c.state).total,seen=new Set();assert.equal(h.cards().length,3);
  for(let i=0;i<4;i++){
   const cards=h.cards();assert.ok(cards.length<=3);cards.forEach(n=>seen.add(n.dataset.item??'parcel'));const back=h.button(h.nodes.shopItems,'← Back'),more=h.button(h.nodes.shopItems,'More finds →');
   if(i===0)assert.equal(back.disabled,true);if(!more||more.disabled)break;more.onclick();
  }
  assert.equal(seen.size,expected);assert.equal(h.cards().length,expected%3||3);
  const back=h.button(h.nodes.shopItems,'← Back');back.onclick();assert.ok(h.cards().length<=3);
  const restored=loadProgress(h.storage);assert.deepEqual(restored.vouchers,vouchers);assert.equal(shopView(restored).total,expected);
 }
});
test('actual purchase updates inventory, removes its fresh card and keeps each page within three',()=>{
 const h=app(),card=h.cards()[0],id=card.dataset.item,before=h.c.state.bells;h.button(card).onclick();assert.ok(h.c.state.owned.includes(id));assert.equal(h.c.state.bells,before-part(id).price);assert.ok(h.calls.fitted.length);assert.ok(h.cards().length<=3);assert.ok(!h.cards().some(n=>n.dataset.item===id));assert.ok(loadProgress(h.storage).owned.includes(id));
});
test('actual parcel view replaces all deal cards, permits exactly one choice, and returns to capped stock after reload',()=>{
 const h=app();h.button(h.nodes.shopItems,'More finds →').onclick();const parcel=h.cards().find(n=>n.className.includes('pack-card'));h.button(parcel).onclick();
 assert.equal(h.nodes.shopItems.hidden,true);assert.equal(h.nodes.packChoices.hidden,false);assert.equal(h.cards().length,3);assert.equal(h.nodes.rerollShop.disabled,true);
 const choose=h.button(h.cards()[0]),id=h.cards()[0].dataset.item;choose.onclick();assert.ok(h.c.state.owned.includes(id));assert.equal(h.c.state.shop.packTaken,true);assert.equal(h.nodes.packChoices.hidden,true);assert.ok(h.cards().length<=3);const before=h.c.state.bells;choose.onclick();assert.equal(h.c.state.bells,before);assert.ok(h.calls.toasts.at(-1).includes('Choose a card'));assert.equal(loadProgress(h.storage).shop.packTaken,true);
});
test('actual incompatible purchase acquires the volunteer without replacing the working build or claiming it fitted',()=>{
 const s=stocked();s.shop.offers=[{kind:'animal',id:'elephant'}];const h=app({state:s}),before=copy(h.c.state.build);h.button(h.cards()[0]).onclick();assert.ok(h.c.state.animals.includes('elephant'));assert.deepEqual(copy(h.c.state.build),before);assert.equal(h.calls.apply,0);assert.equal(h.calls.fitted.length,0);assert.match(h.calls.toasts.at(-1),/inventory/);assert.ok(loadProgress(h.storage).animals.includes('elephant'));
});
test('actual smaller-frame purchase preserves every large custom dimension and acquired older parts remain owned',()=>{
 const big=createScaleBuild('elephant'),s=stocked({build:big,owned:[...new Set([...newProgress().owned,...SLOTS.map(([slot])=>big[slot])])],animals:[...newProgress().animals,'elephant']});s.shop.offers=[{kind:'part',id:'timber'}];const h=app({state:s});h.button(h.cards()[0]).onclick();assert.deepEqual(copy(h.c.state.build),big);assert.ok(h.c.state.owned.includes('timber'));assert.ok(h.c.state.owned.includes('giant'));assert.equal(h.calls.apply,0);
});
test('actual failed persistence rolls back purchase, parcel and reroll; no success cue or fitted message',()=>{
 for(const action of['purchase','parcel','reroll']){
  const h=app(),before=copy(h.c.state);h.failSaving();if(action==='purchase')h.button(h.cards()[0]).onclick();else if(action==='reroll')h.c.rerollShopAction();else{h.button(h.nodes.shopItems,'More finds →').onclick();h.button(h.cards().find(n=>n.className.includes('pack-card'))).onclick();}
  assert.deepEqual(h.c.state,before);assert.equal(h.calls.fitted.length,0);assert.deepEqual(h.calls.cues,[]);assert.equal(h.calls.apply,0);assert.match(h.calls.toasts.at(-1),/Save failed/);assert.deepEqual(loadProgress(h.storage),before);
 }
});
test('actual Creative shop uses its own ledger, preserves Adventure and enforces the same visible cap',()=>{
 const h=app({creative:true}),before=copy(h.c.state),card=h.cards()[0];h.button(card).onclick();assert.deepEqual(h.c.state,before);assert.equal(h.calls.persist,0);assert.ok(h.cards().length<=3);h.c.rerollShopAction();assert.deepEqual(h.c.state,before);assert.equal(h.calls.persist,0);assert.ok(h.cards().length<=3);
});
test('a fitting refusal cannot report a fitted success after an otherwise successful acquisition',()=>{
 const h=app(),id=h.cards()[0].dataset.item;h.failApplying();h.button(h.cards()[0]).onclick();assert.ok(h.c.state.owned.includes(id));assert.deepEqual(copy(h.c.state.build),STARTER);assert.equal(h.calls.fitted.length,0);assert.match(h.calls.toasts.at(-1),/inventory/);
});

test('explicit import replacement still cannot erase an existing space achievement',()=>{
 const storage=memory(),achieved=stocked({achievements:['spaceEscape']});saveProgress(storage,achieved);const bytes=storage.getItem(SAVE_KEY);
 assert.throws(()=>saveProgress(storage,stocked(),{replace:true}),/Reload/);assert.equal(storage.getItem(SAVE_KEY),bytes);
});
test('actual paid reroll returns to the first capped page and durably preserves previously owned inventory',()=>{
 const h=app(),before=copy(h.c.state);h.button(h.nodes.shopItems,'More finds →').onclick();h.c.rerollShopAction();
 assert.equal(h.c.state.bells,before.bells-rerollPrice(before));assert.equal(h.c.state.shop.rerolls,1);assert.deepEqual(h.c.state.owned,before.owned);assert.ok(h.cards().length<=3);assert.equal(h.button(h.nodes.shopItems,'← Back').disabled,true);assert.equal(loadProgress(h.storage).shop.rerolls,1);
});
test('actual voucher purchase keeps the current rig, removes the fresh voucher and preserves its permanent perk on reload',()=>{
 const h=app(),before=copy(h.c.state.build),voucher=h.c.state.shop.voucher,cost=priceFor(h.c.state,voucher),bells=h.c.state.bells;
 h.button(h.nodes.shopItems,'More finds →').onclick();h.button(h.cards().find(c=>c.dataset.item===voucher.id)).onclick();
 assert.ok(h.c.state.vouchers.includes(voucher.id));assert.equal(h.c.state.bells,bells-cost);assert.deepEqual(copy(h.c.state.build),before);assert.equal(h.calls.apply,0);assert.ok(!h.cards().some(c=>c.dataset.item===voucher.id));assert.ok(h.cards().length<=3);assert.ok(loadProgress(h.storage).vouchers.includes(voucher.id));assert.match(h.calls.toasts.at(-1),/perk active/);
});
