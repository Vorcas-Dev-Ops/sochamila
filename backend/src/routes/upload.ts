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
   GET /api/uploads (Health Check)
===================================================== */

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Upload endpoint is ready",
  });
});

/* =====================================================
   POST /api/uploads
===================================================== */

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      console.log("[UPLOAD] File upload request received");
      console.log("[UPLOAD] File:", req.file ? { name: req.file.originalname, size: req.file.size } : "None");

      if (!req.file) {
        console.log("[UPLOAD] No file provided");
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("[UPLOAD] Starting ImageKit upload...");
      
      /* 🔥 ImageKit REQUIRES base64 string */
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: req.file.originalname,
        folder: "/sochamila/uploads",
        useUniqueFileName: true,
      });

      console.log("[UPLOAD] ImageKit upload successful:", result.url);

      return res.status(200).json({
        success: true,
        url: result.url,
        fileId: result.fileId,
      });
    } catch (err) {
      console.error("[UPLOAD] ImageKit upload error:", err);

      return res.status(500).json({
        success: false,
        message: "Upload failed: " + (err instanceof Error ? err.message : String(err)),
      });
    }
  }
);

export default router;
