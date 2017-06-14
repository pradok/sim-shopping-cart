export default class ShoppingCart {
  constructor (pricingRules) {
    this.pricingRules = pricingRules;
    this.cart = {bundle: {}};
    this.promoCode = [];
    this.totalCart = 0;
    this.cartItems = [];
    this.cartItemTotal = [];
  }

  add (sku, promo_code) {
    this.cart[sku] = this.cart[sku] && this.cart[sku] > 0 ? this.cart[sku] += 1 : 1;
    if (promo_code) this.promoCode.push(promo_code);
    //this._addCartItems(this.cart);
    //this._addCartItems(this.cart.bundle);
    const findProduct = this._findProductBySKU(sku);
    if(findProduct) {
      this._adjustCart(findProduct.product);
      const cartItemIndex = this._addToCart(findProduct.product, 1);
      this._cartTotal(findProduct.product, cartItemIndex);
    }
    return this.cart;
  }

  _addToCart(product, qty) {
    let cartItemIndex;
    const findIndexInCart = this.cartItems.findIndex(item => item.sku === product.sku);
    if (findIndexInCart !== -1) {
      this.cartItems[findIndexInCart].qty += qty;
      cartItemIndex = findIndexInCart;
    } else {
      this.cartItems.push({sku: product.sku, name: product.name, qty});
      cartItemIndex = this.cartItems.length - 1;
    }
    return cartItemIndex;
  }

  get items () {
    return this.cartItems;
  }

  get total () {
    /*
    let total = 0;
    const skus = Object.keys(this.cart);
    skus.forEach(sku => {
      const findProduct = this._findProductBySKU(sku);
      if (findProduct) {
        total += this._productTotal(findProduct, this.cart[sku]);
      }
    });
    this.totalCart = this._round(total, 2);
    this._promoTotal();
    */
    return this.totalCart;
  }


  _cartTotal (product, cartItemIndex) {
    console.log('this.totalCart: ', this.totalCart);
    let total = this._productTotal(product, this.cart[product.sku]);
    this.cartItemTotal[cartItemIndex] = total;
    this.totalCart = this.cartItemTotal.reduce((acc, val) => acc + val);
    this._promoTotal();
    console.log('this.totalCart: ', this.totalCart);
  }

  _adjustCart (product) {
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
        const product = this._findProductBySKU(sku);
        if (product) {
          this.cartItems.push({sku, name: product.name, qty: cart[sku]});
        }
      });
    }
  }

  _promoTotal () {
    if (this.promoCode.length > 0) {
      this.promoCode.forEach(code => {
        this.pricingRules.find(rule => {
          if (rule.promoCodes) {
            rule.promoCodes.find(promo => {
              if (promo[code]) {
                const discount = this.totalCart * promo[code];
                const discountTotal = this.totalCart - discount;
                this.totalCart = this._round(discountTotal, 2);
              }
            });
          };
        });
      });
    }
  }

  _productTotal (product, qty) {
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
        return this._round(qtyAdjust * price, 2);
      }
    }
    return this._round(qty * product.price, 2);
  }

  _round (val, toDecimals) {
    const num = Number(Math.round(val + 'e' + toDecimals) + 'e-' + toDecimals);
    return num;
  }

  _findProductBySKU (sku) {
    let index = this.pricingRules.findIndex(product => product.sku === sku);
    if(index === -1) {
      return false;
    }
    return {product: this.pricingRules[index], index}
  }
}
