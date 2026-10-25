import {DOORS,doorHeight,nextDoor,upgradeDoor,doorGeometry,availableCritters} from '../src/critter-door.js';
import {createGroveMap} from '../src/grove-map.js';
import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';
import{newProgress,saveProgress,loadProgress,validateProgress,canBuild,bank,SAVE_KEY}from'../src/build-progress.js';
import{visitShop,purchaseOffer,priceFor,rerollShop,rerollPrice,openPack,choosePack,packPrice,product,shopView,VOUCHERS}from'../src/build-shop.js';
import{fitEquipment,purchaseFit}from'../src/build-equipment.js';
import{createSandboxShop,sandboxTransaction}from'../src/shop-sandbox.js';
import{STARTER,SLOTS,PARTS,CRITTERS,part,critter,grams,dimensions,buildFacts}from'../src/build-catalog.js';
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
}
const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
function app({state=stocked(),creative=false}={}){
 const nodes=Object.fromEntries(['doorUpgradeCard','shopWallet','shopRound','shopMessage','shopkeeper','voucherSlot','packSlot','shopItems','packChoices','packCards','rerollShop'].map(id=>[id,new Node('div')]));
 const root=new Node('section'),special=new Node('div');special.append(nodes.voucherSlot,nodes.packSlot);nodes.packChoices.append(nodes.packCards);root.append(nodes.doorUpgradeCard,nodes.shopItems,special,nodes.packChoices);
 const storage=memory();saveProgress(storage,state);const calls={persist:0,apply:0,fitted:[],toasts:[],cues:[]};let failSave=false,failApply=false;
 const groveMap=createGroveMap(),sim={critterDoor:doorGeometry(groveMap,doorHeight(state))};
 const c={doorHeight,nextDoor,upgradeDoor,doorGeometry,groveMap,sim,dirty:false,state,draft:{...state.build},adventureBuild:{...state.build},creative,creativeShop:createSandboxShop(42),$:id=>nodes[id],el:(...args)=>new Node(...args),SLOTS,PARTS,CRITTERS,part,critter,grams,dimensions,product,priceFor,purchaseOffer,choosePack,rerollShop,rerollPrice,openPack,packPrice,shopView,purchaseFit,fitEquipment,canBuild,equipmentSpec,sandboxTransaction,matchMedia:()=>({matches:true}),drawCritter(){},drawShopArt(){},
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
test('legacy animal offers cannot sell critters',()=>{
 const s=stocked();s.shop.offers=[{kind:'animal',id:'elephant'}];assert.throws(()=>purchaseOffer(s,s.shop.offers[0]),/not for sale/);
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


test('actual door button grants exactly one ordered upgrade per completed round across stale clicks, rerolls and reloads',()=>{
 let h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())})});
 for(let tier=1;tier<DOORS.length;tier++){
  const button=h.button(h.nodes.doorUpgradeCard),before=copy(h.c.state),price=DOORS[tier].price;
  assert.equal(button.disabled,false);button.onclick();
  assert.equal(h.c.state.doorTier,tier);assert.equal(h.c.state.doorUpgradeRound,before.launches);assert.equal(h.c.state.bells,before.bells-price);
  assert.deepEqual(copy(h.c.state.animals),availableCritters(h.c.state));assert.deepEqual(copy(h.c.state.build),before.build);assert.deepEqual(copy(h.c.state.owned),before.owned);
  assert.equal(h.c.sim.critterDoor.height,DOORS[tier].height);assert.equal(h.c.dirty,true);assert.deepEqual(loadProgress(h.storage),h.c.state);
  const paid=copy(h.c.state),persisted=h.calls.persist,cues=h.calls.cues.length;button.onclick();
  assert.deepEqual(copy(h.c.state),paid);assert.equal(h.calls.persist,persisted);assert.equal(h.calls.cues.length,cues);assert.match(h.calls.toasts.at(-1),/round|fully/);
  h.c.rerollShopAction();assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,true);
  const rerolled=copy(h.c.state);h.button(h.nodes.doorUpgradeCard).onclick();assert.deepEqual(copy(h.c.state),rerolled);
  h=app({state:loadProgress(h.storage)});assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,true);
  h.button(h.nodes.doorUpgradeCard).onclick();assert.equal(h.c.state.doorTier,tier);
  if(tier<DOORS.length-1){
   h.c.state=visitShop(bank(h.c.state,'door-round-'+tier,{distance:1,height:1,animal:'mouse',grams:25}),42+tier);
   saveProgress(h.storage,h.c.state);h.c.renderShop();assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,false);
  }
 }
 assert.deepEqual(copy(h.c.state.animals),CRITTERS.map(a=>a.id));
});
test('actual failed door persistence leaves height, critter access, wallet and the round allowance unchanged',()=>{
 const h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())})}),before=copy(h.c.state),door=copy(h.c.sim.critterDoor),button=h.button(h.nodes.doorUpgradeCard);
 h.failSaving();button.onclick();assert.deepEqual(copy(h.c.state),before);assert.deepEqual(loadProgress(h.storage),before);assert.deepEqual(h.c.sim.critterDoor,door);
 assert.equal(h.c.dirty,false);assert.deepEqual(h.calls.cues,[]);assert.match(h.calls.toasts.at(-1),/Save failed/);
 h.failSaving(false);button.onclick();assert.equal(h.c.state.doorTier,1);assert.equal(h.c.state.bells,before.bells-DOORS[1].price);assert.equal(h.c.state.doorUpgradeRound,before.launches);assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,true);
});
test('Creative hides the Adventure door and never adds animal purchase cards',()=>{
 const h=app({creative:true});assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.equal(h.nodes.doorUpgradeCard.children.length,0);
 assert.ok(h.cards().every(card=>!CRITTERS.some(a=>a.id===card.dataset.item)));assert.deepEqual(h.calls.cues,[]);assert.equal(h.calls.persist,0);
});


