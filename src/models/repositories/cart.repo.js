"use strict";

const cartModel = require("../cart.model");
const { getProductById } = require("./product.repo");

const findCartById = async (cartId) => {
  return await cartModel.findOne({
    _id: cartId,
    cart_state: "active",
  });
};

const checkProductInServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
      }
    })
  );
};

module.exports = {
  findCartById,
  checkProductInServer,
};
