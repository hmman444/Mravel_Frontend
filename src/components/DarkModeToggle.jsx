import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark" // lấy từ localStorage nếu có
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="ml-4 px-3 py-1 rounded border text-sm
                 text-accent dark:text-gray-200 
                 hover:bg-secondary hover:text-primary"
    >
      {dark ? "☀️ Sáng" : "🌙 Tối"}
    </button>
  );
}
