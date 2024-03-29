const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  findCartById,
  checkProductInServer,
} = require("../models/repositories/cart.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require("../models/order.model");
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

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });
    // check xem vuot ton kho hay khong
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { proudctId, quantity } = products[i];
      const keyLock = await acquireLock(proudctId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    // check co 1 san pham het hang trong store
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Một số sản phẩm đã được cập nhật vui lòng quay lại"
      );
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });
    // neu insert thanh cong remove product
    if (newOrder) {
    }
    return newOrder;
  }
  /* Query Order [User] */
  static async getAllOrderByUser() {}
  /* Query Order using Id[User] */
  static async getOneOrderByUser() {}

  /* Cancelled Order [User] */
  static async cancelledOrderByUser() {}
  /* update Order status [Admin | sShop] */
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
