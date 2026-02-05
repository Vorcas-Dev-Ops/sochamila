"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Users,
  ShoppingBag,
  Sticker,
  Image,
  LogOut,
} from "lucide-react";

/* ================= TYPES ================= */

type JwtPayload = {
  id: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  exp: number;
};

/* ================= LAYOUT ================= */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.replace("/login");

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.role !== "ADMIN") router.replace("/");
    } catch {
      router.replace("/login");
    }
  }, [router]);

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r flex flex-col z-40">

        {/* BRAND */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-2xl font-extrabold text-indigo-600">
            Sochamila
          </h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">

          <NavLink href="/admin" active={pathname === "/admin"} icon={<LayoutDashboard size={18} />}>
            Dashboard
          </NavLink>

          <Section title="Products">
            <NavLink href="/admin/products" active={pathname === "/admin/products"} icon={<Package size={18} />}>
              All Products
            </NavLink>
            <NavLink href="/admin/products/new" active={pathname === "/admin/products/new"} icon={<PlusSquare size={18} />}>
              Add Product
            </NavLink>
          </Section>

          <Section title="Assets">
            <NavLink href="/admin/graphics" active={pathname.startsWith("/admin/graphics")} icon={<Image size={18} />}>
              Graphics
            </NavLink>
            <NavLink href="/admin/stickers" active={pathname.startsWith("/admin/stickers")} icon={<Sticker size={18} />}>
              Stickers
            </NavLink>
          </Section>

          <Section title="Management">
            <NavLink href="/admin/vendors" active={pathname.startsWith("/admin/vendors")} icon={<Users size={18} />}>
              Vendors
            </NavLink>
            <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")} icon={<ShoppingBag size={18} />}>
              Orders
            </NavLink>
          </Section>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-4">
      <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition
        ${active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-indigo-100"}`}
    >
      {icon}
      {children}
    </Link>
  );
}
