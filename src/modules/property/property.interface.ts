import { PropertyWhereInput } from "../../../generated/prisma/models";

export interface IPropertyQuery {
  searchTerm?: string;
  city?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
