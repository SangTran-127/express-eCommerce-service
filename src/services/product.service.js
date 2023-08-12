"use strict";

const { product, clothing, electronic } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
class ProductFactory {
  // type: 'Clothing'
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronics":
        return new Electronics(payload).createProduct();
      case "Clothing":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid Product Types: ${type}`);
    }
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  async createProduct() {
    return await product.create(this);
  }
}

// Define sub-class for different product types

class Clothing extends Product {
  // override
  async createProduct() {
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing) {
      throw new BadRequestError("Cannot create clothing");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Cannot create Product");
    return newProduct;
  }
}

class Electronics extends Product {
  // override
  async createProduct() {
    const newElectronics = await electronic.create(this.product_attributes);
    if (!newElectronics) {
      throw new BadRequestError("Cannot create Electronics");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Cannot create Product");
    return newProduct;
  }
}

module.exports = ProductFactory;
