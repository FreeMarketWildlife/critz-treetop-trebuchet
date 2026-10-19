import {simulate,ballistic,predict} from './physics.js';
import {world,regionAt} from './world.js';
const $=id=>document.getElementById(id),ctx=$('view').getContext('2d');
let preview;
const settings=()=>({counterMass:Number($('mass').value),projectileMass:Number($('critter').value),longArm:Number($('long').value),shortArm:Number($('short').value),pivotHeight:world.launchHeight});
const updatePreview=()=>{try{preview=predict(settings());}catch{preview=null;}};
for(const id of ['mass','critter','long','short'])$(id).oninput=updatePreview;
updatePreview();
let run,start=0,frozen=false,timingStart=performance.now();
$('time').onclick=()=>{frozen=!frozen;if(!frozen)timingStart=performance.now();};
$('launch').onclick=()=>{try {run=simulate(settings());start=performance.now();}catch(error){$('readout').textContent=error.message;run=null;}};
function line(a,b,color,width=4){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
function dot(p,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fill();}
function render(now){
 if(!frozen)$('power').value=(Math.sin((now-timingStart)/350)+1)/2;
 ctx.clearRect(0,0,960,480);ctx.fillStyle='#263a31';ctx.font='16px system-ui';ctx.fillText('Mechanism • slow motion',20,28);ctx.fillText('Authored world • schematic',510,28);
 line([480,0],[480,480],'#8c9f95',1);
 ctx.fillStyle='#b5caa0';ctx.fillRect(500,360-world.canopyTop,460,world.canopyTop);line([500,360],[960,360],'#534735');
 ctx.fillStyle='#263a31';ctx.fillText('Jungle canopy',510,220);ctx.fillText('Ground',510,345);
 if(preview)preview.points.forEach((p,i)=>dot([530+p.x,360-p.y],2,'rgba(82,85,45,'+(1-i/preview.points.length)*.7+')'));
 if(run){
 const elapsed=Math.max(0,(now-start)/1000),mechanismTime=elapsed*.35,frame=run.frames[Math.min(run.frames.length-1,Math.floor(mechanismTime/.001))];
 const local=p=>[220+p.x*45,270-(p.y-world.launchHeight)*45];
 const pivot=[220,270];line([120,360],pivot,'#705136');line(pivot,[310,360],'#705136');line(local(frame.counter),local(frame.tip),'#76572d',8);dot(local(frame.counter),13,'#536475');
 const released=mechanismTime>=run.time && run.release;
 let shot=released?ballistic(run.release,Math.max(0,elapsed-run.time/.35)):frame.projectile;
 if(shot.y<0){const q=run.release;const land=(q.vy+Math.sqrt(q.vy*q.vy+2*run.p.gravity*q.y))/run.p.gravity;shot=ballistic(q,land);}
 if(!released)line(local(frame.tip),local(frame.projectile),'#444',2);
 dot(local(frame.projectile),6,'#b06042');dot([530+shot.x,360-shot.y],5,'#b06042');
 $('readout').textContent=`${run.release?(Math.atan2(run.release.vy,run.release.vx)*180/Math.PI).toFixed(1)+'° • ':''}${run.reason} at ${run.time?.toFixed(3)} s • release ${run.release?Math.hypot(run.release.vx,run.release.vy).toFixed(2):'—'} m/s • ${regionAt(shot.y)} • height ${shot.y.toFixed(1)} m`;
 }
 requestAnimationFrame(render);
}
$('launch').click();requestAnimationFrame(render);
