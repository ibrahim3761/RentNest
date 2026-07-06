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

export const rentalService = {
  createRentalRequest,
};
