// ExtraCostsSection.jsx
"use client";

import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { inputBase, sectionCard } from "./activityStyles";

export default function ExtraCostsSection({
  extraCosts,
  addExtraCost,
  updateExtraCost,
  removeExtraCost,
  extraTypes,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const getTypeLabel = (value) => {
    if (!value) return "Loại chi phí";
    const found = extraTypes.find((t) => t.value === value);
    return found ? found.label : "Loại chi phí";
  };

  const handleSelectType = (rowIndex, value) => {
    updateExtraCost(rowIndex, "type", value);
    setOpenIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Chi phí phát sinh
        </span>
        <button
          onClick={addExtraCost}
          type="button"
          className="flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-300 hover:text-sky-500"
        >
          <FaPlus size={9} />
          Thêm phát sinh
        </button>
      </div>

      {/* KHUNG CHÍNH – 1 lớp card duy nhất */}
      <div className={sectionCard + " space-y-2"}>
        {extraCosts.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chưa có chi phí phát sinh nào.
          </p>
        )}

        <div className="space-y-2">
          {extraCosts.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              {/* Lý do */}
              <input
                className={`${inputBase} col-span-4 text-xs`}
                placeholder="Lý do (ví dụ: phí cầu đường)"
                value={c.reason}
                onChange={(e) => updateExtraCost(i, "reason", e.target.value)}
              />

              {/* Dropdown loại chi phí – kiểu giống ShareModal */}
              <div className="col-span-3 relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                  className={`
                    w-full px-3 py-2 rounded-xl text-xs font-medium
                    bg-white/80 dark:bg-slate-900/80
                    border border-slate-300 dark:border-slate-700
                    shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800
                    flex items-center justify-between
                  `}
                >
                  <span className="truncate text-left">
                    {getTypeLabel(c.type)}
                  </span>
                  <span
                    className={`text-[9px] ml-2 transition-transform ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openIndex === i && (
                  <div
                    className="
                      absolute z-[9999] right-0 mt-1 w-full
                      bg-white dark:bg-slate-900
                      border border-slate-200 dark:border-slate-700
                      rounded-xl shadow-lg overflow-hidden
                      animate-[fadeDown_0.16s_ease-out]
                    "
                  >
                    {extraTypes.map((t, idx) => {
                      const isActive = c.type === t.value;
                      const isFirst = idx === 0;
                      const isLast = idx === extraTypes.length - 1;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => handleSelectType(i, t.value)}
                          className={`
                            w-full text-left px-3 py-2 text-xs
                            hover:bg-slate-100 dark:hover:bg-slate-800
                            ${isFirst ? "rounded-t-xl" : ""}
                            ${isLast ? "rounded-b-xl" : ""}
                            ${
                              isActive
                                ? "text-sky-600 font-semibold"
                                : "text-slate-700 dark:text-slate-200"
                            }
                          `}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Số tiền */}
              <div className="col-span-4 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  className={`${inputBase} flex-1 text-xs`}
                  placeholder="Số tiền"
                  value={c.actualAmount}
                  onChange={(e) =>
                    updateExtraCost(i, "actualAmount", e.target.value)
                  }
                />
                <span className="text-[11px] text-slate-500">đ</span>
              </div>

              {/* Xóa */}
              <button
                onClick={() => removeExtraCost(i)}
                type="button"
                className="col-span-1 flex justify-end text-slate-400 hover:text-rose-500 transition"
              >
                <FaTrashAlt size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
