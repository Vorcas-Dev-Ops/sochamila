import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import prisma from "../../lib/prisma";

const router = Router();

/* ================= PUBLIC ================= */

// GET /api/graphics
router.get("/", async (_req, res) => {
  const graphics = await prisma.graphic.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(graphics);
});

/* ================= ADMIN ================= */

// POST /api/admin/graphics/upload
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  upload.array("files"),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];

    await prisma.graphic.createMany({
      data: files.map((f) => ({
        imageUrl: `/uploads/${f.filename}`,
      })),
    });

    res.json({ success: true });
  }
);

export default router;
