import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";
import { categoryService } from "./categories.service";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await categoryService.createCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories fetched successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const result = await categoryService.deleteCategory(categoryId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategories,
  deleteCategory
};
