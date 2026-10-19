import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import P from 'planck';
import {PhysicalHookScene} from '../src/hook-experiment.js';import {createRig} from '../src/species.js';
const saved=JSON.parse(readFileSync(new URL('./fixtures/turtle-tail-incoming.json',import.meta.url)));
const work=s=>s.handWork+s.windingWork+s.assistWork+s.dragWork+s.dampingWork+s.spawnEnergy-s.despawnEnergy;
const poses=s=>s.parts.map(b=>({id:b.getUserData().id,p:{...b.getPosition()},v:{...b.getLinearVelocity()},angle:b.getAngle(),spin:b.getAngularVelocity()}));
function response(currentMasses){const s=new PhysicalHookScene(saved.p,'turtle',structuredClone(saved)),before=poses(s);
 if(currentMasses)for(const part of createRig('turtle').bodies){const body=s.parts.find(b=>b.getUserData().id===part.id),d={center:P.Vec2()};body.getMassData(d);body.setMassData({mass:part.mass,center:d.center,I:d.I*part.mass/d.mass});}
 // Explicit counterfactual fixture setup: unchanged geometry/poses/velocities,
 // material, limits and total mass. Production assigns these masses at creation.
 assert.deepEqual(poses(s),before);assert.ok(Math.abs(s.center().mass-2.4)<1e-12);
 const tail=s.parts.find(b=>b.getUserData().id==='tail');let joint;for(let j=s.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&j.getBodyB()===tail)joint=j;
 assert.equal(joint.getLowerLimit(),-.35);assert.equal(joint.getUpperLimit(),.35);
 const e0=s.energy(),w0=work(s);let maxAngle=0,maxAnchor=0,maxResidual=0;
 for(let i=0;i<600;i++){s.step();const a=joint.getAnchorA(),b=joint.getAnchorB();maxAngle=Math.max(maxAngle,joint.getJointAngle()-.35,-.35-joint.getJointAngle());maxAnchor=Math.max(maxAnchor,Math.hypot(a.x-b.x,a.y-b.y));maxResidual=Math.max(maxResidual,s.energy()-e0-(work(s)-w0));}
 return {maxAngle,maxAnchor,maxResidual};
}
test('natural turtle head-load reproducer resolves tail impact with unchanged limits and total mass',()=>{
 const legacy=response(false),current=response(true);assert.ok(legacy.maxAngle>.7,'fixture must retain original defect');assert.ok(current.maxAngle<.04,JSON.stringify(current));assert.ok(current.maxAnchor<.03);assert.ok(current.maxResidual<.01);
});
