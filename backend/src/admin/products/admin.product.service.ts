import prisma from "../../lib/prisma";

/* =====================================================
   CREATE PRODUCT
===================================================== */

export const createProduct = async (data: any) => {
  if (!data.colors || data.colors.length === 0) {
    throw new Error("Product must have at least one color");
  }

  /* ---------- MIN PRICE ---------- */
  const prices: number[] = [];

  for (const color of data.colors) {
    if (!color.sizes || color.sizes.length === 0) {
      throw new Error(`Color ${color.name} has no sizes`);
    }

    for (const size of color.sizes) {
      prices.push(Number(size.price));
    }
  }

  const minPrice = Math.min(...prices);

  /* ---------- AVAILABILITY ---------- */
  const isAvailable = data.colors.some((color: any) =>
    color.sizes.some((s: any) => Number(s.stock) > 0)
  );

  /* ---------- CREATE ---------- */
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      audience: data.audience,
      productType: data.productType,

      thumbnail: data.thumbnail,
      minPrice,

      isActive: data.isActive ?? true,
      isAvailable,

      colors: {
        create: data.colors.map((color: any) => ({
          name: color.name,
          hexCode: color.hexCode || null,

          images: color.images?.length
            ? {
                create: color.images.map(
                  (img: any, index: number) => ({
                    imageUrl: img.imageUrl,
                    sortOrder: index,
                  })
                ),
              }
            : undefined,

          sizes: {
            create: color.sizes.map((size: any) => ({
              size: size.size,

              sku: `${data.name
                .replace(/\s+/g, "-")
                .toUpperCase()}-${color.name.toUpperCase()}-${size.size}`,

              mrp: Number(size.mrp),
              price: Number(size.price),
              stock: Number(size.stock),
              costPrice:
                size.costPrice !== undefined
                  ? Number(size.costPrice)
                  : null,
            })),
          },
        })),
      },
    },
  });
};

/* =====================================================
   GET ALL PRODUCTS (ADMIN LIST)
===================================================== */

export const getAllProducts = async () => {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      audience: true,
      productType: true,
      thumbnail: true,
      minPrice: true,
      isActive: true,
      isAvailable: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/* =====================================================
   GET PRODUCT BY ID
===================================================== */

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      colors: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          sizes: true,
        },
      },
    },
  });
};

/* =====================================================
   UPDATE PRODUCT
===================================================== */

export const updateProduct = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
    },
  });
};

/* =====================================================
   UPDATE STATUS
===================================================== */

export const updateProductStatus = async (
  id: string,
  isActive: boolean
) => {
  return prisma.product.update({
    where: { id },
    data: {
      isActive,
      isAvailable: isActive,
    },
  });
};

/* =====================================================
   DELETE PRODUCT
===================================================== */

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};
