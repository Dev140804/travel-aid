"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(true);

  useEffect(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userLastName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("savedTrips");
    localStorage.removeItem("appTheme");

    const timer = window.setTimeout(() => {
      setIsSigningOut(false);
      window.location.href = "/login";
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] text-[#F8F9FB] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0B1F3A]/95 p-10 shadow-2xl shadow-[#00000060] backdrop-blur-xl text-center">
        <h1 className="text-4xl font-black text-white mb-4">Signing out...</h1>
        <p className="text-gray-300 mb-8">We are closing your session and sending you back to the login page.</p>
        <div className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-[#D4AF37]/30 animate-spin border-t-[#D4AF37]" />
        <p className="text-gray-400">If the redirect does not happen automatically, <Link href="/login" className="text-[#D4AF37] hover:underline">click here</Link>.</p>
      </div>
    </div>
  );
}
