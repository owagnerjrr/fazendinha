import test from 'node:test';import assert from 'node:assert/strict';
import {makeFarm,sellAll} from '../src/farm';
import {MARKET_IDS,isMarketItem,marketStock,reserveLot,returnLot,transferLot,validLot} from '../src/market';

for(const crop of MARKET_IDS)test(`market reserves, transfers and sells ${crop} without minting products`,()=>{
  const seller=makeFarm(),buyer=makeFarm();
  // A returned reserve can come from any supported old or new listing.
  const lot={crop,quantity:3,price:47};assert.equal(returnLot(seller,lot).ok,true);
  assert.equal(reserveLot(seller,lot).ok,true);assert.equal(marketStock(seller,crop),0);
  assert.equal(sellAll(seller),0,'reserved products cannot also be sold at the barn');
  assert.equal(transferLot(buyer,seller,lot).ok,true);assert.equal(marketStock(buyer,crop),3);
  assert.equal(buyer.coins,203);assert.equal(seller.coins,297);assert.equal(buyer.coins+seller.coins,500);
  assert.ok(sellAll(buyer)>0);assert.equal(sellAll(buyer),0);
});
test('market refuses malformed IDs, invalid lots and insufficient stock with no mutations',()=>{
  const f=makeFarm(),before=structuredClone(f);
  for(const crop of ['__proto__','constructor','dog',null,{}])assert.equal(isMarketItem(crop),false);
  for(const lot of [null,{}, {crop:'egg',quantity:0,price:12},{crop:'egg',quantity:100,price:12},{crop:'egg',quantity:1.5,price:12},{crop:'milk',quantity:1,price:-1},{crop:'milk',quantity:1,price:10000},{crop:'milk',quantity:1,price:NaN}]){
    assert.equal(validLot(lot),false);assert.equal(reserveLot(f,lot).ok,false);assert.equal(returnLot(f,lot).ok,false);
  }
  assert.equal(reserveLot(f,{crop:'egg',quantity:1,price:12}).ok,false);assert.deepEqual(f,before);
});
test('a cancellation restores only the reserved stock, preserving money and other items',()=>{
  const f=makeFarm();f.products.milk=5;f.inventory.carrot=4;
  const before=structuredClone(f),lot={crop:'milk',quantity:3,price:60};
  assert.equal(reserveLot(f,lot).ok,true);assert.equal(f.products.milk,2);
  assert.equal(returnLot(f,lot).ok,true);assert.deepEqual(f,before);
});
test('insufficient money, malformed trades and self-purchases leave both farms unchanged',()=>{
  const buyer=makeFarm(),seller=makeFarm();buyer.coins=4;
  const before=[structuredClone(buyer),structuredClone(seller)],lot={crop:'goatMilk',quantity:2,price:50};
  assert.equal(transferLot(buyer,seller,lot).ok,false);
  assert.equal(transferLot(buyer,seller,{...lot,crop:'__proto__'}).ok,false);
  assert.equal(transferLot(seller,seller,lot).ok,false);assert.deepEqual([buyer,seller],before);
});
