"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import DarkModeToggle from "../../../components/DarkModeToggle";
import LanguageDropdown from "../../../components/LanguageDropdown";
import { useLogout } from "../../auth/hooks/useLogout"; // <-- đổi path theo dự án bạn

export default function AdminHeader() {
  const { t } = useTranslation();
  const { handleLogout } = useLogout();

  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setUserOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-b border-transparent",
      ].join(" ")}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* LEFT */}
        <Link
          to="/admin"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="hidden sm:inline">{t("mravel_admin")}</span>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notification */}
          <button
            type="button"
            className="
              relative flex h-9 w-9 items-center justify-center rounded-xl
              text-slate-600 hover:bg-slate-100 transition
              dark:text-slate-300 dark:hover:bg-slate-800
            "
            title={t("notifications")}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <DarkModeToggle />
          <LanguageDropdown />

          {/* User dropdown */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserOpen((v) => !v)}
              className="
                flex items-center gap-2 rounded-xl px-2 py-1
                hover:bg-slate-100 dark:hover:bg-slate-800 transition
              "
              aria-haspopup="menu"
              aria-expanded={userOpen}
            >
              <img
                src="https://i.pravatar.cc/40?img=12"
                alt="Admin"
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700"
              />
              <span className="hidden md:block text-sm font-medium text-slate-800 dark:text-slate-200">
                {t("admin")}
              </span>
              <ChevronDownIcon className="hidden md:block h-4 w-4 text-slate-500" />
            </button>

            {userOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-56 z-50 overflow-hidden
                  rounded-2xl border border-slate-200 bg-white shadow-lg
                  dark:border-slate-800 dark:bg-slate-900
                "
                role="menu"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("admin")}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t("admin_panel")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserOpen(false);
                    handleLogout();
                  }}
                  className="
                    w-full flex items-center gap-2 px-3 py-2.5 text-sm
                    text-rose-600 hover:bg-rose-50
                    dark:text-rose-400 dark:hover:bg-slate-800
                    transition
                  "
                  role="menuitem"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
