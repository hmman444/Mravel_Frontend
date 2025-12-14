"use client";

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import SidebarPlans from "./SidebarPlans";
import ConfirmModal from "../../../components/ConfirmModal";

export default function PlanLayout({
  children,
  activePlanId = null,
  myPlans = [],
  recentPlans = [],
  onOpenPlanList,
  onOpenCalendar,
  onOpenPlanDashboard,
  onCopyPlan,
  onRemoveRecentPlan,

  onDeletePlan, // (plan) => Promise
}) {
  const [collapsed, setCollapsed] = useState(false);

  const [confirmDeletePlan, setConfirmDeletePlan] = useState(null);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950">
      <Navbar fixedWhite />

      <div className="flex pt-12 relative">
        <SidebarPlans
          collapsed={collapsed}
          activePlanId={activePlanId}
          myPlans={myPlans}
          recentPlans={recentPlans}
          onOpenPlanList={onOpenPlanList}
          onOpenCalendar={onOpenCalendar}
          onOpenPlanDashboard={onOpenPlanDashboard}
          onCopyPlan={onCopyPlan}
          onRemoveRecentPlan={onRemoveRecentPlan}

          onDeletePlan={(plan) => setConfirmDeletePlan(plan)}
        />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="fixed top-1/2 z-40 -translate-y-1/2
            h-9 w-9 flex items-center justify-center
            rounded-full border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-900
            shadow-md hover:shadow-lg hover:scale-105
            text-xs text-gray-600 dark:text-gray-200
            transition"
          style={{ left: collapsed ? "18px" : "262px" }}
        >
          {collapsed ? "❯" : "❮"}
        </button>

        <main
          className={`
            flex-1 min-h-[calc(100vh-4rem)]
            transition-all duration-300
            ${collapsed ? "ml-16" : "ml-64"}
            overflow-y-auto overflow-x-hidden p-6
          `}
        >
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg shadow-slate-200/70 dark:shadow-black/40 p-6 min-h-[calc(100vh-160px)]">
            {children}
          </div>
        </main>
      </div>

      {confirmDeletePlan && (
        <ConfirmModal
          open={true}
          title="Xoá lịch trình"
          message={`Xác nhận xoá "${confirmDeletePlan.title || "Chưa đặt tên"}"? Hành động này không thể hoàn tác.`}
          confirmText="Xoá"
          onClose={() => setConfirmDeletePlan(null)}
          onConfirm={async () => {
            try {
              console.log("Confirm delete:", confirmDeletePlan);
    console.log("onDeletePlan exists:", !!onDeletePlan);
              await onDeletePlan?.(confirmDeletePlan);
            } finally {
              setConfirmDeletePlan(null);
            }
          }}
        />
      )}
    </div>
  );
}
