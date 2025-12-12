"use client";

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import SidebarPlans from "./SidebarPlans";

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
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950">
      <Navbar fixedWhite />

      <div className="flex pt-12 relative">
        {/* SIDEBAR */}
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
        />

        {/* TOGGLE BUTTON */}
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

        {/* MAIN CONTENT */}
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
    </div>
  );
}
