import {BuildSimulation} from '../../src/build-physics.js';
import {STARTER,scaledPreset} from '../../src/build-catalog.js';
import {createGroveMap} from '../../src/grove-map.js';
import {landingOpportunity} from '../../src/landing-opportunity.js';
import {layoutLandingCue,createLandingCue} from '../../src/landing-cue-art.js';
const cases=[
 {name:'mouse-half',animal:'mouse',draw:.5},{name:'mouse-three-quarter',animal:'mouse',draw:.75},
 {name:'mouse-full',animal:'mouse',draw:1},{name:'frog-full',animal:'frog',draw:1},
 {name:'chipmunk-full',animal:'chipmunk',draw:1},{name:'squirrel-full',animal:'squirrel',draw:1},
 {name:'rabbit-full',animal:'rabbit',draw:1},{name:'mouse-headwind',animal:'mouse',draw:1,wind:-12},
 {name:'mouse-tailwind',animal:'mouse',draw:1,wind:12},{name:'mouse-no-drag',animal:'mouse',draw:1,drag:0},
 {name:'mouse-extreme-free-flight',animal:'mouse',draw:1,free:{x:24,y:3,vx:70,vy:-6,angle:1.7,omega:30}},
 {name:'mouse-leftward-free-flight',animal:'mouse',draw:1,free:{x:35,y:2,vx:-30,vy:-12,angle:2.2,omega:-20}},
];
const summary=[];
for(const c of cases){
 const build={...scaledPreset(c.animal),...(c.wind!==undefined?{wind:c.wind}:{}),...(c.drag!==undefined?{drag:c.drag}:{})};
 const s=new BuildSimulation(build,{map:createGroveMap()});s.setDraw(c.draw);s.fire();
 if(c.free){while(!s.release&&s.phase==='swing')s.step(1/120);const p=c.free;s.shot.setTransform({x:p.x/s.L,y:p.y/s.L},p.angle);s.shot.setLinearVelocity({x:p.vx*s.T/s.L,y:p.vy*s.T/s.L});s.shot.setAngularVelocity(p.omega*s.T);}
 const rows=[];let nextSample=0;
 for(let i=0;i<24*120&&['swing','flight'].includes(s.phase);i++){
  s.step(1/120);
  if(s.release&&s.time>=nextSample){const before=JSON.stringify(s.snapshot()),h=landingOpportunity(s);if(h)rows.push({time:s.time,p:s.real(s.shot),hit:h});if(JSON.stringify(s.snapshot())!==before)throw Error('mutation');nextSample=s.time+.04;}
 }
 const hits=s.contactEvents.filter(h=>!['foliage','sap'].includes(h.material));
 const paired=rows.map(row=>{const actual=hits.find(h=>h.time>row.time+1e-9);return{...row,actual,same:actual?.id===row.hit.id,error:actual?Math.hypot(actual.x-row.hit.x,actual.y-row.hit.y):null};});
 const complete=paired.filter(r=>r.actual&&r.actual.time-r.time<=1),wrong=complete.filter(r=>!r.same),outside=complete.filter(r=>r.same&&r.error>r.hit.spread+.04);
 summary.push({name:c.name,phase:s.phase,time:s.time,predictions:rows.length,paired:complete.length,wrong:wrong.length,outside:outside.length,maxError:Math.max(0,...complete.filter(r=>r.same).map(r=>r.error)),wrongExamples:wrong.slice(0,2),outsideExamples:outside.slice(0,2)});
}
const directions=[];for(const target of [[2000,300],[-1500,500],[100,2000],[220,-300],[2000,2000],[-1500,-1000]]){
 const animal=[150,350],cue=layoutLandingCue(target,animal,{width:390,height:844,exclusions:[]});if(!cue)continue;
 const dx=target[0]-animal[0],dy=target[1]-animal[1],dot=Math.cos(cue.angle)*dx+Math.sin(cue.angle)*dy;
 directions.push({target,cue,dot});if(dot<=0)throw Error('wrong edge direction');
}
console.log(JSON.stringify({summary,directions},null,2));
