import test from 'node:test';
import assert from 'node:assert/strict';
import {createSandboxShop,sandboxTransaction} from '../src/shop-sandbox.js';
import {newProgress} from '../src/build-progress.js';
import {fitEquipment} from '../src/build-equipment.js';

test('creative shop purchases fit real equipment without changing Adventure or previous ledger',()=>{
 const adventure=newProgress(),before=structuredClone(adventure),shop=createSandboxShop(42),original=structuredClone(shop);
 const offer=shop.shop.offers.find(o=>o.kind==='part'),next=sandboxTransaction(shop,'purchase',offer);
 assert.ok(next.owned.includes(offer.id));assert.deepEqual(shop,original);assert.deepEqual(adventure,before);
 const build=fitEquipment(adventure.build,offer);assert.ok(Object.values(build).includes(offer.id));
 assert.deepEqual(sandboxTransaction(next,'purchase',offer).owned,next.owned);
});
test('creative rerolls retain three compatible equipment offers and do not create new parcels or vouchers',()=>{
 const shop=createSandboxShop(42),rolled=sandboxTransaction(shop,'reroll');
 assert.notDeepEqual(shop.shop.offers,rolled.shop.offers);assert.equal(rolled.shop.offers.length,3);assert.ok(rolled.shop.offers.every(o=>o.kind==='part'));assert.deepEqual(rolled.shop.pack,[]);assert.equal(rolled.shop.voucher,null);assert.equal(rolled.shop.packOpened,false);assert.throws(()=>sandboxTransaction(rolled,'openPack'),/already been opened/);
});
test('a previously paid creative parcel remains recoverable exactly once',()=>{
 const shop=createSandboxShop(42),legacy={...shop,shop:{...shop.shop,pack:[{kind:'part',id:'pouch'},{kind:'part',id:'timber'}],packCost:48,packOpened:true,packTaken:false}},offer=legacy.shop.pack[0],before=structuredClone(legacy),chosen=sandboxTransaction(legacy,'choosePack',offer);
 assert.ok(chosen.owned.includes(offer.id));assert.equal(chosen.shop.packTaken,true);assert.deepEqual(legacy,before);assert.throws(()=>sandboxTransaction(chosen,'choosePack',legacy.shop.pack[1]),/Choose/);
});
