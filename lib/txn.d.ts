import { DgraphClient } from "./client";
import { Assigned, PredicateMap, Response, TxnOptions } from "./types";
export declare class Txn {
    private readonly dc;
    private readonly ctx;
    private finished;
    private mutated;
    constructor(dc: DgraphClient, options?: TxnOptions);
    mutate<T extends object>(mutation: {
        obj: PredicateMap<T>;
        commitNow: boolean;
    }): Promise<Assigned>;
    query(query: string): Promise<{
        [k: string]: any[];
    }>;
    private queryRaw;
    queryWithVars(q: string, vars?: {
        [k: string]: any;
    }, options?: {
        debug?: boolean;
    }): Promise<Response>;
    private mutateRaw;
    commit(): Promise<void>;
    discard(): Promise<void>;
    private mergeArrays;
    private mergeContext;
}
