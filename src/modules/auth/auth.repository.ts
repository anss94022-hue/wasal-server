import { db } from "../../database/db.js";
import type { User } from "../users/users.repository.js";

export async function createAuthUser(
  phone: string,
  username: string | null,
  displayName: string,
  passwordHash: string
): Promise<User> {
  const result = await db.query<User>(
    `
      INSERT INTO users (
        phone,
        username,
        display_name,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        phone,
        username,
        display_name AS "displayName",
        avatar_url AS "avatarUrl",
        password_hash AS "passwordHash",
        is_online AS "isOnline",
        last_seen_at AS "lastSeenAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [phone, username, displayName, passwordHash]
  );

  return result.rows[0];
}
