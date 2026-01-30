import { Request, Response } from "express";
import * as productService from "./admin.product.service";
import { AudienceCategory, ProductType } from "@prisma/client";

/* =====================================================
   CREATE PRODUCT
===================================================== */

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      audience,
      productType,
      isActive,
      colors,
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */

    if (!name || !audience || !productType || !colors) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!Object.values(AudienceCategory).includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audience",
      });
    }

    if (!Object.values(ProductType).includes(productType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type",
      });
    }

    /* ---------- PARSE COLORS ---------- */

    const parsedColors =
      typeof colors === "string" ? JSON.parse(colors) : colors;

    const files = (req.files as Express.Multer.File[]) || [];

    let fileIndex = 0;

    const colorsWithImages = parsedColors.map((color: any) => {
      const imageCount = Number(color.imageCount || 0);

      const images =
        imageCount > 0
          ? Array.from({ length: imageCount })
              .map(() => {
                const file = files[fileIndex++];
                return file ? { imageUrl: file.filename } : null;
              })
              .filter(Boolean)
          : [];

      return {
        ...color,
        images,
      };
    });

    /* ---------- AUTO THUMBNAIL ---------- */

    const thumbnail =
      colorsWithImages?.[0]?.images?.[0]?.imageUrl || null;

    /* ---------- CREATE ---------- */

    const product = await productService.createProduct({
      name: name.trim(),
      description,
      audience,
      productType,
      thumbnail,
      isActive: isActive !== "false",
      colors: colorsWithImages,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* =====================================================
   GET ALL PRODUCTS (ADMIN)
===================================================== */

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* =====================================================
   GET PRODUCT BY ID
===================================================== */

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

/* =====================================================
   UPDATE PRODUCT BASIC INFO
===================================================== */

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/* =====================================================
   UPDATE ACTIVE STATUS
===================================================== */

export const updateProductStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { isActive } = req.body;

    const product = await productService.updateProductStatus(
      req.params.id,
      Boolean(isActive)
    );

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

/* =====================================================
   DELETE PRODUCT
===================================================== */

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(req.params.id);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
