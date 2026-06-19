"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Disable body scroll when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation - remove error when field becomes valid
    const newErrors = { ...errors };

    if (name === "username") {
      if (value.trim()) delete newErrors.username;
    } else if (name === "password") {
      if (value.trim()) delete newErrors.password;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = "Username required";
    if (!formData.password.trim()) newErrors.password = "Password required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      // Store user data in localStorage
      localStorage.setItem("username", formData.username);
      if (data.user?.firstName) {
        localStorage.setItem("userFirstName", data.user.firstName);
      }
      if (data.user?.lastName) {
        localStorage.setItem("userLastName", data.user.lastName);
      }
      if (data.user?.email) {
        localStorage.setItem("userEmail", data.user.email);
      }
      if (data.user?.phoneNumber) {
        localStorage.setItem("userPhoneNumber", data.user.phoneNumber);
      }
      if (data.user?.address) {
        localStorage.setItem("userAddress", data.user.address);
      }
      if (data.user?.country) {
        localStorage.setItem("userCountry", data.user.country);
      }
      if (data.user?.dateOfBirth) {
        localStorage.setItem("userDOB", data.user.dateOfBirth);
      }
      setTimeout(() => (window.location.href = "/welcome"), 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ submit: message });
      setIsLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      <AnimatedHeroBackground />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/40 backdrop-blur-md transition-opacity duration-300 pointer-events-none">
          {/* Animated Spinner Icon Only */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-emerald-500 animate-spin" style={{ animationDelay: "0.15s" }}></div>
            <div className="absolute inset-4 rounded-full border-b-4 border-violet-500 animate-spin" style={{ animationDelay: "0.3s" }}></div>
            <Image
              src="/erasebg-transformed.png"
              alt="Loading"
              width={80}
              height={80}
              className="relative z-10 object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-[#D4AF37]/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <Image src="/erasebg-transformed.png" alt="Logo" width={60} height={60} />
            <div className="font-serif">
              <span className="text-[#F8F9FB]">Trip</span>
              <span className="text-[#D4AF37]"> Planner</span>
            </div>
          </Link>
          <Link href="/signup" className="text-sm text-gray-300 hover:text-[#D4AF37] cursor-pointer">
            Don&apos;t have an account? <span className="text-[#D4AF37]">Sign up</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547]">
                Welcome Back
              </h1>
              <p className="text-gray-300">Log in to your Trip Planner account</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#D4AF37] mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.username ? "border-red-500" : "border-[#D4AF37]/30"
                  }`}
                />
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#D4AF37] mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password ? "border-red-500" : "border-[#D4AF37]/30"
                  }`}
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <Link href="#" className="text-sm text-[#D4AF37] hover:text-[#E8C547] mb-6 block text-right cursor-pointer">
                Forgot password?
              </Link>

              {errors.submit && <p className="text-red-400 text-sm mb-6 text-center">{errors.submit}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-lg font-bold rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>

              <p className="text-center text-gray-400 text-sm mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#D4AF37] font-semibold hover:underline cursor-pointer">
                  Create one now
                </Link>
              </p>
            </form>
          </div>
        </main>

        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-400 backdrop-blur-md bg-[#0B1F3A]/40">
          <p>© {new Date().getFullYear()} Trip Planner. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
