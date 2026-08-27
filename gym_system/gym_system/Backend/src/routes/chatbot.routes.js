import { Router } from "express";
import ctrl from "../controllers/chatbot.controller.js";

const router = Router();

// POST /api/chatbot/query  — public, no auth required
router.post("/query", ctrl.query);

export default router;
