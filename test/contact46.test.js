import test from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../node_modules/planck/dist/planck.mjs';
import {installContactBoundary} from '../scripts/contact-boundary46-audit.js';
function run(guardLead){
 const world=new P.World(P.Vec2(0,0)),a=world.createDynamicBody(),b=world.createDynamicBody({angle:.49,angularVelocity:1000});
 for(const [i,body]of[a,b].entries()){body.setUserData({role:'part',id:String(i)});body.createFixture(P.Box(.2,.02),1);}
 const joint=world.createJoint(new P.RevoluteJoint({bodyA:a,bodyB:b,localAnchorA:P.Vec2(),localAnchorB:P.Vec2(),referenceAngle:0,enableLimit:true,lowerAngle:-.5,upperAngle:.5,collideConnected:false}));
 const config=()=>JSON.stringify([a.getMass(),a.getInertia(),b.getMass(),b.getInertia(),joint.getLowerLimit(),joint.getUpperLimit()]),before=config(),momentum=()=>a.getInertia()*a.getAngularVelocity()+b.getInertia()*b.getAngularVelocity(),energy=()=>[a,b].reduce((n,x)=>n+.5*x.getInertia()*x.getAngularVelocity()**2,0),initialMomentum=momentum(),initialEnergy=energy();let peak=0,count=0,time=0;
 const scene={world,parts:[a,b],phase:'flight',integrate(dt){world.step(dt,20,12);peak=Math.max(peak,joint.getJointAngle()-.5,-.5-joint.getJointAngle());count++;time+=dt;},step(dt=1/600){this.integrate(dt);}};
 const stats=installContactBoundary(scene,{extraBudget:1,reserveContact:0,motionGate:true,schedule:{guardLead}});scene.step();
 assert.equal(config(),before);assert.ok(Math.abs(momentum()-initialMomentum)<1e-12);assert.ok(energy()<=initialEnergy+1e-10);assert.ok(Math.abs(time-1/600)<1e-15);assert.equal(stats.maxOuterActual,count);assert.ok(count<=9);assert.ok(stats.extraIntegrations<=1);return{peak,stats};
}
test('sole extra step resolves a physical stop instead of being consumed by lead-in',()=>{
 const control=run(false),guard=run(true);assert.ok(control.peak>.15);assert.ok(guard.peak<.01);assert.ok(guard.stats.angularFallbacks>0,'unavailable second settling step remains an explicit fallback');
});
