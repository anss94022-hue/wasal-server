"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCallHistory = listCallHistory;
const db_js_1 = require("../../database/db.js");
async function listCallHistory(userId) {
    // يُستنتج اسم الجدول من مخطط الترحيل، ويُقرأ دون افتراض أسماء أعمدة ثابتة
    // قد تختلف بين نسخ قاعدة البيانات.
    const result = await db_js_1.db.query(`
      SELECT *
      FROM calls
      WHERE caller_id::text = $1
         OR receiver_id::text = $1
      LIMIT 200
    `, [userId]);
    return result.rows;
}
