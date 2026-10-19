import * as P from '../node_modules/planck/dist/planck.mjs';
const rigBody=body=>body.isDynamic()&&!['part','enemy'].includes(body.getUserData()?.role);
/** Research-only conservative actual-shape arrival selection. No world state is assigned. */
export function mechanismArrival(scene,dt,stats=null,{selectedMotionOnly=false}={}){
 if(scene.phase!=='flight')return false;
 const bodies=[];
 for(let body=scene.world.getBodyList();body;body=body.getNext()){
  const center=body.getWorldCenter(),velocity=body.getLinearVelocity(),spin=Math.abs(body.getAngularVelocity()),fixtures=[];
  for(let fixture=body.getFixtureList();fixture;fixture=fixture.getNext()){
   if(fixture.isSensor())continue;
   const a=fixture.getAABB(0),radius=Math.hypot(Math.max(Math.abs(a.lowerBound.x-center.x),Math.abs(a.upperBound.x-center.x)),Math.max(Math.abs(a.lowerBound.y-center.y),Math.abs(a.upperBound.y-center.y)));
   fixtures.push({fixture,a,rotation:radius*Math.min(2,spin*dt)});
  }
  bodies.push({body,rig:rigBody(body),velocity,speed:Math.hypot(velocity.x,velocity.y),spin,fixtures});
 }
 const input=new P.DistanceInput(),output=new P.DistanceOutput(),cache=new P.SimplexCache();input.useRadii=true;
 for(let i=0;i<bodies.length;i++){
  const a=bodies[i];if(!a.rig||selectedMotionOnly&&a.speed<3&&a.spin<10)continue;
  for(let k=0;k<bodies.length;k++){
   const b=bodies[k];if(i===k||!selectedMotionOnly&&b.rig&&k<i||!a.body.shouldCollide(b.body))continue;
   const relativeSpeed=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
   if(relativeSpeed<3&&a.spin<10&&b.spin<10)continue;
   for(const f of a.fixtures)for(const g of b.fixtures){
    if(!f.fixture.shouldCollide(g.fixture))continue;
    if(stats)stats.compatiblePairs++;
    // Relative COM translation plus BOTH angular sweeps bounds shape approach.
    // Preserve the previous0.15m guard; don't win cost by reducing its margin.
    const reach=Math.max(.15,f.rotation+g.rotation)+relativeSpeed*dt;
    if(f.a.upperBound.x+reach<g.a.lowerBound.x||f.a.lowerBound.x-reach>g.a.upperBound.x||f.a.upperBound.y+reach<g.a.lowerBound.y||f.a.lowerBound.y-reach>g.a.upperBound.y)continue;
    if(stats)stats.distanceQueries++;
    input.proxyA.set(f.fixture.getShape(),0);input.proxyB.set(g.fixture.getShape(),0);
    input.transformA=a.body.getTransform();input.transformB=b.body.getTransform();cache.recycle();
    P.Distance(output,cache,input);
    if(output.distance<=reach)return true;
   }
  }
 }
 return false;
}
export function installDistancePolicy(scene,factor=8,options={}){
 const original=scene.step.bind(scene),stats={outerSteps:0,refinedSteps:0,compatiblePairs:0,distanceQueries:0};
 scene.step=(dt=1/600)=>{stats.outerSteps++;const count=factor>1&&mechanismArrival(scene,dt,stats,options)?factor:1;if(count>1)stats.refinedSteps++;for(let i=0;i<count;i++)original(dt/count);};return stats;
}
