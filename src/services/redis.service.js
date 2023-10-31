"use strict";

const redis = require("redis");
const { promisify } = require("util");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  //
  const key = `lock_v2023_${productId}`;
  const retryTime = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTime; i++) {
    // tao 1 key
    const result = setnxAsync(key, expireTime);
    if (result === 1) {
      // thao tac voi inventory
      const isReversation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReversation) {
        await pexpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((res) => setTimeout(res, 50));
    }
  }
};

const releaseLock = async (keylock) => {
  const deleteAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await deleteAsyncKey(keylock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
