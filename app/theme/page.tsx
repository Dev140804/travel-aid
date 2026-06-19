"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaPalette } from "react-icons/fa6";
import { THEMES, ThemeType, DEFAULT_THEME, getThemeFromStorage, saveThemeToStorage, applyThemeToDOM, type Theme } from "@/lib/themes";

export default function Theme() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (!storedUsername) {
      window.location.href = "/login";
      return;
    }

    const theme = getThemeFromStorage();
    setSelectedTheme(theme);
    applyThemeToDOM(THEMES[theme]);
    setIsLoading(false);
  }, []);

  const handleThemeChange = async (themeId: ThemeType) => {
    setIsApplyingTheme(true);
    
    // Simulate loading for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setSelectedTheme(themeId);
    saveThemeToStorage(themeId);
    applyThemeToDOM(THEMES[themeId]);
    
    // Reload page to apply theme globally
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] text-[#F8F9FB]">
        <p>Loading...</p>
      </div>
    );
  }

  const currentTheme = THEMES[selectedTheme];

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      <AnimatedHeroBackground />

      {/* Theme Loading Overlay */}
      {isApplyingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/60 backdrop-blur-md">
          <div className="text-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-t-4 border-[#D4AF37] animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-4 border-[#E8C547] animate-spin" style={{ animationDelay: "0.15s" }}></div>
              <div className="absolute inset-4 rounded-full border-b-4 border-[#F8C547] animate-spin" style={{ animationDelay: "0.3s" }}></div>
              <Image
                src="/erasebg-transformed.png"
                alt="Loading"
                width={80}
                height={80}
                className="relative z-10 object-contain"
              />
            </div>
            <p className="text-[#D4AF37] font-bold text-lg">Applying Theme...</p>
          </div>
        </div>
      )}

      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex h-20 items-center justify-center border-b border-[#D4AF37]/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60 relative">
          {/* Back Button - Left */}
          <button
            onClick={() => router.back()}
            className="absolute left-6 flex items-center gap-2 text-slate-300 hover:text-[#D4AF37] transition-colors font-semibold cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Center Logo and Name */}
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image
                src="/erasebg-transformed.png"
                alt="Trip Planner Logo"
                width={60}
                height={60}
                className="object-contain filter drop-shadow-lg"
              />
            </div>
            <div className="font-serif">
              <span className="text-2xl text-[#F8F9FB] font-light tracking-wider">Trip</span>
              <span className="text-2xl text-[#D4AF37] font-semibold"> Planner</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <section className="flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center">
            <div className="mb-6 animate-bounce">
              <FaPalette className="w-24 h-24 text-[#D4AF37] mx-auto filter drop-shadow-lg" />
            </div>
            <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] drop-shadow-lg">
              Theme Settings
            </h1>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed drop-shadow-md">
              Customize your visual experience with 5 unique themes
            </p>
          </section>

          <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0B1F3A]/40 to-transparent">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.values(THEMES).map((theme: Theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    disabled={isApplyingTheme}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedTheme === theme.id
                        ? "border-[#D4AF37] bg-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/40"
                        : "border-[#D4AF37]/30 bg-white/5 hover:border-[#D4AF37]/60"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Color preview circles */}
                      <div className="flex gap-2 justify-center">
                        <div
                          className="w-6 h-6 rounded-full shadow-lg"
                          style={{ backgroundColor: theme.colors.primary }}
                        ></div>
                        <div
                          className="w-6 h-6 rounded-full shadow-lg"
                          style={{ backgroundColor: theme.colors.secondary }}
                        ></div>
                        <div
                          className="w-6 h-6 rounded-full shadow-lg"
                          style={{ backgroundColor: theme.colors.accent }}
                        ></div>
                      </div>

                      <h3 className="text-lg font-bold text-[#F8F9FB]">{theme.name}</h3>
                      <p className="text-xs text-gray-300">{theme.description}</p>

                      {selectedTheme === theme.id && (
                        <div className="pt-2 text-sm font-semibold text-[#D4AF37]">
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Theme Details */}
              <div className="mt-16 p-8 bg-white/10 rounded-2xl border border-[#D4AF37]/30">
                <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">
                  {currentTheme.name}
                </h3>
                <p className="text-gray-300 text-lg mb-8">{currentTheme.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded-lg shadow-lg"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    ></div>
                    <p className="text-center text-sm text-gray-300">Primary</p>
                    <p className="text-center text-xs text-gray-400">
                      {currentTheme.colors.primary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded-lg shadow-lg"
                      style={{ backgroundColor: currentTheme.colors.secondary }}
                    ></div>
                    <p className="text-center text-sm text-gray-300">Secondary</p>
                    <p className="text-center text-xs text-gray-400">
                      {currentTheme.colors.secondary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded-lg shadow-lg border border-gray-600"
                      style={{ backgroundColor: currentTheme.colors.accent }}
                    ></div>
                    <p className="text-center text-sm text-gray-300">Accent</p>
                    <p className="text-center text-xs text-gray-400">
                      {currentTheme.colors.accent}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded-lg shadow-lg border border-gray-600"
                        style={{ backgroundColor: currentTheme.colors.background }}
                    ></div>
                    <p className="text-center text-sm text-gray-300">Background</p>
                    <p className="text-center text-xs text-gray-400">
                        {currentTheme.colors.background}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded-lg shadow-lg border border-gray-600"
                      style={{ backgroundColor: currentTheme.colors.text }}
                    ></div>
                    <p className="text-center text-sm text-gray-800">Text</p>
                    <p className="text-center text-xs text-gray-600">
                      {currentTheme.colors.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 py-12 text-center text-sm text-gray-400 backdrop-blur-md bg-[#0B1F3A]/40">
          <p>
            © {new Date().getFullYear()} Trip Planner. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
