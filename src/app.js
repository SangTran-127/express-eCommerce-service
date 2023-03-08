const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");

const app = express();

// init middleware
app.use(morgan("dev")); //logger
app.use(helmet());
app.use(compression());
// init db
// init router
app.get("/", (req, res, next) => {
  const strCompress = "hello mina";
  return res.status(500).json({
    message: "Welcome",
    metadata: strCompress.repeat(10000),
  });
});
// handle error

module.exports = app;
