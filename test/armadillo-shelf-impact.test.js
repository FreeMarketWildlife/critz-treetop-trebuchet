import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PhysicalHookScene} from '../src/hook-experiment.js';

test('saved backward armadillo shelf arrival retains articulation through contact',()=>{
 const {snapshot:saved}=JSON.parse(readFileSync(new URL('../docs/reviews/iteration-19/incoming-armadillo-first-obstacle.json',import.meta.url)));
 const s=new PhysicalHookScene(saved.p,saved.species,structuredClone(saved));
 assert.ok(saved.release.center.vx<0,'retain the real poor backward throw');
 const work=()=>s.handWork+s.windingWork+s.assistWork+s.dragWork+s.dampingWork+s.spawnEnergy-s.despawnEnergy;
 const energy=s.energy(),initialWork=work();let maxAngle=0,maxAnchor=0,maxPenetration=0;
 const integrate=s.integrate.bind(s);
 s.integrate=dt=>{
  integrate(dt);
  for(let j=s.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&[j.getBodyA(),j.getBodyB()].every(b=>b.getUserData()?.role==='part')){
   const a=j.getAnchorA(),b=j.getAnchorB();maxAnchor=Math.max(maxAnchor,Math.hypot(a.x-b.x,a.y-b.y));
   maxAngle=Math.max(maxAngle,0,j.getJointAngle()-j.getUpperLimit(),j.getLowerLimit()-j.getJointAngle());
  }
  for(let c=s.world.getContactList();c;c=c.getNext())if(c.isTouching()&&c.isEnabled()&&[c.getFixtureA(),c.getFixtureB()].some(f=>f.getBody().getUserData()?.role==='part')){
   const wm=c.getWorldManifold(null);maxPenetration=Math.max(maxPenetration,...wm.separations.slice(0,c.getManifold().pointCount).map(x=>-x));
  }
  assert.ok(Number.isFinite(maxAngle+maxAnchor+maxPenetration));
  assert.ok(s.energy()-energy-(work()-initialWork)<.01,'no positive unaccounted energy');
 };
 for(let i=0;i<600;i++)s.step();
 assert.ok(maxAngle<.04,`shelf angular response ${maxAngle}`);
 assert.ok(maxAnchor<.001,`shelf must not tear the torso/tail hinge: ${maxAnchor}`);
 assert.ok(maxPenetration<.003,`refinement must not trade stretch for penetration: ${maxPenetration}`);
});
