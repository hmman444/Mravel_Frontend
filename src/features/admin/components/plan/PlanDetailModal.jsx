// src/features/admin/components/plan/PlanDetailModal.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { fetchAdminPlanDetail } from "../../services/adminPlanService";

const fmtNum = (n) => (Number(n) || 0).toLocaleString("vi-VN");

const fmtDate = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("vi-VN");
  } catch {
    return String(v);
  }
};

const fmtDateTime = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("vi-VN");
  } catch {
    return String(v);
  }
};

const VIS_BADGE = {
  PUBLIC: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  FRIENDS: "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900",
  PRIVATE: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};
const STATUS_BADGE = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  ACTIVE: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
};
const REPORT_BADGE = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
  REVIEWING: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
  DISMISSED: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const pill = "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold";

function Avatar({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name || ""}
        onError={() => setErr(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold dark:bg-slate-700 dark:text-slate-200"
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
        <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{value}</div>
      </div>
    </div>
  );
}

export default function PlanDetailModal({ planId, open, onClose, onRequestTakedown, onRequestRestore, busy }) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !planId) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setDetail(null);
    fetchAdminPlanDetail(planId)
      .then((d) => alive && setDetail(d))
      .catch((e) => alive && setError(e?.message || t("admin.error_generic")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, planId, t]);

  if (!open) return null;

  const d = detail;
  const locked = !!d?.adminLocked;
  const reports = d?.reports || [];
  const members = d?.members || [];
  const images = d?.images || [];
  const destinations = d?.destinations || [];

  const period =
    d?.startDate || d?.endDate
      ? `${fmtDate(d?.startDate)} → ${fmtDate(d?.endDate)}`
      : "—";

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-6 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {t("admin.plan_manage.detail_title")} {d?.id ? `#${d.id}` : ""}
            </div>
            <h2 className="mt-0.5 truncate text-xl font-bold text-slate-900 dark:text-white">
              {loading ? t("admin.plan_manage.loading") : d?.title || "—"}
            </h2>
            {d && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {d.visibility && (
                  <span className={`${pill} ${VIS_BADGE[d.visibility] || VIS_BADGE.PRIVATE}`}>
                    {t(`enum.visibility.${d.visibility.toLowerCase()}`, d.visibility)}
                  </span>
                )}
                {d.status && (
                  <span className={`${pill} ${STATUS_BADGE[d.status] || STATUS_BADGE.DRAFT}`}>
                    {t(`enum.plan_status.${d.status.toLowerCase()}`, d.status)}
                  </span>
                )}
                {locked && (
                  <span className={`${pill} border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}>
                    <NoSymbolIcon className="h-3.5 w-3.5" />
                    {t("admin.plan_manage.locked_badge")}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          {loading && (
            <div className="py-10 text-center text-slate-400">{t("admin.plan_manage.loading")}</div>
          )}
          {error && !loading && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          )}

          {d && !loading && (
            <>
              {/* Takedown banner */}
              {locked && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/30">
                  <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <div className="text-rose-700 dark:text-rose-200">
                    <div className="font-semibold">{t("admin.plan_manage.detail_locked_banner")}</div>
                    {d.takedownReason && (
                      <div className="mt-0.5">{t("admin.plan_manage.detail_locked_reason", { reason: d.takedownReason })}</div>
                    )}
                    {d.takedownAt && (
                      <div className="mt-0.5 text-xs text-rose-500 dark:text-rose-300">{fmtDateTime(d.takedownAt)}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar src={d.authorAvatar} name={d.authorName} size={44} />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">{t("admin.plan_manage.detail_author")}</div>
                  <div className="truncate font-semibold text-slate-900 dark:text-white">
                    {d.authorName || `#${d.authorId}`}
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <MetaItem icon={CalendarDaysIcon} label={t("admin.plan_manage.detail_created")} value={fmtDate(d.createdAt)} />
                <MetaItem icon={CalendarDaysIcon} label={t("admin.plan_manage.detail_period")} value={period} />
                <MetaItem icon={CalendarDaysIcon} label={t("admin.plan_manage.detail_days")} value={d.days ? t("admin.plan_manage.days_unit", { n: d.days }) : "—"} />
                <MetaItem icon={EyeIcon} label={t("admin.plan_manage.detail_views")} value={fmtNum(d.views)} />
                <MetaItem icon={HeartIcon} label={t("admin.plan_manage.detail_reactions")} value={fmtNum(d.reactions)} />
                <MetaItem icon={ChatBubbleLeftRightIcon} label={t("admin.plan_manage.detail_comments")} value={fmtNum(d.comments)} />
              </div>

              {/* Budget */}
              {(d.budgetTotal || d.budgetPerPerson) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{t("admin.plan_manage.detail_budget")}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
                    {d.budgetTotal != null && (
                      <span>{t("admin.plan_manage.detail_budget_total")}: <b>{fmtNum(d.budgetTotal)} {d.budgetCurrency || "VND"}</b></span>
                    )}
                    {d.budgetPerPerson != null && (
                      <span>{t("admin.plan_manage.detail_budget_per_person")}: <b>{fmtNum(d.budgetPerPerson)} {d.budgetCurrency || "VND"}</b></span>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {d.description && (
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{t("admin.plan_manage.detail_description")}</div>
                  <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{d.description}</p>
                </div>
              )}

              {/* Destinations */}
              {destinations.length > 0 && (
                <div>
                  <div className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-400">{t("admin.plan_manage.detail_destinations")}</div>
                  <div className="flex flex-wrap gap-2">
                    {destinations.map((name, i) => (
                      <span key={i} className={`${pill} border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200`}>
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div>
                  <div className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-400">{t("admin.plan_manage.detail_images")}</div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.slice(0, 8).map((url, i) => (
                      <img key={i} src={url} alt="" className="h-20 w-full rounded-lg object-cover" loading="lazy" />
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <UsersIcon className="h-3.5 w-3.5" /> {t("admin.plan_manage.detail_members")} ({members.length})
                </div>
                {members.length === 0 ? (
                  <div className="text-sm text-slate-400">{t("admin.plan_manage.detail_no_members")}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div key={m.userId} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 dark:border-slate-700 dark:bg-slate-800">
                        <Avatar src={m.avatar} name={m.name} size={24} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{m.name || `#${m.userId}`}</span>
                        {m.role && <span className="text-[10px] uppercase text-slate-400">{m.role}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <FlagIcon className="h-3.5 w-3.5" /> {t("admin.plan_manage.detail_reports", { n: reports.length })}
                </div>
                {reports.length === 0 ? (
                  <div className="text-sm text-slate-400">{t("admin.plan_manage.detail_no_reports")}</div>
                ) : (
                  <div className="space-y-2">
                    {reports.map((r) => (
                      <div key={r.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`${pill} border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900`}>
                            {t(`enum.report_reason.${String(r.reason).toLowerCase()}`, r.reason)}
                          </span>
                          <span className={`${pill} ${REPORT_BADGE[r.status] || REPORT_BADGE.PENDING}`}>
                            {t(`admin.plan_manage.report_status.${String(r.status).toLowerCase()}`, r.status)}
                          </span>
                          <span className="text-xs text-slate-400">{fmtDateTime(r.createdAt)}</span>
                        </div>
                        {r.detail && <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{r.detail}</p>}
                        <div className="mt-1 text-xs text-slate-400">
                          {t("admin.plan_manage.report_by", { name: r.reporterName || `#${r.reporterId}` })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <a
            href={`/plans/${planId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            {t("admin.plan_manage.detail_open_board")}
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("common.close", "Đóng")}
            </button>
            {d && !loading && (
              locked ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRequestRestore?.(d)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:opacity-50"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  {t("admin.plan_manage.restore")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRequestTakedown?.(d)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:opacity-50"
                >
                  <NoSymbolIcon className="h-4 w-4" />
                  {t("admin.plan_manage.takedown")}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
