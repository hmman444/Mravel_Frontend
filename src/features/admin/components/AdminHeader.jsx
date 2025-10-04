import { useEffect, useState } from "react";
import DarkModeToggle from "../../../components/DarkModeToggle";
import LanguageDropdown from "../../../components/LanguageDropdown";
import { BellIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminHeader() {
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();

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
            to="/admin"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
            >
            <img
                src="/src/assets/Mravel-logo.png"
                alt="Mravel Logo"
                className="h-8 w-8 object-contain"
            />
            {t("mravel_admin")}
            </Link>

            {/* Bên phải */}
            <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer">
                <img
                src="https://i.pravatar.cc/40?img=12"
                alt="Admin Avatar"
                className="w-9 h-9 rounded-full border"
                />
                <span className="font-medium text-gray-900 dark:text-gray-200 hidden md:block">
                {t("admin")}
                </span>
            </div>

            {/* Dark mode toggle */}
            <DarkModeToggle />

            {/* Language dropdown */}
            <LanguageDropdown />
            </div>
        </div>
        </header>
    );
}