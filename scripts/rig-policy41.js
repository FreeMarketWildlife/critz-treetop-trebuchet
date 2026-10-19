/** Research only: resolve a moving mechanism's own real external arrivals. */
export function mechanismRegion(scene,dt,complete=false){
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
    if(a.upperBound.x+pad>=o.a.lowerBound.x&&a.lowerBound.x-pad<=o.a.upperBound.x&&a.upperBound.y+pad>=o.a.lowerBound.y&&a.lowerBound.y-pad<=o.a.upperBound.y)return true;
   }
  }
 }return false;
}
export function installRigPolicy(scene,factor,complete=false){
 const original=scene.step.bind(scene),stats={outerSteps:0,refinedSteps:0};
 scene.step=(dt=1/600)=>{stats.outerSteps++;const count=factor>1&&mechanismRegion(scene,dt,complete)?factor:1;if(count>1)stats.refinedSteps++;for(let i=0;i<count;i++)original(dt/count);};return stats;
}
