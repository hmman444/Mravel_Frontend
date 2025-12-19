"use client";

import { useSelector } from "react-redux";
import { useLogout } from "../features/auth/hooks/useLogout";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  ChevronDown,
  LogOut,
  User2,
  Sun,
  Moon,
  Globe,
  Check,
} from "lucide-react";

import { useNotifications } from "../features/notifications/hooks/useNotifications";
import NotificationDropdown from "../features/notifications/components/NotificationDropdown";

export default function Navbar() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

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

  const solid = scrolled || !isTransparentPage;

  /* ================= NOTIFICATIONS (1 nơi duy nhất) ================= */
  const {
    items,
    loading,
    saving,
    unreadCount,
    load,
    markAllRead,
    markRead,
  } = useNotifications();

  const [notiOpen, setNotiOpen] = useState(false);
  const notiWrapRef = useRef(null);

  /* ================= USER MENU ================= */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const fullname = user?.fullname || "Người dùng";
  const avatar =
    user?.avatar || "https://ui-avatars.com/api/?name=User";

  /* ================= LANGUAGE ================= */
  const langs = useMemo(
    () => [
      { code: "vi", label: "Tiếng Việt" },
      { code: "en", label: "English" },
    ],
    []
  );
  const currentLang =
    langs.find((l) => i18n.language?.startsWith(l.code)) || langs[0];

  /* ================= LOAD NOTI ON LOGIN (để chuông có số ngay) ================= */
  useEffect(() => {
    if (!accessToken || !user?.id) return;
    // load page 1 nhẹ (size lấy từ slice/hook), để badge hiện ngay
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.id]);

  /* ================= CLOSE ON ROUTE CHANGE ================= */
  useEffect(() => {
    setNotiOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  /* ================= OUTSIDE CLICK (capture) =================
   * Dùng pointerdown capture để tránh “mở xong đóng ngay”
   */
  useEffect(() => {
    const onPointerDown = (e) => {
      const t = e.target;

      // đóng noti nếu click ngoài vùng noti
      if (notiWrapRef.current && !notiWrapRef.current.contains(t)) {
        setNotiOpen(false);
      }
      // đóng user menu nếu click ngoài vùng user menu
      if (userMenuRef.current && !userMenuRef.current.contains(t)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-[50] transition-all duration-300
        ${
          solid
            ? "bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-md"
            : "bg-transparent"
        }
      `}
    >
      <div
        className={`
          max-w-7xl mx-auto px-6 py-3
          grid grid-cols-[auto_1fr_auto]
          items-center
          ${solid ? "text-gray-900 dark:text-white" : "text-white"}
        `}
      >
        {/* LEFT: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight shrink-0"
        >
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            Mravel
          </span>
        </Link>

        {/* CENTER: Nav */}
        <nav className="hidden md:flex justify-center gap-8 font-medium text-base">
          <Link className="hover:text-sky-500 transition" to="/hotels">
            Khách sạn
          </Link>
          <Link className="hover:text-sky-500 transition" to="/restaurants">
            Quán ăn
          </Link>
          <Link className="hover:text-sky-500 transition" to="/plans">
            Lịch trình
          </Link>
          <Link className="hover:text-sky-500 transition" to="/my-bookings">
            Đặt dịch vụ
          </Link>
          <Link className="hover:text-sky-500 transition" to="/maybe">
            Hợp tác
          </Link>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2">
          {!accessToken ? (
            <>
              <Link className="font-medium hover:text-sky-600 transition" to="/login">
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
              {/* NOTIFICATION */}
              <div className="relative" ref={notiWrapRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // mở noti => đóng user menu
                    setUserMenuOpen(false);
                    setNotiOpen((v) => !v);
                    // mở thì load page1 (nếu chưa load hoặc muốn refresh)
                    // tránh spam: chỉ load khi mở
                    if (!notiOpen) load().catch(() => {});
                  }}
                  className={`
                    relative grid place-items-center w-10 h-10 rounded-full
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition
                    ${solid ? "" : "bg-white/10 hover:bg-white/15"}
                  `}
                  aria-label="Thông báo"
                >
                  <Bell className="w-6 h-6" />

                  {unreadCount > 0 && (
                    <span
                      className="
                        absolute -top-1 -right-1 min-w-[18px] h-[18px]
                        px-1 rounded-full text-[11px] font-bold
                        bg-red-500 text-white grid place-items-center
                      "
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notiOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0"
                  >
                    <NotificationDropdown
                      onClose={() => setNotiOpen(false)}
                      items={items}
                      loading={loading}
                      saving={saving}
                      unreadCount={unreadCount}
                      markAllRead={markAllRead}
                      markRead={markRead}
                    />
                  </div>
                )}
              </div>

              {/* AVATAR MENU */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // mở avatar => đóng noti
                    setNotiOpen(false);
                    setUserMenuOpen((v) => !v);
                  }}
                  className="
                    flex items-center gap-2 px-2 py-1 rounded-full
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition
                  "
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className={`w-9 h-9 rounded-full object-cover border ${
                      solid ? "border-gray-300" : "border-white/50"
                    }`}
                  />
                  <span className="hidden md:inline font-semibold max-w-[160px] truncate">
                    {fullname}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="
                      absolute right-0 mt-2 w-80
                      rounded-2xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900
                      text-gray-900 dark:text-gray-100
                      shadow-2xl z-[70]
                    "
                  >
                    {/* Header (ép màu chữ để không dính text-white của navbar) */}
                    <div className="px-4 py-3 border-b border-gray-200/70 dark:border-gray-800/70">
                      <p className="text-sm font-bold truncate">{fullname}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        @{user?.username || user?.email || "mravel-user"}
                      </p>
                    </div>

                    <div className="py-2">
                      <MenuLink
                        icon={<User2 className="w-4 h-4" />}
                        label="Trang cá nhân"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate(`/profile/${user?.id}`);
                        }}
                      />

                      <div className="my-2 border-t border-gray-200/70 dark:border-gray-800/70" />

                      <ThemeToggleInline />

                      <LanguagePickerInline
                        langs={langs}
                        current={currentLang}
                        onPick={(code) => {
                          i18n.changeLanguage(code);
                          localStorage.setItem("language", code);
                        }}
                      />

                      <div className="mt-2 border-t border-gray-200/70 dark:border-gray-800/70" />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5 text-sm
                          text-red-600 dark:text-red-300
                          hover:bg-red-50 dark:hover:bg-red-900/30
                          transition
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
        </div>
      </div>
    </header>
  );
}

/* ================= SUB ================= */

function MenuLink({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full flex items-center gap-3 px-4 py-2.5 text-sm
        hover:bg-sky-50 dark:hover:bg-slate-800 transition
      "
    >
      <span className="text-sky-600 dark:text-sky-300">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ThemeToggleInline() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className="
        w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm
        hover:bg-sky-50 dark:hover:bg-slate-800 transition
      "
    >
      <div className="flex items-center gap-3">
        <span className="text-sky-600 dark:text-sky-300">
          {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </span>
        <span className="font-medium">Chế độ</span>
      </div>

      <div className={`relative w-11 h-6 rounded-full transition ${dark ? "bg-sky-600/90" : "bg-gray-300"}`}>
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            dark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

function LanguagePickerInline({ langs, current, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm
          hover:bg-sky-50 dark:hover:bg-slate-800 transition
        "
      >
        <div className="flex items-center gap-3">
          <span className="text-sky-600 dark:text-sky-300">
            <Globe className="w-4 h-4" />
          </span>
          <span className="font-medium">Ngôn ngữ</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{current?.label}</span>
      </button>

      {open && (
        <div
          className="
            absolute right-4 top-full mt-1 w-48 z-[90]
            rounded-2xl border border-gray-200 dark:border-gray-800
            bg-white dark:bg-gray-900 shadow-xl overflow-hidden
          "
        >
          {langs.map((l) => {
            const active = current?.code === l.code;
            return (
              <button
                key={l.code}
                onClick={() => {
                  onPick(l.code);
                  setOpen(false);
                }}
                className="
                  w-full flex items-center justify-between px-3 py-2 text-sm
                  hover:bg-slate-100 dark:hover:bg-slate-800 transition
                "
              >
                <span className={active ? "font-semibold" : "font-medium"}>{l.label}</span>
                {active && <Check className="w-4 h-4 text-sky-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
