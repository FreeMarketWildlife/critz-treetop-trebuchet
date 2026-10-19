import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_AUDIO,loadAudioPreferences,saveAudioPreferences} from '../src/audio-preferences.js';
test('audio settings round-trip independently of progress and survive storage failures',()=>{
 const map=new Map([['critz-prototype-economy-v1','unchanged']]);let writes=0;const storage={getItem:k=>map.get(k)??null,setItem(k,v){writes++;map.set(k,v);}};
 assert.deepEqual(loadAudioPreferences(storage),DEFAULT_AUDIO);assert.equal(writes,0);
 assert.ok(saveAudioPreferences(storage,{muted:true,volume:.15}));assert.deepEqual(loadAudioPreferences(storage),{muted:true,volume:.15});assert.equal(map.get('critz-prototype-economy-v1'),'unchanged');
 map.set('critz-prototype-audio-v1','{bad');assert.deepEqual(loadAudioPreferences(storage),DEFAULT_AUDIO);
 map.set('critz-prototype-audio-v1',JSON.stringify({muted:true,volume:2}));assert.deepEqual(loadAudioPreferences(storage),DEFAULT_AUDIO);
 const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};assert.deepEqual(loadAudioPreferences(blocked),DEFAULT_AUDIO);assert.equal(saveAudioPreferences(blocked,{muted:false,volume:.5}),false);assert.equal(saveAudioPreferences(null,DEFAULT_AUDIO),false);
 assert.throws(()=>saveAudioPreferences(storage,{muted:1,volume:.5}));
});
