import { SchemaType } from "./types";
export declare function fromPredicateMap(obj: {
    [k: string]: any;
}): any;
export declare function toPredicateMap<T, Relationships extends keyof T | undefined = undefined>(obj: SchemaType<T, Relationships>): {
    [k: string]: any;
};
export declare function isAbortedError(error: any): boolean;
export declare function isConflictError(error: any): boolean;
export declare function stringifyMessage(msg: object): string;
