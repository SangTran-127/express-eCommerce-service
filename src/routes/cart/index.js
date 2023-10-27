"use strict";
const express = require("express");
const cartController = require("../../controllers/cart.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// authentication
// router.use(authentication);
router.post("", asyncHandler(cartController.addToCart));
router.get("", asyncHandler(cartController.getListCart));
router.post("/update", asyncHandler(cartController.update));
router.delete("", asyncHandler(cartController.delete));

module.exports = router;
