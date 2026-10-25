import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {STARTER,PARTS,part} from '../src/build-catalog.js';
import {fitEquipment,purchaseFit} from '../src/build-equipment.js';
import {BuildSimulation} from '../src/build-physics.js';
import {newProgress,canBuild} from '../src/build-progress.js';
import {visitShop,purchaseOffer,choosePack} from '../src/build-shop.js';
import {capacityFields,capacityAdjustedBuild,createCapacityControls} from '../src/capacity-controls.js';

function dom(){
 const document={activeElement:null,createElement(tag){const handlers=new Map();return{tagName:tag.toUpperCase(),children:[],dataset:{},attributes:{},value:'',disabled:false,textContent:'',
  append(...nodes){this.children.push(...nodes);},setAttribute(k,v){this.attributes[k]=v;},
  addEventListener(type,fn){handlers.set(type,fn);},emit(type){handlers.get(type)?.();},
  get valueAsNumber(){return this.value===''?NaN:Number(this.value);}};}};
 const all=node=>[node,...node.children.flatMap(all)];return{document,all};
}
function setup(slot,build=STARTER){
 const {document,all}=dom();let draft={...build},equipped={...build},preview=null,previews=0,applies=0;
 const component=createCapacityControls({document,slot,getBuild:()=>draft,onPreview:next=>{preview=next;previews++;},onApply:next=>{draft=next;equipped=next;applies++;}});
 const nodes=all(component.element),input=key=>nodes.find(n=>n.id==='capacity-'+key),button=nodes.find(n=>n.tagName==='BUTTON'),status=nodes.find(n=>n.className==='capacity-status');
 function change(key,value){const e=input(key);document.activeElement=e;e.value=value;e.emit('input');}
 return{component,document,input,button,status,change,get draft(){return draft;},get preview(){return preview;},get equipped(){return equipped;},get previews(){return previews;},get applies(){return applies;},setDraft(next){draft=next;}};
}
test('all frame/basket upgrades expose actual limits and preserve chosen settings before adjustment',()=>{
 const original={...STARTER,pivotHeight:2.7,frameGrams:8000,counterGrams:6000},before=structuredClone(original);
 for(const p of PARTS.filter(p=>p.slot==='frame'||p.slot==='ballast'&&p.maxMass>=original.counterGrams)){
  const fitted=fitEquipment(original,{kind:'part',id:p.id}),c=setup(p.slot,fitted);
  assert.equal(fitted.pivotHeight,original.pivotHeight);assert.equal(fitted.frameGrams,original.frameGrams);assert.equal(fitted.counterGrams,original.counterGrams);
  for(const f of capacityFields(fitted,p.slot)){assert.equal(Number(c.input(f.key).value),fitted[f.key]);assert.equal(Number(c.input(f.key).max),f.max);}
  assert.equal(c.previews,0);assert.equal(c.applies,0);assert.deepEqual(c.equipped,fitted);
 }
 assert.deepEqual(original,before);
});
test('basket preview leaves equipped fill alone until explicit apply, then changes only fill',()=>{
 const original={...STARTER,ballast:'quarry'},c=setup('ballast',original);
 c.change('counterGrams','12000');assert.equal(c.preview.counterGrams,12000);assert.equal(c.draft.counterGrams,STARTER.counterGrams);assert.equal(c.equipped.counterGrams,STARTER.counterGrams);assert.equal(c.applies,0);assert.match(c.status.textContent,/Preview only/);
 c.button.emit('click');assert.equal(c.applies,1);assert.deepEqual(c.equipped,{...original,counterGrams:12000});
 const sim=new BuildSimulation(c.equipped);assert.equal(sim.c.counterGrams,12000);assert.ok(sim.facts.counterRadius>new BuildSimulation(original).facts.counterRadius);
});
test('frame controls update actual axle geometry and mass only after explicit apply',()=>{
 const c=setup('frame');c.change('pivotHeight','2.4');c.change('frameGrams','1900');assert.deepEqual(c.equipped,STARTER);
 c.button.emit('click');assert.deepEqual(c.equipped,{...STARTER,pivotHeight:2.4,frameGrams:1900});
 const sim=new BuildSimulation(c.equipped);assert.equal(sim.pivot().y,2.4);assert.equal(sim.c.frameGrams,1900);assert.equal(sim.c.counterGrams,STARTER.counterGrams);assert.equal(sim.c.longArm,STARTER.longArm);
});
test('invalid or out-of-capacity input cannot preview or apply even through direct handler invocation',()=>{
 for(const value of['',NaN,-1,100001]){
  const c=setup('ballast');c.change('counterGrams',value);assert.equal(c.button.disabled,true);assert.equal(c.previews,0);assert.match(c.status.textContent,/Counterweight mass must be/);
  c.button.emit('click');assert.equal(c.applies,0);assert.deepEqual(c.equipped,STARTER);assert.deepEqual(c.draft,STARTER);
 }
 assert.throws(()=>capacityAdjustedBuild(STARTER,'frame',{pivotHeight:2,frameGrams:2000,counterGrams:10000}),/Only this part/);
 assert.throws(()=>capacityAdjustedBuild(STARTER,'arm',{}),/no capacity controls/);
});
test('external fine tuning and newly fitted capacity synchronize fields without applying',()=>{
 const c=setup('frame'),next={...STARTER,frame:'timber',pivotHeight:4.2,frameGrams:18000};
 c.setDraft(next);c.component.sync(next);
 assert.equal(Number(c.input('pivotHeight').value),4.2);assert.equal(Number(c.input('pivotHeight').max),10);assert.equal(Number(c.input('frameGrams').value),18000);assert.equal(Number(c.input('frameGrams').max),100000);
 assert.equal(c.applies,0);assert.deepEqual(c.equipped,STARTER);
});
test('an apply rejection remains visible and cannot report a successful adjustment',()=>{
 const {document,all}=dom();const component=createCapacityControls({document,slot:'ballast',getBuild:()=>STARTER,onPreview(){},onApply(){throw Error('Buy this part first.');}});
 const nodes=all(component.element);nodes.find(n=>n.tagName==='BUTTON').emit('click');
 assert.equal(nodes.find(n=>n.tagName==='BUTTON').disabled,true);assert.equal(nodes.find(n=>n.className==='capacity-status').textContent,'Buy this part first.');
});

