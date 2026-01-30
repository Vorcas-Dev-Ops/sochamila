import { Router, Request, Response } from "express";
import multer from "multer";
import { imagekit } from "../lib/imagekit";

const router = Router();

/* =====================================================
   MULTER CONFIG (MEMORY)
===================================================== */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/* =====================================================
   POST /api/uploads
===================================================== */

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      /* 🔥 ImageKit REQUIRES base64 string */
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: req.file.originalname,
        folder: "/sochamila/uploads",
        useUniqueFileName: true,
      });

      return res.status(200).json({
        success: true,
        url: result.url,
        fileId: result.fileId,
      });
    } catch (err) {
      console.error("ImageKit upload error:", err);

      return res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
);

export default router;
