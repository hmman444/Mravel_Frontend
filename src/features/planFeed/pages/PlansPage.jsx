import { useState } from "react";
import Navbar from "../../../components/Navbar";
import { mockPlans } from "../data/mockPlans";
import { FaFolderOpen, FaPlus } from "react-icons/fa";
import PlanDashboardPage from "./PlanDashboardPage";

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      {!selectedPlan ? (
        <div className="flex-1 mt-16 p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <FaFolderOpen /> Tất cả kế hoạch
            </h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primaryHover">
              <FaPlus /> Tạo kế hoạch mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-all"
              >
                <img
                  src={plan.images[0]}
                  className="rounded-lg h-40 w-full object-cover mb-3"
                  alt={plan.name}
                />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {plan.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-2 text-xs text-gray-400">
                  {plan.startDate} → {plan.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PlanDashboardPage plan={selectedPlan} goBack={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
