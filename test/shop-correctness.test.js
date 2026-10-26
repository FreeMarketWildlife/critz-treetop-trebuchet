import {rigStats,shopComparison} from '../src/shop-comparison.js';
import {DOORS,doorHeight,nextDoor,upgradeDoor,doorGeometry,availableCritters} from '../src/critter-door.js';
import {createGroveMap} from '../src/grove-map.js';
import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';
import{newProgress,saveProgress,loadProgress,validateProgress,canBuild,bank,SAVE_KEY}from'../src/build-progress.js';
import{visitShop,purchaseOffer,priceFor,rerollShop,rerollPrice,openPack,choosePack,packPrice,product,shopView,VOUCHERS}from'../src/build-shop.js';
import{fitEquipment,purchaseFit}from'../src/build-equipment.js';
import{createSandboxShop,sandboxTransaction}from'../src/shop-sandbox.js';
import{STARTER,SLOTS,EQUIPMENT_SLOTS,scaledPreset,PARTS,CRITTERS,part,critter,grams,dimensions,buildFacts}from'../src/build-catalog.js';
import{createScaleBuild}from'../src/scale-builds.js';import{equipmentSpec}from'../src/equipment-summary.js';
const copy=x=>JSON.parse(JSON.stringify(x)),memory=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
const stocked=(patch={})=>visitShop({...newProgress(),bells:10000,doorTier:7,animals:CRITTERS.map(a=>a.id),...patch},42);

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
 const owned={...newProgress(),owned:PARTS.map(p=>p.id),animals:CRITTERS.map(a=>a.id),doorTier:7,build:large},older=fitEquipment(large,{kind:'part',id:'timber'});assert.equal(canBuild(owned,older),true);assert.equal(older.frame,'timber');assert.equal(older.pivotHeight,10);assert.ok(owned.owned.includes('giant'));assert.equal(owned.owned.length,PARTS.length);
 assert.equal(purchaseFit(STARTER,{kind:'part',id:'timber'}).fitted,true);
});

