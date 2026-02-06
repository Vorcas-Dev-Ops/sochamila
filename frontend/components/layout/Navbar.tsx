"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ArrowRight,
  Shirt,
  Gift,
  Home,
  Sticker,
  ImageIcon,
  Smartphone,
  ShoppingBag,
  LogIn,
  UserPlus,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      setIsLoggedIn(decoded.exp * 1000 > Date.now());
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const sidebarItems = [
    { icon: ShoppingBag, title: "Shop Designs", desc: "Discover trending artwork" },
    { icon: Shirt, title: "Apparel", desc: "Adults & kids clothing" },
    { icon: Sticker, title: "Accessories", desc: "Stickers & lifestyle" },
    { icon: Home, title: "Home Decor", desc: "Decorate your space" },
    { icon: ImageIcon, title: "Wall Art", desc: "Canvas, posters, frames" },
    { icon: Smartphone, title: "Phone Cases", desc: "Premium protection" },
    { icon: Gift, title: "Gifts", desc: "Perfect for every occasion" },
  ];

  return (
    <>
      {/* ================= ANNOUNCEMENT ================= */}
      <div className="w-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-center py-2 text-sm font-semibold tracking-wide">
        🎉 Flat 20% OFF on your first order — Use <span className="underline">SOCHA20</span>
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md backdrop-blur">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition hover:rotate-90"
          >
            <Menu size={26} />
          </button>

          <Link href="/" className="group flex items-center gap-2">
            <Image src="/PAINT.png" alt="Sochamila" width={34} height={34} />
            <span className="text-2xl font-extrabold text-[#a19926] tracking-tight group-hover:tracking-wider transition-all">
              SOCHAMILA
            </span>
          </Link>
        </div>

        {/* ================= CENTER LINKS ================= */}
        <div className="hidden md:flex gap-8">
          {["Create", "Shop"].map((item) => (
            <Link
              key={item}
              href="/products"
              className="relative font-semibold text-gray-700 transition hover:text-indigo-600
              after:absolute after:left-1/2 after:-bottom-1 after:h-[3px]
              after:w-0 after:bg-linear-to-r after:from-indigo-500 after:to-purple-500
              after:rounded-full after:-translate-x-1/2 after:transition-all
              hover:after:w-10"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* ================= SEARCH ================= */}
        <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-xl w-[32%]
          focus-within:ring-2 focus-within:ring-indigo-400 transition shadow-inner">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search products..."
            className="ml-2 bg-transparent outline-none w-full text-gray-700"
          />
        </div>

        {/* ================= RIGHT ================= */}
        <div className="hidden md:flex items-center gap-5">

          {/* CUSTOMER AUTH - hide Login when logged in */}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex items-center gap-1 font-semibold text-gray-700 hover:text-indigo-600 transition"
            >
              <LogIn size={18} /> Login
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/admin"
              className="flex items-center gap-1 font-semibold text-gray-700 hover:text-indigo-600 transition"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          )}

          <Link
            href="/register"
            className="flex items-center gap-1 px-5 py-2 rounded-xl font-semibold text-white
            bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500
            bg-size-[200%_200%] hover:bg-position-[100%_50%]
            transition-all hover:shadow-lg hover:-translate-y-px"
          >
            <UserPlus size={18} /> Register
          </Link>

          {/* VENDOR LOGIN */}
          <Link
            href="/vendor/register"
            className="flex items-center gap-1 px-4 py-2 rounded-xl
            border border-indigo-500 text-indigo-600 font-semibold
            hover:bg-indigo-50 transition"
          >
            <Briefcase size={18} /> Vendor
          </Link>

          {/* ICONS */}
          <Heart className="cursor-pointer hover:text-red-500 hover:scale-110 transition" />
          <ShoppingCart className="cursor-pointer hover:text-indigo-600 hover:scale-110 transition" />
        </div>
      </nav>

      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#111322] text-white z-\[999]
        transform transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="flex justify-between p-5 border-b border-white/10">
            <h2 className="text-xl font-bold">SOCHAMILA</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition hover:rotate-90"
            >
              <X />
            </button>
          </div>

          {/* LINKS */}
          <div className="flex-1 p-5 space-y-8">
            {sidebarItems.map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <item.icon className="text-indigo-400 group-hover:scale-110 transition" />
                    <h3 className="text-lg font-semibold group-hover:text-indigo-300">
                      {item.title}
                    </h3>
                  </div>
                  <ArrowRight className="group-hover:translate-x-2 transition" />
                </div>
                <p className="text-sm text-gray-300">{item.desc}</p>
                <hr className="border-white/10 mt-4" />
              </div>
            ))}
          </div>

          {/* MOBILE AUTH */}
          <div className="p-5 border-t border-white/10 space-y-3">
            {!isLoggedIn && (
              <Link href="/login" className="block font-semibold">
                Customer Login
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/admin" className="block font-semibold flex items-center gap-2">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            )}
            <Link href="/register" className="block font-semibold">
              Customer Register
            </Link>
            <Link href="/vendor/register" className="block text-indigo-400 font-semibold">
              Vendor register
            </Link>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-\[998]"
        />
      )}
    </>
  );
}
