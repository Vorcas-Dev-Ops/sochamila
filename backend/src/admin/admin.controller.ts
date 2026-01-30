import { Request, Response } from "express";
import { getAdminStatsService } from "./admin.service";

export const getAdminStats = async (
  _req: Request,
  res: Response
) => {
  try {
    const stats = await getAdminStatsService();
    return res.json(stats);
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};
