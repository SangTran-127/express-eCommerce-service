"use strict";
const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code generations",
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shopId: req.user.userId,
      }),
    });
  };
  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code generations",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    });
  };
  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code generations",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    });
  };
  getAllDiscountCodeWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code generations",
      metadata: await DiscountService.getAllDiscountCodeWithProduct({
        ...req.query,
      }),
    });
  };
}

module.exports = new DiscountController();
