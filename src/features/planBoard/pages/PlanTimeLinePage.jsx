"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaCopy, FaMinus } from "react-icons/fa";

import PlanLayout from "../components/PlanLayout";
import NewPlanModal from "../../planFeed/components/NewPlanModal";
import ConfirmModal from "../../../components/ConfirmModal";

import { useMyPlans } from "../hooks/useMyPlans";
import { useRecentPlans } from "../hooks/useRecentPlans";
import { showSuccess, showError } from "../../../utils/toastUtils";
import {
  deletePlan as deletePlanApi,
  copyPlan as copyPlanApi,
} from "../services/planBoardService";

// ================== helpers ==================
const pad2 = (n) => String(n).padStart(2, "0");

function parseDateSmart(input) {
  if (!input) return null;
  if (input instanceof Date) return input;

  if (typeof input === "string") {
    const s = input.trim();

    // dd/MM/yyyy
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      const yyyy = Number(m[3]);
      const d = new Date(yyyy, mm - 1, dd);
      if (!Number.isNaN(d.getTime())) return d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

const startOfDay = (date) => {
  const x = new Date(date);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (date, days) => {
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
};

const diffDays = (a, b) => {
  const A = startOfDay(a).getTime();
  const B = startOfDay(b).getTime();
  return Math.round((B - A) / (1000 * 60 * 60 * 24));
};

const fmtDay = (d) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
const fmtVN = (d) =>
  d ? parseDateSmart(d)?.toLocaleDateString("vi-VN") || "" : "";

const roleLabels = {
  OWNER: "Chủ sở hữu",
  EDITOR: "Chỉnh sửa",
  VIEWER: "Chỉ xem",
};

const statusLabels = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

//  sidebar muốn Hoàn thành + Đã hủy lên trên cùng
const STATUS_ORDER = ["COMPLETED", "CANCELLED", "ACTIVE", "DRAFT"];

// pastel nền nhẹ, không trong suốt
const statusCardStyle = {
  DRAFT:
    "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-500/15 dark:border-indigo-400/25 dark:text-indigo-100",
  ACTIVE:
    "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/15 dark:border-blue-400/25 dark:text-blue-100",
  COMPLETED:
    "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-400/25 dark:text-emerald-100",
  CANCELLED:
    "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/15 dark:border-rose-400/25 dark:text-rose-100",
};

//  pill highlight theo status
const statusPillStyle = {
  DRAFT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-100",
  ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-100",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-100",
};

export default function PlanTimeLinePage() {
  const navigate = useNavigate();

  const [openNewPlan, setOpenNewPlan] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(null);

  //  filter theo status khi click bên trái
  const [statusFilter, setStatusFilter] = useState(""); // "" | ACTIVE | DRAFT | COMPLETED | CANCELLED

  const { plans: myPlans, loading, reload: reloadMyPlans } = useMyPlans(true);
  const { recentPlans, reloadRecent, removeRecent } = useRecentPlans();

  // px/day
  const [dayWidth, setDayWidth] = useState(78);
  const clampDayWidth = (v) => Math.max(30, Math.min(140, v));

  // normalize + parse date
  const normalizedPlansAll = useMemo(() => {
    return (myPlans || [])
      .map((p) => {
        const s = parseDateSmart(p.startDate);
        const e = parseDateSmart(p.endDate);
        return {
          ...p,
          _start: s ? startOfDay(s) : null,
          _end: e ? startOfDay(e) : null,
        };
      })
      .filter((p) => p._start && p._end);
  }, [myPlans]);

  //  apply status filter cho cả trang
  const normalizedPlans = useMemo(() => {
    if (!statusFilter) return normalizedPlansAll;
    return normalizedPlansAll.filter((p) => (p.status || "DRAFT") === statusFilter);
  }, [normalizedPlansAll, statusFilter]);

  // range = min start -> max end (theo filtered)
  const range = useMemo(() => {
    if (!normalizedPlans.length) return { start: null, end: null };

    let min = normalizedPlans[0]._start;
    let max = normalizedPlans[0]._end;

    for (const p of normalizedPlans) {
      if (p._start < min) min = p._start;
      if (p._end > max) max = p._end;
    }
    return { start: min, end: max };
  }, [normalizedPlans]);

  const days = useMemo(() => {
    if (!range.start || !range.end) return [];
    const total = Math.max(1, diffDays(range.start, range.end) + 1);
    return Array.from({ length: total }).map((_, i) => addDays(range.start, i));
  }, [range]);

  const totalWidth = days.length * dayWidth;

  const isToday = (d) => diffDays(startOfDay(d), startOfDay(new Date())) === 0;

  const grouped = useMemo(() => {
    const by = new Map();
    for (const st of STATUS_ORDER) by.set(st, []);
    for (const p of normalizedPlans) {
      const st = p.status || "DRAFT";
      if (!by.has(st)) by.set(st, []);
      by.get(st).push(p);
    }
    for (const [k, list] of by.entries()) list.sort((a, b) => a._start - b._start);
    return by;
  }, [normalizedPlans]);

  // sidebar actions
  const handleCopyFromSidebar = async (plan) => {
    try {
      const copied = await copyPlanApi(plan.id);
      if (copied?.id) {
        showSuccess("Đã tạo bản sao lịch trình");
        await reloadMyPlans?.();
        await reloadRecent?.();
        navigate(`/plans/${copied.id}`);
      } else {
        showError("Không thể tạo bản sao lịch trình");
      }
    } catch (e) {
      console.error(e);
      showError("Không thể tạo bản sao lịch trình");
    }
  };

  const handleDeletePlan = async (plan) => {
    try {
      await deletePlanApi(plan.id);
      showSuccess("Đã xoá lịch trình");
      await reloadMyPlans?.();
      await reloadRecent?.();
    } catch (e) {
      console.error(e);
      showError("Không thể xoá lịch trình");
    }
  };

  const handleRemoveRecentFromSidebar = async (plan) => {
    try {
      await removeRecent(plan.id);
    } catch (e) {
      console.error(e);
    }
  };

  const leftW = 360;

  const toggleStatusFilter = (st) => {
    setStatusFilter((cur) => (cur === st ? "" : st));
  };

  return (
    <PlanLayout
      activePlanId={null}
      myPlans={myPlans}
      recentPlans={recentPlans}
      onOpenPlanList={() => navigate("/plans/my-plans")}
      onOpenCalendar={() => navigate("/plans/timeline")}
      onOpenPlanDashboard={(p) => navigate(`/plans/${p.id}`)}
      onCopyPlan={handleCopyFromSidebar}
      onRemoveRecentPlan={handleRemoveRecentFromSidebar}
      onDeletePlan={(p) => setConfirmDeletePlan(p)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Timeline lịch trình
          </h1>
          <p className="text-xs text-gray-500">
            Cột kế hoạch cố định • phần lịch cuộn ngang • cuộn dọc theo trang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 backdrop-blur px-2 py-1">
            <button
              type="button"
              title="Thu nhỏ"
              onClick={() => setDayWidth((v) => clampDayWidth(v - 6))}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 grid place-items-center"
            >
              <FaMinus className="text-[12px]" />
            </button>
            <div className="text-xs text-gray-600 dark:text-gray-300 px-1 min-w-[70px] text-center">
              {dayWidth}px/ngày
            </div>
            <button
              type="button"
              title="Phóng to"
              onClick={() => setDayWidth((v) => clampDayWidth(v + 6))}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 grid place-items-center"
            >
              +
            </button>
          </div>

          <button
            onClick={() => setOpenNewPlan(true)}
            className="
              flex items-center gap-2 
              px-4 py-2 rounded-full text-sm font-medium
              bg-gradient-to-r from-blue-500 to-indigo-500 
              text-white shadow-md shadow-blue-500/30
              hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40
              transition-all
            "
          >
            <FaPlus size={12} /> Tạo kế hoạch
          </button>
        </div>
      </div>

      {/* Main box */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/60 dark:shadow-black/30 overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `${leftW}px 1fr` }}>
          {/* LEFT column */}
          <div className="border-r border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Kế hoạch
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {(normalizedPlansAll?.length || 0)} plan
                    {statusFilter ? ` • lọc: ${statusLabels[statusFilter] || statusFilter}` : ""} •{" "}
                    {range.start ? fmtDay(range.start) : "--/--"} →{" "}
                    {range.end ? fmtDay(range.end) : "--/--"}
                  </div>
                </div>

                {statusFilter && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("")}
                    className="text-[11px] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    title="Bỏ lọc"
                  >
                    Bỏ lọc
                  </button>
                )}
              </div>

              {/*  thanh filter status (click để lọc + sáng) */}
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_ORDER.map((st) => {
                  const count = (normalizedPlansAll || []).filter(
                    (p) => (p.status || "DRAFT") === st
                  ).length;

                  const active = statusFilter === st;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleStatusFilter(st)}
                      className={`
                        inline-flex items-center gap-2
                        px-3 py-1 rounded-full text-xs font-semibold
                        border transition-all
                        ${active ? "ring-2 ring-blue-500/40 border-blue-300 dark:border-blue-400/40" : "border-transparent"}
                        ${statusPillStyle[st] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}
                        hover:brightness-[0.98] dark:hover:brightness-110
                      `}
                      title={active ? "Bấm để bỏ lọc" : "Bấm để lọc"}
                    >
                      <span>{statusLabels[st] || st}</span>
                      <span className="text-[11px] font-normal opacity-80">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                Đang tải...
              </div>
            )}

            {!loading && !normalizedPlans.length && (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                {statusFilter
                  ? "Không có lịch trình nào thuộc trạng thái đang lọc."
                  : "Chưa có lịch trình nào để hiển thị."}
              </div>
            )}

            {!loading &&
              normalizedPlans.length > 0 &&
              STATUS_ORDER.map((st) => {
                const list = grouped.get(st) || [];
                if (!list.length) return null;

                return (
                  <div
                    key={st}
                    className="border-b border-gray-200 dark:border-gray-800"
                  >

                    {list.map((p) => {
                      const canDelete = p.myRole === "OWNER";
                      const roleVN = roleLabels[p.myRole] || p.myRole || "";
                      const statusVN = statusLabels[p.status] || p.status || "Bản nháp";

                      return (
                        <div
                            key={p.id}
                            className="
                                relative px-4 py-4 border-t border-gray-100 dark:border-gray-800/70
                                hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors
                            "
                            >
                            <div
                                className={`
                                absolute bottom-3 right-4
                                inline-flex items-center
                                px-2.5 py-1 rounded-full text-[11px] font-semibold
                                border
                                ${statusCardStyle[p.status] || statusCardStyle.DRAFT}
                                `}
                                title={statusVN}
                            >
                                {statusVN}
                            </div>

                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 pr-20">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                        {p.title || "Không có tiêu đề"}
                                    </div>

                                    <div className="text-[11px] text-gray-500 mt-1">
                                        {fmtVN(p.startDate)} → {fmtVN(p.endDate)}
                                    </div>

                                    <div className="text-[11px] text-gray-500 mt-1 truncate">
                                        {p.owner || "Chưa rõ chủ sở hữu"} • {p.members || 1} thành viên
                                    </div>

                                    {!!roleVN && (
                                        <div className="mt-2 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                        {roleVN}
                                        </div>
                                    )}
                                </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Sao chép"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCopyFromSidebar(p);
                                }}
                                className="
                                  h-9 w-9 rounded-full
                                  bg-white dark:bg-gray-900
                                  border border-gray-200 dark:border-gray-700
                                  text-gray-700 dark:text-gray-200
                                  hover:scale-105 transition-all
                                "
                              >
                                <FaCopy className="mx-auto text-[13px]" />
                              </button>

                              <button
                                type="button"
                                title={
                                  canDelete ? "Xoá lịch trình" : "Chỉ chủ sở hữu được xoá"
                                }
                                disabled={!canDelete}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setConfirmDeletePlan(p);
                                }}
                                className={`
                                  h-9 w-9 rounded-full border transition-all
                                  ${
                                    canDelete
                                      ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:scale-105"
                                      : "bg-gray-100 dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 text-gray-400 cursor-not-allowed"
                                  }
                                `}
                              >
                                <FaTrash className="mx-auto text-[13px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>

          {/* RIGHT timeline */}
          <div className="overflow-x-auto">
            <div style={{ width: `${totalWidth}px` }}>
              <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="flex h-[52px]">
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className={`border-l border-gray-200 dark:border-gray-800 px-2 py-3 text-xs ${
                        isToday(d) ? "bg-blue-50 dark:bg-blue-500/10" : ""
                      }`}
                      style={{ width: `${dayWidth}px` }}
                    >
                      <div
                        className={`font-medium ${
                          isToday(d)
                            ? "text-blue-600 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {fmtDay(d)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {!loading &&
                  normalizedPlans.length > 0 &&
                  STATUS_ORDER.map((st) => {
                    const list = grouped.get(st) || [];
                    if (!list.length) return null;

                    return (
                      <div key={st}>
                        <div className="h-[44px] relative">
                          <div className="absolute inset-0 flex pointer-events-none">
                            {days.map((d, i) => (
                              <div
                                key={i}
                                className={`h-full border-l border-gray-200/60 dark:border-gray-800/70 ${
                                  isToday(d) ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
                                }`}
                                style={{ width: `${dayWidth}px` }}
                              />
                            ))}
                          </div>
                        </div>

                        {list.map((p) => {
                          const startIdx = diffDays(range.start, p._start);
                          const endIdx = diffDays(range.start, p._end);
                          const duration = Math.max(1, endIdx - startIdx + 1);

                          const rawLeft = startIdx * dayWidth;
                          const rawWidth = duration * dayWidth;

                          const innerPad = 10;
                          const leftPx = rawLeft + innerPad;
                          const widthPx = Math.max(18, rawWidth - innerPad * 2);

                          const roleVN = roleLabels[p.myRole] || p.myRole || "";
                          const statusVN = statusLabels[p.status] || p.status || "Bản nháp";

                          const tiny = widthPx < 180;
                          const showDates = widthPx >= 320;

                          return (
                            <div key={p.id} className="h-[92px] relative">
                              <div className="absolute inset-0 flex pointer-events-none">
                                {days.map((d, i) => (
                                  <div
                                    key={i}
                                    className={`h-full border-l border-gray-200/60 dark:border-gray-800/70 ${
                                      isToday(d) ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
                                    }`}
                                    style={{ width: `${dayWidth}px` }}
                                  />
                                ))}
                              </div>

                              <div
                                onClick={() => navigate(`/plans/${p.id}`)}
                                className={`
                                  absolute top-6
                                  cursor-pointer select-none
                                  rounded-xl border
                                  ${statusCardStyle[p.status] || statusCardStyle.DRAFT}
                                  shadow-sm hover:shadow
                                  px-3 py-2
                                  transition-all
                                `}
                                style={{
                                  left: `${leftPx}px`,
                                  width: `${widthPx}px`,
                                }}
                                title={`${p.title || ""} • ${statusVN} • ${roleVN} • ${fmtVN(
                                  p.startDate
                                )} → ${fmtVN(p.endDate)}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate leading-5">
                                      {p.title || "Không có tiêu đề"}
                                    </div>

                                    <div className="text-[11px] opacity-90 truncate leading-4">
                                      {statusVN}
                                      {roleVN ? ` • ${roleVN}` : ""}
                                    </div>

                                    {showDates && (
                                      <div className="text-[11px] opacity-80 truncate leading-4">
                                        {fmtVN(p.startDate)} → {fmtVN(p.endDate)}
                                      </div>
                                    )}
                                  </div>

                                  {!tiny && (
                                    <div className="text-xs font-semibold opacity-80 shrink-0">
                                      {duration}d
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewPlanModal
        open={openNewPlan}
        onClose={() => setOpenNewPlan(false)}
        onCreated={() => {
          setOpenNewPlan(false);
          reloadMyPlans?.();
          reloadRecent?.();
        }}
      />

      {confirmDeletePlan && (
        <ConfirmModal
          open={true}
          title="Xoá lịch trình"
          message={`Xác nhận xoá "${confirmDeletePlan.title}"? Hành động này không thể hoàn tác.`}
          confirmText="Xoá"
          onClose={() => setConfirmDeletePlan(null)}
          onConfirm={async () => {
            const plan = confirmDeletePlan;
            setConfirmDeletePlan(null);
            await handleDeletePlan(plan);
          }}
        />
      )}
    </PlanLayout>
  );
}
