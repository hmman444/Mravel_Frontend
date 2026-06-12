"use client";

// src/features/user/pages/HiddenPostsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { fetchHiddenPosts, unhidePost } from "../../planFeed/services/planService";

export default function HiddenPostsPage() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList((await fetchHiddenPosts()) || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || t("user.action_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const onUnhide = async (planId) => {
    setBusyId(planId);
    const prev = list;
    setList((l) => l.filter((p) => p.id !== planId));
    try {
      await unhidePost(planId);
    } catch (e) {
      setList(prev);
      setError(e?.response?.data?.message || e?.response?.data?.error || t("user.action_failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[60vh] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
          {t("user.hidden_posts_title", "Bài đã ẩn")}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {t("user.hidden_posts_desc", "Những bài bạn đã ẩn khỏi bảng tin. Bỏ ẩn để chúng xuất hiện trở lại.")}
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="p-8 text-center text-slate-400">{t("common.loading", "Đang tải...")}</div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <EyeSlashIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("user.hidden_posts_empty", "Bạn chưa ẩn bài viết nào.")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {list.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link to={`/plans/${p.id}`} className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {p.title || `Plan #${p.id}`}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {p.author?.name || ""}
                    </div>
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => onUnhide(p.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {t("user.unhide", "Bỏ ẩn")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
