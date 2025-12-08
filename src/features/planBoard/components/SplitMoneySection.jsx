// src/features/planBoard/components/SplitMoneySection.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { inputBase, pillBtn, sectionCard } from "./activityStyles";
import { usePlanBoard } from "../hooks/usePlanBoard";

export default function SplitMoneySection({
  // props từ modal
  planMembers: planMembersProp = [],

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

  // danh sách member được chọn để chia
  selectedMemberIds: selectedMemberIdsProp,
  setSelectedMemberIds: setSelectedMemberIdsProp,
}) {
  const [payerOpen, setPayerOpen] = useState(false);

  // state nội bộ fallback nếu modal chưa truyền prop
  const [internalSelectedIds, setInternalSelectedIds] = useState([]);

  const selectedMemberIds =
    selectedMemberIdsProp !== undefined
      ? selectedMemberIdsProp
      : internalSelectedIds;

  const setSelectedMemberIds =
    setSelectedMemberIdsProp !== undefined
      ? setSelectedMemberIdsProp
      : setInternalSelectedIds;

  const safeHandleParticipantCount =
    handleParticipantCount ||
    (() => {
      /* noop */
    });
  const safeSetSplitNames =
    setSplitNames ||
    (() => {
      /* noop */
    });

  // input để search / @mention
  const [memberQuery, setMemberQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  // lấy board từ redux
  const board = useSelector((state) => state.planBoard.board);
  const planId = board?.planId; // để hook load đúng plan

  // lấy members từ hook nếu modal không truyền
  const { members: membersFromHook, load: loadMembers } = usePlanBoard(
    planId
  );

  // nếu modal không truyền planMembers thì tự load từ hook
  useEffect(() => {
    if (!planId) return;
    if (planMembersProp && planMembersProp.length > 0) return;
    loadMembers(false); // isFriend = false
  }, [planId, planMembersProp, loadMembers]);

  const planMembers =
    planMembersProp && planMembersProp.length > 0
      ? planMembersProp
      : membersFromHook || [];

  const getMemberLabel = (m) =>
    m.displayName || m.fullname || m.name || m.email || `User #${m.userId}`;

  // helper: set selectedIds + sync participantCount
  const applySelectedIds = (updater) => {
    setSelectedMemberIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const next = updater(current);
      const unique = Array.from(new Set(next.filter(Boolean)));
      safeHandleParticipantCount(String(unique.length));
      return unique;
    });
  };

  const selectedMembers = useMemo(
    () =>
      planMembers.filter((m) =>
        (selectedMemberIds || []).includes(m.userId)
      ),
    [planMembers, selectedMemberIds]
  );

  const availableMembers = useMemo(
    () =>
      planMembers.filter(
        (m) => !(selectedMemberIds || []).includes(m.userId)
      ),
    [planMembers, selectedMemberIds]
  );

  const filteredSuggestions = useMemo(() => {
    const q = memberQuery.trim().replace("@", "").toLowerCase();
    if (!q) return availableMembers;
    return availableMembers.filter((m) =>
      getMemberLabel(m).toLowerCase().includes(q)
    );
  }, [availableMembers, memberQuery]);

  // đồng bộ splitNames = tên của member, không cho gõ tay
  useEffect(() => {
    const labels = selectedMembers.map((m) => getMemberLabel(m));

    safeSetSplitNames((prev) => {
      if (prev.length === labels.length && prev.every((v, i) => v === labels[i])) {
        return prev; // không đổi
      }
      return labels;
    });
  }, [selectedMembers, safeSetSplitNames]);

  // đảm bảo exactAmounts khớp số người (khi EXACT)
  useEffect(() => {
    if (!setExactAmounts || splitType !== "EXACT") return;

    setExactAmounts((prev) => {
      const n = selectedMembers.length;
      const arr = Array.isArray(prev) ? [...prev] : [];
      if (arr.length < n) return [...arr, ...Array(n - arr.length).fill("")];
      if (arr.length > n) return arr.slice(0, n);
      return arr;
    });
  }, [selectedMembers.length, splitType, setExactAmounts]);

  const handleAddMember = (userId) => {
    applySelectedIds((prev) => [...prev, userId]);
    setMemberQuery("");
    setShowSuggest(false);
  };

  const handleRemoveMember = (userId) => {
    applySelectedIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSelectAll = () => {
    const allIds = planMembers.map((m) => m.userId);
    applySelectedIds(() => allIds);
  };

  const handleClearAll = () => {
    applySelectedIds(() => []);
  };

  const getPayerLabel = () => {
    if (!payerChoice) return "Không chọn";

    if (payerChoice.startsWith("member:")) {
      const id = Number(payerChoice.split(":")[1]);
      const m = planMembers.find((x) => x.userId === id);
      return m ? getMemberLabel(m) : "Thành viên";
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
            {/* NGƯỜI TRẢ CHÍNH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Người trả chính (tuỳ chọn)
                </label>

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
                      max-h-52 overflow-y-auto
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
                      const isActive = payerChoice === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelectPayer(value)}
                          className={`
                            w-full text-left px-3 py-2 text-xs
                            hover:bg-slate-100 dark:hover:bg-slate-800
                            ${
                              idx === 0
                                ? ""
                                : "border-t border-slate-100/70 dark:border-slate-800/70"
                            }
                            ${isActive ? "text-sky-600 font-semibold" : ""}
                          `}
                        >
                          {getMemberLabel(m)}
                        </button>
                      );
                    })}
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

            {/* CHỌN THÀNH VIÊN – UI tag/@mention */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Thành viên tham gia chia tiền
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Đang chọn{" "}
                    <b>{selectedMemberIds?.length || 0} người</b>
                  </span>
                  {planMembers.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="underline text-sky-600 dark:text-sky-300"
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="underline text-slate-500 dark:text-slate-400"
                      >
                        Bỏ chọn
                      </button>
                    </>
                  )}
                </div>
              </div>

              {planMembers.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chưa có thành viên nào trong kế hoạch này. Hãy mời thêm ở tab
                  <b> Thành viên</b>.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* danh sách chip người đã chọn */}
                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 px-2.5 py-2">
                    {selectedMembers.length === 0 && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Chưa chọn ai. Gõ <b>@</b> hoặc tên để thêm.
                      </span>
                    )}

                    {selectedMembers.map((m) => {
                      const label = getMemberLabel(m);
                      const initial =
                        label?.trim()?.charAt(0)?.toUpperCase() || "?";

                      return (
                        <span
                          key={m.userId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-[11px] dark:bg-sky-900/40 dark:text-sky-100 dark:border-sky-800"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] text-white">
                            {initial}
                          </span>
                          <span className="max-w-[120px] truncate">
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.userId)}
                            className="ml-1 text-[10px] opacity-70 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* input search / mention */}
                  <div className="relative">
                    <input
                      className={`${inputBase} w-full text-xs`}
                      placeholder="Nhập @ hoặc tên để thêm người chia tiền..."
                      value={memberQuery}
                      onChange={(e) => {
                        setMemberQuery(e.target.value);
                        setShowSuggest(true);
                      }}
                      onFocus={() => setShowSuggest(true)}
                      onBlur={() => {
                        // nhỏ delay để kịp bấm vào suggestion
                        setTimeout(() => setShowSuggest(false), 120);
                      }}
                    />

                    {showSuggest && filteredSuggestions.length > 0 && (
                      <div
                        className="
                          absolute left-0 right-0 mt-1 z-[9999]
                          max-h-52 overflow-y-auto
                          bg-white dark:bg-slate-900
                          border border-slate-200 dark:border-slate-700
                          rounded-xl shadow-lg text-xs
                        "
                      >
                        {filteredSuggestions.map((m, idx) => (
                          <button
                            key={m.userId}
                            type="button"
                            onClick={() => handleAddMember(m.userId)}
                            className={`
                              w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800
                              ${
                                idx !== 0
                                  ? "border-t border-slate-100/70 dark:border-slate-800/70"
                                  : ""
                              }
                            `}
                          >
                            {getMemberLabel(m)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CÁCH CHIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
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

            {/* CHIA ĐỀU – hiển thị theo member */}
            {splitType === "EVEN" && (
              <div className="space-y-1.5">
                {selectedMembers.map((m, idx) => (
                  <div key={m.userId} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">
                      {getMemberLabel(m)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ≈{" "}
                      <b>
                        {evenShare
                          ? evenShare.toLocaleString("vi-VN")
                          : 0}
                        đ
                      </b>
                      {evenRemainder > 0 && idx < evenRemainder
                        ? " (+1đ)"
                        : ""}
                    </span>
                  </div>
                ))}

                {parsedActual > 0 && (
                  <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                    Tổng chi:{" "}
                    <b>{parsedActual.toLocaleString("vi-VN")}đ</b>
                    <br />
                    Mỗi người ~{" "}
                    <b>
                      {(evenShare || 0).toLocaleString("vi-VN")}đ
                    </b>
                    {evenRemainder
                      ? ` (+1đ cho ${evenRemainder} người đầu)`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {/* EXACT – 1 dòng / 1 member, chỉ nhập số tiền */}
            {splitType === "EXACT" && (
              <div className="space-y-2">
                {selectedMembers.map((m, idx) => (
                  <div key={m.userId} className="flex items-center gap-2">
                    <span className="flex-[1.3] text-[11px] text-slate-700 dark:text-slate-200 truncate">
                      {getMemberLabel(m)}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={exactAmounts?.[idx] || ""}
                      onChange={(e) =>
                        setExactAmounts((prev) => {
                          const arr = Array.isArray(prev) ? [...prev] : [];
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
