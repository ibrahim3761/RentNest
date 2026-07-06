import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { landlordController } from "./landlord.controller";

const router = Router();

router.post("/properties", auth(Role.LANDLORD), landlordController.createProperty);
router.put("/properties/:propertyId", auth(Role.LANDLORD), landlordController.updateProperty); 
router.delete("/properties/:propertyId", auth(Role.LANDLORD, Role.ADMIN), landlordController.deleteProperty);
router.get("/requests", auth(Role.LANDLORD), landlordController.getLandlordRequests);
router.patch("/requests/:requestId", auth(Role.LANDLORD), landlordController.updateRentalStatus);


export const landlordRoutes = router;