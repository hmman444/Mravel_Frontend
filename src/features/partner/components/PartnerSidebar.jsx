"use client";

// src/features/partner/components/PartnerSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  LockClosedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function PartnerSidebar() {
  const location = useLocation();

  const menuItems = useMemo(
    () => [
      { to: "/partner/dashboard", label: "Tổng quan", icon: HomeIcon },
      { to: "/partner/services", label: "Dịch vụ của tôi", icon: BuildingStorefrontIcon },
      { to: "/partner/bookings", label: "Đơn đặt", icon: ClipboardDocumentListIcon },
    ],
    []
  );

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("partnerSidebarCollapsed");
    return saved ? saved === "1" : false;
  });

  useEffect(() => {
    localStorage.setItem("partnerSidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SIDEBAR_EXPANDED = 272;
  const SIDEBAR_COLLAPSED = 88;

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  // y chang admin: set CSS var để layout dùng
  useEffect(() => {
    document.documentElement.style.setProperty("--partner-sidebar-w", `${sidebarWidth}px`);
    return () => document.documentElement.style.removeProperty("--partner-sidebar-w");
  }, [sidebarWidth]);

  const isActivePath = (to) => {
    if (to === "/partner") return location.pathname === "/partner";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  // ====== Y CHANG ADMIN (classes giữ nguyên) ======
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
    "bg-gradient-to-r from-blue-500 to-blue-500 text-white " +
    "";

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
                    <Icon
                      className={[
                        "h-5 w-5",
                        active ? "text-white" : iconColorIdle,
                      ].join(" ")}
                    />
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
        {collapsed ? (
          <ChevronRightIcon className="h-5 w-5" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5" />
        )}
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
                          <Icon
                            className={[
                              "h-5 w-5",
                              active ? "text-white" : iconColorIdle,
                            ].join(" ")}
                          />
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
