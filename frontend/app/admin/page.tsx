"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

/* ================= TYPES ================= */

interface DashboardStats {
  products: number;
  orders: number;
  vendors: number;
  revenue: number;
}

/* ================= PAGE ================= */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD STATS ================= */

  const loadStats = async () => {
    try {
      setError("");
      setRefreshing(true);

      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();

    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of store performance & activity
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={refreshing}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg border
            text-sm hover:bg-gray-50 transition
          "
        >
          <RefreshCcw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ================= STATS ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Key Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats?.products}
            loading={loading}
            icon={<Package size={22} />}
            color="indigo"
          />

          <StatCard
            title="Active Orders"
            value={stats?.orders}
            loading={loading}
            icon={<ShoppingBag size={22} />}
            color="green"
          />

          <StatCard
            title="Vendors"
            value={stats?.vendors}
            loading={loading}
            icon={<Users size={22} />}
            color="orange"
          />

          <StatCard
            title="Revenue"
            value={
              stats
                ? `₹${stats.revenue.toLocaleString()}`
                : undefined
            }
            loading={loading}
            icon={<TrendingUp size={22} />}
            color="blue"
          />
        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickCard
            title="Add New Product"
            description="Create new products with images & variants"
            href="/admin/products/new"
          />

          <QuickCard
            title="Manage Products"
            description="Update pricing, stock and visibility"
            href="/admin/products"
          />

          <QuickCard
            title="Manage Orders"
            description="View and process customer orders"
            href="/admin/orders"
          />
        </div>
      </section>

      {/* ================= RECENT ACTIVITY ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Recent Activity
        </h2>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm text-gray-500">
            Recent orders, vendor actions and system events
            will appear here.
          </p>

          {/* Placeholder for future */}
          <div className="mt-4 text-sm text-gray-400">
            No recent activity yet
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  color: "indigo" | "green" | "orange" | "blue";
  loading: boolean;
}) {
  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          {loading ? (
            <span className="animate-pulse text-gray-300">
              —
            </span>
          ) : (
            value ?? "0"
          )}
        </h3>
      </div>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        bg-white rounded-2xl p-6 shadow-sm
        hover:shadow-md transition block
      "
    >
      <h3 className="font-semibold text-lg mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500">
        {description}
      </p>
    </Link>
  );
}
