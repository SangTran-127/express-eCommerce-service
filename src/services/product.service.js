"use strict";

const {
  product,
  clothing,
  electronic,
  accessory,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProduct,
  findOneProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const {
  removeNullAttributeObject,
  updateNestedObjectParser,
} = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");
class ProductFactory {
  // type: 'Clothing'

  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Types: ${type}`);
    }
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Types: ${type}`);
    }
    return new productClass(payload).updateProduct(productId);
  }

  // NOTE: GET
  static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  // publish that draft product
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }
  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  //TODO: Not working
  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }
  static async findAllProduct({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProduct({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_thumb"],
    });
  }

  static async findOneProduct({ product_id }) {
    return await findOneProduct({ product_id, unSelect: ["__v"] });
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

  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      // add stock
      await insertInventory({
        product_id: newProduct._id,
        shop_id: newProduct.product_shop,
        stock: newProduct.product_quantity,
      });
    }
    return newProduct;
  }
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product });
  }
}

// Define sub-class for different product types

class Clothing extends Product {
  // override
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("Cannot create clothing");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Cannot create Product");
    return newProduct;
  }

  async updateProduct(productId) {
    // 1.remove null/undefined value
    // 2. check where ever to update
    const objectParams = removeNullAttributeObject(this);
    if (objectParams.product_attributes) {
      // update
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

class Electronics extends Product {
  // override
  async createProduct() {
    console.log("electric");
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new BadRequestError("Cannot create Electronics");
    }

    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) throw new BadRequestError("Cannot create Product");
    return newProduct;
  }
  async updateProduct(productId) {
    // 1.remove null/undefined value
    // 2. check where ever to update
    const objectParams = this;
    if (objectParams.product_attributes) {
      // update
      await updateProductById({ productId, objectParams, model: electronic });
    }
    const updateProduct = await super.updateProduct(productId, objectParams);
    return updateProduct;
  }
}

class Accessories extends Product {
  async createProduct() {
    console.log("Accessories");
    const newAccessory = await accessory.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newAccessory) {
      throw new BadRequestError("Cannot create Accessory");
    }
    const newProduct = await super.createProduct(newAccessory._id);
    if (!newProduct) throw new BadRequestError("Cannot create Product");
    return newProduct;
  }
  async updateProduct(productId) {
    // 1.remove null/undefined value
    // 2. check where ever to update
    const objectParams = removeNullAttributeObject(this);
    if (objectParams.product_attributes) {
      // update
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: accessory,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Accessories", Accessories);
ProductFactory.registerProductType("Clothing", Clothing);

module.exports = ProductFactory;
