import test from 'node:test';
import assert from 'node:assert/strict';
import {recentContactFeedback,layoutContactWord,drawContactWord} from '../src/impact-feedback.js';
import {drawFlightAccents} from '../src/flight-art.js';
import {BuildSimulation} from '../src/build-physics.js';
import {STARTER} from '../src/build-catalog.js';
import {createGroveMap} from '../src/grove-map.js';
const objects=[{id:'mat',type:'polygon',material:'leaf',collision:true,bounce:.87},{id:'wood',type:'polygon',material:'wood',collision:true,bounce:.26},{id:'flower',type:'circle',material:'bumper',collision:false,bounce:0},{id:'hopper',type:'enemy',kind:'hopper',material:'bumper',collision:true,bounce:.88},{id:'vine',type:'enemy',kind:'vinebug',material:'bumper',collision:true,bounce:.88}];
const hit=(extra={})=>({id:'mat',seq:1,time:1,x:120,y:600,normal:{x:0,y:1},strength:.8,material:'leaf',...extra});
const sim=(events=[hit()])=>({map:{objects},phase:'flight',release:{},time:1.1,contactEvents:events,animal:{length:.18},shot:{},real:()=>({x:180,y:300,vx:9,vy:4,angle:2})});
const viewport={width:390,height:844},project=p=>[p.x,p.y];
function canvas(){let depth=0;const calls=[];const c=new Proxy({},{get:(_,key)=>(...args)=>{calls.push([key,...args]);if(key==='save')depth++;if(key==='restore')depth--;for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n));},set:()=>true});return{c,calls,get depth(){return depth;}};}

