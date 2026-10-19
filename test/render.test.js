import test from 'node:test';import assert from 'node:assert/strict';import{viewportFor,pointerWorld}from'../src/render.js';
test('portrait and landscape pointer mapping follows actual logical canvas dimensions',()=>{
 for(const width of [390,844,1200]){const v=viewportFor(width),bounds={left:10,top:20,width:width,height:width*v.height/v.width};
 const world={x:-2,y:296},x=v.originX+world.x*45,y=v.originY-(world.y-294)*45;
 const result=pointerWorld({clientX:10+x/v.width*bounds.width,clientY:20+y/v.height*bounds.height},bounds,v);assert.ok(Math.abs(result.x-world.x)<1e-10);assert.ok(Math.abs(result.y-world.y)<1e-10);}
});
test('narrow landscape phones use wide panels; portrait uses the taller loading canvas',()=>{
 assert.equal(viewportFor(640,360).portrait,false);assert.equal(viewportFor(390,844).portrait,true);assert.equal(viewportFor(650,650).portrait,true);assert.equal(viewportFor(651,1000).portrait,false);
});
test('hidden or invalid canvas bounds do not produce infinite physics targets',()=>{
 const v=viewportFor(390,844),p={clientX:20,clientY:30};
 for(const bounds of [{left:0,top:0,width:0,height:20},{left:0,top:0,width:20,height:0},{left:0,top:0,width:NaN,height:20}])assert.equal(pointerWorld(p,bounds,v),null);
 assert.equal(pointerWorld({...p,clientX:Infinity},{left:0,top:0,width:20,height:20},v),null);
});
test('renderer resize keeps logical dimensions, CSS ratio and drag targets synchronized',async()=>{
 const {createRenderer}=await import('../src/render.js');const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
 const bounds={left:15,top:25,width:360,height:450};const canvas={width:960,height:480,style:{},getContext:()=>ctx,getBoundingClientRect:()=>bounds};
 const scene={phase:'loading',center:()=>({x:0,y:297}),world:{getBodyList:()=>null},ropes:[],arm:{getWorldPoint:p=>p}};
 const renderer=createRenderer(canvas);
 for(const [width,height] of [[390,844],[640,360],[390,844]]){
  renderer.draw(scene,null,[],0,true,width,height);const v=renderer.viewport;assert.equal(canvas.width,v.width);assert.equal(canvas.height,v.height);assert.equal(canvas.style.aspectRatio,`${v.width}/${v.height}`);
  bounds.width=width-30;bounds.height=bounds.width*v.height/v.width;
  const target={x:-3,y:296},logical={x:v.originX+target.x*45,y:v.originY-(target.y-294)*45};
  const actual=renderer.point({clientX:bounds.left+logical.x/v.width*bounds.width,clientY:bounds.top+logical.y/v.height*bounds.height});assert.ok(Math.abs(actual.x-target.x)<1e-10);assert.ok(Math.abs(actual.y-target.y)<1e-10);
 }
});
test('loading and flight resize/render passes do not change a real articulated world',async()=>{
 const {PhysicalHookScene}=await import('../src/hook-experiment.js'),{STARTER_HARDWARE}=await import('../src/starter.js'),{createRenderer}=await import('../src/render.js');const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});const canvas={width:960,height:480,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:390,height:488})};const s=new PhysicalHookScene({...STARTER_HARDWARE,stoppedSplitPouch:true,releaseHardware:'channel'},'snake'),r=createRenderer(canvas);
 for(const phase of ['loading','flight']){s.phase=phase;const before=JSON.stringify(s.snapshot());for(const [width,height]of [[1200,900],[390,844],[844,390],[1200,900]])r.draw(s,null,[],1,true,width,height);assert.equal(JSON.stringify(s.snapshot()),before);}
});
