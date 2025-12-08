// src/features/planBoard/components/PlanMembers.jsx
"use client";

import { useMemo, useState } from "react";
import {
  FaUser,
  FaUsers,
  FaMoneyBillWave,
  FaChartPie,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

import { usePlanBoard } from "../hooks/usePlanBoard";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ConfirmModal from "../../../components/ConfirmModal";
import MemberRow from "./MemberRow";
import { showSuccess } from "../../../utils/toastUtils";

const ROLE_LABELS = {
  OWNER: "Chủ sở hữu",
  EDITOR: "Chỉnh sửa",
  VIEWER: "Xem",
};

function formatCurrency(amount) {
  if (amount == null) return "—";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

export default function PlanMembers({ planId }) {
  const {
    board,
    memberCostSummary,
    planMembers,
    loading,
    actionLoading,
    error,
    canManageMembers,
    updateMemberRole,
    removeMember,
  } = usePlanBoard(planId);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [confirmMember, setConfirmMember] = useState(null);

  // members data
  const members = planMembers || [];

  const planBudgetTotal =
    memberCostSummary?.budgetTotal ?? board?.budgetTotal ?? null;

  const planBudgetPerPersonRaw =
    memberCostSummary?.budgetPerPerson ?? board?.budgetPerPerson ?? null;

  const planActualTotal =
    memberCostSummary?.totalActualCost ?? board?.totalActualCost ?? null;

  const totalMembersFromBoard = members.length || 0;

  const planBudgetPerPerson =
    planBudgetPerPersonRaw ??
    (planBudgetTotal != null && totalMembersFromBoard > 0
      ? Math.round(planBudgetTotal / totalMembersFromBoard)
      : null);

  // ===== Tính stats =====
  const {
    totalMembers,
    ownerCount,
    editorCount,
    viewerCount,
    totalShareActual,
    shareVsPlanPercent,
    usedBudgetPercent,
    avgSharePerMember,
  } = useMemo(() => {
    const total = members.length;
    const owner = members.filter((m) => m.role === "OWNER").length;
    const editor = members.filter((m) => m.role === "EDITOR").length;
    const viewer = members.filter((m) => m.role === "VIEWER").length;

    const totalShare = members.reduce(
      (acc, m) => acc + (m.shareActual || 0),
      0
    );

    const planActual = planActualTotal || 0;
    const planBudget = planBudgetTotal || 0;

    const sharePercent =
      planActual > 0 ? (totalShare * 100) / planActual : null;

    const usedBudget =
      planBudget > 0 ? (planActual * 100) / planBudget : null;

    const avgShare = total > 0 ? Math.round(totalShare / total) : 0;

    return {
      totalMembers: total,
      ownerCount: owner,
      editorCount: editor,
      viewerCount: viewer,
      totalShareActual: totalShare,
      shareVsPlanPercent: sharePercent,
      usedBudgetPercent: usedBudget,
      avgSharePerMember: avgShare,
    };
  }, [members, planActualTotal, planBudgetTotal]);

  // filtered members
  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let list = members.filter((m) => {
      const matchRole = roleFilter === "ALL" ? true : m.role === roleFilter;

      const fullname = (m.fullname || "").toLowerCase();
      const email = (m.email || "").toLowerCase();

      const matchSearch =
        !keyword || fullname.includes(keyword) || email.includes(keyword);

      return matchRole && matchSearch;
    });

    // OWNER trước, rồi EDITOR, rồi VIEWER
    const rank = {
      OWNER: 1,
      EDITOR: 2,
      VIEWER: 3,
    };

    list = list.sort((a, b) => {
      return rank[a.role] - rank[b.role];
    });

    return list;
  }, [members, search, roleFilter]);

  // handlers
  const handleChangeRole = async (member, newRole) => {
    if (!canManageMembers) return;
    if (member.role === "OWNER") return; 

    await updateMemberRole(member.userId, newRole);
    showSuccess("Đã cập nhật vai trò thành viên");
  };

  const handleAskRemove = (member) => {
    if (!canManageMembers) return;
    if (member.role === "OWNER") return;
    setConfirmMember(member);
  };

  const handleConfirmRemove = async () => {
    if (!confirmMember) return;
    await removeMember(confirmMember.userId);
    showSuccess("Đã xoá thành viên khỏi kế hoạch");
    setConfirmMember(null);
  };

  return (
    <div className="relative p-4 md:p-6 space-y-6">
      <LoadingOverlay
        open={loading}
        message="Đang tải dữ liệu..."
      />

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Thành viên & chi phí
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Thống kê phần chi phí được gán cho từng thành viên trong kế hoạch.
          </p>
          {error && (
            <p className="text-xs text-rose-500 mt-1">{error}</p>
          )}
        </div>

        {canManageMembers && (
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Chỉ chủ sở hữu có thể đổi quyền / xoá thành viên.
          </div>
        )}
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tổng thành viên */}
        <div
          className="
            rounded-2xl bg-white/80 dark:bg-gray-900/70 
            backdrop-blur-md border border-gray-100/70 dark:border-gray-800 
            px-4 py-3 flex items-center gap-3 shadow-sm
          "
        >
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
            <FaUsers className="text-blue-500 text-sm" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Số thành viên
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {totalMembers}
            </p>
            <p className="text-[11px] text-gray-400">
              {ownerCount} chủ • {editorCount} editor • {viewerCount} viewer
            </p>
          </div>
        </div>

        {/* Ngân sách & thực chi */}
        <div
          className="
            rounded-2xl bg-white/80 dark:bg-gray-900/70 
            backdrop-blur-md border border-gray-100/70 dark:border-gray-800 
            px-4 py-3 flex items-center gap-3 shadow-sm
          "
        >
          <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
            <FaMoneyBillWave className="text-emerald-500 text-sm" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Ngân sách & thực chi
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-300">
              Ngân sách:{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(planBudgetTotal)}
              </span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-300">
              Thực chi:{" "}
              <span className="font-semibold text-sky-600 dark:text-sky-300">
                {formatCurrency(planActualTotal)}
              </span>{" "}
              {usedBudgetPercent != null && (
                <span className="text-[10px] text-gray-400">
                  ({formatPercent(usedBudgetPercent)} ngân sách)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Trung bình mỗi người */}
        <div
          className="
            rounded-2xl bg-white/80 dark:bg-gray-900/70 
            backdrop-blur-md border border-gray-100/70 dark:border-gray-800 
            px-4 py-3 flex items-center gap-3 shadow-sm
          "
        >
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
            <FaUser className="text-indigo-500 text-sm" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Chi trung bình / người
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(avgSharePerMember)}
            </p>
            <p className="text-[11px] text-gray-400">
              Ngân sách / người: {formatCurrency(planBudgetPerPerson)}
            </p>
          </div>
        </div>

        {/* Phần của thành viên so với plan */}
        <div
          className="
            rounded-2xl bg-gradient-to-r from-indigo-500/90 via-blue-500/90 to-sky-500/90 
            text-white px-4 py-3 flex items-center gap-3 shadow-md shadow-indigo-500/40
          "
        >
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <FaChartPie className="text-sm" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-white/80">
              Chi phí gán cho thành viên
            </p>
            <p className="text-sm font-semibold truncate">
              {formatCurrency(totalShareActual)}
            </p>
            {shareVsPlanPercent != null && (
              <p className="text-[11px] text-white/80">
                ~ {formatPercent(shareVsPlanPercent)} chi phí của cả plan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-1">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="
                w-full pl-9 pr-3 py-2 text-xs rounded-full
                bg-white/80 dark:bg-gray-900/80
                border border-gray-200 dark:border-gray-800
                text-gray-800 dark:text-gray-100
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent
              "
            />
          </div>
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="hidden sm:inline-flex items-center text-gray-500 dark:text-gray-400">
            <FaFilter className="mr-1 text-xs" />
            Lọc theo quyền:
          </span>
          <div className="inline-flex rounded-full bg-gray-100/80 dark:bg-gray-800/80 p-1">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "OWNER", label: "Owner" },
              { key: "EDITOR", label: "Editor" },
              { key: "VIEWER", label: "Viewer" },
            ].map((r) => {
              const active = roleFilter === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRoleFilter(r.key)}
                  className={`
                    px-3 py-1 rounded-full text-[11px] font-medium transition-all
                    ${
                      active
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/60"
                    }
                  `}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MEMBERS LIST */}
      <div className="mt-2 space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300/70 dark:border-gray-700/70 rounded-2xl">
            Không tìm thấy thành viên phù hợp.
          </div>
        ) : (
          filteredMembers.map((m) => (
            <MemberRow
              key={m.userId}
              member={m}
              canManageMembers={canManageMembers}
              planActualTotal={planActualTotal}
              planBudgetPerPerson={planBudgetPerPerson}
              onChangeRole={handleChangeRole}
              onAskRemove={handleAskRemove}
              roleLabels={ROLE_LABELS}
            />
          ))
        )}
      </div>

      {/* CONFIRM REMOVE MODAL */}
      {confirmMember && (
        <ConfirmModal
          open
          title="Xoá thành viên"
          message={`Xoá ${confirmMember.fullname || confirmMember.email} khỏi kế hoạch?`}
          confirmText="Xoá"
          onClose={() => setConfirmMember(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}
