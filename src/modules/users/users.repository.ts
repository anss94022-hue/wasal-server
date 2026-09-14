import { db } from "../../database/db.js";

export interface User {
  id: string;
  phone: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRow {
  id: string;
  phone: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  password_hash: string | null;
  is_online: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    phone: row.phone,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    passwordHash: row.password_hash,
    isOnline: row.is_online,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserByPhone(
  phone: string
): Promise<User | null> {
  const result = await db.query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE phone = $1
      LIMIT 1
    `,
    [phone]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserByUsername(
  username: string
): Promise<User | null> {
  const result = await db.query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE username = $1
      LIMIT 1
    `,
    [username]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}
