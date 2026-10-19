// Isolated planar open-C-link experiment. This is NOT a closed 3D ring-on-pin claim.
// Measurements show weak/incorrect-direction throws and material timestep sensitivity;
// retain as an optional research mode, not a calibrated replacement for baseline release.
import * as P from '../node_modules/planck/dist/planck.mjs';
import {CritterScene} from './articulated.js';
const V=P.Vec2;
export function makeCLink(world,position,angle=0,options={}){
 const radius=options.radius??.075,wire=options.wire??.022,span=options.span??130,mass=options.mass??.04;
 if(![position.x,position.y,angle,radius,wire,span,mass].every(Number.isFinite)||radius<.06||radius>.15||wire<.015||wire>.03||span<90||span>140||mass<.01||mass>.2)throw new Error('Invalid planar C-link geometry');
 if(2*radius*Math.sin((180-span)*Math.PI/180)-2*wire<.06)throw new Error('C-link mouth cannot clear the 0.05 m peg with contact margin');
 if(radius-wire<.036)throw new Error('Insufficient initial peg clearance');
 // Adjacent beads overlap even at supported geometry extremes: no unintended exit gaps.
 const step=Math.min(18*Math.PI/180,2*Math.asin(.8*wire/radius));
 const segments=Math.ceil(2*span*Math.PI/180/step);
 const b=world.createDynamicBody({position,angle,bullet:true});b.setUserData({role:'hooklink',id:'open-C-link'});
 for(let i=0;i<=segments;i++){const a=(-span+i*2*span/segments)*Math.PI/180;b.createFixture(P.Circle(V(radius*Math.cos(a),radius*Math.sin(a)),wire),{density:1,friction:.08,restitution:0,filterCategoryBits:128,filterMaskBits:64});}
 const m={center:V()};b.getMassData(m);b.setMassData({mass,center:m.center,I:m.I*mass/m.mass});return b;
}
export class PhysicalHookScene extends CritterScene {
 constructor(overrides={},species='lizard',saved=null){super(overrides,species,saved);this.releaseMode='physical-hook';this.hookOpen=false;this.freeDuration=0;
  if(saved){for(let b=this.world.getBodyList();b;b=b.getNext())if(b.getUserData()?.role==='hooklink')this.link=b;this.hookOpen=saved.hookOpen??false;this.freeDuration=saved.freeDuration??0;return;}
  for(const rope of this.ropes)this.world.destroyJoint(rope);this.ropes=[];
  const alpha=this.p.hookAngle??3.4; if(!Number.isFinite(alpha))throw new Error('Invalid hook angle');
  const pegLocal=V(this.p.longArm+.14*Math.cos(alpha),.14*Math.sin(alpha)),peg=this.arm.getWorldPoint(pegLocal);
  this.arm.createFixture(P.Circle(pegLocal,.025),{density:.2,friction:.08,restitution:0,filterCategoryBits:64,filterMaskBits:128});
  this.link=makeCLink(this.world,peg,this.arm.getAngle()+alpha,{span:this.p.hookSpan??130});this.link.setUserData({role:'hooklink',id:'open-C-link',pegLocal:{x:pegLocal.x,y:pegLocal.y}});
  const fixed=this.world.createJoint(new P.RopeJoint({bodyA:this.arm,bodyB:this.pouch,localAnchorA:V(this.p.longArm,0),localAnchorB:V(-.65,0),maxLength:Math.hypot(this.p.sling,.65),collideConnected:false}));fixed.setUserData({role:'rope',id:0});
  // Attach the strap to solid material at the arc end, not an imaginary point in the hole.
  const attachmentAngle=this.p.hookAttachmentAngle??-(this.p.hookSpan??130);
  if(!Number.isFinite(attachmentAngle)||Math.abs(attachmentAngle)>(this.p.hookSpan??130))throw new Error('Attachment must lie on the solid C-link arc');
  const attachment=V(.075*Math.cos(attachmentAngle*Math.PI/180),.075*Math.sin(attachmentAngle*Math.PI/180)),linkAnchor=this.link.getWorldPoint(attachment);
  const anchor=this.pouch.getWorldPoint(V(.65,0)),length=Math.hypot(linkAnchor.x-anchor.x,linkAnchor.y-anchor.y);
  const free=this.world.createJoint(new P.RopeJoint({bodyA:this.link,bodyB:this.pouch,localAnchorA:attachment,localAnchorB:V(.65,0),maxLength:length,collideConnected:false}));free.setUserData({role:'rope',id:1});
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
