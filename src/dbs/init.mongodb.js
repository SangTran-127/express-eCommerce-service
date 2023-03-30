"use strict";

const mongoose = require("mongoose");

const { countConnect } = require("../helpers/check.connect");

const {
  db: { host, name, port },
} = require("../configs/config.mongodb");

const connectionString = `mongodb://${host}:${port}/${name}`;

//Stragey pattern
class Database {
  constructor() {
    this.connect();
  }
  // connect
  connect(type = "mongodb") {
    if (true) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectionString, {
        maxPoolSize: 50,
      })
      .then(() => {
        console.log(`${connectionString}, connected`, countConnect());
      })
      .catch((error) => console.log(error));
  }
  static getDBInstance() {
    if (!Database.intance) {
      Database.intance = new Database();
    }
    return Database.intance;
  }
}

const intanceMongoDB = Database.getDBInstance();

module.exports = intanceMongoDB;
