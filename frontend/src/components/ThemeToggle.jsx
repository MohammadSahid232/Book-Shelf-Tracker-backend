import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("shelfwise-mode") || localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const mode = isDarkMode ? "dark" : "light";

    root.setAttribute("data-theme", "reading-room");
    root.setAttribute("data-mode", mode);

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      localStorage.setItem("shelfwise-mode", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      localStorage.setItem("shelfwise-mode", "light");
    }
    localStorage.setItem("shelfwise-theme", "reading-room");
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border"
      style={{
        backgroundColor: 'var(--bg-raised)',
        color: 'var(--text-primary)',
        borderColor: 'var(--line)',
      }}
      title={isDarkMode ? "Switch to Reading Room Light Mode" : "Switch to Reading Room Dark Mode"}
    >
      {isDarkMode ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
