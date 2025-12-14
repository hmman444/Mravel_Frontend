"use client";

import {
  FaChevronDown,
  FaCalendarAlt,
  FaFolderOpen,
  FaListUl,
} from "react-icons/fa";
import { HiEllipsisVertical } from "react-icons/hi2";
import { useState } from "react";

export default function SidebarPlans({
  collapsed,
  activePlanId,
  myPlans = [],
  recentPlans = [],
  onOpenPlanList,
  onOpenCalendar,
  onOpenPlanDashboard,
  onCopyPlan,
  onRemoveRecentPlan,
  onDeletePlan,
}) {
  const [myOpen, setMyOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

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

          {/* MY PLANS (có dấu ...) */}
          <div className="mt-2">
            <div
              onClick={() => !collapsed && setMyOpen(!myOpen)}
              className="flex items-center justify-between
                px-3 py-2 rounded-lg
                bg-slate-100/80 dark:bg-gray-800
                hover:bg-slate-200/80 dark:hover:bg-gray-700
                cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaFolderOpen />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    Lịch trình của bạn
                    {myPlans?.length ? ` (${myPlans.length})` : ""}
                  </span>
                )}
              </div>
              {!collapsed && (
                <FaChevronDown
                  size={11}
                  className={`text-gray-500 transition-transform ${
                    myOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {myOpen && (
              <div className="mt-2 space-y-1">
                {(myPlans || []).length === 0 && !collapsed && (
                  <p className="px-3 py-2 text-xs text-gray-400">
                    Chưa có lịch trình nào của bạn.
                  </p>
                )}

                {(myPlans || []).map((plan) => (
                  <PlanRowMy
                    key={plan.id}
                    plan={plan}
                    collapsed={collapsed}
                    active={activeIdStr === String(plan.id)}
                    onOpenDashboard={() => onOpenPlanDashboard?.(plan)}
                    onCopyPlan={onCopyPlan}
                    onAskDeletePlan={onDeletePlan}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RECENT PLANS (có dấu ...) */}
          <div className="mt-2">
            <div
              onClick={() => !collapsed && setRecentOpen(!recentOpen)}
              className="flex items-center justify-between
                px-3 py-2 rounded-lg
                bg-slate-100/80 dark:bg-gray-800
                hover:bg-slate-200/80 dark:hover:bg-gray-700
                cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaFolderOpen />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    Xem gần đây
                    {recentPlans?.length ? ` (${recentPlans.length})` : ""}
                  </span>
                )}
              </div>
              {!collapsed && (
                <FaChevronDown
                  size={11}
                  className={`text-gray-500 transition-transform ${
                    recentOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {recentOpen && (
              <div className="mt-2 space-y-1">
                {(recentPlans || []).length === 0 && !collapsed && (
                  <p className="px-3 py-2 text-xs text-gray-400">
                    Chưa có lịch trình nào trong danh sách xem gần đây.
                  </p>
                )}

                {(recentPlans || []).map((plan) => (
                  <PlanRowRecent
                    key={plan.id}
                    plan={plan}
                    collapsed={collapsed}
                    active={activeIdStr === String(plan.id)}
                    onOpenDashboard={() => onOpenPlanDashboard?.(plan)}
                    onCopyPlan={onCopyPlan}
                    onRemoveRecentPlan={onRemoveRecentPlan}
                  />
                ))}
              </div>
            )}
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
        text-[13px] cursor-pointer
        text-slate-700 dark:text-gray-200
        hover:bg-slate-100 dark:hover:bg-gray-800
        transition-all"
    >
      <span className="text-gray-500 dark:text-gray-400 text-sm">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

// Row "Lịch trình của bạn" (có menu ...)
function PlanRowMy({ plan, active, collapsed, onOpenDashboard, onCopyPlan, onAskDeletePlan }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const title = plan.title || plan.name || "Chưa đặt tên";
  const role = plan.myRole || "";
  const canDelete = role === "OWNER";

  const roleLabelMap = {
    OWNER: "Chủ sở hữu",
    EDITOR: "Chỉnh sửa",
    VIEWER: "Chỉ xem",
  };
  const roleLabel = roleLabelMap[role] || role;

  const handleRowClick = () => {
    if (menuOpen) setMenuOpen(false);
    onOpenDashboard?.(plan);
  };

  return (
    <div className="relative">
      {/* Row container (KHÔNG dùng button bọc ngoài nữa) */}
      <div
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          text-left cursor-pointer group text-[13px]
          ${
            active
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/40"
              : "text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800"
          }
          transition-all
        `}
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleRowClick();
        }}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden">
          <FaFolderOpen
            className={
              active ? "text-white" : "text-gray-400 group-hover:text-blue-500"
            }
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

        {/* Nút ... là SIBLING (không lồng trong button nữa) */}
        {!collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={`
              ml-1 rounded-full p-1
              ${active ? "text-white/80" : "text-gray-400 hover:text-gray-700"}
              hover:bg-slate-200/70 dark:hover:bg-gray-700/70
              transition
            `}
            aria-label="Mở menu"
          >
            <HiEllipsisVertical size={16} />
          </button>
        )}
      </div>

      {menuOpen && !collapsed && (
        <PlanRowMenu position="above" onClickOutside={() => setMenuOpen(false)}>
          {onCopyPlan && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs
                text-gray-700 dark:text-gray-100
                hover:bg-slate-100 dark:hover:bg-gray-800"
              onClick={() => {
                onCopyPlan?.(plan);
                setMenuOpen(false);
              }}
            >
              Tạo bản sao
            </button>
          )}
          {canDelete && onAskDeletePlan && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => {
                onAskDeletePlan?.(plan);
                setMenuOpen(false);
              }}
            >
              Xoá lịch trình
            </button>
          )}
        </PlanRowMenu>
      )}
    </div>
  );
}

// Row "Xem gần đây"
function PlanRowRecent({
  plan,
  active,
  collapsed,
  onOpenDashboard,
  onCopyPlan,
  onRemoveRecentPlan,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = plan.title || plan.name || "Chưa đặt tên";

  const handleRowClick = () => {
    if (menuOpen) setMenuOpen(false);
    onOpenDashboard?.(plan);
  };

  return (
    <div className="relative">
      {/* ROW – dùng div thay vì button */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleRowClick();
        }}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          text-left cursor-pointer group text-[13px]
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
            className={
              active ? "text-white" : "text-gray-400 group-hover:text-blue-500"
            }
          />

          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm truncate">{title}</span>
            </div>
          )}
        </div>

        {/* nút ... là sibling, không còn lồng button */}
        {!collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={`
              ml-1 rounded-full p-1
              ${active ? "text-white/80" : "text-gray-400 hover:text-gray-700"}
              hover:bg-slate-200/70 dark:hover:bg-gray-700/70
              transition
            `}
            aria-label="Mở menu"
          >
            <HiEllipsisVertical size={16} />
          </button>
        )}
      </div>

      {menuOpen && !collapsed && (
        <PlanRowMenu position="above" onClickOutside={() => setMenuOpen(false)}>
          {onCopyPlan && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs
                text-gray-700 dark:text-gray-100
                hover:bg-slate-100 dark:hover:bg-gray-800"
              onClick={() => {
                onCopyPlan?.(plan);
                setMenuOpen(false);
              }}
            >
              Tạo bản sao
            </button>
          )}

          {onRemoveRecentPlan && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => {
                onRemoveRecentPlan?.(plan);
                setMenuOpen(false);
              }}
            >
              Xoá khỏi danh sách
            </button>
          )}
        </PlanRowMenu>
      )}
    </div>
  );
}


// Popup menu chung cho các row
function PlanRowMenu({ children, position = "above", onClickOutside }) {
  // position === "above" => hiển thị lên trên dòng
  const posClass =
    position === "above"
      ? "bottom-full mb-2 origin-bottom-right"
      : "top-full mt-2 origin-top-right";

  return (
    <div
      className={`absolute right-2 ${posClass} z-40`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-44 rounded-xl border border-slate-200/80 dark:border-gray-700
          bg-white dark:bg-gray-900
          shadow-xl shadow-slate-300/70 dark:shadow-black/70
          py-1 text-xs divide-y divide-slate-100/80 dark:divide-gray-800"
      >
        {children}
      </div>

      {/* click ra ngoài close menu nếu cần */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClickOutside}
      />
    </div>
  );
}
