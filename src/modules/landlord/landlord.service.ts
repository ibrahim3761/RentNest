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
    throw new AppError("You are not the owner of this property.", httpStatus.FORBIDDEN);
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
    throw new AppError("You are not the owner of this property.", httpStatus.FORBIDDEN);
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });
  return null;
};

export const landlordService = {
  createProperty,
  updateProperty,
  deleteProperty,
};
