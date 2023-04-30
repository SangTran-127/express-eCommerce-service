"use strict";
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // tao access token
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify: ${err}`);
      } else {
        console.log(`decode: ${decode}`);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler();

module.exports = {
  createTokenPair,
};
