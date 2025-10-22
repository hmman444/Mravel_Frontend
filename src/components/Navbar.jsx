// src/components/Navbar.jsx
import { useSelector } from "react-redux";
import { useLogout } from "../features/auth/hooks/useLogout";
import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);

  return (
    <header className="fixed top-0 w-full bg-white shadow dark:bg-gray-900 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain"
          />
          Mravel
        </a>

        <nav className="hidden md:flex gap-6 text-gray-700 dark:text-neutral font-medium">
          <a href="/services">Dịch vụ</a>
          <a href="/locations">Địa điểm</a>
          <a href="/plans">Lịch trình</a>
          <a href="/contact">Liên hệ</a>
          <a href="/about">Giới thiệu</a>
        </nav>

        <div className="flex items-center gap-4 relative">
          {!accessToken ? (
            <>
              <a href="/login" className="text-gray-700 dark:text-neutral">
                Đăng nhập
              </a>
              <a
                href="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Đăng ký
              </a>
            </>
          ) : (
            <>
              {/* 🔔 Notification Icon */}
              <div className="relative cursor-pointer">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {hasNotification && (
                  <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                )}
              </div>

              {/* 👤 User Avatar */}
              <div className="relative">
                <button
                  className="flex items-center gap-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user?.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border"
                  />
                  <span className="hidden md:inline font-semibold text-gray-700 dark:text-gray-300">
                    {user?.fullname || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Hồ sơ của tôi
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cài đặt
                    </a>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
