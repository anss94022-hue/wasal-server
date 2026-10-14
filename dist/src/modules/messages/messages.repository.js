"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = createMessage;
exports.findMessageById = findMessageById;
exports.listMessages = listMessages;
const db_js_1 = require("../../database/db.js");
function mapMessage(row) {
    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        type: row.type,
        content: row.content,
        status: row.status,
        replyToId: row.reply_to_id,
        forwardedFromId: row.forwarded_from_id,
        editedAt: row.edited_at,
        deletedAt: row.deleted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
async function createMessage(conversationId, senderId, type, content, replyToId = null) {
    const result = await db_js_1.db.query(`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        type,
        content,
        reply_to_id
      )
      VALUES ($1, $2, $3::message_type, $4, $5)
      RETURNING
        id,
        conversation_id,
        sender_id,
        type,
        content,
        status,
        reply_to_id,
        forwarded_from_id,
        edited_at,
        deleted_at,
        created_at,
        updated_at
    `, [
        conversationId,
        senderId,
        type,
        content,
        replyToId
    ]);
    return mapMessage(result.rows[0]);
}
async function findMessageById(id) {
    const result = await db_js_1.db.query(`
      SELECT
        id,
        conversation_id,
        sender_id,
        type,
        content,
        status,
        reply_to_id,
        forwarded_from_id,
        edited_at,
        deleted_at,
        created_at,
        updated_at
      FROM messages
      WHERE id = $1
      LIMIT 1
    `, [id]);
    return result.rows[0]
        ? mapMessage(result.rows[0])
        : null;
}
async function listMessages(conversationId, limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const result = await db_js_1.db.query(`
      SELECT
        id,
        conversation_id,
        sender_id,
        type,
        content,
        status,
        reply_to_id,
        forwarded_from_id,
        edited_at,
        deleted_at,
        created_at,
        updated_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [conversationId, safeLimit]);
    return result.rows.map(mapMessage);
}
