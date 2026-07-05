import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

interface PrismaError extends Error {
  code?: string;
  meta?: unknown;
}

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const prismaErr = err as PrismaError;

  if (prismaErr?.code === "P2002") {
    res.status(409).json({ success: false, message: "Already exists.", errorDetails: prismaErr.meta ?? null });
    return;
  }
  if (prismaErr?.code === "P2025") {
    res.status(404).json({ success: false, message: "Record not found.", errorDetails: null });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message, errorDetails: null });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong!", errorDetails: null });
};