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

module.exports = {
  insertInventory,
};
