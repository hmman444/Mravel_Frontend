import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DarkModeToggle() {
    const [dark, setDark] = useState(
      () => localStorage.getItem("theme") === "dark"
    );

    const { t } = useTranslation();

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
        {dark ? `☀️ ${t("light_mode")}` : `🌙 ${t("dark_mode")}`}
      </button>
    );
}