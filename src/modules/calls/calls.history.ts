import { db } from "../../database/db.js";

export interface CallHistoryRow {
  [key: string]: unknown;
}

export async function listCallHistory(
  userId: string
): Promise<CallHistoryRow[]> {
  // يُستنتج اسم الجدول من مخطط الترحيل، ويُقرأ دون افتراض أسماء أعمدة ثابتة
  // قد تختلف بين نسخ قاعدة البيانات.
  const result = await db.query<CallHistoryRow>(
    `
      SELECT *
      FROM calls
      WHERE caller_id::text = $1
         OR receiver_id::text = $1
      LIMIT 200
    `,
    [userId]
  );

  return result.rows;
}
