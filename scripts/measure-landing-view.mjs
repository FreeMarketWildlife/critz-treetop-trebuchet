/** Camera-only comparison over the same controlled physical flight.
 * Lead is visibility of the eventual contact point in the last .65s, not a
 * reaction-time certification or exact ballistic collision prediction. */
import {BuildSimulation,GRAVITY} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
import {groveSetupCamera,groveFlightCamera,groveProject} from '../src/grove-camera.js';
import {imminentLanding} from '../src/landing-view.js';
const output=[];
for(const [width,height]of[[390,844],[1726,819]])for(const draw of[.5,.75,1]){
 const map=createGroveMap(),s=new BuildSimulation(STARTER,{map});s.setDraw(draw);s.fire();
 let old=groveSetupCamera(s.c,{width,height}),next={...old};const samples=[];
 while(['swing','flight'].includes(s.phase)&&s.time<25){
  s.step(1/60);if(!s.release)continue;const p=s.real(s.shot),landing=imminentLanding(s.map,p,{radius:s.animal.width*.5,gravity:GRAVITY*s.gravityFactor});
  old=groveFlightCamera(old,p,{width,height,animalLength:s.animal.length});next=groveFlightCamera(next,p,{width,height,animalLength:s.animal.length,landing});
  samples.push({time:s.time,old,next,landing:landing?.id});
 }
 const inside=p=>p.x>=12&&p.x<=width-12&&p.y>=100&&p.y<=height-32;
 const impacts=s.contactEvents.filter(e=>e.normalSpeed>1&&e.time>s.release.time+.5).slice(0,6).map(hit=>{
  const prior=samples.filter(f=>f.time<hit.time&&f.time>hit.time-.65),lead=key=>{const frame=prior.find(f=>inside(groveProject(hit,f[key],width,height)));return frame?Number((hit.time-frame.time).toFixed(3)):0;};
  return{id:hit.id,time:Number(hit.time.toFixed(3)),beforeLead:lead('old'),afterLead:lead('next'),minBodyPixels:Number(Math.min(...prior.map(f=>f.next.scale*s.animal.length)).toFixed(2))};
 });
 output.push({viewport:{width,height},draw,distance:Number(s.maxX.toFixed(3)),duration:Number(s.time.toFixed(3)),impacts});
}
console.log(JSON.stringify(output,null,2));
