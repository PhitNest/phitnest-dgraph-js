"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyMessage = exports.isConflictError = exports.isAbortedError = exports.fromPredicateMap = void 0;
const errors_1 = require("./errors");
function recursiveReversePredicateMap(obj) {
    if (typeof obj === "string" ||
        typeof obj === "number" ||
        typeof obj === "boolean" ||
        typeof obj === "symbol") {
        return obj;
    }
    let isPoint = null;
    let typename = null;
    return Object.keys(obj).reduce((accumulator, key) => {
        if (key === "coordinates" || key === "type") {
            if (!isPoint) {
                isPoint = true;
                accumulator["__typename"] = "Point";
            }
            if (key === "coordinates") {
                if (obj[key].length !== 2) {
                    throw new Error("Invalid coordinates");
                }
                accumulator["latitude"] = obj[key][1];
                accumulator["longitude"] = obj[key][0];
            }
        }
        else if (isPoint) {
            throw new Error("Invalid point");
        }
        else {
            isPoint = false;
            if (key === "uid") {
                accumulator["uid"] = obj[key];
            }
            else {
                const parts = key.split(".");
                const firstPart = parts.shift() || null;
                const predicate = parts.join(".");
                if (predicate) {
                    if (typename) {
                        if (typename !== firstPart) {
                            throw new Error("Invalid typename");
                        }
                    }
                    else {
                        typename = firstPart;
                        accumulator["__typename"] = firstPart;
                    }
                }
                if (firstPart) {
                    accumulator[predicate ?? firstPart] = fromPredicateMap(obj[key]);
                }
            }
        }
        return accumulator;
    }, {});
}
function fromPredicateMap(obj) {
    return recursiveReversePredicateMap(obj);
}
exports.fromPredicateMap = fromPredicateMap;
function isAbortedError(error) {
    if (!(error instanceof errors_1.APIError)) {
        return false;
    }
    if (error.errors.length === 0) {
        return false;
    }
    const firstError = error.errors[0];
    const message = firstError.message.toLowerCase();
    return message.indexOf("abort") >= 0 && message.indexOf("retry") >= 0;
}
exports.isAbortedError = isAbortedError;
function isConflictError(error) {
    if (!(error instanceof errors_1.APIError)) {
        return false;
    }
    if (error.errors.length === 0) {
        return false;
    }
    const firstError = error.errors[0];
    const message = firstError.message.toLowerCase();
    return message.indexOf("conflict") >= 0;
}
exports.isConflictError = isConflictError;
function stringifyMessage(msg) {
    return JSON.stringify(msg);
}
exports.stringifyMessage = stringifyMessage;
