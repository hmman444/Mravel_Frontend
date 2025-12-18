import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import DarkModeToggle from "../../../components/DarkModeToggle";
import LanguageDropdown from "../../../components/LanguageDropdown";

export default function PartnerHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled ? "bg-white shadow dark:bg-gray-900" : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/partner/dashboard"
          className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
        >
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain"
          />
          Mravel Partner
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="https://i.pravatar.cc/40?img=32"
              alt="Partner Avatar"
              className="w-9 h-9 rounded-full border"
            />
            <span className="font-medium text-gray-900 dark:text-gray-200 hidden md:block">
              Đối tác
            </span>
          </div>

          <DarkModeToggle />
          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
}