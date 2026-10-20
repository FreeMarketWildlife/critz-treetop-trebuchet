import test from 'node:test';import assert from 'node:assert/strict';
import {createBuildRenderer} from '../src/build-art.js';
import {drawGroveWorld,drawGroveEnemy} from '../src/grove-art.js';
import {createGroveMap,ENEMIES} from '../src/grove-map.js';
function checkedCanvas(){
 let commands=0,gradients=0;
 const methods=new Set(['save','restore','beginPath','closePath','fill','stroke','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','fillRect','strokeRect','rect','clip','translate','rotate','scale','roundRect','setLineDash','fillText']);
 const c=new Proxy({globalAlpha:1},{get(target,key){if(key==='createLinearGradient')return(...points)=>{assert.ok(points.every(Number.isFinite));gradients++;return{addColorStop(at,color){assert.ok(Number.isFinite(at));assert.match(color,/^#[0-9a-f]{6}$/i,`valid gradient color: ${color}`);}};};if(methods.has(key))return(...args)=>{commands++;for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${key} arguments must stay finite`);};return target[key];},set(target,key,value){target[key]=value;return true;}});
 return{ctx:c,get commands(){return commands;},get gradients(){return gradients;}};
}
test('every altitude and camera scale renders valid sky colors and finite world commands',()=>{
 const map=createGroveMap();
 for(const altitude of [0,60,120,180,240,300,360,445,480,520,800,1500])for(const scale of [.3,4,43,210]){
  const c=checkedCanvas();drawGroveWorld(c.ctx,{camera:{x:1,y:altitude-300,scale},width:1031,height:738,map,time:1});drawGroveWorld(c.ctx,{camera:{x:1,y:altitude-300,scale},width:1031,height:738,map,time:1,foreground:true});assert.ok(c.gradients>=1);assert.ok(c.commands<10000);
 }
});
test('all original enemy models paint in palette and game sizes',()=>{
 for(const e of ENEMIES)for(const size of[18,50,200]){const c=checkedCanvas();drawGroveEnemy(c.ctx,e.kind,100,80,size,2);assert.ok(c.commands>20,e.kind);}
});

test('equipment feedback expires without drawing a closed preview canvas',()=>{
 let ms=0;const original=Object.getOwnPropertyDescriptor(globalThis,'performance');
 Object.defineProperty(globalThis,'performance',{value:{now:()=>ms},configurable:true});
 try{const c=checkedCanvas();const renderer=createBuildRenderer({getContext:()=>c.ctx});renderer.equipBurst('ballast');assert.equal(renderer.needsAnimation(),true);ms=1199;assert.equal(renderer.needsAnimation(),true);ms=1201;assert.equal(renderer.needsAnimation(),false);renderer.equipBurst('rope');assert.equal(renderer.needsAnimation(),true);ms=5000;assert.equal(renderer.needsAnimation(),false);}finally{Object.defineProperty(globalThis,'performance',original);}
});
