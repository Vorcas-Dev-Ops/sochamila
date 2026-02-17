import { prisma } from "../../config/prisma";
import { getAvatar, setAvatar } from "../../lib/avatars";

/**
 * Get customer profile
 */
export async function getCustomerProfileService(customerId: string) {
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // attach avatar if present in avatar store
  const avatar = getAvatar(customerId);
  return { ...customer, avatarUrl: avatar || null };
}

/**
 * Get customer orders
 */
export async function getCustomerOrdersService(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { userId: customerId },
    include: {
      items: {
        include: {
          size: {
            include: {
              color: {
                include: {
                  product: true,
                },
              },
            },
          },
          vendor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    orderId: order.id.slice(0, 8).toUpperCase(),
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      product: item.size?.color?.product?.name,
      quantity: item.quantity,
      price: item.price,
      vendor: item.vendor?.name || "N/A",
      imageUrl: item.imageUrl,
      mockupUrl: item.mockupUrl,
    })),
  }));
}

/**
 * Get customer dashboard stats
 */
export async function getCustomerStatsService(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { userId: customerId },
  });

  const totalOrders = orders.length;
  // totalAmount is stored as integer cents (or smallest currency unit).
  // Convert to display currency (divide by 100) so frontend matches order formatting.
  const totalSpentCents = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const totalSpent = totalSpentCents / 100;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return {
    totalOrders,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    completedOrders,
    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
  };
}

/**
 * Update customer profile
 */
export async function updateCustomerProfileService(customerId: string, patch: { name?: string; email?: string; avatarUrl?: string }) {
  const data: any = {};
  if (typeof patch.name === "string") data.name = patch.name;
  if (typeof patch.email === "string") data.email = patch.email;

  // persist avatar in file store (avoids DB schema changes)
  if (typeof patch.avatarUrl === "string") {
    try {
      setAvatar(customerId, patch.avatarUrl);
    } catch (err) {
      console.error("Failed to set avatar:", err);
    }
  }

  if (Object.keys(data).length === 0) {
    // nothing to update in DB, but avatar may have been set
    const avatar = getAvatar(customerId);
    return { id: customerId, name: patch.name ?? null, email: patch.email ?? null, role: undefined, updatedAt: new Date(), avatarUrl: avatar ?? null };
  }

  const updated = await prisma.user.update({
    where: { id: customerId },
    data,
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });

  const avatar = getAvatar(customerId);
  return { ...updated, avatarUrl: avatar ?? null };
}
