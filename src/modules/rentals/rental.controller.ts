import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import { rentalService } from "./rental.service";
import { AppError } from "../../errors/AppError";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const payload = req.body;
    const result = await rentalService.createRentalRequest(payload, tenantId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully",
      data: result,
    });
  },
);

const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await rentalService.getMyRentalRequests(tenantId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  },
);

const getRentalRequestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const requestId = req.params.requestId as string;
    if (!requestId) {
      throw new AppError("Request ID is required", httpStatus.BAD_REQUEST);
    }
    const result = await rentalService.getRentalRequestById(
      requestId,
      tenantId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request retrieved successfully",
      data: result,
    });
  },
);

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
};
