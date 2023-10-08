"use strict";
const { BadRequestError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const { convertToObjectIdMongo } = require("../utils");
/*
    discount service
    1 - generate discount code [shop | admin],
    2 - get discount amoint [User]
    3 - get all discount codes [User | shop]
    4 - verify discount code [User]
    5 - delete discount code [admin | shop]
    6 - cancel discount code [User]
*/

class DiscountService {
  static async createDiscount(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applied_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_used_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount wrong date");
    }
    // create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongo(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount existed");
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_min_order_value: min_order_value || 0,
    });
  }
}
