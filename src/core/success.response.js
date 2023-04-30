"use strict";

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
};
const REASON_STATUS_CODE = {
  OK: "Created",
  CREATED: "Success",
};

class SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.OK,
    reasonStatusCode = REASON_STATUS_CODE,
    metadata = {},
  }) {
    this.message = message ? message : reasonStatusCode.OK;
    this.statusCode = statusCode;
    // this.reasonStatusCode = reasonStatusCode;
    this.metadata = metadata;
  }
  send(res, header = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.CREATED,
    reasonStatusCode = REASON_STATUS_CODE.CREATED,
    metadata,
    options = {},
  }) {
    super({ message, metadata, statusCode, reasonStatusCode });
    this.options = options;
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
