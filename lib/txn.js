"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Txn = void 0;
const errors_1 = require("./errors");
const util_1 = require("./util");
class Txn {
    constructor(dc, options = {}) {
        this.finished = false;
        this.mutated = false;
        this.dc = dc;
        if (options.bestEffort && !options.readOnly) {
            this.dc.debug("Client attempted to query using best-effort without setting the transaction to read-only");
            throw errors_1.ERR_BEST_EFFORT_REQUIRED_READ_ONLY;
        }
        this.ctx = {
            start_ts: 0,
            keys: [],
            preds: [],
            readOnly: options.readOnly,
            bestEffort: options.bestEffort,
            hash: "",
        };
    }
    mutateGraphQL(mutation) {
        return this.mutate({
            setJson: mutation.obj,
            commitNow: mutation.commitNow,
        });
    }
    async queryGraphQL(query) {
        return Object.fromEntries(Object.entries((await this.query(query)).data).map(([key, value]) => [
            key,
            value.map(predicateMap => (0, util_1.fromPredicateMap)(predicateMap)),
        ]));
    }
    query(q, options) {
        return this.queryWithVars(q, undefined, options);
    }
    async queryWithVars(q, vars, options = {}) {
        if (this.finished) {
            this.dc.debug(`Query request (ERR_FINISHED):\nquery = ${q}\nvars = ${vars}`);
            throw errors_1.ERR_FINISHED;
        }
        const req = {
            query: q,
            startTs: this.ctx.start_ts,
            timeout: this.dc.getQueryTimeout(),
            debug: options.debug,
            readOnly: this.ctx.readOnly,
            bestEffort: this.ctx.bestEffort,
            hash: this.ctx.hash,
        };
        if (vars !== undefined) {
            const varsObj = {};
            Object.keys(vars).forEach((key) => {
                const value = vars[key];
                if (typeof value === "string" || value instanceof String) {
                    varsObj[key] = value.toString();
                }
            });
            req.vars = varsObj;
        }
        this.dc.debug(`Query request:\n${(0, util_1.stringifyMessage)(req)}`);
        const c = this.dc.anyClient();
        const res = await c.query(req);
        this.mergeContext(res.extensions.txn);
        this.dc.debug(`Query response:\n${(0, util_1.stringifyMessage)(res)}`);
        return res;
    }
    async mutate(mu) {
        if (this.finished) {
            this.dc.debug(`Mutate request (ERR_FINISHED):\nmutation = ${(0, util_1.stringifyMessage)(mu)}`);
            throw errors_1.ERR_FINISHED;
        }
        this.mutated = true;
        mu.startTs = this.ctx.start_ts;
        mu.hash = this.ctx.hash;
        this.dc.debug(`Mutate request:\n${(0, util_1.stringifyMessage)(mu)}`);
        const c = this.dc.anyClient();
        try {
            const ag = await c.mutate(mu);
            if (mu.commitNow) {
                this.finished = true;
            }
            this.mergeContext(ag.extensions.txn);
            this.dc.debug(`Mutate response:\n${(0, util_1.stringifyMessage)(ag)}`);
            return ag;
        }
        catch (e) {
            try {
                await this.discard();
            }
            catch (e) {
            }
            throw (0, util_1.isAbortedError)(e) || (0, util_1.isConflictError)(e) ? errors_1.ERR_ABORTED : e;
        }
    }
    async commit() {
        if (this.finished) {
            throw errors_1.ERR_FINISHED;
        }
        this.finished = true;
        if (!this.mutated) {
            return;
        }
        const c = this.dc.anyClient();
        try {
            await c.commit(this.ctx);
        }
        catch (e) {
            throw (0, util_1.isAbortedError)(e) ? errors_1.ERR_ABORTED : e;
        }
    }
    async discard() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        if (!this.mutated) {
            return;
        }
        this.ctx.aborted = true;
        const c = this.dc.anyClient();
        await c.abort(this.ctx);
    }
    mergeArrays(a, b) {
        const res = a.slice().concat(b);
        res.sort();
        return res.filter((item, idx, arr) => idx === 0 || arr[idx - 1] !== item);
    }
    mergeContext(src) {
        if (src === undefined) {
            return;
        }
        this.ctx.hash = src.hash ?? "";
        if (this.ctx.start_ts === 0) {
            this.ctx.start_ts = src.start_ts;
        }
        else if (this.ctx.start_ts !== src.start_ts) {
            throw new Error("StartTs mismatch");
        }
        if (src.keys !== undefined) {
            this.ctx.keys = this.mergeArrays(this.ctx.keys, src.keys);
        }
        if (src.preds !== undefined) {
            this.ctx.preds = this.mergeArrays(this.ctx.preds, src.preds);
        }
    }
}
exports.Txn = Txn;
