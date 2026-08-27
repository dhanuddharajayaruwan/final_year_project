import { Router } from "express";
import * as ctrl from "../controllers/cart.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateCartItemDTO, UpdateCartItemDTO } from "../dto/cartItem.dto.js";

const router = Router();
router.use(protect, authorize("client", "trainer")); // Allow both clients and trainers to have carts

router.get("/", ctrl.getMyCart);
router.post("/items", validate(CreateCartItemDTO), ctrl.addItem);
router.patch("/items/:itemId", validate(UpdateCartItemDTO), ctrl.updateItem);
router.delete("/items/:itemId", ctrl.removeItem);
router.delete("/", ctrl.clearCart);

export default router;
