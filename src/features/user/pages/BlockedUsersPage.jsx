"use client";

// src/features/user/pages/BlockedUsersPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { getBlockedUsers, unblockUser } from "../services/blockService";
import ConfirmModal from "../../../components/ConfirmModal";

export default function BlockedUsersPage() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await getBlockedUsers());
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doUnblock = async () => {
    const id = confirmUser?.id;
    if (!id) return;
    setBusyId(id);
    setConfirmUser(null);
    const prev = list;
    setList((l) => l.filter((u) => u.id !== id)); // optimistic
    try {
      await unblockUser(id);
    } catch (e) {
      setList(prev); // revert
      setError(e?.message || "Error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[60vh] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
          {t("user.blocked_users_title", "Người đã chặn")}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {t("user.blocked_users_desc", "Quản lý danh sách người bạn đã chặn. Bỏ chặn để họ có thể thấy bạn trở lại.")}
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
              <NoSymbolIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("user.blocked_users_empty", "Bạn chưa chặn ai cả.")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {list.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar || "/default-avatar.png"}
                      alt={u.fullname}
                      className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                    />
                    <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {u.fullname}
                    </span>
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => setConfirmUser(u)}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {t("user.unblock", "Bỏ chặn")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ConfirmModal
          open={!!confirmUser}
          title={t("user.unblock", "Bỏ chặn")}
          message={t("user.unblock_confirm", "Bỏ chặn người này? Họ sẽ có thể tìm thấy và nhắn tin cho bạn trở lại.")}
          confirmText={t("user.unblock", "Bỏ chặn")}
          onConfirm={doUnblock}
          onClose={() => setConfirmUser(null)}
        />
      </div>
    </div>
  );
}
