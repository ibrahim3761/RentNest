import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import { landlordService } from "./landlord.service";
import { AppError } from "../../errors/AppError";

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const payload = req.body;
    const result = await landlordService.createProperty(payload, landlordId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Property created successfully",
      data: result,
    });
  },
);

const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.propertyId as string;
    const landlordId = req.user?.id as string;
    const payload = req.body;
    const result = await landlordService.updateProperty( propertyId, payload, landlordId
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property updated successfully",
      data: result,
    });
  },
);

const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";
    const propertyId = req.params.propertyId as string;

    if (!propertyId) {
      throw new AppError("Property ID is required", httpStatus.BAD_REQUEST);
    }   
    await landlordService.deleteProperty(
      propertyId,
      landlordId,
      isAdmin,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property deleted successfully",
      data: null,
    });
  },
);

const getLandlordRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const result = await landlordService.getLandlordRequests(landlordId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  },
);

const updateRentalStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const requestId = req.params.requestId as string;
    const payload = req.body;
    const result = await landlordService.updateRentalStatus(
      requestId,
      payload,
      landlordId,
    ); 
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request status updated successfully",
      data: result,
    });
  },
);

export const landlordController = {
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordRequests,
  updateRentalStatus,
};
