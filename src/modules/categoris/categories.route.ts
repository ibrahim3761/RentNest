import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./categories.controller";

const router = Router();

router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.delete("/:categoryId", auth(Role.ADMIN), categoryController.deleteCategory);



export const categoriesRoutes = router; 