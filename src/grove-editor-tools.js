import {validateGroveMap,objectBounds,enemyRecipe} from './grove-map.js?v=15';
const clone=v=>structuredClone(v);
export function createEditorHistory(initial,limit=80){
 let states=[clone(initial)],index=0;
 return {push(doc){states=states.slice(0,index+1);states.push(clone(doc));if(states.length>limit)states.shift();index=states.length-1;},undo(){if(index)index--;return clone(states[index]);},redo(){if(index<states.length-1)index++;return clone(states[index]);},get canUndo(){return index>0;},get canRedo(){return index<states.length-1;}};
}
export function translateObject(o,dx,dy){return o.points?{...o,points:o.points.map(p=>({x:p.x+dx,y:p.y+dy}))}:{...o,x:o.x+dx,y:o.y+dy};}
export function resizeObject(o,width,height){
 if(o.type==='enemy')return {...o,radius:enemyRecipe(o.kind).radius};
 if(!o.points)return {...o,radius:Math.max(.05,width/2)};
 const b=objectBounds(o),sx=width/(b.maxX-b.minX||1),sy=height/(b.maxY-b.minY||1);
 return {...o,points:o.points.map(p=>({x:b.minX+(p.x-b.minX)*sx,y:b.minY+(p.y-b.minY)*sy}))};
}
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function pointInside(p,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
export function simplifyStroke(points,tolerance){
 if(points.length<3)return points.map(p=>({...p}));
 let maximum=0,index=0;for(let i=1;i<points.length-1;i++){const d=segmentDistance(points[i],points[0],points.at(-1));if(d>maximum){maximum=d;index=i;}}
 return maximum>tolerance?[...simplifyStroke(points.slice(0,index+1),tolerance).slice(0,-1),...simplifyStroke(points.slice(index),tolerance)]:[{...points[0]},{...points.at(-1)}];
}
export function insertVertex(o,index){if(!o.points)return o;const end=o.type==='polygon'?(index+1)%o.points.length:Math.min(index+1,o.points.length-1),a=o.points[index],b=o.points[end];if(index===end)throw Error('Select a segment before inserting a point.');const points=o.points.map(p=>({...p}));points.splice(index+1,0,{x:(a.x+b.x)/2,y:(a.y+b.y)/2});return {...o,points};}
export function removeVertex(o,index){const minimum=o.type==='polygon'?3:2;if(!o.points||o.points.length<=minimum)throw Error(`This shape needs at least ${minimum} points.`);return {...o,points:o.points.filter((_,i)=>i!==index).map(p=>({...p}))};}
const MAX_JSON=2000000,MAX_LINK=140000;
async function bytesFromStream(stream,max=MAX_JSON){const reader=stream.getReader(),chunks=[];let length=0;try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>max)throw Error('Map is too large. Use a smaller map or JSON export.');chunks.push(value);}}finally{reader.releaseLock();}const result=new Uint8Array(length);let cursor=0;for(const c of chunks){result.set(c,cursor);cursor+=c.length;}return result;}
function base64(bytes){let string='';for(let i=0;i<bytes.length;i+=4096)string+=String.fromCharCode(...bytes.subarray(i,i+4096));return btoa(string).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export async function encodeMapLink(map){let bytes=new TextEncoder().encode(JSON.stringify(validateGroveMap(map)));if(bytes.length>MAX_JSON)throw Error('Map is too large to share.');let prefix='j1.';if(typeof CompressionStream!=='undefined'){bytes=await bytesFromStream(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')));prefix='g1.';}const token=prefix+base64(bytes);if(token.length>MAX_LINK)throw Error('This map is too detailed for a portable link. Export JSON instead.');return token;}
export async function decodeMapLink(token){if(typeof token!=='string'||token.length>MAX_LINK||!/^([gj]1)\.[A-Za-z0-9_-]+$/.test(token))throw Error('Invalid or oversized shared map link.');const raw=atob(token.slice(3).replaceAll('-','+').replaceAll('_','/'));let bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(token.startsWith('g1.')){if(typeof DecompressionStream==='undefined')throw Error('This browser cannot open compressed links. Ask for a JSON export.');bytes=await bytesFromStream(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));}if(bytes.length>MAX_JSON)throw Error('Shared map exceeds the size limit.');return validateGroveMap(JSON.parse(new TextDecoder().decode(bytes)));}
