"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DesignSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= DATA ================= */
  const categories = [
    { img: "/jersey.webp", name: "Jersey" },
    { img: "/cap.png", name: "Caps" },
    { img: "/1.webp", name: "Sweatshirts" },
    { img: "/3.jpeg", name: "Bottle" },
    { img: "/5.webp", name: "Tote Bags" },
    { img: "/hoodie.jpg", name: "Hoodies" },
    { img: "/sticker.jpg", name: "Stickers" },
  ];

  const products = [
    { title: "Bella + Canvas Sweatshirt", desc: "Holly Jolly Vibes", img: "/1.webp", price: "₹631.99" },
    { title: "Kids Longsleeve Shirt", desc: "Stay at Hogwarts", img: "/2.webp", price: "₹429.99" },
    { title: "Caps", desc: "Christmasbear Embroidered", img: "/cap.png", price: "₹726.99" },
    { title: "Jersey", desc: "Official Cookie Tester", img: "/jersey.webp", price: "₹621.99" },
    { title: "Tote Bag", desc: "Nice for Christmas?", img: "/5.webp", price: "₹551.99" },
  ];

  /* ================= AUTO SCROLL (DESKTOP ONLY) ================= */
  useEffect(() => {
    if (window.innerWidth < 768) return;

    const interval = setInterval(() => {
      if (!isHovering && scrollRef.current) {
        const el = scrollRef.current;
        el.scrollLeft += 1;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollLeft = 0;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isHovering]);

  /* ================= FAKE LOADING ================= */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12">

      {/* ================= CREATE YOUR DESIGN ================= */}
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-6">
        Create Your Design
      </h2>

      {/* Categories */}
      <div className="flex gap-6 sm:gap-8 overflow-x-auto hide-scrollbar pb-4">
        {(loading ? Array(7).fill(null) : categories).map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
          >
            <div
              className="
                relative
                w-28 h-28
                sm:w-36 sm:h-36
                md:w-40 md:h-40
                rounded-full overflow-hidden
                bg-white
                ring-1 ring-gray-200
                shadow-sm
                transition
                group-hover:ring-teal-500
                group-hover:shadow-lg
                group-hover:-translate-y-1
              "
            >
              {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              ) : (
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover scale-110 transition group-hover:scale-125"
                />
              )}
            </div>

            <span
              className="
                mt-3 px-3 py-1 rounded-full
                text-xs sm:text-sm font-medium
                bg-gray-100
                transition
                group-hover:bg-teal-50
                group-hover:text-teal-700
              "
            >
              {loading ? "" : item.name}
            </span>
          </div>
        ))}
      </div>

      {/* ================= BESTSELLERS ================= */}
      <div className="flex justify-between items-center mt-12 mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">
          Bestsellers
        </h2>
        <Link
          href="/products"
          className="text-sm text-teal-600 hover:underline"
        >
          Show all
        </Link>
      </div>

      {/* Product Carousel */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="
          flex gap-4 sm:gap-6
          overflow-x-auto hide-scrollbar scroll-smooth
          pb-2
        "
      >
        {(loading ? Array(6).fill(null) : [...products, ...products]).map(
          (product, i) => (
            <div
              key={i}
              className="
                flex-shrink-0
                w-52 sm:w-60 md:w-64
                bg-white
                rounded-2xl
                transition
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div className="relative h-44 sm:h-52 md:h-60 rounded-xl bg-gray-50 overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : (
                  <Image
                    src={product.img}
                    alt={product.title}
                    fill
                    className="object-contain p-4 transition hover:scale-105"
                  />
                )}
              </div>

              <div className="px-3 py-3 text-center space-y-1">
                {loading ? (
                  <>
                    <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-2/3 mx-auto bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/3 mx-auto bg-gray-200 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <h3 className="text-xs sm:text-sm font-semibold">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {product.desc}
                    </p>
                    <p className="text-sm font-semibold text-teal-600">
                      {product.price}
                    </p>
                  </>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
