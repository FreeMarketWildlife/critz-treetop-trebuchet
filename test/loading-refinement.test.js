import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PhysicalHookScene} from '../src/hook-experiment.js';
const entries=[0,1,2].flatMap(group=>JSON.parse(readFileSync(new URL(
 `../docs/reviews/iteration-38/regression-group${group}.json`,import.meta.url))).rows);
function recordedLoad(id,experimental=false){
 const entry=entries.find(row=>row.id===id);
 const input=JSON.parse(readFileSync(new URL(`../docs/reviews/iteration-40/input-${id}.json`,import.meta.url)));
 const scene=new PhysicalHookScene(entry.parameters,entry.species);
 scene.startWinding(entry.fraction);
 for(let i=0;i<7200&&scene.phase==='winding';i++)scene.step();
 assert.equal(scene.phase,'loading');
 assert.equal(createHash('sha256').update(JSON.stringify(scene.snapshot())).digest('hex'),input.postWindHash);
 if(experimental)scene.p.loadingConstraintSubsteps=true;
 let maxAngular=0,innerSteps=0;const integrate=scene.integrate.bind(scene);
 scene.integrate=dt=>{
  integrate(dt);if(scene.phase!=='loading')return;innerSteps++;
  for(let joint=scene.world.getJointList();joint;joint=joint.getNext())
   if(joint.getType()==='revolute-joint'&&joint.isLimitEnabled())
    maxAngular=Math.max(maxAngular,joint.getJointAngle()-joint.getUpperLimit(),joint.getLowerLimit()-joint.getJointAngle());
 };
 for(let i=0;i<600;i++)scene.step();
 assert.ok(scene.grab(input.tape.grab));
 for(const point of input.tape.targets){scene.move(point);scene.step();}
 scene.drop();for(let i=0;i<300+input.tape.waitSteps;i++)scene.step();
 assert.ok(scene.isLoaded()&&scene.loadingStatus().contacting);
 assert.equal(scene.assistWork,0);
 return {scene,maxAngular,innerSteps,outerSteps:2700+input.tape.waitSteps};
}
for(const id of ['stock-chipmunk-0.6','combined-chipmunk-0.75'])
 test(`opt-in recorded physical load respects angular stops: ${id}`,()=>{
  const result=recordedLoad(id,true);
  assert.ok(result.maxAngular<.08,`actual inner-step overrun ${result.maxAngular}`);
  assert.ok(result.innerSteps>result.outerSteps);
 });
test('ordinary loading retains the reviewed historical solver while research policy is deferred',()=>{
 const result=recordedLoad('stock-chipmunk-0.6');
 assert.equal(result.scene.p.loadingConstraintSubsteps,undefined);
 assert.equal(result.innerSteps,result.outerSteps);
 assert.equal(result.maxAngular,.13462300572187247);
});
