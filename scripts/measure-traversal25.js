import {PhysicalHookScene} from '../src/hook-experiment.js';
import {STARTER_HARDWARE} from '../src/starter.js';
import {profiles} from '../src/species.js';
import {load,waitForContact} from './measure-hook.js';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const output=process.argv[2]??'docs/reviews/iteration-25/traversal.json',rows=[],sources=['src/terrain.js','src/articulated.js','src/world.js','src/hook-experiment.js','src/species.js','src/starter.js'];
const hash=()=>Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),sourceSHA256=hash();
for(const fraction of [.2,.6,.9])for(const profile of profiles){
 let s=new PhysicalHookScene({...STARTER_HARDWARE,initialArm:-3,stoppedSplitPouch:true,releaseHardware:'channel',mechanicalWinding:true,collisionSubsteps:true,collisionStepHz:2400,fastCollisionStepHz:4800},profile.id);s.startWinding(fraction);for(let k=0;k<7200&&s.phase==='winding';k++)s.step();const row={species:profile.id,fraction,outcome:'seating_failed'};
 if(load(s)&&waitForContact(s).quiet>=.1){s=s.clone();s.unlatch();for(let k=0;k<3000&&!s.release;k++)s.step();if(s.release){row.outcome='released';row.release=s.release;let still=0,canopyStill=0,groundAt=null,groundX=null,groundSeconds=0,canopySeconds=0;const surfaces=new Map();s.enableEncounters(12000+rows.length);
 for(let k=0;k<24000;k++){s.step();const c=s.center(),speed=Math.hypot(c.vx,c.vy);if(c.y>5&&c.y<120){canopySeconds+=1/600;still=speed<.05?still+1/600:0;canopyStill=Math.max(canopyStill,still);}else still=0;if(c.y<2){groundAt??=k/600;groundX??=c.x;groundSeconds+=1/600;}for(const e of s.events.splice(0))if(e.type==='impact'&&e.surface)surfaces.set(e.surface,(surfaces.get(e.surface)??0)+1);}
 const c=s.center();Object.assign(row,{surfaces:Object.fromEntries(surfaces),canopySeconds,longestCanopyStillSeconds:canopyStill,groundAt,groundSeconds,groundTravel:groundX===null?0:c.x-groundX,end:{x:c.x,y:c.y,speed:Math.hypot(c.vx,c.vy)},impacts:s.impactCount});}}
 rows.push(row);console.error(profile.id,fraction,row.outcome,row.end?.y?.toFixed(1),row.longestCanopyStillSeconds?.toFixed(1));
}
writeFileSync(output,JSON.stringify({protocol:'33 actual torque-wound torso loads,11species x3strengths,starter gear,40seconds after release,seeded encounters,no steering or save/reward writes. Still means COM speed<.05m/s,canopy5..120m. GroundAt/travel start at COM<2m;groundSeconds counts COM<2m,not exact contact time. Endpoints are observations, not universal guarantees.',sourceSHA256,sourcesChanged:JSON.stringify(sourceSHA256)!==JSON.stringify(hash()),rows},null,2)+'\n');
