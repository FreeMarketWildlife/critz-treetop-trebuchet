// Presentation follows authored altitude bands; it never changes terrain or motion.
export const BIOMES=Object.freeze([
 Object.freeze({id:'grandfatherTree',label:'Grandfather Tree',min:245}),
 Object.freeze({id:'openSky',label:'Open sky',min:120}),
 Object.freeze({id:'jungleCanopy',label:'Jungle canopy',min:5}),
 Object.freeze({id:'forestFloor',label:'Forest floor',min:-Infinity})
]);
export const biomeAt=y=>BIOMES.find(b=>y>b.min)||BIOMES[3];
export function createJourneyTracker(){
 let current=null;const visited=new Set();
 return {update(phase,y){if(!Number.isFinite(y))throw new Error('Finite journey height required');
  if(phase!=='flight')return {biome:biomeAt(y),changed:false,firstVisit:false};
  const next=biomeAt(y);let candidate=next;
  if(current&&next!==current){const boundary=BIOMES[Math.min(BIOMES.indexOf(current),BIOMES.indexOf(next))].min;if(Math.abs(y-boundary)<2)candidate=current;}
  const changed=current!==null&&candidate!==current,firstVisit=changed&&!visited.has(candidate.id);current=candidate;visited.add(current.id);
  return {biome:current,changed,firstVisit};
 }};
}
