"use strict";

const apikeyModel = require("../models/apikey.model");

const findById = async (key) => {
  const objectKey = await apikeyModel.findOne({ key, status: true }).lean();
  // const newApiKey = await apikeyModel.create({
  //   key: "83238fd6e4630ec4ea74a2ab1ed713086f6250aa26e5070922ee693854c81613976fa6c353bd18c9a6cd93e7f16f9dcf9e288b36d7f0f92f7ad213be8684a1c1",
  //   permissions: ["0000"],
  // });
  // newApiKey.save();
  return objectKey;
};

module.exports = {
  findById,
};
