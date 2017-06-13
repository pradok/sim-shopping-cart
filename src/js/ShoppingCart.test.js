const chai = require('chai');
const assert = chai.assert;

const ShoppingCart = require('./ShoppingCart').default;

const priceRules = [
  {
    sku: 'ult_small',
    name: 'Unlimited 1GB',
    price: 24.90,
    discount: {
      minQty: 3
    }
  },
  {
    sku: 'ult_medium',
    name: 'Unlimited 2GB',
    price: 29.90,
    extra: [{sku: '1gb', minQty: 1}]
  },
  {
    sku: 'ult_large',
    name: 'Unlimited 5GB',
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
  });
  it('Add to cart', function () {
    assert.deepEqual(shoppingCart.add('ult_large'), {ult_large: 1}, 'add to cart by 1');
    assert.deepEqual(shoppingCart.add('ult_large'), {ult_large: 2}, 'increment cart by 1');
  });
  it('Get total 49.80 and cart 2 x Unlimited 1GB', function () {
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    assert.equal(shoppingCart.total(), 49.80, 'return correct total');
  });
  it('Get discount total 49.80 and cart 3 x Unlimited 1GB', function () {
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    assert.equal(shoppingCart.total(), 49.80, 'return correct discount total');
  });
  it('Get discount total 94.7 and cart 3 x Unlimited 1GB, 1 x Unlimited 5 GB', function () {
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_large');
    assert.equal(shoppingCart.total(), 94.70, 'return correct discount total');
  });
  it('Get discount total 209.40 and cart 2 x Unlimited 1GB, 4 x Unlimited 5 GB', function () {
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_small');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    shoppingCart.add('ult_large');
    assert.equal(shoppingCart.total(), 209.40, 'return correct discount total');
  });
});
