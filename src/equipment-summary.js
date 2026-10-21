import {part,drawLimit,REST_ARM_ANGLE} from './build-catalog.js?v=25';
import {GRAVITY} from './build-physics.js?v=25';
const n=value=>Number(value.toFixed(6)).toLocaleString('en-US',{maximumFractionDigits:6});
const mass=g=>g>=1000000?n(g/1000000)+' t':g>=1000?n(g/1000)+' kg':n(g)+' g';
/** What a purchased part changes, independent of a promised distance increase. */
export function equipmentSpec(p){
 switch(p.slot){
 case 'chassis':return {anchored:'Fixed axle · no recoil',skids:'Sliding feet · grip matters',wheels:'Rolling recoil · adjustable brake',walking:'Rocking support · adjustable lean',floating:'Sliding axle · guided weight'}[p.id];
 case 'arm':return n(p.maxLength)+' m beam limit · '+n(p.strength/1e6)+' MPa strength · '+n(p.density)+' kg/m³';
 case 'frame':return n(p.maxHeight)+' m axle limit · '+mass(p.maxMass)+' frame limit';
 case 'ballast':return mass(p.maxMass)+' fill limit · choose actual fill';
 case 'material':return n(p.density)+' kg/m³ · changes bulk and inertia';
 case 'mount':return p.id==='fixed'?'Weight turns with beam':'Independent hanging weight';
 case 'sling':return mass(p.capacity)+' volunteer · '+n(p.width)+' m opening · '+n(p.maxLength)+' m cords · '+mass(p.mass)+' cloth';
 case 'rope':return n(p.strength)+' N breaking load · '+mass(p.linearGrams)+'/m per cord';
 case 'bearing':return 'Friction coefficient '+n(p.friction)+' · lower resists less';
 case 'release':return 'Ring friction '+n(p.friction)+' · changes release timing';
 case 'winch':return n(p.power)+' W · load-limited winding, no launch boost';
 case 'trough':return 'Rail friction '+n(p.friction)+' · guides the loaded pouch';
 default:throw Error('Unsupported equipment slot');
 }
}
export function equipmentUse(p,c){
 if(p.slot==='frame')return 'Now '+n(c.pivotHeight)+' m / '+mass(c.frameGrams)+'. Capacity leaves dimensions unchanged; adjust below.';
 if(p.slot==='ballast')return 'Now filled with '+mass(c.counterGrams)+'. Capacity does not add weight; set the fill below.';
 if(p.slot==='sling')return 'Now '+n(c.pouchWidth)+' m opening / '+n(c.slingLength)+' m cords. Cloth and cord mass still load the beam.';
 if(p.slot==='winch')return 'Light loads share a 3-second governor. More power helps heavier loads; release uses gravity.';
 return '';
}
export function tuningLimit(c,key){
 return ({longArm:part(c.arm).maxLength-c.shortArm,shortArm:part(c.arm).maxLength-c.longArm,pivotHeight:part(c.frame).maxHeight,frameGrams:part(c.frame).maxMass,counterGrams:part(c.ballast).maxMass,slingLength:part(c.sling).maxLength,pouchWidth:part(c.sling).width})[key];
}
/** Integral of the same power/governor rule as BuildSimulation.wind; an estimate
 * for a fixed frame, not a claim that every moving-frame load winds identically. */
export function preparationSeconds(c,{loaded=true,samples=512}={}){
 const span=Math.PI+drawLimit(c)*Math.PI/180-REST_ARM_ANGLE,power=part(c.winch).power;
 let seconds=0;
 for(let i=0;i<samples;i++){
  const angle=REST_ARM_ANGLE+span*(i+.5)/samples;
  const joules=c.counterGrams/1000*GRAVITY*c.shortArm*Math.max(.01,-Math.cos(angle))*span;
  seconds+=Math.max(loaded?3:1.65,joules/power)/samples;
 }
 return seconds;
}
