import {isSimplePolygon,objectBounds} from './grove-geometry.js?v=9';
export {objectBounds} from './grove-geometry.js?v=9';
export const MAP_KEY='treetop-grove-map-v2';
export const LEVELS=Object.freeze([
 {id:'forestFloor',name:'Forest floor',low:0,high:120,color:'#b98d64'},
 {id:'jungleCanopy',name:'Lower canopy',low:120,high:240,color:'#78a976'},
 {id:'grandfatherTree',name:'Grandfather Tree',low:240,high:360,color:'#b3cf79'},
 {id:'openSky',name:'Open sky',low:360,high:480,color:'#a4d2df'},
 {id:'space',name:'Starlight',low:480,high:1500,color:'#b8a6df'}]);
// Original creatures reuse the established game's encounter vocabulary. These
// are authored arcade encounters, not a simulation of animal biology.
export const ENEMIES=Object.freeze([
 {id:'beetle',kind:'beetle',name:'Archive beetle',biome:'grandfatherTree',shape:'oval',color:'#ba844c',radius:.65,effect:'spin',description:'A sturdy, springy shell.'},
 {id:'hopper',kind:'hopper',name:'Leaf hopper',biome:'grandfatherTree',shape:'leaf',color:'#8bc264',radius:.55,effect:'updraft',description:'A leafy upward bounce.'},
 {id:'cloud',kind:'cloud',name:'Raincloud',biome:'openSky',shape:'wings',color:'#d8d9f5',radius:1,effect:'updraft',description:'A soft upward gust.'},
 {id:'bird',kind:'bird',name:'Letter bird',biome:'openSky',shape:'oval',color:'#8fc6db',radius:.7,effect:'gust',description:'A friendly nudge to the right.'},
 {id:'pod',kind:'pod',name:'Spring pod',biome:'jungleCanopy',shape:'pod',color:'#dba669',radius:.8,effect:'updraft',description:'A powerful pinball pop.'},
 {id:'vinebug',kind:'vinebug',name:'Vine bug',biome:'jungleCanopy',shape:'oval',color:'#9ab86b',radius:.6,effect:'snare',description:'Slows a rushing traveller.'},
 {id:'skid',kind:'skid',name:'Waxleaf skid',biome:'jungleCanopy',shape:'skid',color:'#68bba0',radius:1.1,effect:'gust',description:'A slippery sideward bounce.'},
 {id:'fungus',kind:'fungus',name:'Round fungus',biome:'forestFloor',shape:'cap',color:'#d58fb1',radius:1.2,effect:'updraft',description:'A cheerful mushroom trampoline.'},
 {id:'yokai',kind:'yokai',name:'Wandering yokai',biome:'space',shape:'yokai',color:'#b8a2e3',radius:1,effect:'updraft',description:'A gentle low-gravity lift.'},
 {id:'fragment',kind:'fragment',name:'Ring fragment',biome:'space',shape:'pod',color:'#d8b68e',radius:.9,effect:'spin',description:'A tumbling cosmic bumper.'}
]);
export const enemyRecipe=kind=>ENEMIES.find(e=>e.kind===kind);
export function gravityScaleAt(altitude){const t=Math.max(0,Math.min(1,(altitude-450)/70));return 1-.86*t*t*(3-2*t);}
export function levelAt(altitude){return LEVELS.find(l=>altitude<l.high)??LEVELS.at(-1);}
const shape=(id,points,extra={})=>({id,name:id.replaceAll('-',' '),type:'polygon',points:points.map(([x,y])=>({x,y})),collision:true,layer:'world',material:'wood',bounce:.32,...extra});
const enemy=(id,kind,x,y,radius)=>({id,type:'enemy',kind,name:enemyRecipe(kind).name,x,y,radius,collision:true,layer:'world',material:'bumper',bounce:.88});
export function createGroveMap(){return{
 version:2,name:'Grandfather Tree',width:20000,height:1500,launch:{x:0,y:300},tree:{height:400,trunkX:-12,trunkWidth:14,doorX:-8},objects:[
  shape('launch-bough',[[-12,0],[11,0],[15,-.8],[20,-2.6],[11,-2.1],[-4,-2.9],[-12,-4.1]],{name:'Home branch'}),
  shape('far-bough',[[9,-1.2],[20,-.8],[27,2],[34,2.7],[28,1],[19,-2.3]],{name:'Branch passing behind',collision:false,layer:'back'}),
  shape('returning-bough',[[29,-8],[40,-6.5],[48,-5],[56,-5.6],[48,-7],[39,-8.2],[31,-9]],{name:'Returning branch'}),
  shape('leafy-ramp',[[52,-18],[65,-14],[69,-14],[67,-16],[54,-20]],{material:'leaf',bounce:.6}),
  shape('foreground-bough',[[-9,-5],[15,-6],[24,-8],[32,-8.1],[18,-10],[-9,-8]],{collision:false,layer:'front'}),
  shape('lower-canopy-one',[[15,-85],[47,-85],[63,-88],[51,-89],[21,-88]],{material:'leaf',bounce:.55}),
  shape('lower-canopy-two',[[65,-145],[99,-138],[112,-139],[108,-142],[69,-149]],{material:'leaf',bounce:.55}),
  shape('root-bank',[[-80,-299],[30,-299],[57,-294],[70,-296],[86,-300],[-80,-300]],{material:'stone',bounce:.3}),
  enemy('first-hopper','hopper',16,-3.6,.9),enemy('first-beetle','beetle',26,-8,1.1),enemy('spring-return','pod',38,-5,1.3),
  enemy('sky-gust','bird',51,8,1),enemy('cloud-one','cloud',65,92,2.2),enemy('cloud-two','cloud',105,142,2.5),
  enemy('canopy-pod','pod',39,-82,2),enemy('canopy-bug','vinebug',80,-118,1.4),enemy('floor-fungus','fungus',53,-292,3),
  enemy('star-yokai','yokai',62,208,2),enemy('ring-piece','fragment',112,250,2)
 ]};}
