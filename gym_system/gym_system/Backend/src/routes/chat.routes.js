import { Router } from "express";
import * as ctrl from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(protect);

router.post("/rooms", ctrl.createOrGetRoom);
router.get("/rooms", ctrl.getRooms);
router.get("/rooms/:roomId/messages", ctrl.getMessages);
router.post("/rooms/:roomId/messages", ctrl.sendMessage);

export default router;
