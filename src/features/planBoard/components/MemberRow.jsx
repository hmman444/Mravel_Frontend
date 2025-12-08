"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaUserMinus } from "react-icons/fa";

const ROLE_COLORS = {
  OWNER:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200",
  EDITOR:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
  VIEWER:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
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

export default function MemberRow({
  member,
  canManageMembers,
  planActualTotal,
  planBudgetPerPerson,
  onChangeRole,
  onAskRemove,
  roleLabels,
}) {
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [menuReady, setMenuReady] = useState(false);

  const [localRole, setLocalRole] = useState(member.role);

  // Sync khi BE trả về data mới
  useEffect(() => {
    setLocalRole(member.role);
  }, [member.role]);

  const isOwnerRow = localRole === "OWNER";

  // COST SUMMARY 
  const {
    percentOfPlan,
    budget,
    diffLabel,
    diffClass,
  } = useMemo(() => {
    const percent =
      planActualTotal > 0
        ? (member.shareActual * 100) / planActualTotal
        : null;

    const mbudget = member.memberBudget ?? planBudgetPerPerson ?? null;
    const mdiff =
      mbudget != null && member.shareActual != null
        ? member.shareActual - mbudget
        : null;

    const label =
      mdiff == null
        ? "—"
        : mdiff === 0
        ? "Đúng ngân sách"
        : mdiff > 0
        ? `Vượt ${formatCurrency(mdiff)}`
        : `Dư ${formatCurrency(Math.abs(mdiff))}`;

    const cls =
      mdiff == null || mdiff === 0
        ? "text-gray-700 dark:text-gray-200"
        : mdiff > 0
        ? "text-rose-500 dark:text-rose-300"
        : "text-emerald-600 dark:text-emerald-300";

    return {
      percentOfPlan: percent,
      budget: mbudget,
      diffLabel: label,
      diffClass: cls,
    };
  }, [member, planActualTotal, planBudgetPerPerson]);

  // DROPDOWN POSITION 
  useEffect(() => {
    if (menuOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const DROPDOWN_WIDTH = 200;
      const DROPDOWN_HEIGHT = 120;
      const GAP = 4;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = rect.bottom + GAP;
      const openUp = top + DROPDOWN_HEIGHT > viewportHeight - 8;
      if (openUp) {
        top = Math.max(8, rect.top - DROPDOWN_HEIGHT - GAP);
      }

      let left = rect.left - DROPDOWN_WIDTH + rect.width;
      if (left + DROPDOWN_WIDTH > viewportWidth - 8) {
        left = viewportWidth - DROPDOWN_WIDTH - 8;
      }
      if (left < 8) left = 8;

      setMenuPos({ top, left });
      requestAnimationFrame(() => setMenuReady(true));
    } else {
      setMenuReady(false);
    }
  }, [menuOpen]);

  // CLOSE WHEN CLICK OUTSIDE
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // ==== CHANGE ROLE ====
  const handleRoleChange = (newRole) => {
    if (!canManageMembers || isOwnerRow) return;

    setLocalRole(newRole);

    onChangeRole?.(member, newRole);

    setMenuOpen(false);
  };

  const handleRemoveClick = () => {
    if (!canManageMembers || isOwnerRow) return;
    onAskRemove?.(member);
    setMenuOpen(false);
  };

  // ==== DROPDOWN UI ====
  const dropdown =
    menuOpen && menuReady
      ? createPortal(
          <div
            className="
              fixed z-[99999]
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              w-52 rounded-xl shadow-lg
              origin-top-right
              animate-[fadeDown_0.16s_ease-out]
            "
            style={{ top: menuPos.top, left: menuPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => handleRoleChange("EDITOR")}
                disabled={isOwnerRow || !canManageMembers}
                className={`
                  w-full text-left px-3 py-1.5 text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${
                    localRole === "EDITOR"
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 dark:text-gray-200"
                  }
                  ${
                    isOwnerRow || !canManageMembers
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                Chỉnh sửa
              </button>

              <button
                onClick={() => handleRoleChange("VIEWER")}
                disabled={isOwnerRow || !canManageMembers}
                className={`
                  w-full text-left px-3 py-1.5 text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${
                    localRole === "VIEWER"
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 dark:text-gray-200"
                  }
                  ${
                    isOwnerRow || !canManageMembers
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                Chỉ xem
              </button>
            </div>

            {!isOwnerRow && canManageMembers && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={handleRemoveClick}
                  className="
                    w-full text-left px-3 py-1.5 text-sm
                    text-rose-600 hover:bg-rose-50/80 dark:hover:bg-gray-800
                    flex items-center gap-2 transition
                  "
                >
                  <FaUserMinus className="text-[10px]" />
                  Xoá khỏi kế hoạch
                </button>
              </>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={containerRef}
        className="
          rounded-2xl bg-white/80 dark:bg-gray-900/80 
          backdrop-blur-md border border-gray-100 dark:border-gray-800 
          px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 
          shadow-sm hover:shadow-md transition-all
        "
      >
        {/* LEFT SECTION — Avatar, name, email */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <img
            src={member.avatar}
            alt={member.fullname}
            className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
          />
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {member.fullname || member.email}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {member.email}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tham gia {member.activityCount ?? 0} hoạt động
            </p>
          </div>
        </div>

        {/* NEW COLUMN — Role Badge */}
        <div className="min-w-[120px] flex items-center justify-start md:justify-center">
          <span
            className={`
              inline-flex items-center gap-1 rounded-full px-2 py-1 
              text-[10px] font-semibold ${ROLE_COLORS[localRole]}
            `}
          >
            {roleLabels[localRole] || localRole}
          </span>
        </div>

        {/* COST COLUMN */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-[11px] md:min-w-[340px]">
          <div>
            <p className="text-gray-500 dark:text-gray-400">
              Phần chi của thành viên
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(member.shareActual)}
            </p>
            {percentOfPlan != null && (
              <p className="text-[10px] text-gray-400">
                {formatPercent(percentOfPlan)} chi phí plan
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400">
              Ngân sách dự kiến
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {budget != null ? formatCurrency(budget) : "—"}
            </p>
            <p className={`text-[10px] ${diffClass}`}>{diffLabel}</p>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="text-gray-500 dark:text-gray-400">
              Tỷ lệ so với nhóm
            </p>
            <div className="mt-1">
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  style={{
                    width: `${
                      percentOfPlan != null
                        ? Math.min(percentOfPlan, 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION COLUMN */}
        <div className="flex items-center mr-2 gap-2 md:flex-col md:items-end md:justify-center min-w-[120px]">
          {canManageMembers ? (
            <div ref={anchorRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                disabled={isOwnerRow}
                className={`
                  inline-flex items-center gap-1 rounded-full border 
                  text-[11px] px-2.5 py-1
                  ${
                    isOwnerRow
                      ? "border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-800"
                  }
                  transition-colors
                `}
              >
                <span>{roleLabels[localRole] || localRole}</span>
                <span
                  className={`text-[9px] transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {roleLabels[localRole] || localRole}
            </span>
          )}
        </div>
      </div>

      {dropdown}
    </>
  );
}
