import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroveMap,createV4Revision5GroveMap,readGroveMap,MAP_KEY,mapLevels} from '../src/grove-map.js';
test('four zones cover the authored 75 m oak and keep the launch at its actual 32 m height',()=>{
 const map=createGroveMap(),levels=mapLevels(map);assert.equal(levels.length,4);
 for(let i=1;i<levels.length;i++)assert.equal(levels[i].low,levels[i-1].high);
 assert.deepEqual(levels.map(l=>[l.low,l.high]),[[0,8],[8,30],[30,75],[75,3000]]);
 assert.equal(map.tree.height,75);assert.equal(map.tree.crownRadius*2,72);assert.equal(map.tree.crownDepth,45);assert.equal(map.launch.y,32);
 assert.equal(map.launch.y-levels[2].low,2);assert.equal(map.tree.height-map.launch.y,43);
});
test('untouched previous starter upgrades while custom objects and stored bytes survive',()=>{
 const old=createV4Revision5GroveMap(),raw=JSON.stringify(old),storage={getItem:key=>{assert.equal(key,MAP_KEY);return raw;}};
 assert.deepEqual(readGroveMap(storage),createGroveMap());assert.equal(JSON.stringify(old),raw);
 old.objects[0].name='My home branch';const custom=JSON.stringify(old);
 assert.deepEqual(readGroveMap({getItem:()=>custom}),old);
});
