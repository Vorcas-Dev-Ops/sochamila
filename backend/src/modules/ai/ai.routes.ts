import { Router } from "express";
import { transformImage } from "./ai.controller";

const router = Router();

/* ======================================================
   AI ROUTES
====================================================== */

router.post("/transform", transformImage);

export default router;
