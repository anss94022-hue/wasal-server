"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthUser = createAuthUser;
const db_js_1 = require("../../database/db.js");
async function createAuthUser(displayName, wasalCode) {
    const result = await db_js_1.db.query(`
      INSERT INTO users (
        display_name,
        wasal_code
      )
      VALUES ($1, $2)
      RETURNING
        id,
        phone,
        username,
        wasal_code AS "wasalCode",
        display_name AS "displayName",
        avatar_url AS "avatarUrl",
        password_hash AS "passwordHash",
        is_online AS "isOnline",
        last_seen_at AS "lastSeenAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `, [
        displayName,
        wasalCode,
    ]);
    return result.rows[0];
}
