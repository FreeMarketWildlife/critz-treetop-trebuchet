/** Diagnostic sweep, NOT a success-forcing loader or biological calibration.
 * Run from any directory: node scripts/measure-species.js > report.json
 * Exact force-hand recipe from test/articulated.test.js physicalLoad. No setters,
 * teleports, fallback seating, retries, arcade controls or encounter spawns.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {CritterScene} from '../src/articulated.js';
import {profiles} from '../src/species.js';
const sourceHashes=Object.fromEntries(['articulated.js','species.js','physics.js','world.js'].map(file=>[file,createHash('sha256').update(readFileSync(new URL(`../src/${file}`,import.meta.url))).digest('hex')]));
function measure(profile){
 const s=new CritterScene({},profile.id),dt=1/600;
 const row={species:profile.id,label:profile.label,mass:s.center().mass,grabbed:false,isLoaded:false,release:null,failure:null};
 try{
  for(let i=0;i<600;i++)s.step(dt);
  const root=s.parts.find(b=>b.getUserData().id==='torso')??s.parts[0];row.grabbed=s.grab(root.getWorldCenter());
  if(!row.grabbed){row.failure='Force-hand grab failed';return row;}
  for(let i=0;i<600;i++){s.move({x:-4.3,y:297});s.step(dt);}
  for(let i=0;i<1200;i++){const p=s.pouch.getPosition();s.move({x:p.x,y:p.y+.85});s.step(dt);}
  s.drop();for(let i=0;i<300;i++)s.step(dt);
  row.isLoaded=s.isLoaded();row.loadingCenter=s.center();row.pouchPosition={...s.pouch.getPosition()};row.handWork=s.handWork;row.forceCapped=s.forceCapped;
  row.energyBeforeLaunch=s.energy();row.framePositionBeforeLaunch={...s.frame.getPosition()};
  if(!row.isLoaded){row.failure='Same force-hand recipe did not seat this rig according to current isLoaded predicate';return row;}
  s.unlatch();for(let i=0;i<3000&&!s.release;i++)s.step(dt);
  if(s.release){const c=s.release.center;row.release={time:s.release.time,center:c,speed:Math.hypot(c.vx,c.vy),angleDegrees:Math.atan2(c.vy,c.vx)*180/Math.PI};}
  else row.failure='No release within 5 seconds after unlatching';
  row.phase=s.phase;row.finalCenter=s.center();row.framePositionAfterLaunch={...s.frame.getPosition()};row.energyAtEnd=s.energy();row.assistWork=s.assistWork;
 }catch(error){row.failure=error.message;}
 return row;
}
const measurements=profiles.map(measure);
console.log(JSON.stringify({scope:'Baseline contact-loading sweep with identical force-hand input recipe; failures are retained. No teleportation, per-species rescue, arcade assistance, encounters or biological calibration. Release means geometric pin event, not proof of a good throw or that every body has left the cradle.',sourceHashes,dt:1/600,recipe:{initialSettlingSteps:600,liftTarget:{x:-4.3,y:297},liftSteps:600,pouchRelativeTarget:{x:0,y:.85},pouchTrackingSteps:1200,unheldSettlingSteps:300,maxLaunchSteps:3000},summary:{profiles:measurements.length,loaded:measurements.filter(x=>x.isLoaded).length,released:measurements.filter(x=>x.release).length,failures:measurements.filter(x=>x.failure).length},measurements},null,2));
