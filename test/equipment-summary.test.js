import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,STARTER,part} from '../src/build-catalog.js';
import {BuildSimulation} from '../src/build-physics.js';
import {equipmentSpec,equipmentUse,tuningLimit,preparationSeconds} from '../src/equipment-summary.js';
test('all 48 parts expose distinct functional specifications, including exact small friction',()=>{
 assert.equal(PARTS.length,48);
 const specs=PARTS.map(equipmentSpec);
 assert.ok(specs.every(s=>typeof s==='string'&&s.length>10));
 assert.equal(new Set(specs).size,48);
 for(const p of PARTS.filter(p=>['bearing','release','trough'].includes(p.slot)))assert.ok(equipmentSpec(p).includes(String(p.friction)),p.id);
 assert.match(equipmentUse(part('continental'),STARTER),/Capacity does not add weight/);
 assert.match(equipmentUse(part('leviathan'),STARTER),/dimensions unchanged/);
});
test('tuning controls reflect equipped capacity rather than unavailable global limits',()=>{
 assert.equal(tuningLimit(STARTER,'counterGrams'),100000);
 assert.equal(tuningLimit({...STARTER,ballast:'continental'},'counterGrams'),15000000000);
 assert.equal(tuningLimit(STARTER,'pivotHeight'),3);
 assert.equal(tuningLimit(STARTER,'longArm'),part(STARTER.arm).maxLength-STARTER.shortArm);
 assert.equal(tuningLimit(STARTER,'slingLength'),part(STARTER.sling).maxLength);
});
test('loaded preparation estimate matches actual governed and power-limited winding',()=>{
 for(const c of [STARTER,{...STARTER,ballast:'quarry',counterGrams:150000},{...STARTER,ballast:'quarry',counterGrams:150000,winch:'geared'}]){
  const sim=new BuildSimulation(c);sim.loading={};sim.setDraw(0);let duration=0;
  while(sim.drawFraction<1&&duration<1000){sim.wind(1/1000);duration+=1/1000;}
  assert.ok(Math.abs(preparationSeconds(c)-duration)<.015,JSON.stringify({duration,estimate:preparationSeconds(c)}));
 }
 assert.equal(preparationSeconds(STARTER),3);
 assert.ok(preparationSeconds({...STARTER,ballast:'quarry',counterGrams:150000})>3);
});
