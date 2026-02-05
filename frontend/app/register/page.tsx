"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const isPasswordValid =
    Object.values(passwordRules).every(Boolean);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!isPasswordValid) {
      return setError("Password does not meet required rules.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "CUSTOMER",
      });

      window.location.href = "/login";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center text-gray-900">
          Create your account
        </h1>

        <p className="text-sm text-center text-gray-500 mb-6">
          Join Sochamila and start designing custom products
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            onChange={onChange}
            className="input-light py-3"
          />

          <input
            name="email"
            placeholder="Email Address"
            onChange={onChange}
            className="input-light py-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={onChange}
            className="input-light py-3"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={onChange}
            className="input-light py-3"
          />

          {/* PASSWORD RULES UI */}
          <div className="text-xs space-y-1 mt-2">
            <p className={passwordRules.length ? "text-green-600" : "text-gray-500"}>
              • At least 8 characters
            </p>
            <p className={passwordRules.uppercase ? "text-green-600" : "text-gray-500"}>
              • One uppercase letter
            </p>
            <p className={passwordRules.lowercase ? "text-green-600" : "text-gray-500"}>
              • One lowercase letter
            </p>
            <p className={passwordRules.number ? "text-green-600" : "text-gray-500"}>
              • One number
            </p>
            <p className={passwordRules.special ? "text-green-600" : "text-gray-500"}>
              • One special character
            </p>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                       text-white font-semibold py-3.5 rounded-xl
                       hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
