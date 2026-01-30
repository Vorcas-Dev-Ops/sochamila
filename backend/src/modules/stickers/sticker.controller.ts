import { Request, Response } from "express";
import * as StickerService from "./sticker.service";

/* ===============================
   GET ALL STICKERS
================================ */
export const getAll = async (_req: Request, res: Response) => {
  const data = await StickerService.getAll();
  res.json(data);
};

/* ===============================
   UPLOAD STICKERS
================================ */
export const upload = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { categoryId } = req.body;

  if (!categoryId) {
    return res.status(400).json({
      message: "categoryId is required",
    });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({
      message: "No files uploaded",
    });
  }

  const result = await StickerService.upload(files, categoryId);
  res.json(result);
};

/* ===============================
   TOGGLE ENABLE / DISABLE
================================ */
export const toggle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await StickerService.toggle(id);
  res.json(data);
};

/* ===============================
   DELETE STICKER
================================ */
export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await StickerService.remove(id);
  res.json({ success: true });
};
