"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: string;
  role: "VENDOR";
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  exp: number;
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.replace("/vendor/login");

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.role !== "VENDOR")
        return router.replace("/");

      if (decoded.kycStatus !== "APPROVED")
        return router.replace("/vendor/pending");
    } catch {
      router.replace("/vendor/login");
    }
  }, []);

  return <>{children}</>;
}
