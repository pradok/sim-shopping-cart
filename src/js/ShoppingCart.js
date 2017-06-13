export default class ShoppingCart {
  constructor (pricingRules) {
    this.pricingRules = pricingRules;
    this.cart = {};
  }

  add (sku) {
    this.cart[sku] = this.cart[sku] && this.cart[sku] > 0 ? this.cart[sku] += 1 : 1;
    this.adjustCart(sku);
    return this.cart;
  }

  adjustCart (sku) {
    const product = this.findProductBySKU(sku);
    if (product && product.extras && product.extras.length) {
      const {extras} = product;
      extras.forEach(extra => {
        if(this.cart[sku] % extra.qtyThreshold === 0) {
          this.cart[extra.sku] = this.cart[extra.sku] && this.cart[extra.sku] > 0
            ? this.cart[extra.sku] += extra.qtyAdd : extra.qtyAdd;
        }
      });
    }
  }

  items () {
    const skus = Object.keys(this.cart);
    const products = [];
    skus.forEach(sku => {
      const product = this.findProductBySKU(sku);
      if(product){
        products.push({sku, name: product.name, qty: this.cart[sku]});
      }
    });
    return products;
  }

  total () {
    let total = 0;
    const skus = Object.keys(this.cart);
    skus.forEach(sku => {
      const findProduct = this.findProductBySKU(sku);
      if (findProduct) {
        total += this.productTotal(findProduct, this.cart[sku]);
      }
    });
    return this.round(total, 2);
  }

  productTotal (product, qty) {
    if (product.discount && qty >= product.discount.minQty) {
      const discountCondition = qty % product.discount.minQty;
      if (discountCondition === 0) {
        const reduceQtyBy = qty / product.discount.minQty;
        let price;
        let qtyAdjust;
        if (product.discount.price) {
          price = product.discount.price;
          qtyAdjust = qty;
        } else {
          price = product.price;
          qtyAdjust = qty - reduceQtyBy;
        }
        return this.round(qtyAdjust * price, 2);
      }
    }
    return this.round(qty * product.price, 2);
  }

  round (val, toDecimals) {
    const num = Number(Math.round(val + 'e' + toDecimals) + 'e-' + toDecimals);
    return num;
  }

  findProductBySKU (sku) {
    return this.pricingRules.find(product => product.sku === sku);
  }
}

