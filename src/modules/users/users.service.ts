import {
  findUserById,
  findUserByPhone,
  findUserByUsername
} from "./users.repository.js";

export async function getUserById(id: string) {
  return findUserById(id);
}

export async function getUserByPhone(phone: string) {
  return findUserByPhone(phone);
}

export async function getUserByUsername(username: string) {
  return findUserByUsername(username);
}
