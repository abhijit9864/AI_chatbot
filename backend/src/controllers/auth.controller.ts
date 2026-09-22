import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";
import { Request, Response } from "express";
import {
  loginUser,
  registerUser,
} from "../services/auth.service";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const result = await registerUser(req.body);

    res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Registration failed";

    res.status(400).json({
      message,
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const result = await loginUser(req.body);

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    res.status(401).json({
      message,
    });
  }
}

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get current user",
    });
  }
}