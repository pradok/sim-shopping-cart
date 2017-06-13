export default class ShoppingCart {
  constructor (pricingRules) {
    this.pricingRules = pricingRules;
    this.cart = {bundle: {}};
    this.promoCode = [];
    this.totalCart = 0;
    this.cartItems = [];
  }

  add (sku, promo_code) {
    this.cart[sku] = this.cart[sku] && this.cart[sku] > 0 ? this.cart[sku] += 1 : 1;
    if (promo_code) this.promoCode.push(promo_code);
    this.adjustCart(sku);
    return this.cart;
  }
  adjustCart (sku) {
    const product = this.findProductBySKU(sku);
    if (product && product.extras && product.extras.length) {
      const {extras} = product;
      const {bundle} = this.cart;
      extras.forEach(extra => {
        if(this.cart[sku] % extra.qtyThreshold === 0) {
          bundle[extra.sku] = bundle[extra.sku] && bundle[extra.sku] > 0
            ? bundle[extra.sku] += extra.qtyAdd : extra.qtyAdd;
        }
      });
      this.cart.bundle = bundle;
    }
  }

  _addCartItems(cart) {
    const skus = Object.keys(cart);
    if (skus.length > 0 && cart.constructor === Object) {
      skus.forEach(sku => {
        const product = this.findProductBySKU(sku);
        if (product) {
          this.cartItems.push({sku, name: product.name, qty: cart[sku]});
        }
      });
    }
  }

  items () {
    this._addCartItems(this.cart);
    this._addCartItems(this.cart.bundle);
    return this.cartItems;
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
    this.totalCart = this.round(total, 2);
    this.promoTotal();
    return this.totalCart;
  }

  promoTotal () {
    if (this.promoCode.length > 0) {
      this.promoCode.forEach(code => {
        this.pricingRules.find(rule => {
          if (rule.promoCodes) {
            rule.promoCodes.find(promo => {
              if (promo[code]) {
                const discount = this.totalCart * promo[code];
                const discountTotal = this.totalCart - discount;
                this.totalCart = this.round(discountTotal, 2);;
              }
            });
          };
        });
      });
    }
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

