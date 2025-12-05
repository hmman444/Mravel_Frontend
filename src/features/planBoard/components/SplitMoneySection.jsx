// SplitMoneySection.jsx
"use client";

import { useState } from "react";
import { inputBase, pillBtn, sectionCard } from "./activityStyles";

export default function SplitMoneySection({
  planMembers,
  splitEnabled,
  setSplitEnabled,
  splitType,
  setSplitType,
  participantCount,
  handleParticipantCount,
  splitNames,
  setSplitNames,
  exactAmounts,
  setExactAmounts,
  payerChoice,
  setPayerChoice,
  payerExternalName,
  setPayerExternalName,
  parsedParticipants,
  parsedActual,
  evenShare,
  evenRemainder,
  totalExact,
}) {
  const [payerOpen, setPayerOpen] = useState(false);

  const getPayerLabel = () => {
    if (!payerChoice) return "Không chọn";

    if (payerChoice === "external") {
      return "Người ngoài (nhập tên)";
    }

    if (payerChoice.startsWith("member:")) {
      const id = Number(payerChoice.split(":")[1]);
      const m = planMembers.find((x) => x.userId === id);
      return m ? m.displayName || m.name || m.userId : "Thành viên";
    }

    return "Không chọn";
  };

  const handleSelectPayer = (value) => {
    setPayerChoice(value);
    if (value !== "external") {
      setPayerExternalName("");
    }
    setPayerOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Chia tiền
        </span>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">
            {splitEnabled ? "Đang chia" : "Không chia"}
          </span>
          <button
            type="button"
            onClick={() => setSplitEnabled((v) => !v)}
            className={`relative w-10 h-5 rounded-full transition-all ${
              splitEnabled
                ? "bg-emerald-500"
                : "bg-slate-400/80 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute w-4 h-4 top-[2px] bg-white rounded-full shadow transition-all ${
                splitEnabled ? "right-[2px]" : "left-[2px]"
              }`}
            />
          </button>
        </div>
      </div>

      <div className={sectionCard}>
        {!splitEnabled && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bật chia tiền để tính số tiền mỗi người cần trả.
          </p>
        )}

        {splitEnabled && (
          <div className="mt-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Người trả chính (tuỳ chọn)
                </label>

                {/* Dropdown custom giống ShareModal */}
                <button
                  type="button"
                  onClick={() => setPayerOpen((o) => !o)}
                  className={`
                    w-full mt-1 px-3 py-2 rounded-xl text-xs font-medium
                    bg-white/80 dark:bg-slate-900/80
                    border border-slate-300 dark:border-slate-700
                    shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800
                    flex items-center justify-between
                  `}
                >
                  <span className="truncate text-left">{getPayerLabel()}</span>
                  <span
                    className={`text-[9px] ml-2 transition-transform ${
                      payerOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {payerOpen && (
                  <div
                    className="
                      absolute z-[9999] left-0 right-0 mt-1
                      bg-white dark:bg-slate-900
                      border border-slate-200 dark:border-slate-700
                      rounded-xl shadow-lg overflow-hidden
                      animate-[fadeDown_0.16s_ease-out]
                    "
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectPayer("")}
                      className="
                        w-full text-left px-3 py-2 text-xs
                        hover:bg-slate-100 dark:hover:bg-slate-800
                      "
                    >
                      Không chọn
                    </button>

                    {planMembers.map((m, idx) => {
                      const value = `member:${m.userId}`;
                      const label = m.displayName || m.name || m.userId;
                      const isActive = payerChoice === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelectPayer(value)}
                          className={`
                            w-full text-left px-3 py-2 text-xs
                            hover:bg-slate-100 dark:hover:bg-slate-800
                            ${isActive ? "text-sky-600 font-semibold" : ""}
                            ${idx === 0 ? "" : "border-t border-slate-100/70 dark:border-slate-800/70"}
                          `}
                        >
                          {label}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleSelectPayer("external")}
                      className={`
                        w-full text-left px-3 py-2 text-xs
                        hover:bg-slate-100 dark:hover:bg-slate-800
                        border-t border-slate-100/70 dark:border-slate-800/70
                        ${
                          payerChoice === "external"
                            ? "text-sky-600 font-semibold"
                            : ""
                        }
                      `}
                    >
                      Người ngoài (nhập tên)
                    </button>
                  </div>
                )}
              </div>

              {payerChoice === "external" && (
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tên người trả
                  </label>
                  <input
                    className={`${inputBase} w-full mt-1`}
                    placeholder="VD: Anh tài xế, bạn A..."
                    value={payerExternalName}
                    onChange={(e) => setPayerExternalName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Số người tham gia{" "}
                  <span className="text-red-500 align-middle">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={participantCount}
                  onChange={(e) => handleParticipantCount(e.target.value)}
                  className={`${inputBase} w-full mt-1`}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Cách chia
                </label>
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setSplitType("EVEN")}
                    className={`${pillBtn} ${
                      splitType === "EVEN"
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30"
                        : "bg-white/80 border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Chia đều
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType("EXACT")}
                    className={`${pillBtn} ${
                      splitType === "EXACT"
                        ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
                        : "bg-white/80 border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Nhập từng người
                  </button>
                </div>
              </div>
            </div>

            {splitType === "EVEN" && (
              <div className="space-y-2">
                {Array.from({ length: parsedParticipants }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-slate-600 dark:text-slate-300">
                      Người {idx + 1}
                    </span>
                    <input
                      value={splitNames[idx] || ""}
                      onChange={(e) =>
                        setSplitNames((prev) => {
                          const arr = [...prev];
                          arr[idx] = e.target.value;
                          return arr;
                        })
                      }
                      placeholder="Tên hiển thị"
                      className={`${inputBase} flex-1`}
                    />
                  </div>
                ))}

                {parsedActual > 0 && (
                  <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                    Tổng chi:{" "}
                    <b>{parsedActual.toLocaleString("vi-VN")}đ</b>
                    <br />
                    Mỗi người:{" "}
                    <b>{evenShare?.toLocaleString("vi-VN")}đ</b>
                    {evenRemainder
                      ? ` (+1đ cho ${evenRemainder} người đầu)`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {splitType === "EXACT" && (
              <div className="space-y-2">
                {Array.from({ length: parsedParticipants }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={splitNames[idx] || ""}
                      onChange={(e) =>
                        setSplitNames((prev) => {
                          const arr = [...prev];
                          arr[idx] = e.target.value;
                          return arr;
                        })
                      }
                      placeholder={`Tên người ${idx + 1}`}
                      className={`${inputBase} flex-[1.1]`}
                    />

                    <input
                      type="number"
                      min="0"
                      value={exactAmounts[idx] || ""}
                      onChange={(e) =>
                        setExactAmounts((prev) => {
                          const arr = [...prev];
                          arr[idx] = e.target.value;
                          return arr;
                        })
                      }
                      className={`${inputBase} flex-[0.9]`}
                      placeholder="Số tiền"
                    />

                    <span className="text-xs text-slate-500">đ</span>
                  </div>
                ))}

                <p className="text-[11px] mt-1">
                  Tổng đã nhập:{" "}
                  <b
                    className={
                      totalExact === parsedActual
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }
                  >
                    {totalExact.toLocaleString("vi-VN")}đ
                  </b>{" "}
                  /{" "}
                  <b>{parsedActual.toLocaleString("vi-VN")}đ</b>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
