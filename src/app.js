require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");

const app = express();

// init middleware
app.use(morgan("dev")); //logger
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// init db
require("./dbs/init.mongodb");

// init router
app.use("/", require("./routes"));
// handle error

module.exports = app;
