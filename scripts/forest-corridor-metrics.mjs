// Source QA metrics only; no browser state or runtime behavior.
const bands={forest:{x:[-46,733],y:[-32,78]},openSky:{x:[-Infinity,Infinity],y:[78,928]},space:{x:[-Infinity,Infinity],y:[928,2968]}};
function clip(a,b,band){let lo=0,hi=1;for(const axis of['x','y']){const v=a[axis],d=b[axis]-v,[min,max]=band[axis];if(Math.abs(d)<1e-12){if(v<min||v>max)return null;}else{const x=(min-v)/d,y=(max-v)/d;lo=Math.max(lo,Math.min(x,y));hi=Math.min(hi,Math.max(x,y));if(hi<lo)return null;}}return[a.t+(b.t-a.t)*lo,a.t+(b.t-a.t)*hi];}
export function quietMetrics(r){
 const substantive=r.events.filter(e=>!['foliage','sap'].includes(e.material)&&((e.normalSpeed>=.6&&e.velocityChange>=.35)||(e.power&&e.velocityChange>.35))),ends=[0,...substantive.map(e=>e.time-r.release.time),r.flight],path=[{t:0,x:r.release.x,y:r.release.y},...r.samples,{t:r.flight,...r.end}],out={whole:0,forest:0,openSky:0,space:0,allEventsWhole:r.gaps[0].seconds,substantiveEvents:substantive.length,fieldEvents:r.events.filter(e=>['foliage','sap'].includes(e.material)).length,intervals:{forest:[],openSky:[],space:[]},samplingMaxStep:Math.max(...path.slice(1).map((p,i)=>p.t-path[i].t))};
 for(let j=1;j<ends.length;j++){
  const from=ends[j-1],to=ends[j];out.whole=Math.max(out.whole,to-from);
  for(const[name,band]of Object.entries(bands)){
   const pieces=[];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];if(b.t<=from||a.t>=to||b.t<=a.t)continue;const span=clip(a,b,band);if(!span)continue;const lo=Math.max(from,span[0]),hi=Math.min(to,span[1]);if(hi<=lo)continue;const prior=pieces.at(-1);if(prior&&lo<=prior[1]+1e-7)prior[1]=hi;else pieces.push([lo,hi]);}
   for(const[lo,hi]of pieces){out[name]=Math.max(out[name],hi-lo);out.intervals[name].push({from:lo,to:hi,seconds:hi-lo});}
  }
 }
 for(const a of Object.values(out.intervals))a.sort((a,b)=>b.seconds-a.seconds);return out;
}
export function compareMetrics(before,after){return after.map((a,i)=>{const b=before[i],bm=quietMetrics(b),am=quietMetrics(a);return{id:a.id,draw:a.draw,weapon:a.weapon,before:bm,after:am,forestDelta:am.forest-bm.forest,wholeDelta:am.whole-bm.whole,beforeRange:b.range,afterRange:a.range,beforeFlight:b.flight,afterFlight:a.flight,hits:a.newHits,phase:a.phase,failure:a.failure,preContacts:a.preContacts.length,releaseEqual:JSON.stringify(a.release)===JSON.stringify(b.release)};});}
