"use strict";
const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

// Declare the Schema of the Mongo model
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: mongoose.Schema.Types.Boolean,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
