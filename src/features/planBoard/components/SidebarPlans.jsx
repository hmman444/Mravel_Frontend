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

  return (
    <aside
      className={`
        fixed top-16 left-0 z-30
        h-[calc(100vh-64px)]
        bg-white/90 dark:bg-gray-900/90 backdrop-blur
        border-r shadow-lg shadow-gray-200/40 dark:shadow-black/20
        transition-all duration-300 overflow-hidden
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="h-full flex flex-col p-3 overflow-y-auto sidebar-scroll">

        {/* NAV ITEMS */}
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

        {/* YOUR PLANS HEADER */}
        <div className="mt-4">
          <div
            onClick={() => !collapsed && setSectionOpen(!sectionOpen)}
            className="
              flex items-center justify-between px-3 py-2 rounded-lg
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              cursor-pointer transition-all
            "
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaFolderOpen />
              {!collapsed && <span>Lịch trình của bạn</span>}
            </div>

            {!collapsed && (
              <FaChevronDown
                size={12}
                className={`transition-transform ${
                  sectionOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>

          {/* PLANS LIST */}
          <div
            className={`
              transition-all overflow-hidden
              ${sectionOpen ? "max-h-[500px] mt-2" : "max-h-0"}
            `}
          >
            {plans.map((plan) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                collapsed={collapsed}
                active={String(activePlanId) === String(plan.id)}
                onOpenDashboard={() => onOpenPlanDashboard(plan)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, collapsed, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        text-gray-700 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-800
        transition-all
      "
    >
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

function PlanRow({ plan, active, collapsed, onOpenDashboard }) {
  return (
    <div
      onClick={onOpenDashboard}
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
        transition-all group
        ${
          active
            ? "bg-blue-600 text-white shadow"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }
      `}
    >
      <div className="flex items-center gap-2 w-full overflow-hidden">

        <FaFolderOpen
          className={active ? "text-white" : "text-gray-400"}
        />

        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm truncate">{plan.name}</span>

            {/* ROLE TAG */}
            <span
              className={`
                text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded
                ${
                  plan.myRole === "OWNER"
                    ? "bg-yellow-200 text-yellow-700"
                    : plan.myRole === "EDITOR"
                    ? "bg-indigo-200 text-indigo-700"
                    : "bg-gray-200 text-gray-700"
                }
              `}
            >
              {plan.myRole}
            </span>
          </div>
        )}
      </div>

      {!collapsed && (
        <FaChevronRight size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
      )}
    </div>
  );
}
