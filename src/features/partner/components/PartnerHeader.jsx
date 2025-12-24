// src/features/partner/components/PartnerHeader.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, LogOut, Store } from "lucide-react";

import DarkModeToggle from "../../../components/DarkModeToggle";
import LanguageDropdown from "../../../components/LanguageDropdown";
import { useLogout } from "../../partnerAuth/hooks/useLogout";
import { fetchCurrentPartner } from "../../partnerAuth/slices/partnerAuthSlice";

// Nếu bạn đã có notification hook + dropdown giống user/admin thì dùng lại:
import { useNotifications } from "../../notifications/hooks/useNotifications";
import NotificationDropdown from "../../notifications/components/NotificationDropdown";

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dqp7k8d4r/image/upload/v1757608869/avatars/y1kuegnpvey9ukpcv5iu.jpg";

export default function PartnerHeader() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();

  const { accessToken, partner } = useSelector((state) => state.partnerAuth);
  const { handleLogout } = useLogout();

  /* ================= FETCH ME ================= */
  useEffect(() => {
    if (accessToken && !partner) dispatch(fetchCurrentPartner());
  }, [accessToken, partner, dispatch]);

  /* ================= SCROLL ================= */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled;

  /* ================= NOTIFICATIONS (UI giống user/admin) ================= */
  // const { items, loading, saving, unreadCount, load, markAllRead, markRead } =
  //   useNotifications(); // sau này có thể đổi sang usePartnerNotifications()

  const [notiOpen, setNotiOpen] = useState(false);
  const notiWrapRef = useRef(null);

  /* ================= USER MENU ================= */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  /* ================= CLOSE ON ROUTE CHANGE ================= */
  useEffect(() => {
    setNotiOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.search]);

  /* ================= OUTSIDE CLICK (capture) ================= */
  useEffect(() => {
    const onPointerDown = (e) => {
      const el = e.target;
      if (notiWrapRef.current && !notiWrapRef.current.contains(el)) setNotiOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(el)) setDropdownOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  const p = partner || {};
  const partnerName = p.fullname || p.name || p.displayName || p.username || "Đối tác";
  const partnerEmail = p.email || "";
  const partnerAvatar =
    p.avatar || p.avatarUrl || p.photoUrl || p.imageUrl || FALLBACK_AVATAR;

  return (
    <header
      className={`fixed top-0 w-full z-[60] transition-all duration-300
        ${
          solid
            ? "bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-md"
            : "bg-white dark:bg-gray-900 border-b border-transparent"
        }
      `}
    >
      <div className="px-6 py-3 flex items-center">
        {/* LEFT: Logo + Partner label (xích sát trái) */}
        <Link
          to="/partner/dashboard"
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

          <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            Partner
          </span>
        </Link>

        {/* RIGHT: xích sát phải */}
        <div className="ml-auto flex items-center justify-end gap-3">
          {/*  THEME */}
          <DarkModeToggle variant="icon" />

          {/*  LANGUAGE */}
          <LanguageDropdown />

          {/*  NOTIFICATIONS (giống user/admin) */}
          {/* {accessToken ? (
            <div className="relative" ref={notiWrapRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  setNotiOpen((v) => !v);
                  if (!notiOpen) load().catch(() => {});
                }}
                className="
                  relative grid place-items-center w-10 h-10 rounded-full
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition
                "
                aria-label={t("notifications") || "Thông báo"}
                title={t("notifications") || "Thông báo"}
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
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0">
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
          ) : null} */}

          {/* PARTNER MENU (xích sát phải) */}
          {accessToken ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotiOpen(false);
                  setDropdownOpen((v) => !v);
                }}
                className="
                  flex items-center gap-2 px-2 py-1 rounded-full transition
                  hover:bg-gray-100/70 dark:hover:bg-gray-800/60
                "
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <img
                  src={partnerAvatar}
                  alt="Partner Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-white/10"
                />
                <span className="hidden md:inline font-semibold max-w-[180px] truncate text-gray-800 dark:text-gray-100">
                  {partnerName}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform duration-200" />
              </button>

              {dropdownOpen ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="
                    absolute right-0 mt-2 w-80
                    rounded-2xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900
                    text-gray-900 dark:text-gray-100
                    shadow-2xl z-[80] overflow-hidden
                  "
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-gray-200/70 dark:border-gray-800/70">
                    <p className="text-sm font-bold truncate text-gray-900 dark:text-white">
                      {partnerName}
                    </p>
                    {partnerEmail ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {partnerEmail}
                      </p>
                    ) : null}
                  </div>

                  <div className="py-2">
                    <button
                      type="button"
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm
                        text-gray-800 dark:text-gray-100
                        hover:bg-sky-50 dark:hover:bg-slate-800 transition
                      "
                      onClick={() => {
                        setDropdownOpen(false);
                        // nếu bạn có route hồ sơ partner thì đổi path ở đây
                        // navigate("/partner/profile");
                      }}
                    >
                      <span className="text-sky-600 dark:text-sky-300">
                        <Store className="w-4 h-4" />
                      </span>
                      <span className="font-medium">
                        {t("partner_account") || "Tài khoản đối tác"}
                      </span>
                    </button>

                    <div className="mt-2 border-t border-gray-200/70 dark:border-gray-800/70" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm
                        text-red-600 dark:text-red-300
                        hover:bg-red-50 dark:hover:bg-red-900/30 transition
                      "
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("logout") || "Đăng xuất"}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/partner"
              className="
                px-4 h-10 inline-flex items-center rounded-full
                border border-gray-200 dark:border-white/10
                text-sm font-medium
                text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-gray-800 transition
              "
            >
              {t("partner_login") || "Đăng nhập đối tác"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
