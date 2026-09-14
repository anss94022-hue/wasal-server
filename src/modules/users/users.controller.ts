import { Request, Response } from "express";
import {
  getUserById,
  getUserByPhone,
  getUserByUsername
} from "./users.service.js";

export async function getUserByIdController(
  req: Request,
  res: Response
): Promise<void> {
  const user = await getUserById(req.params.id);

  if (!user) {
    res.status(404).json({
      error: "USER_NOT_FOUND"
    });
    return;
  }

  res.status(200).json({
    user
  });
}

export async function getUserByPhoneController(
  req: Request,
  res: Response
): Promise<void> {
  const phone = String(req.query.phone ?? "");

  if (!phone) {
    res.status(400).json({
      error: "PHONE_REQUIRED"
    });
    return;
  }

  const user = await getUserByPhone(phone);

  if (!user) {
    res.status(404).json({
      error: "USER_NOT_FOUND"
    });
    return;
  }

  res.status(200).json({
    user
  });
}

export async function getUserByUsernameController(
  req: Request,
  res: Response
): Promise<void> {
  const username = String(req.query.username ?? "");

  if (!username) {
    res.status(400).json({
      error: "USERNAME_REQUIRED"
    });
    return;
  }

  const user = await getUserByUsername(username);

  if (!user) {
    res.status(404).json({
      error: "USER_NOT_FOUND"
    });
    return;
  }

  res.status(200).json({
    user
  });
}
