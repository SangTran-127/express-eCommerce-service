"use strict";
const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);
router.get("", asyncHandler(productController.findAllProduct));
router.get("/:product_id", asyncHandler(productController.findProduct));

// authentication
router.use(authentication);

router.post("", asyncHandler(productController.createNewProduct));
router.patch("/:productId", asyncHandler(productController.updateProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);
// QUERY //
router.get("/draft/all", asyncHandler(productController.getAllDraftForShop));
router.get(
  "/publish/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
