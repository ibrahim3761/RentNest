import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utility/catchAsync";
import { jwtUtils } from "../utility/jwt";
import config from "../config";
import { AppError } from "../errors/AppError";
import httpStatus from "http-status";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError("You are not logged in.", httpStatus.UNAUTHORIZED);
    }
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError("Forbiddden. You don't have permission to access" , httpStatus.FORBIDDEN);
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    if (!user) {
      throw new AppError("User not found", httpStatus.NOT_FOUND);
    }

    if (user.status === "BANNED") {
      throw new AppError("Your account has been banned. Please contact support!!", httpStatus.FORBIDDEN);
    }

    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  });
};
