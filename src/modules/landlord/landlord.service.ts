import { RentalStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateProperty, IUpdateProperty } from "./landlord.interface";
import httpStatus from "http-status";

const createProperty = async (payload: ICreateProperty, landlordId: string) => {
  const result = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },
    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },
  });
  return result;
};

const updateProperty = async (
  propertyId: string,
  payload: IUpdateProperty,
  landlordId: string,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  if (property.landlordId !== landlordId) {
    throw new AppError(
      "You are not the owner of this property.",
      httpStatus.FORBIDDEN,
    );
  }

  const result = await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },
  });
  return result;
};

const deleteProperty = async (
  propertyId: string,
  landlordId: string,
  isAdmin: boolean,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
  });

  if (!isAdmin && property.landlordId !== landlordId) {
    throw new AppError(
      "You are not the owner of this property.",
      httpStatus.FORBIDDEN,
    );
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });
  return null;
};

const getLandlordRequests = async (landlordId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },
    include: {
      tenant: {
        omit: {
          password: true,
        },
      },
      property: {
        include: { category: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const updateRentalStatus = async (
  requestId: string,
  payload: { status: RentalStatus },
  landlordId: string,
) => {
  const request = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId,
    },
    include: {
      property: true,
    },
  });

  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      "You are not the owner of this property.",
      httpStatus.FORBIDDEN,
    );
  }

  if (
    (payload.status === "APPROVED" || payload.status === "REJECTED") &&
    request.status !== "PENDING"
  ) {
    throw new AppError(
      "Only pending requests can be approved or rejected.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (payload.status === "COMPLETED" && request.status !== "ACTIVE") {
    throw new AppError(
      "Only active rentals can be marked as completed.",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: payload.status,
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

export const landlordService = {
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordRequests,
  updateRentalStatus,
};
