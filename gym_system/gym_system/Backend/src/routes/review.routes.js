import { Router } from "express";
import * as ctrl from "../controllers/review.controller.js";
import {
  protect,
  authorize,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateReviewDTO, UpdateReviewDTO } from "../dto/review.dto.js";

const router = Router();

router.get("/", optionalAuth, ctrl.getAll);
router.get("/gym", optionalAuth, ctrl.getGym);
router.get("/order/:orderId", optionalAuth, ctrl.getByOrder);
router.get("/product/:productId", optionalAuth, ctrl.getByProduct);
router.get("/stats/:productId", optionalAuth, ctrl.getStats);

// All users (including guests) can submit, update or delete reviews
// Ownership logic is handled in service: role === admin || user_id matches
router.post("/", optionalAuth, validate(CreateReviewDTO), ctrl.create);
router.post(
  "/gym",
  protect,
  authorize("client"),
  validate(CreateReviewDTO),
  ctrl.createGym
);
router.patch("/:id", optionalAuth, validate(UpdateReviewDTO), ctrl.update);
router.delete("/:id", optionalAuth, ctrl.remove);

router.use(protect);
router.get("/me", authorize("client"), ctrl.getMy);

export default router;
