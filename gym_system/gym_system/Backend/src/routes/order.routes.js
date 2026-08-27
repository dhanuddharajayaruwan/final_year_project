import { Router } from "express";
import * as ctrl from "../controllers/order.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../dto/order.dto.js";

const router = Router();

// Guest and User can create orders
router.post("/", optionalAuth, validate(CreateOrderDTO), ctrl.create);

// Protected routes (move specific routes above generic ones)
router.get("/me", protect, authorize("client", "trainer"), ctrl.getMy);
router.get("/", protect, authorize("admin"), ctrl.getAll);

// optionalAuth: parses token if present → sets req.user for ownership check, but doesn't block guests
router.get("/:id", optionalAuth, ctrl.getById);

router.patch("/:id/status", protect, authorize("admin"), validate(UpdateOrderStatusDTO), ctrl.updateStatus);

export default router;
