import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./reviews.controller";

const router = Router()


router.post("/", auth(Role.TENANT), reviewController.createReview);
router.get("/:propertyId", reviewController.getPropertyReviews);

export const reviewsRoutes = router