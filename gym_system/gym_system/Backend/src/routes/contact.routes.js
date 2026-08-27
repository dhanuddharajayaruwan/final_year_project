import { Router } from "express";
import * as ctrl from "../controllers/contact.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateContactDTO } from "../dto/contact.dto.js";

const router = Router();

// Public — anyone can submit a contact message
router.post("/", validate(CreateContactDTO), ctrl.create);

// Admin only
router.use(protect, authorize("admin"));
router.get("/", ctrl.getAll);
router.patch("/:id/read", ctrl.markRead);
router.delete("/:id", ctrl.remove);

export default router;
