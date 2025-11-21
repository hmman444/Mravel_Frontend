"use client";

import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaUserCircle,
  FaCalendarAlt,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import PlanLayout from "../components/PlanLayout";
import { useState, useMemo } from "react";
import NewPlanModal from "../../planFeed/components/NewPlanModal";
import { useMyPlans } from "../hooks/useMyPlans";

export default function ListPlanPage() {
  const navigate = useNavigate();
  const [openNewPlan, setOpenNewPlan] = useState(false);

  const { plans, loading, reload } = useMyPlans(true);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("asc");

  const formatCost = (c) =>
    (c || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("vi-VN");
  };

  const statusClasses = {
    DRAFT: "bg-gray-100 text-gray-600",
    ACTIVE: "bg-blue-100 text-blue-600",
    COMPLETED: "bg-emerald-100 text-emerald-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  const statusLabels = {
    DRAFT: "Bản nháp",
    ACTIVE: "Đang diễn ra",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  const filtered = useMemo(() => {
    return (plans || [])
      .filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) =>
        month
          ? new Date(p.startDate).getMonth() + 1 === Number(month)
          : true
      )
      .filter((p) =>
        year
          ? new Date(p.startDate).getFullYear() === Number(year)
          : true
      )
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate) : new Date(0);
        const db = b.startDate ? new Date(b.startDate) : new Date(0);
        return sort === "asc" ? da - db : db - da;
      });
  }, [plans, search, month, year, sort]);

  const skeletons = Array.from({ length: 6 });

  return (
    <PlanLayout
      activePlanId={null}
      plans={plans}
      onOpenPlanList={() => navigate("/my-plans")}
      onOpenCalendar={() => navigate("/plans/calendar")}
      onOpenPlanDashboard={(p) => navigate(`/plans/${p.id}`)}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Danh sách lịch trình
        </h1>

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

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* SEARCH */}
        <div
          className="
            flex items-center gap-2 px-4 py-2 
            bg-white/80 dark:bg-gray-800/80 backdrop-blur
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-sm
            text-sm w-full sm:w-64
            transition-all
          "
        >
          <FaSearch className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kế hoạch..."
            className="bg-transparent focus:outline-none flex-1"
          />
        </div>

        <Dropdown
          label={month ? `Tháng ${month}` : "Tháng"}
          value={month}
          onChange={setMonth}
          options={[
            { label: "Tất cả tháng", value: "" },
            ...Array.from({ length: 12 }).map((_, i) => ({
              label: `Tháng ${i + 1}`,
              value: i + 1,
            })),
          ]}
        />

        <Dropdown
          label={year ? `Năm ${year}` : "Năm"}
          value={year}
          onChange={setYear}
          options={[
            { label: "Tất cả năm", value: "" },
            { label: "2024", value: 2024 },
            { label: "2025", value: 2025 },
            { label: "2026", value: 2026 },
          ]}
        />

        <Dropdown
          label={sort === "asc" ? "Ngày tăng dần" : "Ngày giảm dần"}
          value={sort}
          onChange={setSort}
          options={[
            { label: "Ngày tăng dần", value: "asc" },
            { label: "Ngày giảm dần", value: "desc" },
          ]}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-opacityFade">
        {loading &&
          skeletons.map((_, i) => (
            <div
              key={i}
              className="
                h-[180px] rounded-2xl bg-gray-200/60 dark:bg-gray-700/60
                animate-pulse
              "
            />
          ))}

        {!loading &&
          filtered.map((p) => {
            const status = p.status;

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/plans/${p.id}`)}
                className="
                  group cursor-pointer rounded-2xl p-5
                  bg-white/90 dark:bg-gray-900/90 backdrop-blur
                  border border-gray-200 dark:border-gray-700
                  shadow-lg shadow-gray-200/60 dark:shadow-black/30
                  hover:shadow-xl hover:-translate-y-1 transition-all
                "
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h2>

                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${statusClasses[status] || "bg-gray-100 text-gray-600"}
                    `}
                  >
                    {statusLabels[status] || "Không xác định"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {p.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaCalendarAlt size={13} className="text-blue-500" />
                  <span>
                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Chủ sở hữu: <span className="font-medium">{p.owner}</span>
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Chi phí dự kiến:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatCost(p.cost)}
                  </span>
                </p>

                <div className="mt-3 flex items-center -space-x-2">
                  {Array.from({ length: p.members || 0 }).map((_, i) => (
                    <span
                      key={i}
                      className="
                        flex items-center justify-center
                        h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800
                        border-2 border-white dark:border-gray-900
                        text-gray-500 shadow-inner
                      "
                    >
                      <FaUserCircle size={18} />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

        {!loading && (
          <div
            onClick={() => setOpenNewPlan(true)}
            className="
              flex flex-col items-center justify-center
              rounded-2xl border-2 border-dashed
              border-gray-300 dark:border-gray-600
              text-gray-500 dark:text-gray-400
              p-5 cursor-pointer hover:border-blue-500
              hover:text-blue-500 dark:hover:text-blue-400
              hover:-translate-y-1 hover:shadow-lg
              transition-all
            "
          >
            <FaPlus size={22} />
            <span className="mt-2 text-sm">Tạo kế hoạch mới</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes opacityFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-opacityFade {
          animation: opacityFade .25s ease-out;
        }
      `}</style>

      <NewPlanModal
        open={openNewPlan}
        onClose={() => setOpenNewPlan(false)}
        onCreated={() => {
          setOpenNewPlan(false);
          reload();
        }}
      />
    </PlanLayout>
  );
}

function Dropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 px-3 py-2 
          bg-white/80 dark:bg-gray-800/80 backdrop-blur
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-sm
          text-gray-700 dark:text-gray-300
          hover:bg-white dark:hover:bg-gray-700
          transition-all duration-200
        "
      >
        <span className="whitespace-nowrap">{label}</span>

        <FaChevronDown
          size={12}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute mt-2 z-20 
            bg-white/95 dark:bg-gray-900/95 backdrop-blur
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl shadow-gray-300/40 dark:shadow-black/30
            py-1 animate-dropdown
            min-w-max
          "
        >
          {options.map((opt) => (
            <div
              key={opt.label}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="
                px-4 py-2 cursor-pointer
                hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300
                whitespace-nowrap
              "
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-4px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown {
          animation: dropdown .18s ease-out;
        }
      `}</style>
    </div>
  );
}
