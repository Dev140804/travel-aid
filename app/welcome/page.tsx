"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [message, setMessage] = useState("Preparing your dashboard...");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedFirstName = localStorage.getItem("userFirstName");

    if (!storedUsername) {
      router.replace("/login");
      return;
    }

    setUsername(storedUsername);
    setFirstName(storedFirstName || storedUsername);
    setMessage(`Welcome back, ${storedFirstName || storedUsername}!`);

    const timer = window.setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] text-[#F8F9FB] px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B1F3A]/95 p-10 shadow-2xl shadow-[#00000060] backdrop-blur-lg">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]/80 mb-3">Welcome</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">{firstName ? `Hi, ${firstName}` : "Welcome"}</h1>
          <p className="text-lg text-gray-300 mb-8">{message}</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm text-[#E8C547] ring-1 ring-[#D4AF37]/20">
            Redirecting you to your dashboard...
          </div>
        </div>
      </div>
    </div>
  );
}
