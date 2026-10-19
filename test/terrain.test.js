import test from 'node:test';import assert from 'node:assert/strict';
import {surfaceY,surfaceVertices,surfaceCrossing,surfaceNear} from '../src/terrain.js';
import {terrainApproaches} from '../src/terrain-cues.js';
import {approachCues} from '../src/approach-cues.js';
import {impact,world} from '../src/world.js';
import {CritterScene} from '../src/articulated.js';
const branch={id:'test branch',minX:40,maxX:50,y:100,slope:-.35,restitution:.3,tangentRetention:.8};
test('sloped branch shares exact endpoints, swept crossing and passive normal response',()=>{
 assert.equal(surfaceY(branch,50),96.5);assert.deepEqual(surfaceVertices(branch).slice(2),[{x:50,y:96.5},{x:40,y:100}]);
 const hit=surfaceCrossing({x:45,y:105},{x:45,y:90},branch);assert.equal(hit.x,45);assert.ok(surfaceNear(branch,{x:45,y:98.25}));assert.equal(surfaceCrossing({x:60,y:105},{x:60,y:90},branch),null);
 const before={x:45,y:98.25,vx:0,vy:-20},after=impact(before,branch);assert.ok(after.vx>0,'the downhill normal redirects a falling payload forward');assert.ok(after.vx**2+after.vy**2<400,'passive collision cannot increase kinetic energy');
});
test('real branch collider follows the authored slope and a resting mouse slides onward under gravity',()=>{
 const s=new CritterScene({collisionSubsteps:true},'mouse'),c=s.center(),surface=world.surfaces.find(s=>s.id==='canopy approach'),x=46,y=surfaceY(surface,x)+.5;
 for(const b of s.parts){const p=b.getPosition();b.setPosition({x:p.x+x-c.x,y:p.y+y-c.y});b.setLinearVelocity({x:0,y:0});b.setAngularVelocity(0);}s.phase='flight';s.release={time:0,center:s.center()};s.installRouteTerrain();let hit=false,maxX=x;
 for(let k=0;k<7200;k++){s.step();maxX=Math.max(maxX,s.center().x);for(const e of s.events.splice(0))if(e.surface==='canopy approach')hit=true;}
 assert.ok(hit,'fixture physically contacts the branch');assert.ok(maxX>surface.maxX+1,'gravity carries the volunteer beyond the branch end');assert.ok(s.center().y<surfaceY(surface,surface.maxX)-5,'no flat shelf traps the volunteer');
});
test('portrait fixed-branch and bumper advice uses the actual contact segment before it enters view',()=>{
 const p={x:46,y:130,vx:0,vy:-35},layout={surfaces:[branch],bumpers:[{x:46,y:110,radius:1}]},options={camera:{x:46,y:130},width:480,height:600,scale:42};
 const candidates=terrainApproaches(p,layout),cues=approachCues(p,candidates,options);assert.ok(candidates.some(c=>c.id==='terrain-test branch'&&c.y===surfaceY(branch,c.x)));assert.ok(cues.some(c=>c.kind==='branch'||c.members.includes('terrain-test branch')));assert.ok(cues.every(c=>c.time>0&&c.time<=1.2));
 assert.equal(terrainApproaches({...p,vy:35},layout).filter(c=>c.kind==='branch').length,0);assert.equal(terrainApproaches({...p,x:80},layout).filter(c=>c.kind==='branch').length,0);
 const visible={...options,camera:{x:46,y:100}};assert.ok(!approachCues(p,candidates,visible).some(c=>c.members.includes('terrain-test branch')),'a readable contact section needs no extra arrow; an offscreen bumper can still warn');
});

test('all authored downhill branch contact sections receive bounded advance cues in both viewport shapes',()=>{
 for(const surface of world.surfaces.filter(s=>s.flightOnly))for(const [width,height]of [[480,600],[960,480]])for(const speed of [20,60,100])for(const payloadRadius of [1.5,3]){
  const x=(surface.minX+surface.maxX)/2,p={x,y:surfaceY(surface,x)+speed,vx:0,vy:-speed},before=JSON.stringify(p),candidates=terrainApproaches(p,world,{payloadRadius}),cues=approachCues(p,candidates,{camera:p,width,height,scale:42,payloadRadius});
  assert.ok(cues.some(c=>c.members.includes(`terrain-${surface.id}`)),`${surface.id}/${width}/${speed}/${payloadRadius}`);assert.ok(cues.length<=4);assert.equal(JSON.stringify(p),before);
 }
});
