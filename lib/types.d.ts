/// <reference types="node" />
import * as https from "https";
export interface Operation {
    schema?: string;
    dropAttr?: string;
    dropAll?: boolean;
}
export interface Payload {
    data: Record<string, unknown>;
}
export interface Request {
    query: string;
    vars?: {
        [k: string]: string;
    };
    startTs?: number;
    timeout?: number;
    debug?: boolean;
    readOnly?: boolean;
    bestEffort?: boolean;
    hash?: string;
}
export interface Response {
    data: Record<string, unknown>;
    extensions: Extensions;
}
export interface UiKeywords {
    keywords: {
        type: string;
        name: string;
    }[];
}
export interface LoginResponse {
    data: {
        accessJWT: string;
        refreshJWT: string;
    };
}
export interface Mutation {
    setJson?: object;
    deleteJson?: object;
    setNquads?: string;
    deleteNquads?: string;
    startTs?: number;
    commitNow?: boolean;
    mutation?: string;
    isJsonString?: boolean;
    hash?: string;
}
export interface Assigned {
    data: AssignedData;
    extensions: Extensions;
}
export interface AssignedData {
    uids: {
        [k: string]: string;
    };
}
export interface Extensions {
    server_latency: Latency;
    txn: TxnContext;
}
export interface TxnContext {
    start_ts: number;
    aborted?: boolean;
    keys?: string[];
    preds?: string[];
    readOnly: boolean;
    bestEffort: boolean;
    hash?: string;
}
export interface Latency {
    parsing_ns?: number;
    processing_ns?: number;
    encoding_ns?: number;
}
export interface TxnOptions {
    readOnly?: boolean;
    bestEffort?: boolean;
}
export interface ErrorNonJson extends Error {
    responseText?: string;
}
export interface Options extends https.RequestOptions {
    agent?: https.Agent;
}
export interface Config extends Options {
    acceptRawText?: boolean;
    body?: string;
}
export declare type WithTypename<T> = T & {
    __typename: string;
};
export declare type WithRelationships<T, Relationships extends keyof T | undefined = undefined> = Relationships extends keyof T ? Omit<WithTypename<T>, Relationships> & {
    [K in Relationships]: SchemaType<Partial<T[Relationships]>>;
} : WithTypename<T>;
export declare type SchemaType<T, Relationships extends keyof T | undefined = undefined> = WithRelationships<T, Relationships> | (WithRelationships<T, Relationships> & {
    uid: string;
});
