import test from 'node:test';
import assert from 'node:assert/strict';
import {profiles,createRig,createVolunteerQueue} from '../src/species.js';
test('eleven original, geometrically distinct tunable profiles',()=>{
 assert.equal(profiles.length,11);assert.equal(new Set(profiles.map(p=>p.id)).size,11);
 assert.equal(new Set(profiles.map(p=>JSON.stringify(p.bodies))).size,11);
 for(const p of profiles){assert.ok(p.totalMass>0);assert.ok(p.bodies.length>=4&&p.bodies.length<=8);assert.ok(Math.abs(p.bodies.reduce((n,b)=>n+b.massFraction,0)-1)<1e-12);for(const b of p.bodies){assert.ok(b.massFraction>0);assert.ok(['circle','capsule','box'].includes(b.shape.type));for(const [k,v]of Object.entries(b.shape))if(k!=='type')assert.ok(v>0);}}
});
test('joints form connected trees with consistent local anchors and angle limits',()=>{
 for(const p of profiles){const r=createRig(p.id),ids=new Set(r.bodies.map(b=>b.id)),seen=new Set([r.bodies[0].id]);assert.equal(r.joints.length,r.bodies.length-1);
 for(const j of r.joints){assert.ok(ids.has(j.a)&&ids.has(j.b)&&j.a!==j.b);assert.ok(j.minAngle<0&&j.maxAngle>0&&j.maxAngle<=Math.PI);const a=r.bodies.find(b=>b.id===j.a),b=r.bodies.find(b=>b.id===j.b);assert.ok(Math.abs(a.x+j.anchorA.x-b.x-j.anchorB.x)<1e-12);assert.ok(Math.abs(a.y+j.anchorA.y-b.y-j.anchorB.y)<1e-12);}
 for(let i=0;i<r.bodies.length;i++)for(const j of r.joints)if(seen.has(j.a)||seen.has(j.b)){seen.add(j.a);seen.add(j.b);}assert.equal(seen.size,ids.size);
 assert.ok(Math.abs(r.bodies.reduce((n,b)=>n+b.mass,0)-p.totalMass)<1e-12);}
});
test('relative species properties retain requested differences',()=>{
 const p=id=>profiles.find(p=>p.id===id);assert.ok(p('lizard').friction>p('mouse').friction);assert.ok(p('salamander').friction<p('lizard').friction);assert.ok(p('armadillo').totalMass>Math.max(...profiles.filter(p=>p.id!=='armadillo').map(p=>p.totalMass)));assert.ok(p('turtle').bodies[0].massFraction>.7);assert.ok(p('flying-squirrel').queueWeight<.02*p('mouse').queueWeight);assert.equal(p('small-marsupial').provisional,false);assert.equal(p('tiny-primate').provisional,false);
});
test('rig copies cannot mutate templates; unknown ids fail',()=>{const r=createRig('frog');r.bodies[0].shape.radius=999;assert.notDeepEqual(r,createRig('frog'));assert.throws(()=>createRig('dragon'),RangeError);});
test('queue is reproducible, exposes current and only next three, consumes one at a time',()=>{
 const a=createVolunteerQueue(123),b=createVolunteerQueue(123);assert.equal(a.peek().length,3);assert.equal(a.state,undefined);assert.throws(()=>a.peek(4),RangeError);const copy=a.peek();copy[0]='unknown';assert.notDeepEqual(a.peek(),copy);
 for(let i=0;i<100;i++){assert.equal(a.current,b.current);assert.deepEqual(a.peek(),b.peek());const next=a.peek()[0],old=a.current;assert.equal(a.consume(),old);b.consume();assert.equal(a.current,next);}assert.notDeepEqual(createVolunteerQueue(3).peek(),createVolunteerQueue(4).peek());
});
