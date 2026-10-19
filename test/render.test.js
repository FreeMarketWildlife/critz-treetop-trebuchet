import test from 'node:test';import assert from 'node:assert/strict';import{viewportFor,pointerWorld}from'../src/render.js';
test('portrait and landscape pointer mapping follows actual logical canvas dimensions',()=>{
 for(const width of [390,844,1200]){const v=viewportFor(width),bounds={left:10,top:20,width:width,height:width*v.height/v.width};
 const world={x:-2,y:296},x=v.originX+world.x*45,y=v.originY-(world.y-294)*45;
 const result=pointerWorld({clientX:10+x/v.width*bounds.width,clientY:20+y/v.height*bounds.height},bounds,v);assert.ok(Math.abs(result.x-world.x)<1e-10);assert.ok(Math.abs(result.y-world.y)<1e-10);}
});
