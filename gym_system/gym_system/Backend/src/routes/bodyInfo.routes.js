import { Router } from "express";
import * as ctrl from "../controllers/bodyInfo.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateBodyInfoDTO, UpdateBodyInfoDTO } from "../dto/bodyInfo.dto.js";

const router = Router();
router.use(protect);

router.post("/", authorize("client", "trainer", "admin"), validate(CreateBodyInfoDTO), ctrl.create);
router.get("/", authorize("admin", "trainer"), ctrl.getAll);
router.get("/me", authorize("client", "trainer", "admin"), ctrl.getMe);
router.get("/:id", authorize("admin", "trainer"), ctrl.getById);
router.patch("/me", authorize("client", "trainer", "admin"), validate(UpdateBodyInfoDTO), ctrl.updateMe);
router.patch("/:id", authorize("admin"), validate(UpdateBodyInfoDTO), ctrl.updateById);
router.delete("/:id", authorize("admin"), ctrl.remove);

export default router;
