"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const { findOneAndDelete } = require("../models/keytoken.model");
const {
  findAllDiscountCodeUnSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { findAllProduct } = require("../models/repositories/product.repo");
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
      users_used,
      max_uses,
      uses_count,
      max_used_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount wrong date");
    }
    // create index for discount code
    const foundDiscount = await checkDiscountExists(discount, {
      discount_code: code,
      discount_shopId: convertToObjectIdMongo(shopId),
    });

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount existed");
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_code: code,
      discount_end_date: end_date,
      discount_start_date: start_date,
      discount_value: value,
      discount_type: type,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_used_per_user,
      discount_is_active: is_active,
      discount_applied_to: applied_to,
      discount_product_id_list: applied_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    /**/
  }
  // get all products available with discount code
  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await checkDiscountExists(discount, {
      discount_code: code,
      discount_shopId: convertToObjectIdMongo(shopId),
    });

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Cannot found discount");
    }

    const { discount_applied_to, discount_product_id_list } = foundDiscount;
    let products;
    if (discount_applied_to === "all") {
      products = await findAllProduct({
        limit: +limit,
        sort: "ctime",
        page: +page,
        filter: {
          product_shop: convertToObjectIdMongo(shopId),
          isPublished: true,
        },
        select: ["product_name"],
      });
    }

    if (discount_applied_to === "specific") {
      products = await findAllProduct({
        filter: {
          _id: { $in: discount_product_id_list },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }
  // get all discount by shop
  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongo(shopId),
        discount_is_active: true,
      },
      sort: "time",
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });
    return discounts;
  }
  /**/
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists(discount, {
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongo(shopId),
    });

    if (!foundDiscount) throw new NotFoundError("Discount doesnt exist");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_value,
      discount_type,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError("Discount expired");
    }
    if (!discount_max_uses) {
      throw new NotFoundError("Discount are out");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError("Discount wrong date");
    }

    // check co xet gia tri toi thieu hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `Discount required minium order value of ${discount_min_order_value}`
        );
      }

      if (discount_max_uses_per_user > 0) {
        const userDiscount = discount_users_used.find(
          (user) => user.userId === userId
        );
        if (userDiscount) {
          // ...
        }
      }
    }
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);
    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deletedDiscount = await findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongo(shopId),
    });
    return deletedDiscount;
  }
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists(discount, {
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongo(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount doesnt exist");
    }

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
