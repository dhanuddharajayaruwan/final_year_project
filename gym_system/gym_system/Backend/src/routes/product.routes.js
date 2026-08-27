import { Router } from "express";
import * as ctrl from "../controllers/product.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";
import { uploadMultiple } from "../utils/upload.js";

const router = Router();

router.get("/", optionalAuth, ctrl.getAll);
router.get("/:id", optionalAuth, ctrl.getById);

router.use(protect, authorize("admin"));
// Map multiple image uploads to req.files up to 5 images
router.post("/", uploadMultiple("products", "images", 5), validate(CreateProductDTO), ctrl.create);
router.patch("/:id", uploadMultiple("products", "images", 5), validate(UpdateProductDTO), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
