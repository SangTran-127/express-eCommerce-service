"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // 1. check ton tai email
      // .lean() giup nhanh hon
      const shopHolder = await shopModel.findOne({ email }).lean();
      if (shopHolder) {
        return {
          code: "xxx",
          message: "Email already existed",
        };
      }

      const passwordHashed = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHashed,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        //created priavte key(dung de sign token, ko luu) and public key(dung de verify token, luu)
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });

        console.log(privateKey, publicKey); //save collection keystore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        const publicKeyObject = crypto.createPublicKey(publicKeyString);

        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "public keystring error",
          };
        }
        // neu thanh cong thi tao token va refresh token
        // create access token va refresh token
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyObject,
          privateKey
        );
        console.log(`created token success: `, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
