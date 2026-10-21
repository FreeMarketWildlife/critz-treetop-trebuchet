import {critterBodyProfile} from './critter-body.js?v=17';
import {World,Vec2,Box,Edge,RevoluteJoint} from '../vendor/planck/planck.mjs';
import {GRAVITY} from './build-physics.js?v=17';
/** Jointed preparation bodies remain free on real basket contacts, including
 * after a successful drop and while winding. `loaded` only observes support;
 * it never welds, centers, replaces or freezes the ragdoll. */
export function createPayloadLoading(sim){
 const L=sim.animal.length,T=Math.sqrt(L),w=sim.animal.width,c=sim.c;
 const stand={x:-Math.max(c.longArm*.92,c.baseWidth*.9),y:Math.max(.1,c.pivotHeight*.16),width:Math.max(L*1.35,c.pouchWidth*1.25),height:Math.max(.08,c.pivotHeight*.1)};
 const home=()=>({x:stand.x,y:stand.y+w*.52});
 const target=()=>sim.loadingPosition(sim.tip());
 const world=new World(Vec2(0,-GRAVITY)),ground=world.createBody(),basket=world.createKinematicBody(),handle=world.createKinematicBody();
 ground.createFixture(Edge(Vec2(-1000,0),Vec2(1000,0)),{friction:.65,restitution:.08});
 ground.createFixture(Box(stand.width/(2*L),stand.height/(2*L),Vec2(stand.x/L,(stand.y-stand.height/2)/L)),{friction:.7,restitution:.05});
 const bw=c.pouchWidth*.64,depth=Math.max(w*1.3,c.pouchWidth*.45),base=-w*.45;
 basket.createFixture(Edge(Vec2(-bw/L,base/L),Vec2(bw/L,base/L)),{friction:.75,restitution:.05});
 for(const side of [-1,1])basket.createFixture(Edge(Vec2(side*bw/L,base/L),Vec2(side*bw/L,(base+depth)/L)),{friction:.5,restitution:.03});
 const profile=critterBodyProfile(sim.animal),frontMass=profile.find(p=>p.id==='head')?.mass??.12,rearMass=profile.find(p=>['tail','haunch','flukes'].includes(p.id))?.mass??.08;
 const specs=[{id:'body',offset:-.045,a:-.30,b:.19,mass:1-frontMass-rearMass},{id:'head',offset:.34,a:.19,b:.5,mass:frontMass},{id:['frog','rabbit','elephant'].includes(sim.animal.id)?'haunch':'tail',offset:-.395,a:-.5,b:-.30,mass:rearMass}];
 const bodies=specs.map((s,i)=>{const b=world.createDynamicBody({position:Vec2(0,0),linearDamping:2*T,angularDamping:3*T,bullet:true,allowSleep:true,userData:s.id});const half=(s.b-s.a)/2,ry=w/L*(i===2?.24:.42);b.createFixture(Box(half,Math.max(.025,ry)),{density:1,friction:.55,restitution:.06,filterGroupIndex:-4});const md={mass:s.mass,center:Vec2(0,0),I:s.mass*((half*2)**2+(ry*2)**2)/12};b.setMassData(md);return b;});
 let dragging=false,loaded=false,mouse=null,grab=null,cursor=null,clock=0,lastActivity=0,forcedUntil=0,dropTime=0,falling=false,accumulator=0,returning=false,hopAt=-Infinity;
 const origin=()=>{const p=bodies[0].getWorldPoint(Vec2(-specs[0].offset,0));return{x:p.x*L,y:p.y*L};};
 const joints=[];
 const poseAt=p=>{for(let i=0;i<bodies.length;i++){bodies[i].setTransform(Vec2(p.x/L+specs[i].offset,p.y/L),0);bodies[i].setLinearVelocity(Vec2(0,0));bodies[i].setAngularVelocity(0);bodies[i].setAwake(true);}};
 poseAt(home());
 for(const [i,x]of[[1,.19],[2,-.30]])joints.push(world.createJoint(RevoluteJoint({enableLimit:true,lowerAngle:i===1?-.5:-1.2,upperAngle:i===1?.5:1.2,collideConnected:false},bodies[0],bodies[i],Vec2(home().x/L+x,home().y/L))));
 const sync=()=>{const p=origin();sim.shot.setTransform(Vec2(p.x/sim.L,p.y/sim.L),bodies[0].getAngle());sim.shot.setLinearVelocity(Vec2(0,0));sim.shot.setAngularVelocity(0);};
 const clearMouse=()=>{for(let f=basket.getFixtureList();f;f=f.getNext())f.setSensor(false);if(mouse)world.destroyJoint(mouse);mouse=null;grab=null;cursor=null;};
 const activity=()=>{lastActivity=clock;forcedUntil=0;};
 const basketPoint=()=>{const p=target();basket.setTransform(Vec2(p.x/L,p.y/L),0);return p;};
 function observeSupport(){
  const p=origin(),q=target();let contact=false,maxSpeed=0;
  for(const b of bodies){const v=b.getLinearVelocity();maxSpeed=Math.max(maxSpeed,Math.hypot(v.x,v.y)*L/T);for(let edge=b.getContactList();edge;edge=edge.next)if(edge.other===basket&&edge.contact.isTouching())contact=true;}
  const supported=!dragging&&contact&&Math.abs(p.x-q.x)<bw*.85&&p.y>q.y-w&&p.y<q.y+Math.max(w,L*.55);
  if(supported&&!loaded){falling=false;activity();}loaded=supported;
 }

 function pick(point,padding=0){
  const p=Vec2(point.x/L,point.y/L);let best=null;
  for(let i=0;i<bodies.length;i++){const b=bodies[i],local=b.getLocalPoint(p),half=(specs[i].b-specs[i].a)/2,ry=w/L*(i===2?.24:.42);const dx=Math.max(0,Math.abs(local.x)-half),dy=Math.max(0,Math.abs(local.y)-ry),distance=Math.hypot(dx,dy)*L;if(distance<=padding&&(!best||distance<best.distance))best={index:i,distance};}
  return best;
 }
 const api={
  get returning(){return returning;},get walkPhase(){return clock*15;},get loaded(){return loaded;},get dragging(){return dragging;},get falling(){return falling;},get position(){return origin();},get angle(){return bodies[0].getAngle();},get motion(){const v=bodies[0].getLinearVelocity();return{vx:v.x*L/T,vy:v.y*L/T,omega:bodies[0].getAngularVelocity()/T};},get stand(){return{...stand};},get basketShape(){const p=target();return{left:p.x-bw,right:p.x+bw,bottom:p.y+base,rim:p.y+base+depth};},target,home,activity,
  get hint(){return false;},get hintPhase(){return((clock-lastActivity-5)%3.2+3.2)%3.2/3.2;},
  requestHint(){},
  get animating(){return dragging||falling||returning||api.hint||bodies.some(b=>b.isAwake());},
  get parts(){return specs.map((s,i)=>{const p=bodies[i].getPosition();return{...s,x:p.x*L,y:p.y*L,angle:bodies[i].getAngle()};});},
  get grip(){if(!grab)return null;const p=bodies[grab.index].getWorldPoint(grab.local);return{x:p.x*L,y:p.y*L,part:specs[grab.index].id,cursor:{...cursor}};},
  begin(point=api.position,padding=0){if(sim.phase!=='ready'||dragging)return false;const hit=pick(point,padding);if(!hit)return false;loaded=false;dragging=true;falling=false;returning=false;activity();for(let f=basket.getFixtureList();f;f=f.getNext())f.setSensor(true);const b=bodies[hit.index],p=Vec2(point.x/L,point.y/L);grab={index:hit.index,local:b.getLocalPoint(p)};cursor={...point};handle.setTransform(p,0);mouse=world.createJoint(RevoluteJoint({localAnchorA:Vec2(0,0),localAnchorB:grab.local,collideConnected:false},handle,b));b.setAwake(true);return true;},
  move(p){if(!dragging||![p.x,p.y].every(Number.isFinite))return;cursor={...p};handle.setTransform(Vec2(p.x/L,p.y/L),0);},
  drop(){if(!dragging)return false;clearMouse();dragging=false;falling=true;dropTime=clock;activity();return false;},
  loadKeyboard(){if(sim.phase!=='ready'||dragging)return false;clearMouse();loaded=false;returning=false;falling=true;dropTime=clock;poseAt({...target(),y:target().y+w*1.6});sync();activity();return true;},
  prepareLaunch(){observeSupport();if(!loaded)return false;sync();sim.startX=origin().x;return true;},
  cancel(){if(!dragging)return;clearMouse();loaded=false;dragging=false;falling=true;dropTime=clock;sync();activity();},
  reset(){clearMouse();dragging=false;loaded=false;falling=false;returning=false;poseAt(home());sync();activity();},
  step(dt){if(sim.phase!=='ready')return false;const oldHint=api.hint;clock+=Math.max(0,dt);
   const desired=target(),bp=basket.getPosition(),basketMoving=Math.hypot(bp.x*L-desired.x,bp.y*L-desired.y)>1e-8;
   const awake=dragging||falling||basketMoving||bodies.some(b=>b.isAwake());accumulator+=awake?Math.min(.06,Math.max(0,dt)):0;let changed=false;
   const steps=Math.floor(accumulator/(1/120));
   if(steps){const duration=steps/120/T;basket.setLinearVelocity(Vec2((desired.x/L-bp.x)/duration,(desired.y/L-bp.y)/duration));}
   while(accumulator>=1/120){world.step(1/120/T,14,10);accumulator-=1/120;changed=true;}
   basket.setLinearVelocity(Vec2(0,0));
   const wasLoaded=loaded;observeSupport();
   if(loaded)returning=false;
   if(!dragging&&!loaded){const p=origin();
    const onGround=bodies.some(b=>{for(let e=b.getContactList();e;e=e.next)if(e.other===ground&&e.contact.isTouching())return true;return false;});
    if(falling&&clock-dropTime>.45&&onGround){falling=false;returning=true;}
    if(returning){
     const dx=home().x-p.x,speed=Math.max(.28,Math.min(2,L*3)),vx=Math.max(-speed,Math.min(speed,dx*5));
     // Active walking is confined to preparation. Ground contacts carry the
     // critter; a small jump clears the pedestal edge without teleporting it.
     const near=Math.abs(dx)<stand.width*.5+L*.8;
     const hop=near&&p.y<stand.y+w*.2&&onGround&&clock-hopAt>.6;
     if(hop)hopAt=clock;
     for(const body of bodies){const v=body.getLinearVelocity();body.setLinearVelocity(Vec2(vx*T/L,hop?Math.sqrt(2*GRAVITY*(stand.y+w+L*.2))*T/L:v.y));}
     const body=bodies[0],angle=Math.atan2(Math.sin(body.getAngle()),Math.cos(body.getAngle()));
     body.setAngularVelocity(Math.max(-5,Math.min(5,-angle*8))*T);
     if(Math.abs(dx)<L*.06&&p.y>stand.y&&onGround){returning=false;falling=false;activity();}
     changed=true;
    }
   }
   if(wasLoaded!==loaded)changed=true;
   sync();return changed||oldHint!==api.hint;
  },
 };basketPoint();sync();return api;
}
