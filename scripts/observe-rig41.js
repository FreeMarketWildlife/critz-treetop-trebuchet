import * as P from '../node_modules/planck/dist/planck.mjs';
import{PhysicalHookScene}from'../src/hook-experiment.js';import{installRigPolicy}from'./rig-policy41.js';import{readFileSync,writeFileSync}from'node:fs';
/** Research only: resolve a moving mechanism's own real external arrivals. */
function arrivalDetail(scene,dt,complete=false){
 if(scene.phase!=='flight')return false;
 const rig=new Set();for(let b=scene.world.getBodyList();b;b=b.getNext())
  if(b.isDynamic()&&!['part','enemy'].includes(b.getUserData()?.role))rig.add(b);
 const obstacles=[];for(let b=scene.world.getBodyList();b;b=b.getNext())if(complete||!rig.has(b))
  for(let f=b.getFixtureList();f;f=f.getNext())obstacles.push({body:b,fixture:f,a:f.getAABB(0)});
 for(const b of rig){const v=b.getLinearVelocity(),speed=Math.hypot(v.x,v.y),spin=Math.abs(b.getAngularVelocity());
  if(speed<3&&spin<10)continue;
  const center=b.getWorldCenter();for(let f=b.getFixtureList();f;f=f.getNext()){
   const a=f.getAABB(0),radius=Math.hypot(Math.max(Math.abs(a.lowerBound.x-center.x),Math.abs(a.upperBound.x-center.x)),Math.max(Math.abs(a.lowerBound.y-center.y),Math.abs(a.upperBound.y-center.y)));
   for(const o of obstacles){if(o.body===b||!b.shouldCollide(o.body))continue;const g=f.getFilterGroupIndex(),h=o.fixture.getFilterGroupIndex();
    if(!(g!==0&&g===h?g>0:((f.getFilterMaskBits()&o.fixture.getFilterCategoryBits())&&(o.fixture.getFilterMaskBits()&f.getFilterCategoryBits()))))continue;
    const q=o.body.getLinearVelocity(),pad=Math.max(.15,radius*Math.min(2,spin*dt))+(speed+Math.hypot(q.x,q.y))*dt;
    if(a.upperBound.x+pad>=o.a.lowerBound.x&&a.lowerBound.x-pad<=o.a.upperBound.x&&a.upperBound.y+pad>=o.a.lowerBound.y&&a.lowerBound.y-pad<=o.a.upperBound.y){let fixturePairTouching=false,bodyPairTouching=false;for(let edge=b.getContactList();edge;edge=edge.next)if(edge.other===o.body&&edge.contact.isTouching()){bodyPairTouching=true;const ca=edge.contact.getFixtureA(),cb=edge.contact.getFixtureB();if(ca===f&&cb===o.fixture||cb===f&&ca===o.fixture)fixturePairTouching=true;}const input=new P.DistanceInput(),output=new P.DistanceOutput();input.proxyA.set(f.getShape(),0);input.proxyB.set(o.fixture.getShape(),0);input.transformA=b.getTransform();input.transformB=o.body.getTransform();input.useRadii=true;P.Distance(output,new P.SimplexCache(),input);const point={x:Math.max(o.a.lowerBound.x,Math.min(o.a.upperBound.x,center.x)),y:Math.max(o.a.lowerBound.y,Math.min(o.a.upperBound.y,center.y))},u=b.getLinearVelocityFromWorldPoint(point),v=o.body.getLinearVelocityFromWorldPoint(point);return{a:b.getUserData(),b:o.body.getUserData(),fixturePairTouching,bodyPairTouching,fixtureDistance:output.distance,closestA:{...output.pointA},closestB:{...output.pointB},absoluteSpeed:speed,relativeSpeedAtProxyPoint:Math.hypot(u.x-v.x,u.y-v.y),proxyPoint:point};}
   }
  }
 }return false;
}

const q=JSON.parse(readFileSync('docs/reviews/iteration-41/earlier-incoming.json')),scene=new PhysicalHookScene(q.p,q.species,q),stats=installRigPolicy(scene,8,true),arrivals=[];for(let i=0;i<600;i++){const detail=arrivalDetail(scene,1/600,true);if(detail)arrivals.push({time:scene.elapsed,...detail});scene.step();}writeFileSync('docs/reviews/iteration-41/arrival-cost.json',JSON.stringify({protocol:'Read-only first broadphase-risk pair per outer tick of the corrected earlier-incoming1s replay. Relative speed evaluated at the rig body centre clamped to the other fixture AABB, not a measured manifold or proof of collision; exact broadphase first-pair rule copied from pinned research policy. GJK fixture distance uses pinned Planck actual shapes/transforms with radii; it observes geometry only. Used to diagnose cost, not change integration.',stats,arrivals},null,2)+'\n');console.log(stats);
