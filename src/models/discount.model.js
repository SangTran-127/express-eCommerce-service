"use strict";

const { Schema, Types, model } = require("mongoose");

const DOCUMENT_NAME = "Discount";

const COLLECTION_NAME = "discounts";

const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, //percentage
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true },
    discount_uses_count: { type: Number, required: true },
    discount_users_used: { type: Array, default: [] },
    discount_max_uses_per_user: { type: Number, required: true },
    discount_max_value: { type: Number, required: true },
    discount_min_order_value: { type: Number, required: true }, // so luong don hang toi thieu
    discount_shopId: { type: Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applied_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_id_list: { type: Array, default: [] }, // so san pham duoc ap dung
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = { discount: model(DOCUMENT_NAME, discountSchema) };
