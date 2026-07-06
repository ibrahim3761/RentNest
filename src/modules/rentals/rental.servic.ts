import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateRentalRequest } from "./rental.interface";
import httpStatus from "http-status";

const createRentalRequest = async (
  payload: ICreateRentalRequest,
  tenantId: string,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: payload.propertyId },
  });

  if (!property.isAvailable) {
    throw new AppError(
      "This property is not available.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (property.landlordId === tenantId) {
    throw new AppError(
      "You cannot rent your own property.",
      httpStatus.BAD_REQUEST,
    );
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId: payload.propertyId,
      tenantId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingRequest) {
    throw new AppError(
      "You already have an active request for this property.",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      property: {
        include: { category: true },
      },
      tenant: { omit: { password: true } },
    },
  });
  return result;
};

const getMyRentalRequests = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
    },
    include: {
      property: {
        include: {
          category: true,
          landlord: {
            omit: {
              password: true,
            },
          },
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const getRentalRequestById = async (requestId: string, tenantId: string) => {
  const result = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId,
    },
    include: {
      property: {
        include: {
          category: true,
          landlord: {
            omit: {
              password: true,
            },
          },
        },
      },
      payment: true,
      review: true,
    },
  });

  if (result.tenantId !== tenantId) {
    throw new AppError(
      "You are not authorized to view this request.",
      httpStatus.FORBIDDEN,
    );
  }

  return result;
};

export const rentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
};
