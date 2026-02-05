import { Request, Response } from "express";
import * as productService from "./product.service";

/* ======================================================
   GET ALL SHOP PRODUCTS
====================================================== */

export const getProducts = async (
  _req: Request,
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
      data: null,
    });
  }
};

/* ======================================================
   GET SINGLE PRODUCT BY ID
====================================================== */

export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id?.trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        data: null,
      });
    }

    const product = await productService.getPublicProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
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
      data: null,
    });
  }
};
