import { Router } from "express";
import * as ctrl from "../controllers/category.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dto/category.dto.js";

const router = Router();

router.get("/", optionalAuth, ctrl.getAll);
router.get("/:id", optionalAuth, ctrl.getById);

router.use(protect, authorize("admin"));
router.post("/", validate(CreateCategoryDTO), ctrl.create);
router.patch("/:id", validate(UpdateCategoryDTO), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
