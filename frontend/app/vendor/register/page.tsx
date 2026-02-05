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
      alert("Unable to submit KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex justify-center px-3 sm:px-6 overflow-x-hidden">

      <div className="w-full max-w-6xl my-6 bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* ================= LEFT INFO ================= */}
          <div
            className="
              hidden lg:flex flex-col justify-center
              px-10 xl:px-14 py-12
              bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500
              text-white
            "
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold mb-6">
              Vendor Registration & KYC
            </h1>

            <p className="text-white/90 mb-8 leading-relaxed">
              Join Sochamila as a manufacturing partner. Orders will be assigned
              by the admin after verification.
            </p>

            <div className="space-y-3 text-sm">
              <div> Admin assigns orders</div>
              <div> No customer interaction</div>
              <div> Aadhaar & PAN verification</div>
              <div> Secure payouts</div>
            </div>

            <div className="mt-10 bg-white/15 p-5 rounded-xl text-sm italic">
              “Verified vendors receive regular orders and stable payouts.”
              <div className="mt-2 font-semibold">
                — Sochamila Admin Team
              </div>
            </div>
          </div>

          {/* ================= RIGHT FORM ================= */}
          <div className="p-5 sm:p-8 md:p-10 overflow-y-auto">

            <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800">
              Vendor KYC Form
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Fill accurate details. Fake information leads to rejection.
            </p>

            <div className="space-y-4">

              <input name="name" onChange={onChange} className="input-light" placeholder="Full Name" />
              <input name="email" onChange={onChange} className="input-light" placeholder="Email Address" />
              <input name="phone" onChange={onChange} className="input-light" placeholder="Phone Number" />
              <input type="password" name="password" onChange={onChange} className="input-light" placeholder="Password" />

              <select name="vendorType" onChange={onChange} className="input-light">
                <option value="">Select Vendor Category</option>
                <option value="TSHIRT">T-Shirt Printing</option>
                <option value="MUG">Mug Printing</option>
                <option value="STICKER">Sticker Printing</option>
                <option value="POSTER">Poster Printing</option>
              </select>

              <input name="aadhaar" onChange={onChange} className="input-light" placeholder="Aadhaar Number" />
              <input name="pan" onChange={onChange} className="input-light" placeholder="PAN Number" />

              {/* PAYOUT METHOD */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("BANK")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    payoutMethod === "BANK"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Bank Transfer
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod("UPI")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    payoutMethod === "UPI"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  UPI
                </button>
              </div>

              {payoutMethod === "BANK" ? (
                <>
                  <input name="accountNumber" onChange={onChange} className="input-light" placeholder="Account Number" />
                  <input name="ifsc" onChange={onChange} className="input-light" placeholder="IFSC Code" />
                </>
              ) : (
                <input name="upiId" onChange={onChange} className="input-light" placeholder="UPI ID" />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                  w-full mt-4
                  bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500
                  text-white font-semibold py-3 rounded-xl
                  hover:opacity-90 transition
                  disabled:opacity-60
                "
              >
                {loading ? "Submitting KYC..." : "Submit Vendor KYC"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already registered?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline">
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
