"use strict";

const mongoose = require("mongoose");
const slugify = require("slugify");
const DOCUMENT_NAME = "Product";

const COLLECTION_NAME = "Products";

const productSchema = new mongoose.Schema(
  {
    product_slug: String,
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: { type: String },
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Accessories"],
    },
    product_shop: { type: String },
    product_attributes: { type: mongoose.Schema.Types.Mixed, required: true },
    // more
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// create index search
productSchema.index({ product_name: "text", product_description: "text" });
// document middleware: runs before .save() and .create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

const clothingSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

const electronicSchema = new mongoose.Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

const accessorySchema = new mongoose.Schema(
  {
    accessory: { type: String, required: true },
    model: String,
    color: String,
  },
  {
    collection: "accessories",
    timestamps: true,
  }
);

module.exports = {
  product: mongoose.model(DOCUMENT_NAME, productSchema),
  electronic: mongoose.model("Electronics", electronicSchema),
  clothing: mongoose.model("Clothings", clothingSchema),
  accessory: mongoose.model("Accessories", accessorySchema),
};
