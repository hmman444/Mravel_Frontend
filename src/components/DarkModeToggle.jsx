"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle({ variant = "icon" }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (variant !== "icon") return null;

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className="
        grid place-items-center w-10 h-10 rounded-full
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition
      "
      aria-label="Đổi chế độ sáng tối"
      title="Chế độ sáng / tối"
    >
      {dark ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
