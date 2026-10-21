import {part,validateBuild} from './build-catalog.js?v=24';
/** Fit owned equipment, reducing dimensions only when the selected part cannot
 * accommodate them. Buying capacity never secretly fills the counterweight. */
export function fitEquipment(build,offer){
 const c={...build};
 if(offer.kind==='voucher')return c;
 if(offer.kind==='animal')c.animal=offer.id;
 else{
  const p=part(offer.id);c[p.slot]=p.id;
  if(p.slot==='arm'&&c.longArm+c.shortArm>p.maxLength){const ratio=p.maxLength/(c.longArm+c.shortArm);c.longArm*=ratio;c.shortArm*=ratio;}
  if(p.slot==='frame'){c.pivotHeight=Math.min(c.pivotHeight,p.maxHeight);c.frameGrams=Math.min(c.frameGrams,p.maxMass);}
  if(p.slot==='ballast')c.counterGrams=Math.min(c.counterGrams,p.maxMass);
  if(p.slot==='sling'){c.slingLength=Math.min(c.slingLength,p.maxLength);c.pouchWidth=Math.min(c.pouchWidth,p.width);}
 }
 return validateBuild(c);
}
