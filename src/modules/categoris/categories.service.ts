import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload } from "./categories.interface";

const createCategory = async (payload: ICreateCategoryPayload) => {
    const { name } = payload;
  const result = await prisma.category.create({
    data: {
        name: name,
    }
  });
  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany();
  return result;
}

const deleteCategory = async (categoryId: string) => {
  const result = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
  return result;
}


export const categoryService = {
  createCategory,
  getAllCategories,
  deleteCategory
};