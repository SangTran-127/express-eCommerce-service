"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Order";

const COLLECTION_NAME = "Orders";

const orderSchema = new mongoose.Schema(
  {
    order_userId: { type: [mongoose.Types.ObjectId], required: true },
    order_checkout: { type: Object, default: {} },
    /*
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            freeShip
        }
    */
    order_shipping: { type: Object, default: {} },
    /*
        order_shipping = {
            street,
            city,
            state
        }
    */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_tracking: { type: String, default: "#00031102023" },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "shipped"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
