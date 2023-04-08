import { DgraphClient } from "./client";
import { Assigned, Mutation, Response, SchemaType, TxnOptions } from "./types";
export declare class Txn {
    private readonly dc;
    private readonly ctx;
    private finished;
    private mutated;
    constructor(dc: DgraphClient, options?: TxnOptions);
    mutateGraphQL<T, Relationships extends keyof T | undefined = undefined>(mutation: {
        obj: SchemaType<T, Relationships>;
        commitNow: boolean;
    }): Promise<Assigned>;
    queryGraphQL(query: string): Promise<{
        [k: string]: any[];
    }>;
    query(q: string, options?: {
        debug?: boolean;
    }): Promise<Response>;
    queryWithVars(q: string, vars?: {
        [k: string]: any;
    }, options?: {
        debug?: boolean;
    }): Promise<Response>;
    mutate(mu: Mutation): Promise<Assigned>;
    commit(): Promise<void>;
    discard(): Promise<void>;
    private mergeArrays;
    private mergeContext;
}
