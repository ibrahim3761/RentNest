import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUser(payload);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
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
      statusCode: httpStatus.OK,
      success: true,
      message: "Login successful",
      data: { accessToken, refreshToken },
    });
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const {accessToken} = await authService.refreshToken(refreshToken);
    
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours or 1 day
    });

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.OK,
        message : "Token Refreshed Successfully!!",
        data : {
            accessToken
        }
    })
  },
);

const getMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const user = await authService.getMe(userId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User fetched",
      data: user,
    });
  },
);

const updateMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id as string;  
    const payload = req.body;
    const updatedUser = await authService.updateMe(userId, payload);
    sendResponse(res, { 
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }
)

export const authController = {
  register,
  login,
  refreshToken,
  getMe,
  updateMe
};
