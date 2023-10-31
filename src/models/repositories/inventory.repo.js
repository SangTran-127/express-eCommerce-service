const { inventory } = require("../inventory.model");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "unkown",
}) => {
  return await inventory.create({
    inven_productId: product_id,
    inven_shopId: shop_id,
    inven_stock: stock,
    inven_location: location,
  });
};
// ton kho
const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_productId: productId,
    inven_stock: { $gte: quantity },
  };
  const updateSet = {
    $inc: {
      inven_stock: -quantity,
    },
    $push: {
      inven_reservations: {
        quantity,
        cartId,
        createOn: new Date(),
      },
    },
  };
  const options = {
    upsert: true,
    new: true,
  };

  return await inventory.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
