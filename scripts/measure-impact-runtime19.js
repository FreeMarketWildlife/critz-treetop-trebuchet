import {PhysicalHookScene} from '../src/hook-experiment.js';
import {CritterScene} from '../src/articulated.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const current=CritterScene.prototype.step;
await import('./research-joint-motion.js');
const experimental=CritterScene.prototype.step;
const fixtures=[['lizard-head','docs/reviews/iteration-18/incoming-default-lizard-head.json'],['lizard-light-beam','docs/reviews/iteration-18/incoming-owned-beam-light.json'],['armadillo-shelf','docs/reviews/iteration-19/incoming-armadillo-first-obstacle.json']].map(([name,path])=>{const j=JSON.parse(readFileSync(path));return{name,saved:j.snapshot??j};});
const rows=[];
for(let round=0;round<12;round++)for(const {name,saved} of fixtures)for(const variant of round%2?['jointMotion8','shelfOnly']:['shelfOnly','jointMotion8']){
 CritterScene.prototype.step=variant==='shelfOnly'?current:experimental;
 const s=new PhysicalHookScene(saved.p,saved.species,structuredClone(saved));const batches=[];let integrations=0;const integrate=s.integrate.bind(s);s.integrate=dt=>{integrations++;integrate(dt);};const cpu=process.cpuUsage(),start=performance.now();
 for(let i=0;i<60;i++){const t=performance.now();for(let k=0;k<10;k++)s.step();batches.push(performance.now()-t);}
 const used=process.cpuUsage(cpu);rows.push({round,name,variant,wallMs:performance.now()-start,cpuMs:(used.user+used.system)/1000,integrations,batches});
}
CritterScene.prototype.step=current;
const percentile=(a,p)=>[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*p)];
const summaries=[];for(const {name}of fixtures)for(const variant of ['shelfOnly','jointMotion8']){const warm=rows.filter(r=>r.round>=2&&r.name===name&&r.variant===variant),b=warm.flatMap(r=>r.batches);summaries.push({name,variant,tenTickBatchP95:percentile(b,.95),tenTickBatchMax:Math.max(...b),medianOneSecondCpuMs:percentile(warm.map(r=>r.cpuMs),.5),integrations:warm[0].integrations});}
writeFileSync('docs/reviews/iteration-19/impact-runtime.json',JSON.stringify({protocol:'12 alternating-order pairs per identical incoming fixture; first2rounds discarded in summaries,600outerticks each. Engine only including joint scan and instrumentation integration counter, no diagnostic contact scans/rendering. Shared Node process/host, not browser FPS. No other explicit measurement jobs running.',summaries,rows},null,2)+'\n');console.table(summaries);
