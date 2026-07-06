import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPropertyQuery } from "./property.interface";

const getAllProperties = async (query: IPropertyQuery) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions: PropertyWhereInput[] = [];

  andConditions.push({ isAvailable: true });

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { location: { contains: query.searchTerm, mode: "insensitive" } },
        { city: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.city) {
    andConditions.push({
      city: {
        contains: query.city,
        mode: "insensitive",
      },
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.bedrooms) {
    andConditions.push({
      bedrooms: Number(query.bedrooms),
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  const where: PropertyWhereInput = { AND: andConditions };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        category: true,
        landlord: { omit: { password: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPropertyById = async (propertyId: string) => {
  const result = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
      reviews: {
        include: {
          tenant: {
            omit: {
              password: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          reviews: true,
          rentalRequests: true,
        },
      },
    },
  });
  return result;
};

export const propertyService = {
  getAllProperties,
  getPropertyById,
};