class Node{
 constructor(tag,text,cls=''){this.tagName=tag.toUpperCase();this.textContent=text??'';this.className=cls;this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.attributes={};this.parentElement=null;}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getContext(){return{clearRect(){}};}
 scrollIntoView(){}
 get options(){return this.children;}
 querySelectorAll(){return [];}
 querySelector(){return null;}
 cloneNode(){const n=new Node(this.tagName,this.textContent,this.className);n.disabled=this.disabled;return n;}
 click(){if(!this.disabled)this.onclick?.();}
 focus(){this.onfocus?.();}
 get classList(){return {add(){},remove(){}};}
}
const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
function app({state=stocked(),creative=false}={}){
 const nodes=Object.fromEntries(['visitorPreview','currentVisitorArt','nextVisitorArt','currentVisitorName','nextVisitorName','creatureQueue','doorUpgradeCard','shopWallet','shopRound','shopMessage','shopkeeper','voucherSlot','packSlot','shopItems','packChoices','packCards','rerollShop','shopDetail','shopInventory','shopPanel','cargoPlan','cargoPlanDetail','previewName'].map(id=>[id,new Node('div')]));
 const root=new Node('section');nodes.shopPanel=root;const special=new Node('div');special.append(nodes.voucherSlot,nodes.packSlot);nodes.packChoices.append(nodes.packCards);root.append(nodes.doorUpgradeCard,nodes.shopItems,special,nodes.packChoices);
 const storage=memory();saveProgress(storage,state);const calls={persist:0,apply:0,fitted:[],toasts:[],cues:[]};let failSave=false,failApply=false;
 const groveMap=createGroveMap(),sim={critterDoor:doorGeometry(groveMap,doorHeight(state))};
 const c={EQUIPMENT_SLOTS,scaledPreset,rigStats,shopComparison,syncPreview(){},doorHeight,nextDoor,upgradeDoor,doorGeometry,groveMap,sim,dirty:false,state,draft:{...state.build},adventureBuild:{...state.build},creative,creativeShop:createSandboxShop(42),$:id=>nodes[id],el:(...args)=>new Node(...args),SLOTS,PARTS,CRITTERS,part,critter,grams,dimensions,product,priceFor,purchaseOffer,choosePack,rerollShop,rerollPrice,openPack,packPrice,shopView,purchaseFit,fitEquipment,canBuild,equipmentSpec,sandboxTransaction,matchMedia:()=>({matches:true}),drawCritter(){},drawShopArt(){},
  persist(){calls.persist++;try{if(failSave)throw Error('quota');saveProgress(storage,c.state);return true;}catch(error){calls.toasts.push('Save failed: '+error.message);return false;}},
  populate(){c.renderShop();},applyBuild(){calls.apply++;if(failApply)return false;if(!c.creative)c.state={...c.state,build:{...c.draft}};c.renderShop();return true;},fitted(name){calls.fitted.push(name);},toast(message){calls.toasts.push(message);},cue(name){calls.cues.push(name);},chime(){},shopLedger(){return c.creative?c.creativeShop:c.state;}
 };
 vm.createContext(c);const start=source.indexOf('let shopPage='),end=source.indexOf('function renderBlueprints()',start);assert.ok(start>0&&end>start);vm.runInContext(source.slice(start,end),c);c.renderShop();
 const all=(n=root)=>[n,...n.children.flatMap(x=>all(x))],visible=(n=root)=>n.hidden?[]:[n,...n.children.flatMap(x=>visible(x))],cards=()=>visible().filter(n=>n.className.split(' ').includes('shop-card'));
 const button=(node,label)=>all(node).find(n=>n.tagName==='BUTTON'&&(!label||n.textContent===label));
 // Count advertised offers, including unaffordable ones. A used/full door
 // button is status, and hidden parcel/door controls are not visible offers.
 const offers=()=>visible().filter(n=>n.tagName==='BUTTON'&&n.className.split(' ').includes('buy')&&(n.parentElement!==nodes.doorUpgradeCard||nextDoor(c.state)&&c.state.doorUpgradeRound!==c.state.launches));
 return{c,nodes,root,storage,calls,all,cards,offers,button,failSaving(value=true){failSave=value;},failApplying(){failApply=true;}};
}
test('fresh shop shows exactly three stable equipment slots and no voucher or parcel sales',()=>{
 for(const vouchers of [[],['extraShelf']]){const h=app({state:stocked({vouchers})});assert.equal(h.cards().length,3);assert.equal(h.nodes.shopItems.children.length,3);assert.equal(h.nodes.voucherSlot.parentElement.hidden,true);assert.equal(h.nodes.voucherSlot.children.length,0);assert.equal(h.nodes.packSlot.children.length,0);assert.ok(h.cards().every(c=>part(c.dataset.item)));assert.deepEqual(loadProgress(h.storage).vouchers,vouchers);assert.match(h.nodes.shopInventory.textContent,/no storage limit/);}
});
test('inspecting a card cannot spend Bells; purchase is explicit and stale repeated actions cannot charge twice',()=>{
 const h=app(),card=h.cards()[0],before=copy(h.c.state);card.onclick({target:{closest:()=>null}});assert.deepEqual(copy(h.c.state),before);const buy=h.button(card);buy.onclick();assert.equal(h.c.state.bells,before.bells-part(card.dataset.item).price);assert.ok(h.c.state.owned.includes(card.dataset.item));const paid=copy(h.c.state);buy.onclick();assert.deepEqual(copy(h.c.state),paid);assert.ok(loadProgress(h.storage).owned.includes(card.dataset.item));assert.equal(h.nodes.shopItems.children.length,3);assert.ok(h.cards().some(c=>c.dataset.item===card.dataset.item&&c.className.includes('sold')));
});
test('unaffordable cards remain inspectable and programmatic purchase refuses without mutation',()=>{
 const h=app({state:stocked({bells:0})}),card=h.cards()[0],before=copy(h.c.state);assert.equal(h.button(card).disabled,true);card.onfocus();assert.ok(h.nodes.shopDetail.children.length>3);h.button(card).onclick();assert.deepEqual(copy(h.c.state),before);assert.match(h.calls.toasts.at(-1),/More Bells/);
});
test('failed persistence rolls back purchases and rerolls before fitting or cues',()=>{
 for(const action of ['buy','reroll']){const h=app(),before=copy(h.c.state);h.failSaving();if(action==='buy')h.button(h.cards()[0]).onclick();else h.c.rerollShopAction();assert.deepEqual(copy(h.c.state),before);assert.equal(h.calls.apply,0);assert.deepEqual(h.calls.cues,[]);assert.deepEqual(loadProgress(h.storage),before);}
});
test('paid rerolls preserve parcel, voucher and owned inventory; their increasing price persists',()=>{
 const h=app(),before=copy(h.c.state);h.c.rerollShopAction();assert.equal(h.c.state.bells,before.bells-rerollPrice(before));assert.equal(h.c.state.shop.rerolls,1);assert.deepEqual(copy(h.c.state.shop.voucher),before.shop.voucher);assert.deepEqual(copy(h.c.state.shop.pack),before.shop.pack);assert.deepEqual(copy(h.c.state.owned),before.owned);assert.equal(loadProgress(h.storage).shop.rerolls,1);
});
test('paid legacy parcel survives stock migration and reload and permits exactly one recovered choice without another charge',()=>{
 const raw=stocked();raw.shop={...raw.shop,dealVersion:1,pack:[{kind:'part',id:'hammock'},{kind:'part',id:'pouch'},{kind:'part',id:'timber'}],packCost:Math.max(15,Math.floor(Math.min(...['hammock','pouch','timber'].map(id=>part(id).price))*.8)),packOpened:true,packTaken:false};
 let h=app({state:visitShop(raw,17)}),before=copy(h.c.state);assert.equal(h.cards().length,3);assert.equal(h.nodes.rerollShop.disabled,true);assert.equal(h.nodes.shopItems.hidden,true);assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.equal(h.c.state.bells,raw.bells);
 h=app({state:loadProgress(h.storage)});const choice=h.cards().find(c=>c.dataset.item==='hammock'),button=h.button(choice);button.onclick();assert.ok(h.c.state.owned.includes('hammock'));assert.equal(h.c.state.shop.packTaken,true);assert.equal(h.c.state.bells,before.bells);const paid=copy(h.c.state);button.onclick();assert.deepEqual(copy(h.c.state),paid);assert.equal(h.nodes.shopItems.children.length,3);assert.equal(h.nodes.voucherSlot.parentElement.hidden,true);assert.equal(loadProgress(h.storage).shop.packTaken,true);
});
test('legacy voucher perks persist and affect equipment prices without a new voucher sale',()=>{
 const h=app({state:stocked({vouchers:['friendDiscount','luckyPenny','extraShelf']})}),before=copy(h.c.state),card=h.cards()[0],cost=priceFor(before,{kind:'part',id:card.dataset.item});assert.equal(cost,Math.floor(part(card.dataset.item).price*.9));assert.equal(rerollPrice(before),3);h.button(card).onclick();assert.equal(h.c.state.bells,before.bells-cost);assert.deepEqual(copy(h.c.state.vouchers),before.vouchers);assert.equal(h.nodes.voucherSlot.parentElement.hidden,true);
});
test('stale incompatible heavy equipment purchase is refused without spending, ownership or fitting changes',()=>{
 const state=stocked();state.shop.offers=[{kind:'part',id:'hammock'}];const h=app({state}),before=copy(h.c.state),card=h.cards().find(c=>c.dataset.item==='hammock');card.onfocus();const comparison=shopComparison(before.build,{kind:'part',id:'hammock'});assert.equal(comparison.fit.fitted,false);assert.ok(comparison.rows.find(r=>r.label==='Payload + pouch + cords').changed);h.button(card).onclick();assert.deepEqual(copy(h.c.state),before);assert.equal(h.calls.apply,0);assert.match(h.calls.toasts.at(-1),/rig changed|fit this build/);assert.deepEqual(loadProgress(h.storage),before);
});
test('fitting failure retains the purchased item but restores the original build',()=>{
 const h=app(),before=copy(h.c.state.build),card=h.cards()[0];h.failApplying();h.button(card).onclick();assert.ok(h.c.state.owned.includes(card.dataset.item));assert.deepEqual(copy(h.c.state.build),before);assert.match(h.calls.toasts.at(-1),/inventory/);assert.ok(loadProgress(h.storage).owned.includes(card.dataset.item));
});
test('door upgrade allows one ordered purchase each round across repeated clicks, rerolls and reload',()=>{
 let h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())})});const button=h.button(h.nodes.doorUpgradeCard),before=copy(h.c.state);button.onclick();assert.equal(h.c.state.doorTier,1);assert.equal(h.c.state.bells,before.bells-DOORS[1].price);const paid=copy(h.c.state);button.onclick();assert.deepEqual(copy(h.c.state),paid);h.c.rerollShopAction();h=app({state:loadProgress(h.storage)});assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,true);assert.equal(h.c.state.doorTier,1);
});
test('Creative purchases and rerolls exercise real three-card transactions without changing Adventure',()=>{
 const h=app({creative:true}),before=copy(h.c.state);assert.equal(h.nodes.doorUpgradeCard.hidden,true);const card=h.cards()[0];h.button(card).onclick();assert.ok(h.c.creativeShop.owned.includes(card.dataset.item));h.c.rerollShopAction();assert.equal(h.nodes.shopItems.children.length,3);assert.equal(h.nodes.voucherSlot.parentElement.hidden,true);assert.deepEqual(copy(h.c.state),before);assert.equal(h.calls.persist,0);assert.equal(h.c.creativeShop.shop.packOpened,false);
});
test('touch pointer entry never selects or spends; keyboard focus exposes the same detail panel',()=>{const h=app(),card=h.cards()[0],before=copy(h.c.state),initial=h.nodes.shopDetail.children[0].textContent;card.onpointerenter({pointerType:'touch'});assert.equal(h.nodes.shopDetail.children[0].textContent,initial);assert.deepEqual(copy(h.c.state),before);card.onfocus();assert.equal(h.nodes.shopDetail.children[0].textContent,'SELECTED FIND');assert.deepEqual(copy(h.c.state),before);});
test('explicit selection pins the purchase target while the pointer crosses other cards',()=>{const h=app(),[first,second]=h.cards();first.onclick({target:{closest:()=>null}});const title=h.nodes.shopDetail.children[1].textContent;second.onpointerenter({pointerType:'mouse'});assert.equal(h.nodes.shopDetail.children[1].textContent,title);second.onclick({target:{closest:()=>null}});assert.notEqual(h.nodes.shopDetail.children[1].textContent,title);});
test('pouch inspection reports fit readiness and changed stats while retaining the complete disclosure',()=>{const state=stocked();state.shop.offers=[{kind:'part',id:'pouch'}];const h=app({state}),card=h.cards().find(c=>c.dataset.item==='pouch'),before=copy(h.c.state);card.onfocus();const nodes=h.all(h.nodes.shopDetail),tables=nodes.filter(n=>n.tagName==='TABLE'),outcome=nodes.find(n=>n.className.includes('fit-outcome')),details=nodes.find(n=>n.tagName==='DETAILS');assert.match(outcome.textContent,/Fits now/);assert.equal(tables.length,2);assert.equal(tables[0].children.length,3);assert.equal(tables[1].children.length,9);assert.ok(details.children.includes(tables[1]));assert.equal(details.open,undefined);assert.ok(!nodes.some(n=>n.textContent.includes('Owned: fit')));assert.deepEqual(copy(h.c.state),before);});
test('unchanged geometry stays available behind disclosure and Creative collection label reflects access',()=>{const h=app({creative:true});assert.match(h.nodes.shopInventory.textContent,/all parts available/);const card=h.cards()[0];card.onfocus();const nodes=h.all(h.nodes.shopDetail);assert.equal(nodes.filter(n=>n.tagName==='DETAILS').length,1);assert.equal(nodes.filter(n=>n.tagName==='TABLE').at(-1).children.length,9);});
