import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/confirm", paymentController.handleWebhook);
router.post("/create", auth(Role.TENANT), paymentController.createCheckoutSession);
router.get("/", auth(Role.TENANT, Role.ADMIN), paymentController.getMyPayments);
router.get("/:paymentId", auth(Role.TENANT, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router; 