"use client";

import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MapIcon,
  Cog6ToothIcon,
  SparklesIcon,
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function AdminSidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = useMemo(
    () => [
      { to: "/admin", label: t("overview"), icon: HomeIcon },
      { to: "/admin/users", label: t("manage_users"), icon: UsersIcon },
      { to: "/admin/partners", label: t("manage_partners"), icon: BuildingOfficeIcon },
      { to: "/admin/services", label: t("manage_services"), icon: Cog6ToothIcon },
      { to: "/admin/locations", label: t("manage_locations"), icon: MapIcon },
      { to: "/admin/amenities", label: t("manage_amenities"), icon: SparklesIcon },
      { to: "/admin/reports", label: t("reports"), icon: FlagIcon },
    ],
    [t]
  );

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    return saved ? saved === "1" : false;
  });

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SIDEBAR_EXPANDED = 272;
  const SIDEBAR_COLLAPSED = 88;

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    document.documentElement.style.setProperty("--admin-sidebar-w", `${sidebarWidth}px`);
    return () => document.documentElement.style.removeProperty("--admin-sidebar-w");
  }, [sidebarWidth]);

  const isActivePath = (to) => {
    if (to === "/admin") return location.pathname === "/admin";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  // ✅ Dark-mode synced: border + glass background + blur
  const asideBase = [
    "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]",
    "border-r border-slate-200/70 dark:border-slate-800",
    "bg-white/85 dark:bg-slate-950/75",
    "backdrop-blur supports-[backdrop-filter]:bg-white/65 supports-[backdrop-filter]:dark:bg-slate-950/60",
  ].join(" ");

  const itemBase =
    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition";

  const itemIdle =
    "text-slate-700 hover:bg-slate-100/80 " +
    "dark:text-slate-200 dark:hover:bg-slate-800/60";

  const itemActive =
    "bg-gradient-to-r from-sky-500 to-blue-600 text-white " +
    "shadow-[0_10px_28px_rgba(37,99,235,0.28)]";

  const iconWrapIdle =
    "bg-slate-100 group-hover:bg-slate-200 " +
    "dark:bg-slate-900 dark:group-hover:bg-slate-800";

  const iconColorIdle = "text-slate-700 dark:text-slate-200";

  return (
    <>
      {/* Desktop */}
      <motion.aside
        className={`${asideBase} hidden lg:block`}
        style={{ width: sidebarWidth }}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <nav className="px-2 py-3">
          <div className="space-y-1">
            {menuItems.map((item, idx) => {
              const active = isActivePath(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={idx}
                  to={item.to}
                  className={[itemBase, active ? itemActive : itemIdle].join(" ")}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />
                  )}

                  {/* Icon */}
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-xl transition",
                      active ? "bg-white/15" : iconWrapIdle,
                    ].join(" ")}
                  >
                    <Icon className={["h-5 w-5", active ? "text-white" : iconColorIdle].join(" ")} />
                  </span>

                  {/* Label */}
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.16 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip when collapsed (dark-aware) */}
                  {collapsed && (
                    <span
                      className="
                        pointer-events-none absolute left-[88px] z-50 hidden whitespace-nowrap
                        rounded-xl px-3 py-1.5 text-xs shadow-lg group-hover:block
                        bg-slate-900 text-white
                        dark:bg-slate-800 dark:text-slate-100
                        border border-white/10 dark:border-white/5
                      "
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* subtle bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-950/70" />
      </motion.aside>

      {/* Toggle button (circle, not inside sidebar) - dark synced */}
      <motion.button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="
          hidden lg:flex fixed z-50 h-10 w-10 items-center justify-center rounded-full
          border border-slate-200/80 dark:border-slate-800
          bg-white/90 dark:bg-slate-900/80
          text-slate-600 dark:text-slate-200
          shadow-md hover:shadow-lg
          hover:bg-slate-50 dark:hover:bg-slate-800
          transition
        "
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: sidebarWidth,
        }}
        animate={{ left: sidebarWidth }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
      </motion.button>

      {/* Mobile open button - dark synced */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          lg:hidden fixed left-3 top-[4.5rem] z-50 rounded-xl px-3 py-2 text-sm
          border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50
          dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800
          transition
        "
      >
        Menu
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(e) => e.target === e.currentTarget && setMobileOpen(false)}
            />

            <motion.aside
              className={`${asideBase} lg:hidden`}
              style={{ width: 280 }}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <nav className="px-2 py-3">
                <div className="space-y-1">
                  {menuItems.map((item, idx) => {
                    const active = isActivePath(item.to);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={idx}
                        to={item.to}
                        className={[itemBase, active ? itemActive : itemIdle].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-xl transition",
                            active ? "bg-white/15" : iconWrapIdle,
                          ].join(" ")}
                        >
                          <Icon className={["h-5 w-5", active ? "text-white" : iconColorIdle].join(" ")} />
                        </span>

                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
