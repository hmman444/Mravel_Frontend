"use client";

import {
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
  FaFolderOpen,
  FaListUl,
} from "react-icons/fa";
import { useState } from "react";

export default function SidebarPlans({
  collapsed,
  activePlanId,
  plans = [],
  onOpenPlanList,
  onOpenCalendar,
  onOpenPlanDashboard,
}) {
  const [sectionOpen, setSectionOpen] = useState(true);

  const activeIdStr =
    activePlanId !== null && activePlanId !== undefined
      ? String(activePlanId)
      : null;

  return (
    <aside
      className={`
        fixed top-16 left-0 z-30
        h-[calc(100vh-64px)]
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
        border-r border-slate-200/80 dark:border-gray-800
        shadow-xl shadow-slate-200/60 dark:shadow-black/40
        transition-all duration-300 ease-out overflow-hidden
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="h-full flex flex-col">
        {/* BRAND / HEADER */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-200/80 dark:border-gray-800 bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              M
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Mravel Plans
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Quản lý chuyến đi của bạn
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-3 overflow-y-auto sidebar-scroll space-y-4">
          {/* NAV GROUP */}
          <div>
            {!collapsed && (
              <p className="px-1 mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">
                Tổng quan
              </p>
            )}

            <SidebarItem
              icon={<FaListUl />}
              label="Danh sách lịch trình"
              collapsed={collapsed}
              onClick={onOpenPlanList}
            />

            <SidebarItem
              icon={<FaCalendarAlt />}
              label="Lịch tổng quan"
              collapsed={collapsed}
              onClick={onOpenCalendar}
            />
          </div>

          {/* YOUR PLANS */}
          <div className="mt-2">
            <div
              onClick={() => !collapsed && setSectionOpen(!sectionOpen)}
              className={`
                flex items-center justify-between
                px-3 py-2 rounded-lg
                bg-slate-100/80 dark:bg-gray-800
                hover:bg-slate-200/80 dark:hover:bg-gray-700
                cursor-pointer transition-all
              `}
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaFolderOpen />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    Lịch trình của bạn
                    {plans?.length ? ` (${plans.length})` : ""}
                  </span>
                )}
              </div>

              {!collapsed && (
                <FaChevronDown
                  size={11}
                  className={`text-gray-500 transition-transform ${
                    sectionOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {/* PLANS LIST */}
            <div
              className={`
                transition-all duration-300 overflow-hidden
                ${sectionOpen ? "max-h-[640px] mt-2" : "max-h-0"}
              `}
            >
              {(plans || []).length === 0 && !collapsed && (
                <p className="px-3 py-2 text-xs text-gray-400">
                  Chưa có lịch trình nào. Hãy tạo mới từ màn hình chính.
                </p>
              )}

              {(plans || []).map((plan) => (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  collapsed={collapsed}
                  active={activeIdStr === String(plan.id)}
                  onOpenDashboard={() => onOpenPlanDashboard(plan)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full flex items-center gap-3 px-3 py-2 rounded-lg
        text-[13px] cursor-pointer
        text-slate-700 dark:text-gray-200
        hover:bg-slate-100 dark:hover:bg-gray-800
        transition-all
      "
    >
      <span className="text-gray-500 dark:text-gray-400 text-sm">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function PlanRow({ plan, active, collapsed, onOpenDashboard }) {
  const title = plan.title || plan.name || "Chưa đặt tên";
  const role = plan.myRole || "";
  const roleLabelMap = {
    OWNER: "Chủ sở hữu",
    EDITOR: "Chỉnh sửa",
    VIEWER: "Chỉ xem",
  };
  const roleLabel = roleLabelMap[role] || role;

  return (
    <button
      type="button"
      onClick={onOpenDashboard}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-lg
        text-left cursor-pointer group
        text-[13px]
        ${
          active
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/40"
            : "text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
    >
      <div className="flex items-center gap-2 w-full overflow-hidden">
        <FaFolderOpen
          className={active ? "text-white" : "text-gray-400 group-hover:text-blue-500"}
        />

        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm truncate">{title}</span>

            {role && (
              <span
                className={`
                  text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded
                  ${
                    role === "OWNER"
                      ? "bg-amber-100 text-amber-700"
                      : role === "EDITOR"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  }
                  ${active ? "bg-white/20 text-white" : ""}
                `}
              >
                {roleLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <FaChevronRight
          size={11}
          className={`
            ${active ? "text-white/80" : "text-gray-400"}
            opacity-0 group-hover:opacity-100
            transition-opacity
          `}
        />
      )}
    </button>
  );
}
