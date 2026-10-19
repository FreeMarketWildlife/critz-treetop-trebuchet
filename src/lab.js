import {simulate,predict,config,initialState,geometry} from './physics.js';
import {world,regionAt,firstCollision,worldFlight} from './world.js';
import {seatLoad,settleLoad,loadedSettings} from './loading.js';
const $=id=>document.getElementById(id),canvas=$('view'),ctx=canvas.getContext('2d');
const base=()=>({counterMass:Number($('mass').value),projectileMass:Number($('critter').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:world.launchHeight,armDamping:Number($('friction').value),flightDrag:Number($('drag').value)});
const local=p=>[220+p.x*45,270-(p.y-world.launchHeight)*45];
let load=null,preview=null,run=null,flight=null,start=0,drag=null,frozen=false,timingStart=performance.now();
const settings=()=>load?loadedSettings(base(),load):base();
const message=text=>$('readout').textContent=text;
function updatePreview(){preview=null;if(load)try{preview=predict(settings(),(a,b)=>Boolean(firstCollision(a,b)));}catch(e){message(e.message);}}
for(const id of ['mass','critter','long','short','friction','drag'])$(id).oninput=()=>{load=null;preview=null;$('launch').disabled=true;message('Configuration changed: drag the critter into the sling again.');};
$('time').onclick=()=>{frozen=!frozen;if(!frozen)timingStart=performance.now();};
$('launch').disabled=true;
$('launch').onclick=()=>{try{run=simulate(settings());flight=run.release?worldFlight(run.release,run.p):null;start=performance.now();}catch(e){message(e.message);run=null;}};
const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height,time:e.timeStamp};};
canvas.onpointerdown=e=>{const q=point(e);if(Math.hypot(q.x-70,q.y-420)>24)return;
 canvas.setPointerCapture(e.pointerId);drag={q,samples:[q]};run=null;load=null;preview=null;$('launch').disabled=true;};
canvas.onpointermove=e=>{if(!drag)return;const q=point(e);drag.q=q;drag.samples.push(q);drag.samples=drag.samples.filter(s=>q.time-s.time<=120);};
canvas.onpointerup=e=>{if(!drag)return;const q=point(e),samples=drag.samples,last=samples.at(-1);
 const earlier=samples.find(s=>q.time-s.time>=40),dt=earlier?(q.time-earlier.time)/1000:0;
 const velocity=earlier && q.time-last.time<100 && dt>0?{x:(q.x-earlier.x)/45/dt,y:-(q.y-earlier.y)/45/dt}:{x:0,y:0};
 drag=null;try{
   const seated=seatLoad(base(),{x:(q.x-220)/45,y:world.launchHeight+(270-q.y)/45},velocity);
   load=settleLoad(base(),seated);updatePreview();$('launch').disabled=false;
   message(`Loaded: ${load.remainingEnergy.toFixed(3)} J above hanging-rest reference after 0.25 s settling; radial loss ${load.discardedRadialEnergy.toFixed(3)} J; speed-cap loss ${load.discardedCapEnergy.toFixed(3)} J; seating work ${load.seatingWork.toFixed(3)} J. Ready to unlatch.`);
 }catch(error){message(error.message);}
};
canvas.onpointercancel=()=>{drag=null;message('Loading cancelled. Drag the critter again.');};
function line(a,b,color,width=4){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
function dot(p,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fill();}
function render(now){
 if(!frozen)$('power').value=(Math.sin((now-timingStart)/350)+1)/2;
 ctx.clearRect(0,0,960,480);ctx.fillStyle='#263a31';ctx.font='16px system-ui';ctx.fillText('Load critter → unlatch',20,28);ctx.fillText('Authored world • schematic',510,28);
 line([480,0],[480,480],'#8c9f95',1);ctx.fillStyle='#b5caa0';ctx.fillRect(500,240,460,120);line([500,360],[960,360],'#534735');
 ctx.fillStyle='#263a31';ctx.fillText('Jungle canopy',510,220);ctx.fillText('Ground',510,385);
 for(const surface of world.surfaces)if(surface.id!=='ground')line([530+surface.minX,360-surface.y],[530+surface.maxX,360-surface.y],'#786444',3);
 if(preview)preview.points.forEach((p,i)=>dot([530+p.x,360-p.y],2,`rgba(82,85,45,${(1-i/preview.points.length)*.7})`));
 let frame,released=false,shot,elapsed=0;
 try{const p=run?.p??config(settings());frame=geometry(initialState(p),p);
   if(run){elapsed=Math.max(0,(now-start)/1000);const mechanismTime=elapsed*.35;
     frame=run.frames[Math.min(run.frames.length-1,Math.floor(mechanismTime/.001))];released=mechanismTime>=run.time && Boolean(run.release);
     shot=released?flight.frames[Math.min(flight.frames.length-1,Math.floor(Math.max(0,elapsed-run.time/.35)/.001))]:frame.projectile;
   }
   const pivot=[220,270];line([120,360],pivot,'#705136');line(pivot,[310,360],'#705136');line(local(frame.counter),local(frame.tip),'#76572d',8);dot(local(frame.counter),13,'#536475');
   if(!released){line(local(frame.tip),local(frame.projectile),'#444',2);dot(local(frame.projectile),8,load?'#b06042':'#839b8a');}
   if(shot)dot([530+shot.x,360-shot.y],5,'#b06042');
   if(run)message(`${run.release?(Math.atan2(run.release.vy,run.release.vx)*180/Math.PI).toFixed(1)+'° • ':''}${run.reason} • ${run.release?Math.hypot(run.release.vx,run.release.vy).toFixed(2):'—'} m/s • ${regionAt(shot.y)} • height ${shot.y.toFixed(1)} m • ${flight?.collisions.filter(c=>c.time<=Math.max(0,elapsed-run.time/.35)).length??0} impacts`);
 }catch{/* Invalid numeric input is reported on load/launch, without crashing rendering. */}
 dot(drag?[drag.q.x,drag.q.y]:[70,420],12,'#b06042');ctx.fillStyle='#263a31';ctx.fillText('Drag me',22,450);
 requestAnimationFrame(render);
}
message('Drag the critter onto the lower end of the sling. The beam stays latched while loading.');requestAnimationFrame(render);
