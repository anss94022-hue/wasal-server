"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = findUserById;
exports.updateUserDisplayName = updateUserDisplayName;
exports.findUserByPhone = findUserByPhone;
exports.findUserByUsername = findUserByUsername;
exports.findUserByWasalCode = findUserByWasalCode;
const db_js_1 = require("../../database/db.js");
function mapUser(row) {
    return {
        id: row.id,
        phone: row.phone,
        username: row.username,
        wasalCode: row.wasal_code,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        passwordHash: row.password_hash,
        isOnline: row.is_online,
        lastSeenAt: row.last_seen_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
async function findUserById(id) {
    const result = await db_js_1.db.query(`
      SELECT
        id, phone, username, wasal_code,
        display_name, avatar_url, password_hash,
        is_online, last_seen_at, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `, [id]);
    return result.rows.length ? mapUser(result.rows[0]) : null;
}
async function updateUserDisplayName(id, displayName) {
    const result = await db_js_1.db.query(`
      UPDATE users
      SET display_name = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING
        id, phone, username, wasal_code,
        display_name, avatar_url, password_hash,
        is_online, last_seen_at, created_at, updated_at
    `, [id, displayName]);
    return result.rows.length ? mapUser(result.rows[0]) : null;
}
async function findUserByPhone(phone) {
    const result = await db_js_1.db.query(`
      SELECT
        id, phone, username, wasal_code,
        display_name, avatar_url, password_hash,
        is_online, last_seen_at, created_at, updated_at
      FROM users
      WHERE phone = $1
      LIMIT 1
    `, [phone]);
    return result.rows.length ? mapUser(result.rows[0]) : null;
}
async function findUserByUsername(username) {
    const result = await db_js_1.db.query(`
      SELECT
        id, phone, username, wasal_code,
        display_name, avatar_url, password_hash,
        is_online, last_seen_at, created_at, updated_at
      FROM users
      WHERE username = $1
      LIMIT 1
    `, [username]);
    return result.rows.length ? mapUser(result.rows[0]) : null;
}
async function findUserByWasalCode(wasalCode) {
    const result = await db_js_1.db.query(`
      SELECT
        id, phone, username, wasal_code,
        display_name, avatar_url, password_hash,
        is_online, last_seen_at, created_at, updated_at
      FROM users
      WHERE wasal_code = $1
      LIMIT 1
    `, [wasalCode]);
    return result.rows.length ? mapUser(result.rows[0]) : null;
}