test('impact words stay on the recorded surface while the body and camera move',()=>{
 const s=sim(),before=JSON.stringify(s),a=recentContactFeedback(s),first=layoutContactWord(a,project,viewport);assert.equal(a.word,'BOING!');assert.deepEqual(first.point,[120,600]);assert.equal(first.y,576);
 s.real=()=>({x:300,y:150,vx:9,vy:4,angle:4});assert.deepEqual(recentContactFeedback(s),a,'body motion cannot relocate an impact');
 const moved=layoutContactWord(a,p=>[p.x+20,p.y-30],viewport);assert.equal(moved.x-first.x,20);assert.equal(moved.y-first.y,-30,'only world projection moves the word');
 assert.equal(JSON.stringify(s),before,'feedback reads cannot mutate events or the world');
});
test('one dominant contact in the newest solver tick wins independent of event ordering',()=>{
 const events=[hit({seq:1,time:.95,strength:1,id:'wood',material:'wood'}),hit({seq:2,strength:.9}),hit({seq:3,strength:.35,id:'wood',material:'wood'})];
 const a=recentContactFeedback(sim(events)),b=recentContactFeedback(sim([...events].reverse()));assert.equal(a.seq,2);assert.deepEqual(a,b);
 assert.equal(recentContactFeedback(sim([hit({seq:3}),hit({seq:4})])).seq,4,'sequence breaks equal-strength ties');
});
test('fields, decorative sources, invalid data, stale/future events and unreleased/finished states produce no word',()=>{
 for(const h of[hit({material:'sap'}),hit({material:'foliage'}),hit({id:'flower',material:'bumper'}),hit({id:'unknown'}),hit({strength:.1}),hit({time:.5}),hit({time:2}),hit({x:NaN}),hit({normal:null}),hit({normal:{x:0,y:0}})])assert.equal(recentContactFeedback(sim([h])),null);
 for(const state of[{phase:'ready'},{phase:'finished'},{release:null}])assert.equal(recentContactFeedback({...sim(),...state}),null);
});
test('source semantics distinguish actual authored power from passive and slowing contacts',()=>{
 assert.equal(recentContactFeedback(sim([hit({id:'wood',material:'wood'})])).word,'BONK!');
 assert.equal(recentContactFeedback(sim([hit({id:'hopper',material:'bumper',power:true,strength:.1})])).word,'POP!');
 assert.equal(recentContactFeedback(sim([hit({id:'vine',material:'bumper',power:true})])).word,'SNAG!');
 assert.equal(recentContactFeedback(sim([hit({id:'vine',material:'bumper'})])).word,'BOING!','physical collision alone never claims a positive power');
 assert.equal(recentContactFeedback(sim([hit({id:'forest-floor',material:'stone'})])).word,'BONK!');
});
test('full words are suppressed offscreen or under fixed controls without relocating the source',()=>{
 const a=recentContactFeedback(sim());assert.ok(layoutContactWord(a,project,viewport));
 for(const [x,y]of[[2,600],[388,600],[35,200],[120,20],[120,870]])assert.equal(layoutContactWord({...a,x,y},project,viewport),null);
 const c=canvas();drawContactWord(c.c,a,project,viewport);assert.equal(c.depth,0);assert.equal(c.calls.filter(c=>c[0]==='fillText').length,1);assert.ok(c.calls.length<15);
 const no=canvas();drawContactWord(no.c,{...a,x:-40},project,viewport);assert.equal(no.calls.length,0);
});
test('pause holds contact age, retry clears it, and integrated flight art emits one source word',()=>{
 const s=sim(),a=recentContactFeedback(s);assert.deepEqual(recentContactFeedback(s),a);s.time+=.14;assert.equal(recentContactFeedback(s),null);assert.equal(recentContactFeedback({...sim(),release:null,contactEvents:[]}),null);
 const c=canvas();drawFlightAccents(c.c,{sim:sim([hit(),hit({seq:2,id:'wood',material:'wood',strength:.4})]),project,scale:100,...viewport,reducedMotion:true});
 const words=c.calls.filter(c=>c[0]==='fillText');assert.equal(words.length,1);assert.equal(words[0][1],'BOING!');assert.equal(words[0][2],120);assert.equal(words[0][3],576);assert.equal(c.depth,0);
});
test('a natural starter bounce reads its actual editable solid face without changing the physical run',()=>{
 const s=new BuildSimulation(STARTER,{map:createGroveMap()});s.setDraw(1);s.fire();let feedback;
 for(let i=0;i<1800&&!feedback;i++){s.step(1/60);const f=recentContactFeedback(s);if(f&&['wood','leaf'].includes(s.map.objects.find(o=>o.id===f.id)?.material))feedback=f;}
 assert.ok(feedback,'natural starter throw reaches a readable solid impact');const hit=s.contactEvents.find(h=>h.seq===feedback.seq),object=s.map.objects.find(o=>o.id===hit.id);
 const before=JSON.stringify(s.snapshot()),events=JSON.stringify(s.contactEvents),omega=s.shot.getAngularVelocity();
 assert.equal(feedback.id,hit.id);assert.equal(feedback.x,hit.x);assert.equal(feedback.y,hit.y);assert.equal(feedback.word,object.material==='leaf'?'BOING!':'BONK!');
 const distances=object.points.map((a,i)=>{const b=object.points[(i+1)%object.points.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((hit.x-a.x)*dx+(hit.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(hit.x-a.x-dx*t,hit.y-a.y-dy*t);});
 assert.ok(Math.min(...distances)<.025,'the source lies on the actual editable contact boundary');
 assert.equal(JSON.stringify(s.snapshot()),before);assert.equal(JSON.stringify(s.contactEvents),events);assert.equal(s.shot.getAngularVelocity(),omega);
});


test('malformed null events cannot create punctuation or crash flight rendering',()=>{
 const s=sim([null,hit()]);assert.equal(recentContactFeedback(s).id,'mat');const c=canvas();
 drawFlightAccents(c.c,{sim:s,project,scale:100,...viewport,reducedMotion:true});assert.equal(c.depth,0);assert.equal(c.calls.filter(c=>c[0]==='fillText').length,1);
 for(const malformed of[null,{}, {word:'BONK!',normal:null}, {word:'BONK!',normal:{x:NaN,y:1},alpha:1}])assert.equal(layoutContactWord(malformed,project,viewport),null);
});
