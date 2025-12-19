import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell({ solid, onOpen }) {
  const {
    dropdownOpen,
    toggle,
    close,
    unreadCount,
    load,
    loading,
    items,
    saving,
    markAllRead,
    markRead,
  } = useNotifications();

  const wrapRef = useRef(null);

  // ✅ dùng CLICK, KHÔNG dùng mousedown
  useEffect(() => {
    if (!dropdownOpen) return;

    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        close();
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [dropdownOpen, close]);

  useEffect(() => {
    if (dropdownOpen && !loading) load().catch(() => {});
  }, [dropdownOpen, load, loading]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();   // ⭐ FIX QUAN TRỌNG NHẤT
          onOpen?.();
          toggle();
        }}
        className={`
          relative grid place-items-center w-10 h-10 rounded-full
          hover:bg-gray-100 dark:hover:bg-gray-800 transition
          ${solid ? "" : "bg-white/10 hover:bg-white/15"}
        `}
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

      {dropdownOpen && (
        <NotificationDropdown
          onClose={close}
          items={items}
          loading={loading}
          saving={saving}
          unreadCount={unreadCount}
          markAllRead={markAllRead}
          markRead={markRead}
        />
      )}
    </div>
  );
}
