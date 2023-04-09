import { APIError, APIResultError } from "./errors";

function recursiveReversePredicateMap(obj: any) {
    if (
        typeof obj === "string" ||
        typeof obj === "number" ||
        typeof obj === "boolean" ||
        typeof obj === "symbol"
    ) {
        return obj;
    }
    let isPoint: boolean | null = null;
    let typename: string | null = null;
    return Object.keys(obj).reduce((accumulator: any, key: string) => {
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
        } else if (isPoint) {
            throw new Error("Invalid point");
        } else {
            isPoint = false;
            if (key === "uid") {
                accumulator["uid"] = obj[key];
            } else {
                const parts = key.split(".");
                const firstPart = parts.shift() || null;
                const predicate = parts.join(".");
                if (predicate) {
                    if (typename) {
                        if (typename !== firstPart) {
                            throw new Error("Invalid typename");
                        }
                    } else {
                        typename = firstPart;
                        accumulator["__typename"] = firstPart;
                    }
                }
                if (firstPart) {
                    accumulator[predicate ?? firstPart] = fromPredicateMap(
                        obj[key],
                    );
                }
            }
        }
        return accumulator;
    }, {});
}

export function fromPredicateMap(obj: { [k: string]: any }) {
    return recursiveReversePredicateMap(obj);
}

export function isAbortedError(error: any): boolean {
    // tslint:disable-line no-any
    if (!(error instanceof APIError)) {
        return false;
    }

    if (error.errors.length === 0) {
        return false;
    }
    const firstError: APIResultError = error.errors[0];

    const message = firstError.message.toLowerCase();
    return message.indexOf("abort") >= 0 && message.indexOf("retry") >= 0;
}

export function isConflictError(error: any): boolean {
    // tslint:disable-line no-any
    if (!(error instanceof APIError)) {
        return false;
    }

    if (error.errors.length === 0) {
        return false;
    }
    const firstError: APIResultError = error.errors[0];

    const message = firstError.message.toLowerCase();
    return message.indexOf("conflict") >= 0;
}

export function stringifyMessage(msg: object): string {
    return JSON.stringify(msg);
}
