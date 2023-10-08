const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
class ProductController {
  createNewProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new Product success!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  /**
   * @description get all draft for shop
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @return {JSON}
   */
  getAllDraftForShop = async (req, res, next) => {
    // console.log(req.user);
    new SuccessResponse({
      message: "Get list draft product success!",
      metadata: await ProductService.findAllDraftForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    // console.log(req.user);
    new SuccessResponse({
      message: "Get list published product success!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish successfully!",
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublish successfully!",
      metadata: await ProductService.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product successfully!",
      metadata: await ProductService.searchProduct(req.params),
    }).send(res);
  };

  findAllProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product successfully!",
      metadata: await ProductService.findAllProduct(req.query),
    }).send(res);
  };
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product successfully!",
      metadata: await ProductService.findOneProduct(req.params),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