function findPagedCard(h,predicate){
 for(let page=0;page<10;page++){
  assert.ok(h.offers().length<=3,'door and every stock page share three offers');const card=h.cards().find(predicate);if(card)return card;
  const more=h.button(h.nodes.shopItems,'More finds →');if(!more||more.disabled)break;more.onclick();
 }
 assert.fail('expected offer remains reachable through the capped pages');
}
test('actual door and stock pages share three advertised offers without discarding deals, perks or owned inventory',()=>{
 for(const config of[{doorTier:0,doorUpgradeRound:-1,creative:false,limit:2},{doorTier:1,doorUpgradeRound:0,creative:false,limit:3},{doorTier:7,doorUpgradeRound:-1,creative:false,limit:3},{doorTier:0,doorUpgradeRound:-1,creative:true,limit:3},{doorTier:0,doorUpgradeRound:-1,creative:false,limit:2,bells:0}])for(const vouchers of[[],['extraShelf']]){
  const state=stocked({doorTier:config.doorTier,doorUpgradeRound:config.doorUpgradeRound,bells:config.bells??10000,vouchers,animals:availableCritters(config)}),h=app({state,creative:config.creative}),before=copy(h.c.state),ledger=copy(h.c.shopLedger()),expected=shopView(ledger).total,seen=new Set();
  assert.equal(h.cards().length,config.limit);assert.equal(h.offers().length,3);
  for(let page=0;page<10;page++){
   assert.ok(h.offers().length<=3);assert.ok(h.cards().length<=config.limit);h.cards().forEach(card=>seen.add(card.dataset.item??'parcel'));
   const more=h.button(h.nodes.shopItems,'More finds →');if(!more||more.disabled)break;more.onclick();
  }
  assert.equal(seen.size,expected,'pagination must retain every gear, voucher and parcel offer');assert.deepEqual(copy(h.c.shopLedger()),ledger);assert.deepEqual(copy(h.c.state),before);assert.equal(h.calls.persist,0);
  const reloaded=app({state:loadProgress(h.storage),creative:config.creative});assert.equal(reloaded.cards().length,config.limit);assert.ok(reloaded.offers().length<=3);assert.deepEqual(reloaded.c.state.owned,before.owned);assert.deepEqual(reloaded.c.state.vouchers,before.vouchers);assert.equal(reloaded.c.state.bells,before.bells);
 }
});
test('buying gear retains the door offer and buying that door releases the third stock slot across reload and next round',()=>{
 let h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())})});const card=h.cards()[0],id=card.dataset.item,stock=copy(h.c.state.shop),owned=[...h.c.state.owned],bells=h.c.state.bells;
 assert.equal(h.cards().length,2);assert.equal(h.offers().length,3);h.button(card).onclick();
 assert.deepEqual(copy(h.c.state.owned),[...owned,id]);assert.equal(h.c.state.bells,bells-part(id).price);assert.equal(h.c.state.doorTier,0);assert.deepEqual(copy(h.c.state.shop),stock);assert.equal(h.cards().length,2);assert.equal(h.offers().length,3);
 const beforeDoor=copy(h.c.state),button=h.button(h.nodes.doorUpgradeCard);button.onclick();
 assert.equal(h.c.state.doorTier,1);assert.equal(h.c.state.bells,beforeDoor.bells-DOORS[1].price);assert.deepEqual(copy(h.c.state.owned),beforeDoor.owned);assert.deepEqual(copy(h.c.state.build),beforeDoor.build);assert.deepEqual(copy(h.c.state.shop),stock);assert.equal(h.cards().length,3);assert.equal(h.offers().length,3);
 h=app({state:loadProgress(h.storage)});assert.equal(h.cards().length,3);assert.equal(h.offers().length,3);assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,true);assert.deepEqual(h.c.state.owned,[...owned,id]);
 h.c.state=visitShop(bank(h.c.state,'offer-cap-next-round',{distance:1,height:1,animal:'mouse',grams:25}),91);saveProgress(h.storage,h.c.state);h.c.renderShop();
 assert.equal(h.cards().length,2);assert.equal(h.offers().length,3);assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,false);assert.deepEqual(copy(h.c.state.owned),[...owned,id]);
});
test('paid parcel temporarily uses all three choices and restores the guaranteed door after one saved selection',()=>{
 let h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())})});const before=copy(h.c.state),cost=packPrice(h.c.state),stock=copy(h.c.state.shop);
 const parcel=findPagedCard(h,card=>card.className.split(' ').includes('pack-card'));h.button(parcel).onclick();
 assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.equal(h.cards().length,3);assert.equal(h.offers().length,3);assert.equal(h.c.state.bells,before.bells-cost);assert.deepEqual(copy(h.c.state.owned),before.owned);
 h=app({state:loadProgress(h.storage)});assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.equal(h.cards().length,3);assert.equal(h.offers().length,3);assert.equal(h.c.state.bells,before.bells-cost);
 const choice=h.cards()[0],id=choice.dataset.item,choose=h.button(choice);choose.onclick();
 assert.deepEqual(copy(h.c.state.owned),[...before.owned,id]);assert.equal(h.c.state.bells,before.bells-cost);assert.equal(h.c.state.doorTier,0);assert.equal(h.c.state.doorUpgradeRound,-1);assert.deepEqual(copy(h.c.state.shop.offers),stock.offers);assert.deepEqual(copy(h.c.state.shop.voucher),stock.voucher);
 assert.equal(h.nodes.doorUpgradeCard.hidden,false);assert.equal(h.button(h.nodes.doorUpgradeCard).disabled,false);assert.equal(h.cards().length,2);assert.equal(h.offers().length,3);const paid=copy(h.c.state);choose.onclick();assert.deepEqual(copy(h.c.state),paid);
 const restored=app({state:loadProgress(h.storage)});assert.deepEqual(restored.c.state.owned,[...before.owned,id]);assert.equal(restored.c.state.bells,before.bells-cost);assert.equal(restored.nodes.doorUpgradeCard.hidden,false);assert.equal(restored.offers().length,3);
});
test('Creative purchases and three parcel choices obey the shared visible cap without altering Adventure',()=>{
 const h=app({state:stocked({doorTier:0,animals:availableCritters(newProgress())}),creative:true}),before=copy(h.c.state),bytes=h.storage.getItem(SAVE_KEY);
 assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.equal(h.offers().length,3);h.button(h.cards()[0]).onclick();assert.ok(h.offers().length<=3);
 const parcel=findPagedCard(h,card=>card.className.split(' ').includes('pack-card'));h.button(parcel).onclick();assert.equal(h.cards().length,3);assert.equal(h.offers().length,3);assert.equal(h.nodes.doorUpgradeCard.hidden,true);
 h.button(h.cards()[0]).onclick();assert.ok(h.offers().length<=3);assert.equal(h.nodes.doorUpgradeCard.hidden,true);assert.deepEqual(copy(h.c.state),before);assert.equal(h.storage.getItem(SAVE_KEY),bytes);assert.equal(h.calls.persist,0);
});
test('bounded stock-page limits preserve every offer and purchased shelf while parcel choices remain three',()=>{
 const state=stocked({vouchers:['extraShelf']}),before=copy(state),total=shopView(state).total;
 for(const [limit,count]of[[0,1],[1,1],[2,2],[2.9,2],[3,3],[9,3],[NaN,3]]){
  const seen=[];for(let page=0;page<10;page++){const view=shopView(state,{limit,page});assert.ok(view.cards.length<=count);assert.equal(view.total,total);seen.push(...view.cards.map(card=>card.kind+':'+card.id));if(view.page===view.pages-1)break;}
  assert.equal(new Set(seen).size,total);assert.equal(seen.length,total);assert.deepEqual(state,before);
 }
 const opened=openPack(state);assert.equal(shopView(opened,{limit:2}).cards.length,3);assert.equal(shopView(opened,{limit:2}).choosing,true);
});
