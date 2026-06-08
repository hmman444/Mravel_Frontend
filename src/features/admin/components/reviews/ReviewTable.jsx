"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

function Stars({ value = 0 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={`h-4 w-4 ${s <= value ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
        {value}
      </span>
    </span>
  );
}

const publicLink = (targetType, slug) => {
  if (!slug) return null;
  if (targetType === "HOTEL") return `/hotels/${slug}`;
  if (targetType === "RESTAURANT") return `/restaurants/${slug}`;
  if (targetType === "PLACE") return `/place/${slug}`;
  return null;
};

const fmtDate = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
};

export default function ReviewTable({ items, acting = false, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3 w-[56px] text-center">#</th>
              <th className="px-4 py-3 w-[220px]">{t("admin.review_col_venue")}</th>
              <th className="px-4 py-3 w-[160px]">{t("admin.review_col_reviewer")}</th>
              <th className="px-4 py-3 w-[120px]">{t("admin.review_col_rating")}</th>
              <th className="px-4 py-3">{t("admin.review_col_content")}</th>
              <th className="px-4 py-3 w-[150px]">{t("admin.review_col_date")}</th>
              <th className="px-4 py-3 text-right w-[90px]">{t("admin.col_actions")}</th>
            </tr>
          </thead>

          <motion.tbody layout>
            <AnimatePresence initial={false}>
              {items.map((x, idx) => {
                const link = publicLink(x.targetType, x.targetSlug);
                return (
                  <motion.tr
                    key={x.id}
                    layout
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={{ duration: 0.16 }}
                    className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40 align-top"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex min-w-[28px] justify-center rounded-lg bg-slate-100 dark:bg-gray-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-200">
                        {idx + 1}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-slate-900 dark:text-white">
                          {x.targetName || t("admin.review_unknown_venue")}
                        </span>
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-500"
                            title={t("admin.review_open_public")}
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500" title={x.targetId}>
                        {x.targetType} • {x.targetId}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {x.userAvatar ? (
                          <img
                            src={x.userAvatar}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : null}
                        <span className="truncate text-slate-700 dark:text-slate-200">
                          {x.userFullname || t("admin.review_anonymous")}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Stars value={x.rating || 0} />
                    </td>

                    <td className="px-4 py-3">
                      {x.content ? (
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                          {x.content}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}

                      {Array.isArray(x.aspects) && x.aspects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {x.aspects.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex max-w-full items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900"
                              title={a.comment}
                            >
                              <span className="font-medium">{a.labelVi || a.labelEn || a.code}</span>
                              {a.comment ? (
                                <span className="truncate text-rose-600/80 dark:text-rose-300/80">
                                  : {a.comment}
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {fmtDate(x.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onDelete?.(x)}
                        disabled={acting}
                        className="rounded-lg p-2 hover:bg-rose-50 disabled:opacity-40 dark:hover:bg-slate-800"
                        title={t("common.delete")}
                      >
                        <TrashIcon className="h-5 w-5 text-rose-600" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
