import { useSelector } from "react-redux";
import { useLogout } from "../features/auth/hooks/useLogout";
import { useEffect, useState, useRef } from "react"; // <- thêm useRef
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

  const userMenuRef = useRef(null); // <- ref cho cụm user + dropdown

  const location = useLocation();
  const isTransparentPage =
    location.pathname === "/" || location.pathname.startsWith("/place");

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    setScrolled(!isTransparentPage || window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isTransparentPage, location.pathname]);

  // CLICK RA NGOÀI → ĐÓNG DROPDOWN
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
      className={[
        "fixed top-0 w-full z-50 transition-all duration-300",
        solid
          ? "bg-white/90 dark:bg-gray-900/85 supports-[backdrop-filter]:backdrop-blur border-b border-gray-200/70 dark:border-white/10 shadow-sm"
          : "bg-transparent",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-7xl mx-auto px-6 py-3 flex justify-between items-center transition-colors duration-300",
          solid ? "text-gray-900 dark:text-white" : "text-white",
        ].join(" ")}
      >
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain"
          />
          Mravel
        </Link>

        <nav className="hidden md:flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <Link className="hover:opacity-80" to="/hotels">
            Khách sạn
          </Link>
          <Link className="hover:opacity-80" to="/restaurants">
            Quán ăn
          </Link>
          <Link className="hover:opacity-80" to="/plans">
            Lịch trình
          </Link>
          <Link className="hover:opacity-80" to="/coupons">
            Khuyến mãi
          </Link>
          <Link className="hover:opacity-80" to="/co-op">
            Hợp tác với chúng tôi
          </Link>
          <Link className="hover:opacity-80" to="/co-op">
            Đã đặt
          </Link>
        </nav>

        <div className="flex items-center gap-4 relative">
          {!accessToken ? (
            <>
              <Link className="hover:opacity-80" to="/login">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className={[
                  "px-4 py-2 rounded-lg transition-opacity",
                  "bg-primary text-white hover:opacity-90",
                ].join(" ")}
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {/* 🔔 Notification */}
              <div className="relative cursor-pointer">
                <Bell className="w-6 h-6" />
                {hasNotification && (
                  <span className="absolute top-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-current"></span>
                )}
              </div>

              {/* 👤 User */}
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <img
                    src={user?.avatar}
                    alt="avatar"
                    className={[
                      "w-8 h-8 rounded-full border",
                      solid
                        ? "border-gray-300 dark:border-white/20"
                        : "border-white/30",
                    ].join(" ")}
                  />
                  <span className="hidden md:inline font-semibold">
                    {user?.fullname || "User"}
                  </span>
                  {/* MŨI TÊN XOAY KHI MỞ */}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 bg-white text-gray-900 dark:bg-gray-900 dark:text-white overflow-hidden">
                    {/* Header giống Traveloka */}
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3">
                      <p className="text-sm font-semibold text-white line-clamp-1">
                        {user?.fullname || "Người dùng Mravel"}
                      </p>
                      <p className="mt-1 text-xs text-white/90 flex items-center gap-1">
                        <span className="text-base">🥉</span>
                        <span>
                          Bạn là thành viên{" "}
                          <span className="font-semibold">Bronze Priority</span>
                        </span>
                      </p>
                    </div>

                    {/* Body */}
                    <div className="py-2 bg-white dark:bg-gray-900">
                      <div className="border-b border-slate-100 dark:border-white/10 pb-1 mb-1">
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-800 transition">
                          <Ticket className="w-4 h-4 text-sky-500" />
                          <div>
                            <p className="text-sm font-semibold text-sky-600">
                              0 Điểm
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Tích điểm khi đặt dịch vụ trên Mravel
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/account/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <User2 className="w-4 h-4 text-sky-500" />
                        <span>Chỉnh sửa hồ sơ</span>
                      </Link>

                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <CreditCard className="w-4 h-4 text-sky-500" />
                        <span>Thẻ & phương thức thanh toán</span>
                      </button>

                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <BookmarkCheck className="w-4 h-4 text-sky-500" />
                        <span>Đặt chỗ của tôi</span>
                      </button>

                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <Gift className="w-4 h-4 text-sky-500" />
                        <span>Khuyến mãi</span>
                      </button>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4 text-sky-500" />
                        <span>Cài đặt tài khoản</span>
                      </Link>

                      <div className="mt-1 border-t border-slate-100 dark:border-white/10" />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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

          {/* 🌙 Dark mode */}
          <DarkModeToggle />

          {/* 🔤 Language switcher */}
          <LanguageDropdown scrolled={solid} />
        </div>
      </div>
    </header>
  );
}