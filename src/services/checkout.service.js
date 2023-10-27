const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  findCartById,
  checkProductInServer,
} = require("../models/repositories/cart.repo");
const { getDiscountAmount } = require("./discount.service");

class CheckoutService {
  /*
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discount,
                    item_products: [
                    {
                        price, 
                        quantity,
                        productId
                    }
                    ]
                },
                {
                    shopId,
                    shop_discount,
                    item_products: [
                    {
                        price, 
                        quantity,
                        productId
                    }
                    ]
                }
            ]
        }    
    */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    const foundedCart = await findCartById(cartId);
    if (!foundedCart) throw new NotFoundError("Cart not found");

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0, // tong thanh toan
    };

    const shop_order_ids_new = [];

    // tinh tien bill

    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts, item_products } = shop_order_ids[i];
      const checkProductServer = await checkProductInServer(item_products);
      console.log(item_products);
      if (!checkProductServer[0]) throw new BadRequestError("Order not found");

      const checkoutPrice = checkProductServer.reduce(
        (acc, product) => acc + product.quantity * product.price,
        0
      );

      //   tong tien
      checkout_order.totalPrice += checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceAppliedDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      if (shop_discounts.length > 0) {
        const { totalPrice, discount } = await getDiscountAmount({
          shopId,
          userId,
          products: checkProductServer,
          codeId: shop_discounts[0].codeId,
        });
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceAppliedDiscount = checkoutPrice - discount;
        }
      }
      checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount;
      shop_order_ids_new.push(itemCheckout);
    }
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;
