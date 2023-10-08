"use strict";
const _ = require("lodash");

const { Types } = require("mongoose");

const convertToObjectIdMongo = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) =>
  Object.fromEntries(select.map((s) => [s, 1]));

const getUnSelectData = (select = []) =>
  Object.fromEntries(select.map((s) => [s, 0]));

const removeNullAttributeObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] == null) {
      delete obj[k];
    }
  });

  return obj;
};

const updateNestedObjectParser = (obj) => {
  const final = {};

  Object.keys(obj || {}).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const response = updateNestedObjectParser(obj[key]);
      Object.keys(response).forEach((k) => {
        final[`${key}.${k}`] = response[k];
      });
    } else {
      final[key] = obj[key];
    }
  });
  console.log("final");
  return final;
};

module.exports = {
  getInfoData,
  getUnSelectData,
  getSelectData,
  removeNullAttributeObject,
  updateNestedObjectParser,
  convertToObjectIdMongo,
};
