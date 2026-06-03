"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCheck, Loader2, Bell } from "lucide-react";

import { useNotifications } from "../hooks/useNotifications";
import NotificationItem from "../components/NotificationItem";

const CATEGORIES = [
  { key: "ALL", value: undefined },
  { key: "SOCIAL", value: "SOCIAL" },
  { key: "BOOKING", value: "BOOKING" },
  { key: "ACCOUNT", value: "ACCOUNT" },
  { key: "PARTNER", value: "PARTNER" },
  { key: "ADMIN", value: "ADMIN" },
];

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    items, loading, saving, unreadCount, hasMore,
    load, loadMore, markRead, markAllRead,
  } = useNotifications();

  const [cat, setCat] = useState("ALL");
  const activeValue = useMemo(
    () => CATEGORIES.find((c) => c.key === cat)?.value,
    [cat]
  );

  // Reload whenever the category filter changes.
  useEffect(() => {
    load({ category: activeValue }).catch(() => {});
  }, [activeValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid place-items-center w-9 h-9 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t("notification.title")}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? t("notification.unread_count", { n: unreadCount })
                : t("notification.no_unread")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => markAllRead().catch(() => {})}
            disabled={saving || unreadCount === 0}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl
                       bg-sky-50 text-sky-700 hover:bg-sky-100
                       dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            {t("notification.mark_all_read")}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border
                ${cat === c.key
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
            >
              {t(`notification.category.${c.key.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="p-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("common.loading")}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-semibold mt-3">{t("notification.empty")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("notification.empty_hint")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((n) => (
                <NotificationItem
                  key={n?.id ?? n?.eventId}
                  n={n}
                  onRead={async () => { await markRead(n.id).catch(() => {}); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load more */}
        {items.length > 0 && hasMore && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => loadMore({ category: activeValue }).catch(() => {})}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl
                         bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800
                         hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("notification.load_more")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
