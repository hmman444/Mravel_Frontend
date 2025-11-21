"use client";

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import SidebarPlans from "./SidebarPlans";

export default function PlanLayout({
  children,
  activePlanId = null,
  plans = [],
  onOpenPlanList,
  onOpenCalendar,
  onOpenPlanDashboard,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      <div className="flex pt-12 relative">

        {/* SIDEBAR */}
        <SidebarPlans
          collapsed={collapsed}
          activePlanId={activePlanId}
          plans={plans}
          onOpenPlanList={onOpenPlanList}
          onOpenCalendar={onOpenCalendar}
          onOpenPlanDashboard={onOpenPlanDashboard}
        />

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            fixed top-1/2 z-40 -translate-y-1/2
            h-9 w-9 flex items-center justify-center
            rounded-full border bg-white dark:bg-gray-800
            shadow hover:scale-105 transition
          "
          style={{ left: collapsed ? "20px" : "260px" }}
        >
          {collapsed ? "❯" : "❮"}
        </button>

        {/* MAIN CONTENT */}
        <main
          className={`
            flex-1 min-h-[calc(100vh-4rem)]
            transition-all duration-300
            ${collapsed ? "ml-16" : "ml-64"}
            overflow-y-auto p-6
            overflow-x-hidden
          `}
        >
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow p-6 min-h-[calc(100vh-160px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
