import prisma from "../../lib/prisma";

export const getAll = () =>
  prisma.stickerCategory.findMany();

export const create = (name: string) =>
  prisma.stickerCategory.create({
    data: { name },
  });

export const update = (id: string, name: string) =>
  prisma.stickerCategory.update({
    where: { id },
    data: { name },
  });

export const remove = (id: string) =>
  prisma.stickerCategory.delete({
    where: { id },
  });
