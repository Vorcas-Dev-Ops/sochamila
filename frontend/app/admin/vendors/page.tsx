"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type VendorForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  vendorType: string;
  aadhaar: string;
  pan: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
};

export default function VendorRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"BANK" | "UPI">("BANK");

  const [form, setForm] = useState<VendorForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    vendorType: "",
    aadhaar: "",
    pan: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/vendor/register", {
        ...form,
        payoutMethod,
        kycStatus: "PENDING",
      });
      alert("Vendor registered successfully. Await admin approval.");
      window.location.href = "/login";
    } catch {
      alert("Unable to submit vendor KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ===== PAGE (NO SCROLL EVER) ===== */
    <div className="h-screen w-screen bg-gray-50 overflow-hidden flex items-center justify-center px-2">

      {/* ===== CARD (FULL HEIGHT) ===== */}
      <div className="h-full max-h-[96vh] w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* ===== GRID (FULL HEIGHT) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

          {/* ===== LEFT PANEL ===== */}
         <div
  className="
    hidden lg:flex flex-col
    sticky top-0 h-screen
    justify-center
    px-8 xl:px-10 py-10
    bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500
    text-white
  "
>

            <h1 className="text-3xl xl:text-4xl font-extrabold mb-5">
              Vendor Registration & KYC
            </h1>

            <p className="text-white/90 mb-6 text-sm xl:text-base">
              Join Sochamila as a verified manufacturing partner.
              Orders are assigned only after admin approval.
            </p>

            <div className="space-y-2 text-sm">
              <p>✅ Admin assigns orders</p>
              <p>✅ No customer interaction</p>
              <p>✅ Aadhaar & PAN verification</p>
              <p>✅ Secure weekly payouts</p>
            </div>

            <div className="mt-8 bg-white/15 p-4 rounded-xl text-sm italic">
              “Verified vendors receive consistent orders and stable income.”
              <div className="mt-2 font-semibold">
                — Sochamila Admin Team
              </div>
            </div>
          </div>

          {/* ===== RIGHT FORM (ONLY SCROLL AREA) ===== */}
         <div className="h-full overflow-y-auto no-scrollbar px-5 sm:px-7 py-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800">
              Vendor KYC Form
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Please enter accurate details. Fake information leads to rejection.
            </p>

            <div className="space-y-3">

              <input className="input-light py-2.5 text-sm" name="name" onChange={onChange} placeholder="Full Name" />
              <input className="input-light py-2.5 text-sm" name="email" onChange={onChange} placeholder="Email Address" />
              <input className="input-light py-2.5 text-sm" name="phone" onChange={onChange} placeholder="Phone Number" />
              <input className="input-light py-2.5 text-sm" type="password" name="password" onChange={onChange} placeholder="Password" />

              <select className="input-light py-2.5 text-sm" name="vendorType" onChange={onChange}>
                <option value="">Select Vendor Category</option>
                <option value="TSHIRT">T-Shirt Printing</option>
                <option value="MUG">Mug Printing</option>
                <option value="STICKER">Sticker Printing</option>
                <option value="POSTER">Poster Printing</option>
              </select>

              <input className="input-light py-2.5 text-sm" name="aadhaar" onChange={onChange} placeholder="Aadhaar Number" />
              <input className="input-light py-2.5 text-sm" name="pan" onChange={onChange} placeholder="PAN Number" />

              <div className="flex gap-3 pt-1 flex-wrap">
                {["BANK", "UPI"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      payoutMethod === method
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {method === "BANK" ? "Bank Transfer" : "UPI"}
                  </button>
                ))}
              </div>

              {payoutMethod === "BANK" ? (
                <>
                  <input className="input-light py-2.5 text-sm" name="accountNumber" onChange={onChange} placeholder="Account Number" />
                  <input className="input-light py-2.5 text-sm" name="ifsc" onChange={onChange} placeholder="IFSC Code" />
                </>
              ) : (
                <input className="input-light py-2.5 text-sm" name="upiId" onChange={onChange} placeholder="UPI ID" />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold py-3 rounded-xl"
              >
                {loading ? "Submitting KYC..." : "Submit Vendor KYC"}
              </button>

              <p className="text-center text-xs sm:text-sm text-gray-500">
                Already registered?{" "}
                <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                  Login
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
