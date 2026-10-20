import {writeFileSync} from 'node:fs';
import {runBuild} from '../src/build-physics.js';
import {scaledPreset,CRITTERS,PARTS} from '../src/build-catalog.js';
const runs=[];
for(const animal of CRITTERS)for(const chassis of ['anchored','skids','wheels','walking','floating']){
 const sim=runBuild(scaledPreset(animal.id,chassis),110);
 runs.push({animal:animal.id,chassis,massGrams:animal.grams,phase:sim.phase,distanceMetres:sim.maxX,releaseSpeed:sim.release?.speed??null,releaseAngle:sim.release?.angle??null,peakTensionN:sim.peakTension,failure:sim.failure});
}
const result={equipmentItems:PARTS.length,gravity:9.80665,runs};
writeFileSync(new URL('../docs/custom-workshop/verification.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({cases:runs.length,finished:runs.filter(r=>r.phase==='finished').length,released:runs.filter(r=>r.releaseSpeed!==null).length,invalid:runs.filter(r=>r.phase==='invalid').length}));
