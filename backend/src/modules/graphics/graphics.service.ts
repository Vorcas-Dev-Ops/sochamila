import prisma from "../../lib/prisma";

/* =========================================================
   GET ALL GRAPHICS
========================================================= */

export const getAllGraphics = async () => {
  return prisma.graphic.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

/* =========================================================
   CREATE GRAPHICS (UPLOAD)
========================================================= */

export const createGraphics = async (
  files: Express.Multer.File[]
) => {
  if (!files || !files.length) return [];

  const graphics = await Promise.all(
    files.map((file) =>
      prisma.graphic.create({
        data: {
          imageUrl: `/uploads/${file.filename}`,
        },
      })
    )
  );

  return graphics;
};
