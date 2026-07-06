import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin) {
      throw new AppError("Unauthorized access", httpStatus.UNAUTHORIZED);
    }
    const result = await adminService.getAllUsers();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin) {
      throw new AppError("Unauthorized access", httpStatus.UNAUTHORIZED);
    }
    const userId = req.params.userId as string;
    if (!userId) {
      throw new AppError("User ID is required", httpStatus.BAD_REQUEST);
    }
    const payload = req.body;
    const result = await adminService.updateUserStatus(
      userId,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  },
);

const getAllPropertiesForAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin) {
      throw new AppError("Unauthorized access", httpStatus.UNAUTHORIZED);
    }
    const result = await adminService.getAllPropertiesForAdmin();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties retrieved successfully",
      data: result,
    });
  },
);

const getAllRentalsForAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin) {
      throw new AppError("Unauthorized access", httpStatus.UNAUTHORIZED);
    }
    const result = await adminService.getAllRentalsForAdmin();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rentals retrieved successfully",
      data: result,
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllPropertiesForAdmin,
  getAllRentalsForAdmin,
};