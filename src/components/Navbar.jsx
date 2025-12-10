import { useSelector } from "react-redux";
import { useLogout } from "../features/auth/hooks/useLogout";
import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  User2,
  CreditCard,
  Ticket,
  Settings,
  LogOut,
  BookmarkCheck,
  Gift,
} from "lucide-react";

import DarkModeToggle from "./DarkModeToggle";
import LanguageDropdown from "./LanguageDropdown";

export default function Navbar() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNotification] = useState(true);
  const userMenuRef = useRef(null);

  const location = useLocation();
  const isTransparentPage =
    location.pathname === "/" || location.pathname.startsWith("/place");

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    setScrolled(!isTransparentPage || window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isTransparentPage]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const solid = scrolled || !isTransparentPage;

  return (
    <header
      className={`fixed top-0 w-full z-[200] transition-all duration-300
        ${solid
          ? "bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-md"
          : "bg-transparent"
        }
      `}
    >
      {/* NAVBAR WRAPPER */}
      <div
        className={`
          max-w-7xl mx-auto px-6 py-3 flex justify-between items-center
          transition-colors duration-300
          ${solid ? "text-gray-900 dark:text-white" : "text-white"}
        `}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:opacity-90 transition"
        >
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain drop-shadow"
          />
          <span className="font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            Mravel
          </span>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-6 font-medium text-sm">
          <Link className="hover:text-sky-500 transition" to="/hotels">
            Khách sạn
          </Link>
          <Link className="hover:text-sky-500 transition" to="/restaurants">
            Quán ăn
          </Link>
          <Link className="hover:text-sky-500 transition" to="/plans">
            Lịch trình
          </Link>
          <Link className="hover:text-sky-500 transition" to="/maybe">
            Đã đặt
          </Link>
          <Link className="hover:text-sky-500 transition" to="/maybe">
            Hợp tác
          </Link>
        </nav>

        {/* RIGHT AREA */}
        <div className="flex items-center gap-4 relative">

          {/* NOT LOGGED IN */}
          {!accessToken ? (
            <>
              <Link
                className="hover:text-sky-600 transition font-medium"
                to="/login"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="
                  px-4 py-2 rounded-xl text-white font-medium
                  bg-gradient-to-r from-sky-500 to-blue-600
                  shadow-md hover:shadow-lg hover:scale-[1.03]
                  active:scale-[0.98] transition
                "
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {/* Notification */}
              <div className="relative cursor-pointer hover:scale-105 transition">
                <Bell className="w-6 h-6" />
                {hasNotification && (
                  <span className="
                    absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full 
                    bg-red-500 ring-2 ring-white dark:ring-gray-900
                  "></span>
                )}
              </div>

              {/* USER MENU */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="
                    flex items-center gap-2 px-2 py-1 
                    rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
                    transition
                  "
                >
                  <img
                    src={user?.avatar}
                    className={`w-9 h-9 rounded-full shadow-sm object-cover 
                      border ${solid ? "border-gray-300" : "border-white/50"}
                    `}
                    alt="avatar"
                  />

                  <span className="hidden md:inline font-semibold">
                    {user?.fullname || "Người dùng"}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div
                    className="
                      absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden
                      shadow-2xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 animate-dropdown
                      text-gray-900 dark:text-gray-100
                    "
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-white">
                      <p className="text-sm font-semibold line-clamp-1">
                        {user?.fullname}
                      </p>
                      <p className="mt-1 text-xs opacity-90 flex items-center gap-1">
                        <span className="text-base">🥉</span> Bronze Priority
                      </p>
                    </div>

                    {/* Menu */}
                    <div className="py-2">
                      {/* Points */}
                      <div className="border-b border-gray-200 dark:border-gray-800 mb-1">
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-800 transition">
                          <Ticket className="w-4 h-4 text-sky-500" />
                          <div>
                            <p className="font-semibold text-sky-600 text-sm">
                              0 Điểm
                            </p>
                            <p className="text-xs text-gray-500">
                              Tích điểm khi đặt dịch vụ
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <DropdownItem
                        to="/account/profile"
                        icon={<User2 className="w-4 h-4 text-sky-500" />}
                        label="Chỉnh sửa hồ sơ"
                        onClick={() => setDropdownOpen(false)}
                      />

                      <DropdownButton
                        icon={<CreditCard className="w-4 h-4 text-sky-500" />}
                        label="Phương thức thanh toán"
                      />

                      <DropdownButton
                        icon={<BookmarkCheck className="w-4 h-4 text-sky-500" />}
                        label="Đặt chỗ của tôi"
                      />

                      <DropdownButton
                        icon={<Gift className="w-4 h-4 text-sky-500" />}
                        label="Khuyến mãi"
                      />

                      <DropdownItem
                        to="/settings"
                        icon={<Settings className="w-4 h-4 text-sky-500" />}
                        label="Cài đặt tài khoản"
                        onClick={() => setDropdownOpen(false)}
                      />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                          text-red-600 dark:text-red-300 
                          hover:bg-red-50 dark:hover:bg-red-900/30 
                          transition mt-1 border-t border-gray-200 dark:border-gray-800
                        "
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dark Mode */}
          <DarkModeToggle />

          {/* Language */}
          <LanguageDropdown scrolled={solid} />
        </div>
      </div>
    </header>
  );
}

/* ITEM COMPONENTS */
function DropdownItem({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
        flex items-center gap-3 px-4 py-2.5 text-sm 
        hover:bg-sky-50 dark:hover:bg-slate-800 transition
      "
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function DropdownButton({ icon, label }) {
  return (
    <button
      type="button"
      className="
        w-full flex items-center gap-3 px-4 py-2.5 text-sm
        hover:bg-sky-50 dark:hover:bg-slate-800 transition
      "
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
