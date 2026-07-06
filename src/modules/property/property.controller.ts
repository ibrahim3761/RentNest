import httpStatus from "http-status";
import { catchAsync } from "../../utility/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utility/sendResponse";
import { propertyService } from "./property.service";
import { AppError } from "../../errors/AppError";


const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.getAllProperties(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.propertyId;
    if (!propertyId) {
      throw new AppError("Property ID is required", httpStatus.BAD_REQUEST);
    }
    const result = await propertyService.getPropertyById(propertyId as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property retrieved successfully",
      data: result,
    });
  },
);

export const propertyController = {
  getAllProperties,
  getPropertyById,
};