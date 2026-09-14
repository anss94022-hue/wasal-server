import { db } from "../../database/db.js";

export interface Conversation {
  id: string;
  type: "private" | "group";
  name: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationRow {
  id: string;
  type: "private" | "group";
  name: string | null;
  avatar_url: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    avatarUrl: row.avatar_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findConversationById(
  id: string
): Promise<Conversation | null> {
  const result = await db.query<ConversationRow>(
    `
      SELECT
        id,
        type,
        name,
        avatar_url,
        created_by,
        created_at,
        updated_at
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0]
    ? mapConversation(result.rows[0])
    : null;
}

export async function createPrivateConversation(
  userId: string,
  otherUserId: string
): Promise<Conversation> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<ConversationRow>(
      `
        SELECT
          c.id,
          c.type,
          c.name,
          c.avatar_url,
          c.created_by,
          c.created_at,
          c.updated_at
        FROM conversations c
        JOIN conversation_members cm1
          ON cm1.conversation_id = c.id
        JOIN conversation_members cm2
          ON cm2.conversation_id = c.id
        WHERE c.type = 'private'
          AND cm1.user_id = $1
          AND cm2.user_id = $2
        LIMIT 1
      `,
      [userId, otherUserId]
    );

    if (existing.rows[0]) {
      await client.query("COMMIT");
      return mapConversation(existing.rows[0]);
    }

    const conversationResult = await client.query<ConversationRow>(
      `
        INSERT INTO conversations (
          type,
          created_by
        )
        VALUES ('private', $1)
        RETURNING
          id,
          type,
          name,
          avatar_url,
          created_by,
          created_at,
          updated_at
      `,
      [userId]
    );

    const conversation = conversationResult.rows[0];

    await client.query(
      `
        INSERT INTO conversation_members (
          conversation_id,
          user_id
        )
        VALUES
          ($1, $2),
          ($1, $3)
      `,
      [conversation.id, userId, otherUserId]
    );

    await client.query("COMMIT");

    return mapConversation(conversation);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function isConversationMember(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const result = await db.query(
    `
      SELECT 1
      FROM conversation_members
      WHERE conversation_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return result.rowCount === 1;
}
