"use strict";

const {
  product,
  electronic,
  clothing,
  accessory,
} = require("../../models/product.model");

const { Types } = require("mongoose");
const { getSelectData, getUnSelectData } = require("../../utils");

const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundedShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundedShop) return null;

  foundedShop.isDraft = false;
  foundedShop.isPublished = true;
  const { modifiedCount } = await foundedShop.updateOne(foundedShop);
  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundedShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundedShop) return null;

  foundedShop.isDraft = true;
  foundedShop.isPublished = false;
  const { modifiedCount } = await foundedShop.updateOne(foundedShop);
  return modifiedCount;
};

const searchProductByUser = async ({ keySearch }) => {
  const searchPattern = new RegExp(keySearch);
  // console.log(searchPattern);
  const result = await product
    .find(
      {
        $text: { $search: searchPattern },
        isPublished: true,
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({
      score: { $meta: "textScore" },
    })
    .lean();

  return result;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};

const getProductById = async (productId) =>
  await product.findById(productId).lean();

const findAllProduct = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  console.log(getSelectData(select));
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findOneProduct = async ({ product_id, unSelect }) => {
  return product.findById(product_id).select(getUnSelectData(unSelect));
};

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProduct,
  findOneProduct,
  updateProductById,
  getProductById,
};
