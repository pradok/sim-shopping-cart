const chai = require('chai');
const assert = chai.assert;

const ShoppingCart = require('./ShoppingCart').default;

const priceRules = [
  {
    sku: 'ult_small',
    name: 'Unlimited 1 GB',
    price: 24.90,
    discount: {
      minQty: 3
    }
  },
  {
    sku: 'ult_medium',
    name: 'Unlimited 2 GB',
    price: 29.90,
    extras: [{sku: '1gb', qtyAdd: 1, qtyThreshold: 1}]
  },
  {
    sku: 'ult_large',
    name: 'Unlimited 5 GB',
    price: 44.90,
    discount: {
      minQty: 4,
      price: 39.90
    }
  },
  {
    sku: '1gb',
    name: '1 GB Data-pack',
    price: 9.90
  }
];

describe('Test ShoppingCart class', function () {
  var shoppingCart;
  beforeEach(function () {
    shoppingCart = new ShoppingCart(priceRules);
  });
  it('shoppingCart class is defined', function () {
    assert.isDefined(shoppingCart, 'shoppingCart defined');
    assert.isDefined(shoppingCart.constructor, 'shoppingCart constructor defined');
    assert.isDefined(shoppingCart.add, 'shoppingCart.add() defined');
    assert.isDefined(shoppingCart.total, 'shoppingCart.total() defined');
    assert.isDefined(shoppingCart.items, 'shoppingCart.total() defined');
  });
  it('Add to cart', function () {
    assert.deepEqual(shoppingCart.add('ult_large'), {ult_large: 1, bundle: {}}, 'add to cart by 1');
    assert.deepEqual(shoppingCart.add('ult_large'), {ult_large: 2, bundle: {}}, 'increment cart by 1');
  });
  it('Get total 49.80 and Cart Items 2 x Unlimited 1 GB', function () {
    const expectedCartItems = [{sku: 'ult_small', name: 'Unlimited 1 GB', qty: 2}];
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    assert.equal(shoppingCart.total(), 49.80, 'return correct total');
    assert.deepEqual(shoppingCart.items(), expectedCartItems, 'return cart Items');
  });
  it('Get discount total 49.80 and Cart Items 3 x Unlimited 1 GB', function () {
    const expectedCartItems = [{sku: 'ult_small', name: 'Unlimited 1 GB', qty: 3}];
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    assert.equal(shoppingCart.total(), 49.80, 'return correct discount total');
    assert.deepEqual(shoppingCart.items(), expectedCartItems, 'return cart Items');
  });
  it('Get discount total 94.7 and Cart Items 3 x Unlimited 1 GB, 1 x Unlimited 5 GB', function () {
    const expectedCartItems = [
      {sku: 'ult_small', name: 'Unlimited 1 GB', qty: 3},
      {sku: 'ult_large', name: 'Unlimited 5 GB', qty: 1}
    ];
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_large');
    assert.equal(shoppingCart.total(), 94.70, 'return correct discount total');
    assert.deepEqual(shoppingCart.items(), expectedCartItems, 'return cart Items');
  });
  it('Get discount total 209.40 and Cart Items 2 x Unlimited 1 GB, 4 x Unlimited 5 GB', function () {
    const expectedCartItems = [
      {sku: 'ult_small', name: 'Unlimited 1 GB', qty: 2},
      {sku: 'ult_large', name: 'Unlimited 5 GB', qty: 4}
    ];
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    assert.equal(shoppingCart.total(), 209.40, 'return correct discount total');
    assert.deepEqual(shoppingCart.items(), expectedCartItems, 'return cart Items');
  });
  it('Get discount total 84.70 and Cart Items 1 x Unlimited 1 GB, 2 x Unlimited 2 GB, 2 X 1 GB Data-pack', function () {
    const expectedCartItems = [
      {sku: 'ult_small', name: 'Unlimited 1 GB', qty: 1},
      {sku: 'ult_medium', name: 'Unlimited 2 GB', qty: 2},
      {sku: '1gb', name: '1 GB Data-pack', qty: 2}
    ];
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_medium');
    shoppingCart.add('ult_medium');
    assert.equal(shoppingCart.total(), 84.70, 'return correct discount total');
    assert.deepEqual(shoppingCart.items(), expectedCartItems, 'return cart Items');
  });
});
