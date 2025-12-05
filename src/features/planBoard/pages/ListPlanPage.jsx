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
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [hasBudgetOnly, setHasBudgetOnly] = useState(false);

  const formatMoney = (amount, currency) => {
    if (amount === null || amount === undefined) return "—";
    const cur = currency || "VND";
    try {
      return amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: cur,
      });
    } catch {
      return `${amount.toLocaleString("vi-VN")} ${cur}`;
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("vi-VN");
  };

  const statusClasses = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMPLETED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  const statusLabels = {
    DRAFT: "Bản nháp",
    ACTIVE: "Đang diễn ra",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  const roleLabels = {
    OWNER: "Chủ sở hữu",
    EDITOR: "Chỉnh sửa",
    VIEWER: "Chỉ xem",
  };

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (plans || [])
      .filter((p) => {
        if (!keyword) return true;
        const text = `${p.title || ""} ${p.description || ""}`.toLowerCase();
        return text.includes(keyword);
      })
      .filter((p) =>
        month
          ? new Date(p.startDate).getMonth() + 1 === Number(month)
          : true
      )
      .filter((p) =>
        year ? new Date(p.startDate).getFullYear() === Number(year) : true
      )
      .filter((p) =>
        statusFilter ? p.status === statusFilter : true
      )
      .filter((p) =>
        roleFilter ? p.myRole === roleFilter : true
      )
      .filter((p) =>
        hasBudgetOnly ? p.budgetTotal && p.budgetTotal > 0 : true
      )
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate) : new Date(0);
        const db = b.startDate ? new Date(b.startDate) : new Date(0);
        return sort === "asc" ? da - db : db - da;
      });
  }, [
    plans,
    search,
    month,
    year,
    sort,
    statusFilter,
    roleFilter,
    hasBudgetOnly,
  ]);

  const skeletons = Array.from({ length: 6 });

  return (
    <PlanLayout
      activePlanId={null}
      plans={plans}
      onOpenPlanList={() => navigate("/plans/my-plans")}
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
          label={
            statusFilter
              ? statusLabels[statusFilter] || "Trạng thái"
              : "Trạng thái"
          }
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Tất cả trạng thái", value: "" },
            { label: "Bản nháp", value: "DRAFT" },
            { label: "Đang diễn ra", value: "ACTIVE" },
            { label: "Hoàn thành", value: "COMPLETED" },
            { label: "Đã hủy", value: "CANCELLED" },
          ]}
        />

        <Dropdown
          label={roleFilter ? roleLabels[roleFilter] || "Vai trò" : "Vai trò"}
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { label: "Tất cả vai trò", value: "" },
            { label: "Chủ sở hữu", value: "OWNER" },
            { label: "Chỉnh sửa", value: "EDITOR" },
            { label: "Chỉ xem", value: "VIEWER" },
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

        <button
          type="button"
          onClick={() => setHasBudgetOnly((v) => !v)}
          className={`
            text-xs px-3 py-1.5 rounded-full
            border transition-all duration-200
            ${
              hasBudgetOnly
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/60"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            }
          `}
        >
          {hasBudgetOnly ? "Chỉ kế hoạch có ngân sách" : "Lọc kế hoạch có ngân sách"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 animate-opacityFade">
        {loading &&
          skeletons.map((_, i) => (
            <div
              key={i}
              className="
                h-[230px] rounded-2xl bg-gray-200/60 dark:bg-gray-700/60
                animate-pulse
              "
            />
          ))}

        {!loading &&
          filtered.map((p) => {
            const status = p.status;
            const currency = p.budgetCurrency || "VND";
            const budget = p.budgetTotal;
            const estimated = p.totalEstimatedCost;
            const actual = p.totalActualCost;

            const budgetUsage =
              budget && actual
                ? Math.min(100, Math.round((actual / budget) * 100))
                : null;

            const myRoleLabel = p.myRole ? roleLabels[p.myRole] || p.myRole : "";

            const days =
              p.startDate && p.endDate
                ? Math.round(
                    (new Date(p.endDate) - new Date(p.startDate)) /
                      (1000 * 60 * 60 * 24)
                  ) + 1
                : null;

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/plans/${p.id}`)}
                className="
                  group cursor-pointer rounded-2xl overflow-hidden
                  bg-white/90 dark:bg-gray-900/90 backdrop-blur
                  border border-gray-200 dark:border-gray-700
                  shadow-lg shadow-gray-200/60 dark:shadow-black/30
                  hover:shadow-xl hover:-translate-y-1 transition-all
                "
              >
                <div className="relative h-28 w-full overflow-hidden">
                  {p.thumbnail ? (
                    <>
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="h-full w-full object-cover transform  transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    </>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="absolute top-2 left-3 flex flex-col gap-1">
                    <span
                      className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                        bg-black/40 text-white backdrop-blur
                      `}
                    >
                      {statusLabels[status] || "Không xác định"}
                    </span>

                    {myRoleLabel && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/85 text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 backdrop-blur">
                        {myRoleLabel}
                      </span>
                    )}
                  </div>

                  {days && (
                    <span className="absolute bottom-2 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/50 text-white backdrop-blur">
                      {days} ngày
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                    {p.title}
                  </h2>

                  {p.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {p.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <FaCalendarAlt size={12} className="text-blue-500" />
                    <span className="truncate">
                      {formatDate(p.startDate)} → {formatDate(p.endDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                    <div>
                      <div className="uppercase tracking-wide text-[9px] text-gray-400 dark:text-gray-500">
                        Ngân sách
                      </div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                        {budget ? formatMoney(budget, currency) : "—"}
                      </div>
                    </div>

                    <div>
                      <div className="uppercase tracking-wide text-[9px] text-gray-400 dark:text-gray-500">
                        Ước tính
                      </div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                        {estimated ? formatMoney(estimated, currency) : "—"}
                      </div>
                    </div>

                    <div>
                      <div className="uppercase tracking-wide text-[9px] text-gray-400 dark:text-gray-500">
                        Thực tế
                      </div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {actual ? formatMoney(actual, currency) : "—"}
                      </div>
                    </div>
                  </div>

                  {budgetUsage !== null && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                        <span>Đã dùng {budgetUsage}% ngân sách</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="
                            h-full rounded-full bg-gradient-to-r
                            from-emerald-400 via-amber-400 to-red-500
                          "
                          style={{ width: `${budgetUsage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaUserCircle className="text-gray-400" />
                      <span className="truncate max-w-[140px]">
                        {p.owner || "Chưa rõ chủ sở hữu"}
                      </span>
                    </span>

                    <span>{p.members || 1} thành viên</span>
                  </div>
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
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-4px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown {
          animation: dropdown .18s ease-out;
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
    </div>
  );
}