const finite=(v,lo,hi)=>Number.isFinite(v)&&v>=lo&&v<=hi;
export function validateGroveMap(value){
 if(!value||value.version!==2||typeof value.name!=='string'||!value.name.trim()||value.name.length>80||value.width!==20000||!finite(value.height,600,1500)||!Array.isArray(value.objects)||value.objects.length>2000)throw Error('Use a Grove v2 map, with a name and no more than 2,000 objects.');
 if(value.launch?.x!==0||value.launch?.y!==300)throw Error('The launch stays at 300 m in the Grandfather Tree.');
 if(!value.tree||!finite(value.tree.height,350,600)||!finite(value.tree.trunkX,-100,-5)||!finite(value.tree.trunkWidth,5,100)||!finite(value.tree.doorX,-30,-3))throw Error('Invalid Grandfather Tree dimensions.');
 const seen=new Set();let vertexCount=0;
 const objects=value.objects.map(o=>{
  if(!o||typeof o.id!=='string'||!o.id||o.id.length>100||seen.has(o.id)||!['polygon','chain','circle','enemy'].includes(o.type))throw Error('Every object needs a unique ID and a supported shape.');seen.add(o.id);
  if(typeof o.collision!=='boolean'||!['back','world','front'].includes(o.layer)||!['wood','leaf','stone','bumper'].includes(o.material)||!finite(o.bounce,0,1))throw Error('Invalid collision, depth layer, material or bounce setting.');
  const n={id:o.id,type:o.type,name:typeof o.name==='string'?o.name.slice(0,80):o.id,collision:o.collision,layer:o.layer,material:o.material,bounce:o.bounce};
  if(o.type==='polygon'||o.type==='chain'){
   if(!Array.isArray(o.points)||o.points.length<(o.type==='polygon'?3:2)||o.points.length>(o.type==='polygon'?128:256))throw Error('Polygons use 3–128 points; paths use 2–256 points.');
   n.points=o.points.map(p=>{if(!p||!finite(p.x,-500,20000)||!finite(p.y,-300,1200))throw Error('Keep points inside the world: x −500…20,000 m and altitude 0…1,500 m.');return{x:p.x,y:p.y};});
   vertexCount+=n.points.length;if(vertexCount>18000)throw Error('The map has too many collision vertices. Simplify a few shapes.');
   if(o.type==='polygon'&&!isSimplePolygon(n.points))throw Error('Polygon edges cannot cross or double back.');
   if(o.type==='chain'&&n.points.some((p,i)=>i&&Math.hypot(p.x-n.points[i-1].x,p.y-n.points[i-1].y)<.002))throw Error('Path points must be distinct.');
  }else{
   if(!finite(o.x,-500,20000)||!finite(o.y,-300,1200)||!finite(o.radius,.03,200))throw Error('Invalid circle position or radius (0.03–200 m).');
   Object.assign(n,{x:o.x,y:o.y,radius:o.radius});
   if(o.type==='enemy'){if(!enemyRecipe(o.kind))throw Error('Unknown enemy. Choose one from the illustrated palette.');n.kind=o.kind;}
  }
  return n;
 });
 return{version:2,name:value.name.trim(),width:20000,height:value.height,launch:{x:0,y:300},tree:{height:value.tree.height,trunkX:value.tree.trunkX,trunkWidth:value.tree.trunkWidth,doorX:value.tree.doorX},objects};
}
export function readGroveMap(storage){try{const raw=(storage??globalThis.localStorage)?.getItem(MAP_KEY);return raw?validateGroveMap(JSON.parse(raw)):null;}catch{return null;}}
export function saveGroveMap(storage,value){const map=validateGroveMap(value);storage.setItem(MAP_KEY,JSON.stringify(map));return map;}
