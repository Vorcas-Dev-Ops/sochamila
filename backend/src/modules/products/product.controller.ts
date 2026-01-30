import { Request, Response } from "express";
import * as productService from "./product.service";

/* ======================================================
   GET ALL SHOP PRODUCTS
====================================================== */

export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await productService.getAllPublicProducts();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("PUBLIC PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* ======================================================
   GET SINGLE PRODUCT
====================================================== */

export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product =
      await productService.getPublicProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("PUBLIC PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};
