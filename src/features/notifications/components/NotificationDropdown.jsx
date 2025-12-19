"use client";

import { useMemo } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({
  onClose,
  items = [],
  loading,
  saving,
  unreadCount,
  markAllRead,
  markRead,
}) {
    useNotifications();

  const topItems = useMemo(() => items.slice(0, 8), [items]);

  return (
    <div
    onClick={(e) => e.stopPropagation()}
      className="
        absolute right-0 mt-3 w-[360px] overflow-hidden
        rounded-2xl border border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900 shadow-2xl
        text-gray-900 dark:text-gray-100
        backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10
        z-[60]
      "
    >
      <div className="px-4 py-3 border-b border-gray-200/70 dark:border-gray-800/70 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm">Thông báo</p>
          <p className="text-xs text-gray-500">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : "Không có thông báo chưa đọc"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => markAllRead().catch(() => {})}
          disabled={saving || unreadCount === 0}
          className="
            inline-flex items-center gap-2 text-xs font-semibold
            px-3 py-1.5 rounded-xl
            bg-sky-50 text-sky-700 hover:bg-sky-100
            dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          "
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          Đọc tất cả
        </button>
      </div>

      <div className="max-h-[420px] overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải...
          </div>
        ) : topItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold">Chưa có thông báo</p>
            <p className="text-xs text-gray-500 mt-1">
              Khi có hoạt động mới, Mravel sẽ báo ngay tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topItems.map((n) => (
              <NotificationItem
                key={n?.id ?? n?.eventId}
                n={n}
                onRead={async () => {
                  await markRead(n.id).catch(() => {});
                }}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200/70 dark:border-gray-800/70">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            // TODO: navigate /notifications nếu bạn làm trang đó
          }}
          className="
            w-full text-sm font-semibold
            rounded-xl py-2
            bg-gray-50 hover:bg-gray-100
            dark:bg-slate-800 dark:hover:bg-slate-700
            transition
          "
        >
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
}
