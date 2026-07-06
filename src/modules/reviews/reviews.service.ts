import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./reviews.interface";
import httpStatus from "http-status";

const createReview = async (payload: ICreateReview, tenantId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: payload.rentalRequestId },
  });

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      "You are not authorized to review this rental.",
      httpStatus.FORBIDDEN,
    );
  }

  if (rentalRequest.status !== "COMPLETED") {
    throw new AppError(
      "You can only review a completed rental.",
      httpStatus.BAD_REQUEST,
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      rentalRequestId: payload.rentalRequestId,
    },
  });

  if (existingReview) {
    throw new AppError(
      "You have already reviewed this rental.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new AppError(
      "Rating must be between 1 and 5.",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await prisma.review.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      tenant: {
        omit: {
          password: true,
        },
      },
      property: true,
    },
  });
  return result;
};

const getPropertyReviews = async (propertyId: string) => {
  await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  const result = await prisma.review.findMany({
    where: { propertyId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      tenant: {
        omit: {
          password: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = result.length;
  const averageRating =
    total > 0 ? result.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    total,
    reviews: result,
  };
};

export const reviewService = {
  createReview,
  getPropertyReviews,
};
