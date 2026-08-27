import { Router } from "express";
import * as ctrl from "../controllers/payment.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { UpdatePaymentStatusDTO } from "../dto/payment.dto.js";

const router = Router();

// Test helper/Webhook
router.post("/webhook/success/:orderId", ctrl.simulateSuccess); // Would normally have signature validation

// PayHere Webhook
router.post("/payment-notify", ctrl.notifyPayHere);

// PayHere details for frontend
router.get("/payhere-params/:orderId", optionalAuth, ctrl.getPayHereParams);

router.use(protect);
router.get("/order/:orderId", authorize("admin", "client", "trainer"), ctrl.getByOrderId);
router.get("/", authorize("admin"), ctrl.getAll);
router.patch("/:id/status", authorize("admin"), validate(UpdatePaymentStatusDTO), ctrl.updateStatus);

export default router;
