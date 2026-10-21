import assert from 'node:assert/strict';
import {BuildSimulation} from '../../src/build-physics.js';
import {STARTER} from '../../src/build-catalog.js';
import {createGroveMap} from '../../src/grove-map.js';
import {landingOpportunity} from '../../src/landing-opportunity.js';
import {createLandingCue} from '../../src/landing-cue-art.js';
import {createFlightWeapons} from '../../src/flight-weapons.js';
const results=[];
for(const miss of [false,true]){
 const map={...createGroveMap(),objects:[{id:'clear-ledge',name:'Audit ledge',type:'polygon',collision:true,layer:'world',material:'wood',bounce:.5,points:[{x:20,y:0},{x:80,y:0},{x:80,y:-.3},{x:20,y:-.3}]}]};
 const s=new BuildSimulation({...STARTER,drag:0},{map});s.fire();s.shot.setPosition({x:30/s.L,y:3.5/s.L});s.shot.setAngle(0);s.shot.setLinearVelocity({x:8*s.T/s.L,y:-s.T/s.L});s.shot.setAngularVelocity(0);s.detach('Boost cue audit');
 const cue=createLandingCue(),options={width:1000,height:700,dt:1/60,project:p=>[250+(p.x-30)*10,200-(p.y-3.5)*10]},before=landingOpportunity(s);assert.ok(before);let mark;
 for(let i=0;i<15;i++)mark=cue.update(s,before,options);assert.ok(mark);
 const velocityBefore=s.real(s.shot),w=createFlightWeapons(),event=w.fire(s,miss?[500,500]:[0,0],[0,0]);assert.equal(event.hit,!miss);
 const after=landingOpportunity(s),updated=cue.update(s,after,options);
 if(miss){assert.deepEqual(after,before);assert.ok(updated);}else{assert.equal(after,null);assert.equal(updated,null);}
 results.push({miss,velocityBefore,velocityAfter:s.real(s.shot),before,after,cueBefore:mark,cueAfter:updated});
}
console.log(JSON.stringify(results,null,2));
