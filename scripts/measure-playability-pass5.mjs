/** Pass5: prior repeated slowdown/camera vs readable art framing and natural tempo.
 * Strict fixed-tick inputs compare complete physical outcomes on the same map.
 * Prepared weapon hits use the existing F behavior; there is no steering binding
 * in this workshop. This is not human reaction-time or device-FPS certification. */
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
import {createFlightWeapons} from '../src/flight-weapons.js';
import {createLaunchFeel} from '../src/launch-feel.js';
import {groveFlightCamera,groveSetupCamera,groveProject} from '../src/grove-camera.js';
import {groveFlightCamera as oldCamera} from '../docs/overnight-pass-5/before-camera.mjs';
import {createLaunchFeel as beforeFeel} from '../docs/overnight-pass-5/before-tempo.mjs';
import {imminentLanding} from '../src/landing-view.js';
const output=[];
for(const [width,height]of[[390,844],[1726,819]])for(const draw of[.5,.75,1])for(const weapon of['none','slingshot','staff','air'])for(const improved of[false,true]){
 const sim=new BuildSimulation(STARTER,{map:createGroveMap()}),feel=(improved?createLaunchFeel:beforeFeel)(),weapons=createFlightWeapons();sim.setDraw(draw);sim.fire();if(weapon!=='none')weapons.select(weapon);
 // Trigger prepared inputs at fixed physical ticks for strict before/after
 // comparisons. Actual human/RAF input timing remains a separate playtest.
 const tick=sim.tick.bind(sim);let shots=0;
 sim.tick=h=>{if(sim.release){const limit=weapon==='air'?1:3;if(weapon!=='none'&&shots<limit&&sim.time>=sim.release.time+1.6+shots*.7){const action=weapons.fire(sim,[0,0],[0,0]);if(action)shots++;}}tick(h);};
 let cam=groveSetupCamera(sim.c,{width,height}),wall=0,minBody=Infinity,variation=0,lastScale=null;const frames=[];
 while(['swing','flight'].includes(sim.phase)&&wall<60){
  const physicalBefore=sim.time;feel.advance(sim,1/60);wall+=1/60;weapons.update(improved?sim.time-physicalBefore:1/60);
  if(!sim.release)continue;
  const p=sim.real(sim.shot),landing=imminentLanding(sim.map,p,{radius:sim.animal.width*.5,gravity:GRAVITY*sim.gravityFactor});
  cam=(improved?groveFlightCamera:oldCamera)(cam,p,{width,height,animalLength:sim.animal.length,landing});
  frames.push({wall,time:sim.time,cam});if(sim.time-sim.release.time>.6){minBody=Math.min(minBody,cam.scale*sim.animal.length);if(lastScale!==null)variation+=Math.abs(Math.log(cam.scale/lastScale));lastScale=cam.scale;}
 }
 const inside=p=>p.x>=12&&p.x<=width-12&&p.y>=100&&p.y<=height-32;
 const contacts=sim.contactEvents.filter(h=>h.normalSpeed>1).slice(0,7).map(h=>{const at=frames.find(f=>f.time>=h.time),prior=frames.filter(f=>f.time<h.time&&f.time>h.time-.65),first=prior.find(f=>inside(groveProject(h,f.cam,width,height)));return{id:h.id,time:+h.time.toFixed(3),wallPreview:at&&first?+(at.wall-first.wall).toFixed(3):0};});
 output.push({width,height,draw,weapon,improved,shots,phase:sim.phase,failure:sim.failure,physicalSeconds:+sim.time.toFixed(3),wallSeconds:+wall.toFixed(3),distance:+sim.maxX.toFixed(3),minBodyPixels:+minBody.toFixed(2),zoomVariation:+variation.toFixed(3),contacts});
}
console.log(JSON.stringify(output,null,2));
