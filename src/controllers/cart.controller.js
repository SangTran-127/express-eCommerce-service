const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Add to cart successfully",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart successfully",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete cart successfully",
      metadata: await CartService.deleteItemCart(req.body),
    }).send(res);
  };
  getListCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list cart successfully",
      metadata: await CartService.getListCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
