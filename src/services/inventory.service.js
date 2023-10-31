"use strict";
const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventorySerive {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "HCM",
  }) {
    const product = await getProductById(productId);
    if (!product) throw new BadRequestError("product doesnt existed");
    const query = {
      inven_shopId: shopId,
      inven_productId: productId,
    };
    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    return await inventory.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventorySerive;
