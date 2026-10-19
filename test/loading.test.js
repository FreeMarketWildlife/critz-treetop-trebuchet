import test from 'node:test';import assert from 'node:assert/strict';
import {config,geometry,initialState,simulate,predict} from '../src/physics.js';
import {seatLoad,settleLoad,loadedSettings} from '../src/loading.js';
const p=config(),tip=geometry(initialState(p),p).tip;
const point=phi=>({x:tip.x+p.sling*Math.cos(phi),y:tip.y+p.sling*Math.sin(phi)});
test('different real placements and tangential motions preserve different initial states',()=>{
 const a=settleLoad(p,seatLoad(p,point(-1.5))),b=settleLoad(p,seatLoad(p,point(-1.9),{x:.5,y:0}));
 assert.notEqual(a.phi,b.phi);assert.notEqual(a.omega,b.omega);
 assert.notDeepEqual(simulate(loadedSettings(p,a)).release,simulate(loadedSettings(p,b)).release);
 assert.deepEqual(simulate(loadedSettings(p,a)),simulate(loadedSettings(p,a)));
 assert.deepEqual(predict(loadedSettings(p,a)).release,simulate(loadedSettings(p,a)).release);
});
test('seating accounts for tangential energy, radial loss and physical settling',()=>{
 const a=seatLoad(p,point(-Math.PI/2),{x:1,y:.5});assert.ok(Math.abs(a.inputEnergy-.5)<1e-10);
 assert.ok(Math.abs(a.discardedRadialEnergy-.125)<1e-10);
 const b=settleLoad(p,a);assert.ok(Math.abs(a.inputEnergy-b.remainingEnergy)<1e-8);
 const drag=config({flightDrag:.05}),c=settleLoad(drag,a);assert.ok(c.remainingEnergy<a.inputEnergy);
});
test('invalid sling geometry, fast pointer and nonfinite values reject without boosts',()=>{
 assert.throws(()=>seatLoad(p,tip));assert.throws(()=>seatLoad(p,point(1)));
 assert.throws(()=>seatLoad(p,point(-1.5),{x:100,y:0}));assert.throws(()=>seatLoad(p,{x:NaN,y:0}));
});

test('pointer-speed safeguard records dissipated cap energy without a hidden boost',()=>{
 const load=seatLoad(p,point(-Math.PI/2),{x:10,y:0});assert.equal(load.speedCapped,true);
 assert.equal(load.omega,2/p.sling);assert.ok(Math.abs(load.discardedCapEnergy-48)<1e-10);
 assert.ok(Math.abs(load.inputEnergy-2)<1e-10);
});
