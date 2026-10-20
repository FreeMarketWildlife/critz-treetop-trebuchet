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
test('creative rerolls preserve pack/voucher and parcels allow exactly one choice',()=>{
 const shop=createSandboxShop(42),rolled=sandboxTransaction(shop,'reroll');
 assert.notDeepEqual(shop.shop.offers,rolled.shop.offers);assert.deepEqual(shop.shop.pack,rolled.shop.pack);
 assert.deepEqual(shop.shop.voucher,rolled.shop.voucher);
 const opened=sandboxTransaction(rolled,'openPack'),offer=opened.shop.pack[0],chosen=sandboxTransaction(opened,'choosePack',offer);
 assert.ok(chosen.owned.includes(offer.id));assert.equal(chosen.shop.packTaken,true);
 assert.throws(()=>sandboxTransaction(chosen,'choosePack',opened.shop.pack[1]),/Choose/);
});
