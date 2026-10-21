// Retained V3 world: these archived art/contact/journey regressions deliberately
// keep their original geometry. V4 coverage lives in grove-proportioned and scale tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {drawGroveBackdrop} from '../src/grove-backdrop.js';
import {drawGroveWorld} from '../src/grove-art.js';
import {createV3GroveMap as createGroveMap} from '../src/grove-map.js';

function canvas(){
 let commands=0,path=[];const fills=[],stack=[],methods=new Set(['save','restore','beginPath','closePath','fill','stroke','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','fillRect','strokeRect','rect','clip','translate','rotate','scale','roundRect','setLineDash','fillText']);
 const state={globalAlpha:1},ctx=new Proxy(state,{get(target,key){
  if(['createLinearGradient','createRadialGradient'].includes(key))return(...args)=>{assert.ok(args.every(Number.isFinite));return{addColorStop(at,color){assert.ok(at>=0&&at<=1);assert.match(color,/^#[0-9a-f]{6}([0-9a-f]{2})?$/i);}};};
  if(!methods.has(key))return target[key];return(...args)=>{commands++;for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${key} must stay finite`);
   if(key==='save')stack.push({...state});if(key==='restore'){assert.ok(stack.length);Object.assign(state,stack.pop());}
   if(key==='beginPath')path=[];if(['moveTo','lineTo','bezierCurveTo','quadraticCurveTo'].includes(key))path.push([key,...args]);
   if(key==='fill')fills.push({color:state.fillStyle,alpha:state.globalAlpha,path:[...path]});
  };
 },set(target,key,value){if(typeof value==='number')assert.ok(Number.isFinite(value));target[key]=value;return true;}});
 return{ctx,fills,get commands(){return commands;},get depth(){return stack.length;}};
}

test('close phone and desktop canopy compositions stay finite and below the shared frame budget',()=>{
 const map=createGroveMap(),before=JSON.stringify(map);
 for(const [width,height]of[[390,844],[1726,819]])for(const [x,altitude]of[[0,600],[18,580],[70,540],[130,445],[200,320]])for(const scale of[18,43,100]){
  const c=canvas(),camera={x,y:altitude-map.launch.y,scale};for(const foreground of[false,true])drawGroveWorld(c.ctx,{camera,width,height,map,foreground});
  assert.equal(c.depth,0);assert.ok(c.commands<10000,`${width}px/${altitude}m/${scale}px per metre: ${c.commands} commands`);
 }
 assert.equal(JSON.stringify(map),before,'composition never changes editable objects');
});

test('distant canopy trunks retain fixed parallax positions instead of following the screen',()=>{
 const map=createGroveMap(),scale=43,width=390,height=844,par=.155;
 const trunks=x=>{const c=canvas();drawGroveBackdrop(c.ctx,{camera:{x,y:-25,scale},width,height,map});return c.fills.filter(f=>f.color==='#285f5b').map(f=>{
  assert.ok(f.alpha>0&&f.alpha<=.22,'distant silhouettes remain quiet and unoutlined');
  return f.path.map(([op,...v])=>[op,...v.map((n,i)=>Math.round((i%2?(height/2-n)/scale-25*par:(n-width/2)/scale+x*par)*1e6)/1e6)]);
 });};
 const a=trunks(70),b=trunks(71);assert.ok(a.length&&b.length,'the phone canopy has a broad distant trunk silhouette');
 assert.ok(a.some(p=>b.some(q=>JSON.stringify(p)===JSON.stringify(q))),'overlapping views preserve a shared world silhouette');
});


test('phone distant crowns and forks are recognizable whole forms rather than full-screen facets',()=>{
 const map=createGroveMap(),c=canvas();drawGroveBackdrop(c.ctx,{camera:{x:70,y:-25,scale:112},width:390,height:844,map});
 for(const color of['#285f5b','#3d776b']){
  const forms=c.fills.filter(f=>f.color===color);assert.ok(forms.length);
  for(const f of forms){const points=f.path.flatMap(([, ...args])=>Array.from({length:args.length/2},(_,i)=>[args[i*2],args[i*2+1]])),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
   const w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
   assert.ok(w>35&&w<260,`distant ${color} width ${w} fits a phone`);if(color==='#3d776b')assert.ok(h<550,`distant crown height ${h} leaves context`);else assert.ok(Math.max(...ys)>844,'trunk bases continue below the phone view');
  }
 }
});


test('the phone canopy composes several broad botanical silhouettes instead of one repeated stamp',()=>{
 const c=canvas();drawGroveBackdrop(c.ctx,{camera:{x:70,y:-25,scale:112},width:390,height:844,map:createGroveMap()});
 const crowns=c.fills.filter(f=>f.color==='#3d776b'||f.color==='#6b9987'),families=new Set(crowns.map(f=>f.path.map(p=>p[0]).join('/')));
 assert.ok(crowns.length>3);assert.equal(families.size,3,'spreading, upright and drooping crowns have distinct outline structures');
});