const source=readFileSync(new URL('../src/build-app.js',import.meta.url),'utf8');
function application(){
 const groups=Object.fromEntries(['frame','ballast'].map(slot=>['part-'+slot,{open:false,scrolled:false,scrollIntoView(){this.scrolled=true;}}]));
 const classes={add(){},remove(){}},nodes={...groups,workshopDialog:{open:true},buildTab:{click(){nodes.activeTab='build';}},fittedNotice:{textContent:'',classList:classes},previewStage:{classList:classes,offsetWidth:1}};
 const original={...newProgress(),bells:1000,points:18117,owned:[...new Set([...newProgress().owned,'timber','quarry'])]};
 const context={state:original,draft:{...original.build},creative:false,stage:{dataset:{}},renderer:{equipBurst(){}},previewRenderer:{equipBurst(){}},dirty:false,$:id=>nodes[id],fitEquipment,purchaseFit,canBuild,
  product:offer=>part(offer.id),syncPreview(next){context.preview=next;},cue(){},chime(){},toast(){},persist(){return true;},persistShop(next){context.state=next;return true;},populate(){},purchaseOffer,choosePack,
 };
 context.applyBuild=()=>{canBuild(context.state,context.draft,context.creative);context.state={...context.state,build:{...context.draft}};};
 vm.createContext(context);
 const start=source.indexOf('function previewCapacity('),end=source.indexOf('function syncPreview(',start);
 assert.ok(start>0&&end>start);vm.runInContext(source.slice(start,end),context);
 return{context,nodes};
}
test('actual equip handler preserves custom dimensions/currency and reveals direct frame controls',()=>{
 const h=application(),before=structuredClone(h.context.state);h.context.selectEquipment({kind:'part',id:'timber'});
 assert.equal(h.context.state.build.frame,'timber');assert.equal(h.context.state.build.pivotHeight,before.build.pivotHeight);assert.equal(h.context.state.build.frameGrams,before.build.frameGrams);assert.equal(h.context.state.bells,before.bells);assert.equal(h.context.state.points,before.points);
 assert.equal(h.nodes.activeTab,'build');assert.equal(h.nodes['part-frame'].open,true);assert.equal(h.nodes['part-frame'].scrolled,true);assert.match(h.nodes.fittedNotice.textContent,/Adjust axle height/);
});
test('actual shop purchase path reveals new fill controls while preserving the chosen fill and other earned progress',()=>{
 const h=application(),offer={kind:'part',id:'quarry'};
 h.context.state=visitShop({...h.context.state,owned:h.context.state.owned.filter(id=>id!=='quarry')},73);h.context.state.shop.offers=[offer];
 h.context.draft={...h.context.state.build};h.context.offer=offer;h.context.p=part('quarry');h.context.packChoice=false;h.context.button={};
 const before=structuredClone(h.context.state),start=source.indexOf(' button.onclick=()=>{try{',source.indexOf('function shopCard(')),end=source.indexOf('\n card.append',start);
 assert.ok(start>0&&end>start);vm.runInContext(source.slice(start,end),h.context);h.context.button.onclick();
 assert.equal(h.context.state.bells,before.bells-part('quarry').price);assert.equal(h.context.state.points,before.points);assert.equal(h.context.state.build.ballast,'quarry');assert.equal(h.context.state.build.counterGrams,before.build.counterGrams);assert.equal(h.context.state.build.pivotHeight,before.build.pivotHeight);
 assert.equal(h.nodes.activeTab,'build');assert.equal(h.nodes['part-ballast'].open,true);assert.equal(h.nodes['part-ballast'].scrolled,true);assert.match(h.nodes.fittedNotice.textContent,/Adjust counterweight mass/);
});
test('capacity reveal never opens workshop controls on the playfield',()=>{
 const h=application();h.nodes.workshopDialog.open=false;h.context.fitted('Timber tower','frame');assert.equal(h.nodes.activeTab,undefined);assert.equal(h.nodes['part-frame'].open,false);
});

