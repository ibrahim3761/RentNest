import { Router } from "express";
import { authController } from "./auh.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth(), authController.getMe);
router.put("/me", auth(), authController.updateMe);

export const authRoutes = router;