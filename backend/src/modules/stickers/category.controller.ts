import { Request, Response } from "express";
import * as CategoryService from "./category.service";

export const getAll = async (_req: Request, res: Response) => {
  const categories = await CategoryService.getAll();
  res.json(categories);
};

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await CategoryService.create(name);
  res.status(201).json(category);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await CategoryService.update(id, name);
  res.json(category);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await CategoryService.remove(id);
  res.json({ success: true });
};
