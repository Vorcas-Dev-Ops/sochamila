import { Request, Response } from "express";
import {
  getAllGraphics,
  createGraphics,
} from "./graphics.service";

export const getGraphics = async (
  req: Request,
  res: Response
) => {
  try {
    const graphics = await getAllGraphics();
    res.json(graphics);
  } catch (error) {
    res.status(500).json({ message: "Failed to load graphics" });
  }
};

export const uploadGraphics = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const graphics = await createGraphics(files);
    res.json(graphics);
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};
