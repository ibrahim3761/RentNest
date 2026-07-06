import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./reviews.service";
import { AppError } from "../../errors/AppError";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const payload = req.body;
    const result = await reviewService.createReview(payload, tenantId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
  },
);

const getPropertyReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.propertyId as string;
    if (!propertyId) {
      throw new AppError("Property ID is required", httpStatus.BAD_REQUEST);
    }
    const result = await reviewService.getPropertyReviews(propertyId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully",
      data: result,
    });
  },
);

export const reviewController = {
  createReview,
  getPropertyReviews,
};