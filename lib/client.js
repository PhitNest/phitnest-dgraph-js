"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DgraphClient = void 0;
const errors_1 = require("./errors");
const txn_1 = require("./txn");
const util_1 = require("./util");
class DgraphClient {
    constructor(...clients) {
        this.debugMode = false;
        this.queryTimeout = 600;
        if (clients.length === 0) {
            throw errors_1.ERR_NO_CLIENTS;
        }
        this.clients = clients;
    }
    setQueryTimeout(timeout) {
        this.queryTimeout = timeout;
        return this;
    }
    getQueryTimeout() {
        return this.queryTimeout;
    }
    async alter(op) {
        this.debug(`Alter request:\n${(0, util_1.stringifyMessage)(op)}`);
        const c = this.anyClient();
        return c.alter(op);
    }
    setAlphaAuthToken(authToken) {
        this.clients.forEach((c) => c.setAlphaAuthToken(authToken));
    }
    setSlashApiKey(apiKey) {
        this.setCloudApiKey(apiKey);
    }
    setCloudApiKey(apiKey) {
        this.clients.forEach((c) => c.setCloudApiKey(apiKey));
    }
    async login(userid, password) {
        this.debug(`Login request:\nuserid: ${userid}`);
        const c = this.anyClient();
        return c.login(userid, password);
    }
    async loginIntoNamespace(userid, password, namespace) {
        this.debug(`Login request:\nuserid: ${userid}`);
        const c = this.anyClient();
        return c.loginIntoNamespace(userid, password, namespace);
    }
    logout() {
        this.debug("Logout");
        this.clients.forEach((c) => c.logout());
    }
    newTxn(options) {
        return new txn_1.Txn(this, options);
    }
    setDebugMode(mode = true) {
        this.debugMode = mode;
    }
    fetchUiKeywords() {
        return this.anyClient().fetchUiKeywords();
    }
    async getHealth(all = true) {
        return this.anyClient().getHealth(all);
    }
    async getState() {
        return this.anyClient().getState();
    }
    debug(msg) {
        if (this.debugMode) {
            console.log(msg);
        }
    }
    anyClient() {
        return this.clients[Math.floor(Math.random() * this.clients.length)];
    }
}
exports.DgraphClient = DgraphClient;
