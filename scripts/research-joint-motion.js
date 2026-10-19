/** Research-only Node preload. Never imported by the game. */
import {CritterScene} from '../src/articulated.js';
const original=CritterScene.prototype.step;
CritterScene.prototype.step=function(dt=1/600){
 if(this.phase!=='flight')return original.call(this,dt);
 if(!(dt>0&&dt<=1/120))throw Error('Engine timestep outside tested domain');
 const near=this.p.collisionSubsteps&&this.collisionRegion(dt);
 const fast=near&&this.p.fastCollisionStepHz&&this.parts.some(b=>b.getLinearVelocity().length()>40||Math.abs(b.getAngularVelocity())>100);
 const hz=fast?Math.max(this.p.collisionStepHz??1200,this.p.fastCollisionStepHz):this.p.collisionStepHz??1200;
 let count=near?Math.min(fast?8:4,Math.ceil(dt*hz)):1,speed=0;
 for(let j=this.world.getJointList();j;j=j.getNext())if(j.getType()==='revolute-joint'&&[j.getBodyA(),j.getBodyB()].every(b=>b.getUserData()?.role==='part'))speed=Math.max(speed,Math.abs(j.getJointSpeed()));
 count=Math.max(count,Math.min(8,Math.ceil(speed*dt/.05)));
 for(let i=0;i<count;i++)this.integrate(dt/count);
};
