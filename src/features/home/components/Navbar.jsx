import { useEffect, useState } from "react";
import DarkModeToggle from "../../../components/DarkModeToggle";
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); 
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
        className={`fixed top-0 w-full z-30 transition-all duration-300 ${
            scrolled ? "bg-white shadow dark:bg-gray-900" : "bg-transparent"
        }`}
        >
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <a
                href="/"
                className={`flex items-center gap-2 text-2xl font-bold transition-colors duration-300 ${
                     scrolled
                        ? "text-primary dark:text-secondary"
                        : "text-white dark:text-neutral"
                }`}
                >
                <img src="/src/assets/Mravel-logo.png" alt="Mravel Logo" className="h-8 w-8 object-contain" />
                Mravel
            </a>
            <nav
                className={`hidden md:flex gap-6 font-medium transition-colors duration-300 ml-20 ${
                    scrolled
                    ? "text-gray-700 dark:text-neutral"
                    : "text-white dark:text-neutral"
                }`}
                >
                <a href="/services" className="hover:text-accent">Dịch vụ</a>
                <a href="/locations" className="hover:text-accent">Địa điểm</a>
                <a href="/plans" className="hover:text-accent">Lịch trình</a>
                <a href="/contact" className="hover:text-accent">Liên hệ</a>
                <a href="/about" className="hover:text-accent">Giới thiệu</a>
            </nav>
            <div className="flex gap-3">
            <a
                href="/login"
                className={`px-4 py-2 text-sm transition-colors ${
                scrolled
                    ? "text-gray-700 hover:text-primary dark:text-neutral"
                    : "text-white hover:text-secondary"
                }`}
            >
                Đăng nhập
            </a>
            <a
                href="/register"
                className="px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primaryHover dark:bg-secondary dark:text-gray-900 dark:hover:bg-secondaryDark"
            >
                Đăng ký
            </a>
            <DarkModeToggle />
            </div>
        </div>
        </header>
  );
}
