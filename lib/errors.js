"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPError = exports.APIError = exports.CustomError = exports.ERR_BEST_EFFORT_REQUIRED_READ_ONLY = exports.ERR_ABORTED = exports.ERR_FINISHED = exports.ERR_NO_CLIENTS = void 0;
exports.ERR_NO_CLIENTS = new Error("No clients provided in DgraphClient constructor");
exports.ERR_FINISHED = new Error("Transaction has already been committed or discarded");
exports.ERR_ABORTED = new Error("Transaction has been aborted. Please retry");
exports.ERR_BEST_EFFORT_REQUIRED_READ_ONLY = new Error("Best effort only works for read-only queries");
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
        const setPrototypeOf = Object.setPrototypeOf;
        setPrototypeOf !== undefined
            ? setPrototypeOf(this, new.target.prototype)
            : (this.__proto__ = new.target.prototype);
        const captureStackTrace = Error.captureStackTrace;
        if (captureStackTrace !== undefined) {
            captureStackTrace(this, this.constructor);
        }
    }
}
exports.CustomError = CustomError;
class APIError extends CustomError {
    constructor(url, errors) {
        super(errors.length > 0 ? errors[0].message : "API returned errors");
        this.url = url;
        this.errors = errors;
    }
}
exports.APIError = APIError;
class HTTPError extends CustomError {
    constructor(response) {
        super(`Invalid status code = ${response.status}`);
        this.errorResponse = response;
    }
}
exports.HTTPError = HTTPError;
