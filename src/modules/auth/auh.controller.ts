import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUser(payload);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Registration successful",
      data: user,
    });
  },
);

const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { accessToken, refreshToken } = await authService.loginUser(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { accessToken, refreshToken },
    });
  },
);

const getMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const user = await authService.getMe(userId as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User fetched",
      data: user,
    });
  },
);

export const authController = {
  register,
  login,
  getMe,
};
