/** Bounded pass6 cue-on/off regression: identical physical-tick actions, camera
 * and unchanged world. Layout notice is not an unfamiliar-player reaction test. */
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
import {createLaunchFeel} from '../src/launch-feel.js';
import {createFlightWeapons} from '../src/flight-weapons.js';
import {groveSetupCamera,groveFlightCamera,groveProject} from '../src/grove-camera.js';
import {imminentLanding} from '../src/landing-view.js';
import {landingOpportunity} from '../src/landing-opportunity.js';
import {createLandingCue} from '../src/landing-cue-art.js';
const rows=[];
for(const[width,height]of[[390,844],[1726,819]])for(const draw of[.5,.75,1])for(const weapon of['none','slingshot','staff','air'])for(const enabled of[false,true]){
 const sim=new BuildSimulation(STARTER,{map:createGroveMap()}),feel=createLaunchFeel(),weapons=createFlightWeapons(),marks=createLandingCue();sim.setDraw(draw);sim.fire();if(weapon!=='none')weapons.select(weapon);
 const tick=sim.tick.bind(sim);let shots=0;sim.tick=h=>{if(sim.release&&weapon!=='none'&&shots<(weapon==='air'?1:3)&&sim.time>=sim.release.time+1.6+shots*.7){const e=weapons.fire(sim,[0,0],[0,0]);if(e){shots++;if(e.hit)marks.clear();}}tick(h);};
 let cam=groveSetupCamera(sim.c,{width,height}),wall=0,lastScale=null,zoomVariation=0;const notices=[];
 while(['swing','flight'].includes(sim.phase)&&wall<60){const before=sim.time;feel.advance(sim,1/60);wall+=1/60;weapons.update(sim.time-before);if(!sim.release)continue;
  const p=sim.real(sim.shot),landing=imminentLanding(sim.map,p,{radius:sim.animal.width*.5,gravity:GRAVITY*sim.gravityFactor});cam=groveFlightCamera(cam,p,{width,height,animalLength:sim.animal.length,landing});if(lastScale!==null)zoomVariation+=Math.abs(Math.log(cam.scale/lastScale));lastScale=cam.scale;
  const cue=marks.update(sim,enabled?landingOpportunity(sim):null,{project:p=>{const q=groveProject(p,cam,width,height);return[q.x,q.y];},width,height,enabled});if(cue&&cue.alpha>=.5)notices.push({time:sim.time,id:cue.id,mode:cue.mode});
 }
 const hits=sim.contactEvents.filter(h=>h.normalSpeed>1&&!['foliage','sap'].includes(h.material));const leads=hits.slice(0,7).map((h,i)=>{const first=notices.find(n=>n.id===h.id&&n.time<h.time&&n.time>(hits[i-1]?.time??0));return{id:h.id,lead:first?+(h.time-first.time).toFixed(3):0};});
 rows.push({width,height,draw,weapon,enabled,shots,phase:sim.phase,failure:sim.failure,physicalSeconds:+sim.time.toFixed(6),wallSeconds:+wall.toFixed(3),distance:+sim.maxX.toFixed(6),zoomVariation:+zoomVariation.toFixed(6),visibleCueFrames:notices.length,modes:[...new Set(notices.map(n=>n.mode))],leads});
}
console.log(JSON.stringify(rows,null,2));
