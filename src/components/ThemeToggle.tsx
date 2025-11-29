"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
        <Sun className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center border-2   
                 rounded-md transition-colors bg-black text-white
                 dark:bg-white dark:text-black"
    >
      {/* Sun icon (light mode) */}
      <Sun
        className={`h-5 w-5 transition-all duration-300 
            ${isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />

      {/* Moon icon (dark mode) */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 
            ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}
      />

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
