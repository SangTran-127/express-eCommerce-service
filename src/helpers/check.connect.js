"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;
// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of collection ${numConnection}`);
  return numConnection;
};
// check overload
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.lengthl;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCores * 5;
    console.log(`Active Connection: ${numConnection}`);
    console.log(`Memory Usage: ${memoryUsage / 1024 / 1024}MB`);
    if (numConnection > maxConnections) {
      console.log(`Connection overload detected`);
    }
  }, _SECONDS); // Monitor every 5 seconds
};

//
module.exports = {
  countConnect,
};
