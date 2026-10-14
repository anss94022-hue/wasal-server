"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
const pg_1 = require("pg");
const env_js_1 = require("../config/env.js");
exports.db = new pg_1.Pool({
    connectionString: env_js_1.env.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
});
async function checkDatabaseConnection() {
    const client = await exports.db.connect();
    try {
        await client.query("SELECT 1");
    }
    finally {
        client.release();
    }
}
