import test from 'node:test';import assert from 'node:assert/strict';import{approachCues,payloadWarningRadius}from'../src/approach-cues.js';
const player=Object.freeze({x:0,y:200,vx:50,vy:-10}),options={camera:{x:1,y:200},width:480,height:600,scale:42};
const enemy=Object.freeze({id:'moth',kind:'puffy moth',x:45,y:191,vx:0,vy:0,radius:.65});
test('fast portrait arrival gets a bounded edge warning before entering the viewport',()=>{const cues=approachCues(player,[enemy],options);assert.equal(cues.length,1);assert.ok(cues[0].time>.8&&cues[0].time<1);assert.equal(cues[0].x,456);assert.ok(cues[0].y>=80&&cues[0].y<=576);assert.equal(enemy.x,45);assert.equal(player.vx,50);});
test('visible, receding, distant and harmless cross-track encounters do not clutter play',()=>{for(const e of [{...enemy,x:2,y:200},{...enemy,x:-45},{...enemy,x:100},{...enemy,y:240},{...enemy,vx:100}])assert.deepEqual(approachCues(player,[e],options),[]);assert.deepEqual(approachCues({...player,vx:NaN},[enemy],options),[]);});
test('warning work is capped, deterministic and supports both viewport shapes',()=>{for(const [width,height]of [[480,600],[960,480]]){const o={...options,width,height},enemies=Array.from({length:8},(_,i)=>({...enemy,id:String(i),x:30+i,y:194-i*.2})),a=approachCues(player,enemies,o);assert.equal(a.length,1);assert.equal(a[0].count,8);assert.deepEqual(a,approachCues(player,enemies,o));for(const p of a)assert.ok(p.x>=24&&p.x<=width-24&&p.y>=80&&p.y<=height-24);}});

test('a rim sliver or HUD-covered body retains notice until its full silhouette is readable',()=>{
 const p={x:0,y:200,vx:0,vy:50},o={...options,camera:{x:0,y:200}},e={...enemy,x:0,y:207,vx:0,vy:0};
 assert.equal(approachCues(p,[e],o).length,1); // circle reaches the top/HUD area
 assert.equal(approachCues(p,[{...e,y:204}],o).length,0);
 const horizontal={x:0,y:200,vx:50,vy:0};assert.equal(approachCues(horizontal,[{...enemy,x:6,y:200}],o).length,1);assert.equal(approachCues(horizontal,[{...enemy,x:4,y:200}],o).length,0);
});
test('four simultaneous directions fit on the rim and actual long poses extend the near-pass envelope',()=>{
 const p={x:0,y:200,vx:0,vy:0},enemies=[[30,0],[-30,0],[0,30],[0,-30]].map(([x,y],i)=>({...enemy,id:String(i),x,y:200+y,vx:-x,vy:-y}));assert.equal(approachCues(p,enemies,{...options,camera:{x:0,y:200}}).length,4);
 const radius=payloadWarningRadius(p,[{lowerBound:{x:-3,y:199.9},upperBound:{x:3,y:200.1}}]);assert.ok(radius>3.25&&radius<3.26);assert.equal(payloadWarningRadius(p,[]),1.5);
 const moving={...p,vx:50},nearMiss={...enemy,x:30,y:202.5};assert.equal(approachCues(moving,[nearMiss],options).length,0);assert.equal(approachCues(moving,[nearMiss],{...options,payloadRadius:radius}).length,1);
});

test('a reversal updates the warned direction immediately without stale receding threats',()=>{const p={x:0,y:200,vx:50,vy:0},o={...options,camera:{x:1,y:200}},enemies=[{...enemy,id:'right',x:40,y:200},{...enemy,id:'left',x:-40,y:200}];assert.deepEqual(approachCues(p,enemies,o).map(q=>q.id),['right']);assert.deepEqual(approachCues({...p,vx:-50},enemies,o).map(q=>q.id),['left']);});

test('skid warning uses the whole capsule radius and carries a slide telegraph',()=>{
 const p={x:0,y:200,vx:8,vy:0},o={...options,camera:{x:0,y:200}},e={id:'skid',kind:'waxleaf skid',shape:'skid',x:4.8,y:200,vx:0,vy:0,radius:1.1};
 const cues=approachCues(p,[e],o);assert.equal(cues.length,1);assert.equal(cues[0].interaction,'slide');assert.ok(cues[0].time>.5);assert.deepEqual(approachCues(p,[{...e,radius:.242}],o),[]);
});

test('actual cap encounter carries a rebound cue while other round actors stay neutral',()=>{
 const e={...enemy,shape:'cap'};assert.equal(approachCues(player,[e],options)[0].interaction,'bounce');
 assert.equal(approachCues(player,[{...e,shape:'oval'}],options)[0].interaction,undefined);
});
