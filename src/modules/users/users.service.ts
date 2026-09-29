import {
  findUserById,
  findUserByPhone,
  findUserByUsername,
  findUserByWasalCode,
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

export async function getUserByWasalCode(wasalCode: string) {
  return findUserByWasalCode(wasalCode);
}