test('actual capacity preview cannot leak into an unrelated equipment selection before Apply',()=>{
 const h=application(),original=structuredClone(h.context.state);
 h.context.previewCapacity(capacityAdjustedBuild(h.context.draft,'ballast',{counterGrams:12000}));
 assert.equal(h.context.preview.counterGrams,12000);assert.equal(h.context.draft.counterGrams,STARTER.counterGrams);assert.deepEqual(h.context.state,original);
 h.context.selectEquipment({kind:'part',id:'timber'});
 assert.equal(h.context.state.build.counterGrams,STARTER.counterGrams);assert.equal(h.context.state.build.frame,'timber');
});
test('actual capacity apply validates ownership and changes only explicitly requested capacity fields',()=>{
 const h=application(),before=structuredClone(h.context.state);
 const next=capacityAdjustedBuild(h.context.draft,'ballast',{counterGrams:12000});
 h.context.applyCapacity('ballast',next,'Boulder basket');
 assert.deepEqual(h.context.state.build,{...before.build,counterGrams:12000});assert.equal(h.context.state.bells,before.bells);assert.equal(h.nodes.fittedNotice.textContent,'✓ Counterweight fill applied');
 const state=structuredClone(h.context.state);
 assert.throws(()=>h.context.applyCapacity('ballast',{...next,ballast:'continental'},'Continental ballast'),/Buy/);
 assert.deepEqual(h.context.state,state);
});
