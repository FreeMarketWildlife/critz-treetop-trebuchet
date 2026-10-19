// Isolated planar open-C-link experiment. This is NOT a closed 3D ring-on-pin claim.
import * as P from '../node_modules/planck/dist/planck.mjs';
import {CritterScene} from './articulated.js';
const V=P.Vec2;
export function makeCLink(world,position,angle=0){
 const b=world.createDynamicBody({position,angle,bullet:true});b.setUserData({role:'hooklink',id:'open-C-link'});
 for(let i=0;i<=10;i++){const a=(-110+i*22)*Math.PI/180;b.createFixture(P.Circle(V(.075*Math.cos(a),.075*Math.sin(a)),.022),{density:1,friction:.08,restitution:0,filterCategoryBits:128,filterMaskBits:64});}
 const m={center:V()};b.getMassData(m);b.setMassData({mass:.04,center:m.center,I:m.I*.04/m.mass});return b;
}
export class PhysicalHookScene extends CritterScene {
 constructor(overrides={},species='lizard',saved=null){super(overrides,species,saved);this.releaseMode='physical-hook';this.hookOpen=false;this.freeDuration=0;
  if(saved){for(let b=this.world.getBodyList();b;b=b.getNext())if(b.getUserData()?.role==='hooklink')this.link=b;this.hookOpen=saved.hookOpen??false;this.freeDuration=saved.freeDuration??0;return;}
  for(const rope of this.ropes)this.world.destroyJoint(rope);this.ropes=[];
  const alpha=this.p.hookAngle??3.4,pegLocal=V(this.p.longArm+.14*Math.cos(alpha),.14*Math.sin(alpha)),peg=this.arm.getWorldPoint(pegLocal);
  this.arm.createFixture(P.Circle(pegLocal,.025),{density:.2,friction:.08,restitution:0,filterCategoryBits:64,filterMaskBits:128});
  this.link=makeCLink(this.world,peg,this.arm.getAngle()+alpha);this.link.setUserData({role:'hooklink',id:'open-C-link',pegLocal:{x:pegLocal.x,y:pegLocal.y}});
  const fixed=this.world.createJoint(new P.RopeJoint({bodyA:this.arm,bodyB:this.pouch,localAnchorA:V(this.p.longArm,0),localAnchorB:V(-.65,0),maxLength:Math.hypot(this.p.sling,.65),collideConnected:false}));fixed.setUserData({role:'rope',id:0});
  const anchor=this.pouch.getWorldPoint(V(.65,0)),length=Math.hypot(peg.x-anchor.x,peg.y-anchor.y);
  const free=this.world.createJoint(new P.RopeJoint({bodyA:this.link,bodyB:this.pouch,localAnchorA:V(),localAnchorB:V(.65,0),maxLength:length,collideConnected:false}));free.setUserData({role:'rope',id:1});
  this.ropes=[fixed,free];this.rope=fixed;
 }
 snapshot(){return {...super.snapshot(),hookOpen:this.hookOpen,freeDuration:this.freeDuration};}
 clone(){return new PhysicalHookScene(this.p,this.rig.id,this.snapshot());}
 step(dt=1/600){super.step(dt);const peg=this.arm.getWorldPoint(this.link.getUserData().pegLocal),ring=this.link.getPosition();
  this.hookOpen=Math.hypot(peg.x-ring.x,peg.y-ring.y)>.22;
  if(this.phase!=='launching'||!this.hookOpen){this.freeDuration=0;return;}
  // Observe loss of payload support; never destroy a strap or disable contact.
  let touching=false;for(const part of this.parts)for(let edge=part.getContactList();edge;edge=edge.next)if(edge.other===this.pouch && edge.contact.isTouching())touching=true;
  const c=this.center(),cup=this.pouch.getPosition(),away=Math.hypot(c.x-cup.x,c.y-cup.y)>.7;
  this.freeDuration=!touching&&away?this.freeDuration+dt:0;
  if(this.freeDuration>=.01-1e-12){this.phase='flight';this.release={time:this.elapsed,center:c,parts:this.parts.map(b=>({id:b.getUserData().id,p:{...b.getPosition()},v:{...b.getLinearVelocity()},w:b.getAngularVelocity()}))};this.events.push({type:'launch'});}
 }
 predict(){if(this.phase!=='loading'||this.hand||this.control||!this.isLoaded())return null;const clone=this.clone(),points=[];clone.unlatch();for(let i=0;i<3000&&!clone.release;i++)clone.step();if(!clone.release)return {points,reason:'hook did not release'};
 points.push(clone.center());for(let i=0;i<480;i++){clone.step();if(clone.events.some(e=>e.type==='impact'))break;if(i%30===0)points.push(clone.center());}return {points,release:clone.release,reason:'contact hook experiment'};
 }
}
