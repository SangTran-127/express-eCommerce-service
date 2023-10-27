"use strict";

const { BadRequestError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

// 1 add to cart
// 2 remove from cart
// 3 increase product quantity
// 4 get list to cart
// 5 delete cart
// 6 delete cart item

class CartService {
  static async createUserCart({ userId, product }) {
    const { productId } = product;
    const foundProduct = await getProductById(productId);
    const payload = {
      ...product,
      name: foundProduct.product_name,
      price: foundProduct.product_price,
    };
    if (!foundProduct) throw new BadRequestError("Product not found");
    const query = {
      cart_userId: userId,
      cart_state: "active",
    };
    const updateToInsert = {
      $addToSet: { cart_products: payload },
    };
    const options = { upsert: true, new: true };
    return await cartModel
      .findOneAndUpdate(query, updateToInsert, options)
      .lean();
  }

  static async updateCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };
    const update = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };
    const options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, update, options);
  }

  static async addToCart({ userId, product = {} }) {
    const cartExisted = await cartModel.findOne({ cart_userId: userId });
    if (!cartExisted) {
      return await CartService.createUserCart({ userId, product });
    }
    // neu co gio hang nhung chua co san pham
    if (
      cartExisted.cart_count_product ||
      cartExisted.cart_count_product === 0
    ) {
      cartExisted.cart_products = [product];
      return await cartExisted.save();
    }
    return await CartService.updateCartQuantity({ userId, product });
  }
  // update cart
  /*
    shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ]
        }
    ]
  */
  static addToCartV2 = async ({ userId, shop_order_ids }) => {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    const foundProduct = await getProductById(productId);

    if (!foundProduct) throw new BadRequestError("Product not found");

    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new BadRequestError("Product not belong to that shop");
    if (quantity === 0) {
      // delete
    }

    return await CartService.updateCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  };
  static deleteItemCart = async ({ userId, productId }) => {
    const query = {
      cart_userId: userId,
      cart_state: "active",
    };
    const update = {
      $pull: {
        cart_products: { productId },
      },
    };
    return await cartModel.findOneAndUpdate(query, update).lean();
  };

  static async getListCart({ userId }) {
    return await cartModel.findOne({ cart_userId: userId }).lean();
  }
}

module.exports = CartService;
