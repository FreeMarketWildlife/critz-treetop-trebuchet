import * as P from'../node_modules/planck/dist/planck.mjs';
/** Pure shape/contact-motion query; no body, impulse or solver state is assigned. */
export function fixtureContactMotion(fa,fb,contact=null){
 const a=fa.getBody(),b=fb.getBody(),input=new P.DistanceInput(),output=new P.DistanceOutput(),cache=new P.SimplexCache();
 input.proxyA.set(fa.getShape(),contact?.getChildIndexA()??0);input.proxyB.set(fb.getShape(),contact?.getChildIndexB()??0);input.transformA=a.getTransform();input.transformB=b.getTransform();input.useRadii=true;P.Distance(output,cache,input);
 const distance=output.distance;let witnessMode='radii';
 // Pinned1.5.1's radii-overlap branch returns a difference vector as both witnesses.
 // Its scalar distance is valid; recompute CORE witnesses rather than using that point.
 if(distance===0){input.useRadii=false;cache.recycle();P.Distance(output,cache,input);witnessMode='core-recomputed';}
 const dx=output.pointB.x-output.pointA.x,dy=output.pointB.y-output.pointA.y,length=Math.hypot(dx,dy),point={x:(output.pointA.x+output.pointB.x)/2,y:(output.pointA.y+output.pointB.y)/2};
 let normal=length>1e-8?{x:dx/length,y:dy/length}:null;
 if(!normal&&contact?.getManifold().pointCount>0)normal={...contact.getWorldManifold().normal};
 const va=a.getLinearVelocityFromWorldPoint(point),vb=b.getLinearVelocityFromWorldPoint(point),vx=va.x-vb.x,vy=va.y-vb.y;
 return{distance,witnessMode,point,relativeSpeed:Math.hypot(vx,vy),closing:normal?vx*normal.x+vy*normal.y:null,normalAvailable:Boolean(normal)};
}
/** Read-only near-contact audit over existing public broadphase contact edges. */
export function imminentPartContacts(scene,{distance=.01,speed=3,onTrigger=null,shouldInspect=null,onQuery=null}={}){
 if(scene.phase!=='flight')return[];
 const records=[],seen=new Set();for(const part of scene.parts)for(let edge=part.getContactList();edge;edge=edge.next){const contact=edge.contact;if(seen.has(contact))continue;seen.add(contact);const fa=contact.getFixtureA(),fb=contact.getFixtureB();if(fa.isSensor()||fb.isSensor())continue;const a=fa.getBody(),b=fb.getBody();if(!a.shouldCollide(b)||!fa.shouldCollide(fb))continue;
  if(shouldInspect&&!shouldInspect(contact))continue;onQuery?.();const motion=fixtureContactMotion(fa,fb,contact);if(motion.distance>distance)continue;
  const trigger=motion.normalAvailable?motion.closing>speed:motion.relativeSpeed>speed,record={a:a.getUserData(),b:b.getUserData(),...motion,touching:contact.isTouching(),points:contact.getManifold().pointCount,trigger};records.push(record);if(trigger)onTrigger?.(contact,record);
 }return records;
}

/** Conservative point-closing bound: each witness lies on its fixture. Midpoint
 * displacement is along the query normal, so it adds no normal spin velocity.
 * Tiny coincident-witness ambiguity is covered by a 1e-7m radial allowance.
 * Unknown fixture radius conservatively retains the exact query. No cached poses.
 */
export function canExceedContactSpeed(contact,speed=3){
 const fa=contact.getFixtureA(),fb=contact.getFixtureB(),a=fa.getBody(),b=fb.getBody(),va=a.getLinearVelocity(),vb=b.getLinearVelocity();
 let bound=Math.hypot(va.x-vb.x,va.y-vb.y);if(bound>speed)return true;
 for(const [f,body,child]of[[fa,a,contact.getChildIndexA()],[fb,b,contact.getChildIndexB()]]){
  const spin=Math.abs(body.getAngularVelocity());if(!spin)continue;
  const shape=f.getShape();if(typeof shape.getRadius!=='function')return true;
  const proxy=new P.DistanceProxy();proxy.set(shape,child);const center=body.getLocalCenter();let radius=0;
  for(let i=0;i<proxy.getVertexCount();i++){const p=proxy.getVertex(i);radius=Math.max(radius,Math.hypot(p.x-center.x,p.y-center.y));}
  bound+=spin*(radius+shape.getRadius()+1e-7);if(bound>speed)return true;
 }
 return !(bound<=speed); // nonfinite/unknown always retains exact geometry
}
