import { prisma } from "../../config/prisma";

/* ======================================================
   FORMAT PRODUCT FOR SHOP FRONTEND
====================================================== */

const formatProduct = (product: any) => {
  const variants = product.colors.flatMap((color: any) =>
    color.sizes.map((size: any) => ({
      id: size.id,
      color: color.name,
      size: size.size,
      price: size.price,
      stock: size.stock,
      images: (color.images || []).map((img: any) => ({
        image: img.imageUrl,
      })),
    }))
  );

  const prices = variants.map((v: any) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    audience: product.audience,
    productType: product.productType,
    thumbnail: product.thumbnail,
    minPrice,
    variants,
  };
};

/* ======================================================
   GET ALL PUBLIC PRODUCTS (SHOP PAGE)
====================================================== */

export const getAllPublicProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isAvailable: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      colors: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          sizes: {
            where: {
              isActive: true,
              stock: { gt: 0 },
            },
            orderBy: {
              price: "asc",
            },
          },
        },
      },
    },
  });

  return products.map(formatProduct);
};

/* ======================================================
   GET SINGLE PRODUCT (DETAIL PAGE)
====================================================== */

export const getPublicProductById = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      isAvailable: true,
    },
    include: {
      colors: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          sizes: {
            where: {
              isActive: true,
              stock: { gt: 0 },
            },
            orderBy: {
              price: "asc",
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  return formatProduct(product);
};
