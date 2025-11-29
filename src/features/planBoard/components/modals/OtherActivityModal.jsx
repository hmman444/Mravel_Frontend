"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaPenFancy,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard } from "../activityStyles";

export default function OtherActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [customFields, setCustomFields] = useState([{ key: "", value: "" }]);

  // giống transport/event: nhiều khoản phát sinh + ngân sách
  const [extraItems, setExtraItems] = useState([]);
  const [budgetAmount, setBudgetAmount] = useState("");

  // ===== CHIA TIỀN =====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  // payer: "", "member:<id>", "external"
  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  // ===== LOAD KHI EDIT =====
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};
      const split = editingCard.split || {};

      setTitle(editingCard.text || data.title || "Hoạt động khác");
      setLocation(data.location || "");

      const loadedStart = editingCard.startTime || data.startTime || "";
      const loadedEnd =
        editingCard.endTime || data.endTime || editingCard.startTime || "";

      setStartTime(loadedStart);
      setEndTime(loadedEnd);

      setEstimatedCost(
        (cost.estimatedCost != null
          ? String(cost.estimatedCost)
          : data.estimatedCost != null
          ? String(data.estimatedCost)
          : "") || ""
      );

      setActualCost(
        (data.actualCost != null
          ? String(data.actualCost)
          : cost.actualCost != null
          ? String(cost.actualCost)
          : "") || ""
      );

      // ===== LOAD CHI PHÍ PHÁT SINH =====
      let initialExtraItems = [];

      if (Array.isArray(data.extraItems) && data.extraItems.length > 0) {
        // kiểu mới
        initialExtraItems = data.extraItems.map((it) => ({
          reason: it.reason || "",
          amount:
            it.amount !== undefined && it.amount !== null
              ? String(it.amount)
              : "",
        }));
      } else if (data.extraSpend != null) {
        // kiểu cũ: chỉ có tổng
        initialExtraItems = [
          {
            reason: "Chi phí phụ",
            amount: String(data.extraSpend),
          },
        ];
      } else if (cost.extraCosts && cost.extraCosts.length > 0) {
        // map từ cost.extraCosts
        initialExtraItems = cost.extraCosts.map((e) => ({
          reason: e.reason || "Chi phí phụ",
          amount:
            e.actualAmount !== undefined && e.actualAmount !== null
              ? String(e.actualAmount)
              : "",
        }));
      }

      setExtraItems(initialExtraItems);

      // NGÂN SÁCH
      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      setNote(editingCard.description || "");

      setCustomFields(
        Array.isArray(data.customFields) && data.customFields.length > 0
          ? data.customFields
          : [{ key: "", value: "" }]
      );

      // ===== LOAD SPLIT =====
      if (split.splitType && split.splitType !== "NONE") {
        setSplitEnabled(true);
        setSplitType(split.splitType);

        const pc =
          cost.participantCount ||
          (split.splitMembers && split.splitMembers.length) ||
          (split.splitDetails && split.splitDetails.length) ||
          editingCard.participantCount ||
          2;

        setParticipantCount(String(pc));

        let names = [];
        if (split.splitMembers && split.splitMembers.length) {
          names = split.splitMembers.map((m) => m.displayName || "");
        }
        if (names.length < pc) {
          names = [...names, ...Array(pc - names.length).fill("")];
        }
        setSplitNames(names);

        if (split.splitType === "EXACT" && split.splitDetails) {
          setExactAmounts(
            split.splitDetails.map((d) =>
              d.amount != null ? String(d.amount) : ""
            )
          );
        } else {
          setExactAmounts([]);
        }

        setPayerChoice("");
        setPayerExternalName("");
        if (split.payerId) {
          setPayerChoice(`member:${split.payerId}`);
        } else if (split.payments && split.payments.length > 0) {
          const first = split.payments[0];
          const payer = first && first.payer;
          if (payer) {
            if (payer.external || !payer.memberId) {
              setPayerChoice("external");
              setPayerExternalName(payer.displayName || "");
            } else if (payer.memberId) {
              setPayerChoice(`member:${payer.memberId}`);
            }
          }
        }
      } else {
        setSplitEnabled(false);
        setSplitType("EVEN");
        setParticipantCount("2");
        setSplitNames([]);
        setExactAmounts([]);
        setPayerChoice("");
        setPayerExternalName("");
      }
    } else {
      // RESET NEW
      setTitle("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setEstimatedCost("");
      setActualCost("");
      setNote("");
      setCustomFields([{ key: "", value: "" }]);
      setExtraItems([]);
      setBudgetAmount("");

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
    }
  }, [open, editingCard]);

  // ===== EXTRA ITEMS UTILS =====
  const handleAddExtra = () => {
    setExtraItems((prev) => [...prev, { reason: "", amount: "" }]);
  };

  const handleChangeExtra = (idx, key, value) => {
    setExtraItems((prev) => {
      const clone = [...prev];
      clone[idx][key] = value;
      return clone;
    });
  };

  const handleRemoveExtra = (idx) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ===== COST LOGIC =====
  const estimatedValue = Number(estimatedCost || 0);
  const actualValue = Number(actualCost || 0);

  const extraValue = useMemo(
    () =>
      extraItems.reduce((sum, it) => {
        const v = Number(it.amount || 0);
        return sum + (Number.isNaN(v) ? 0 : v);
      }, 0),
    [extraItems]
  );

  // Tổng dùng để chia: base (thực tế nếu có, không thì ước lượng) + phát sinh
  const baseForSplit = actualValue > 0 ? actualValue : estimatedValue;

  const parsedActual = useMemo(
    () => baseForSplit + extraValue,
    [baseForSplit, extraValue]
  );

  // ===== DURATION =====
  const computeDurationMinutes = () => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (
      Number.isNaN(sh) ||
      Number.isNaN(sm) ||
      Number.isNaN(eh) ||
      Number.isNaN(em)
    ) {
      return null;
    }
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return null;
    return diff;
  };

  const durationMinutes = computeDurationMinutes();

  // ===== SPLIT UTILS =====
  const handleParticipantCount = (value) => {
    setParticipantCount(value);
    const n = Math.max(1, Number(value) || 1);

    setSplitNames((prev) => {
      const arr = [...prev];
      if (arr.length < n) return [...arr, ...Array(n - arr.length).fill("")];
      if (arr.length > n) return arr.slice(0, n);
      return arr;
    });

    setExactAmounts((prev) => {
      const arr = [...prev];
      if (arr.length < n) return [...arr, ...Array(n - arr.length).fill("")];
      if (arr.length > n) return arr.slice(0, n);
      return arr;
    });
  };

  const parsedParticipants = splitEnabled
    ? Math.max(1, Number(participantCount) || 1)
    : 0;

  const evenShare =
    splitEnabled && parsedParticipants > 0 && parsedActual > 0
      ? Math.floor(parsedActual / parsedParticipants)
      : null;

  const evenRemainder =
    splitEnabled && parsedParticipants > 0 && parsedActual > 0
      ? parsedActual % parsedParticipants
      : 0;

  const totalExact = exactAmounts
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const selectedMemberId = payerChoice.startsWith("member:")
    ? Number(payerChoice.split(":")[1])
    : null;

  const selectedMember = selectedMemberId
    ? planMembers.find((m) => m.userId === selectedMemberId)
    : null;

  // ===== CUSTOM FIELDS HANDLERS =====
  const handleAddField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleChangeField = (index, field, value) => {
    const next = [...customFields];
    next[index][field] = value;
    setCustomFields(next);
  };

  const handleRemoveField = (index) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== BUILD PAYLOAD (cost + split + participants) =====
  const buildPayload = () => {
    const participants = splitEnabled
      ? Array.from({ length: parsedParticipants }).map((_, i) => ({
          memberId: null,
          displayName:
            splitNames[i] && splitNames[i].trim()
              ? splitNames[i].trim()
              : `Người ${i + 1}`,
          external: true,
        }))
      : [];

    let splitDetails = [];
    if (splitEnabled) {
      if (splitType === "EVEN") {
        const baseEven = evenShare || 0;
        const rem = evenRemainder || 0;
        splitDetails = Array.from({ length: parsedParticipants }).map(
          (_, i) => ({
            person: participants[i],
            amount: baseEven + (i < rem ? 1 : 0),
          })
        );
      } else if (splitType === "EXACT") {
        splitDetails = Array.from({ length: parsedParticipants }).map(
          (_, i) => ({
            person: participants[i],
            amount: Number(exactAmounts[i]) || 0,
          })
        );
      }
    }

    const cleanedExtraItems = extraItems
      .filter((it) => it.reason.trim() || it.amount)
      .map((it) => ({
        reason: it.reason.trim() || "Chi phí phụ",
        amount: Number(it.amount) || 0,
      }));

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedValue || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      // lưu luôn tổng thực tế dùng để chia (base + phát sinh)
      actualCost: parsedActual || null,
      participantCount: splitEnabled ? parsedParticipants : null,
      participants,
      extraCosts: cleanedExtraItems.length
        ? cleanedExtraItems.map((it) => ({
            reason: it.reason,
            type: "OTHER",
            estimatedAmount: null,
            actualAmount: it.amount,
          }))
        : [],
    };

    let payerId = null;
    const payments = [];

    if (splitEnabled && parsedActual > 0) {
      if (selectedMember) {
        payerId = selectedMember.userId;
        payments.push({
          payer: {
            memberId: selectedMember.userId,
            displayName:
              selectedMember.displayName ||
              selectedMember.name ||
              `Thành viên ${selectedMember.userId}`,
            external: false,
          },
          amount: parsedActual,
          note: null,
        });
      } else if (payerChoice === "external") {
        const name =
          payerExternalName && payerExternalName.trim()
            ? payerExternalName.trim()
            : "Người trả";
        payments.push({
          payer: {
            memberId: null,
            displayName: name,
            external: true,
          },
          amount: parsedActual,
          note: null,
        });
      }
    }

    const split = splitEnabled
      ? {
          splitType,
          payerId,
          includePayerInSplit: true,
          splitMembers: participants,
          splitDetails,
          payments,
        }
      : {
          splitType: "NONE",
          payerId: null,
          includePayerInSplit: true,
          splitMembers: [],
          splitDetails: [],
          payments: [],
        };

    return { cost, split, participants, cleanedExtraItems };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const { cost, split, participants, cleanedExtraItems } = buildPayload();

    onSubmit?.({
      type: "OTHER",
      title: title || "Hoạt động khác",
      text: title || "Hoạt động khác",
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        location,
        startTime,
        endTime,
        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
        actualCost: actualCost ? Number(actualCost) : null,
        // tương thích & chi tiết phát sinh
        extraSpend: extraValue || null,
        extraItems: cleanedExtraItems,
        customFields: customFields.filter(
          (f) => f.key.trim() !== "" || f.value.trim() !== ""
        ),
      },
      cost,
      split,
    });

    onClose?.();
  };

  // ===== HEADER / FOOTER =====
  const headerRight =
    parsedActual > 0 || (budgetAmount && Number(budgetAmount) > 0) ? (
      <div className="hidden sm:flex flex-col items-end text-xs">
        {parsedActual > 0 && (
          <>
            <span className="text-slate-500 dark:text-slate-400">
              Tổng chi dùng để chia
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {parsedActual.toLocaleString("vi-VN")}đ
            </span>
          </>
        )}
        {budgetAmount && Number(budgetAmount) > 0 && (
          <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Ngân sách:{" "}
            <b className="text-slate-700 dark:text-slate-100">
              {Number(budgetAmount).toLocaleString("vi-VN")}đ
            </b>
          </span>
        )}
      </div>
    ) : null;

  const footerLeft = (
    <div className="hidden sm:flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
      <span>{title || "Hoạt động tuỳ chỉnh khác"}</span>
      {location && (
        <span>
          Địa điểm: <b>{location}</b>
        </span>
      )}
      {startTime && endTime && durationMinutes != null && (
        <span>
          Thời gian:{" "}
          <b>
            {startTime} - {endTime} ({durationMinutes} phút)
          </b>
        </span>
      )}
    </div>
  );

  const footerRight = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium 
        border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-slate-600
        dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Hủy
      </button>
      <button
        onClick={handleSubmit}
        type="button"
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-gray-700 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-slate-600/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition"
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động khác"}
      </button>
    </div>
  );

  return (
    <ActivityModalShell
      open={open}
      onClose={onClose}
      icon={{
        main: <FaPenFancy />,
        close: <FaTimes size={14} />,
        bg: "from-slate-600 to-gray-700",
      }}
      title="Hoạt động khác"
      typeLabel="Other"
      subtitle="Thêm hoạt động tuỳ chỉnh không thuộc các nhóm mặc định."
      headerRight={headerRight}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {/* THÔNG TIN CHUNG */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Thông tin chung
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Tên hoạt động + địa điểm + thời gian
          </span>
        </div>

        <div className={sectionCard}>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên hoạt động
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Sinh nhật, họp nhóm, check-in..."
              className={`${inputBase} w-full mt-1`}
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Địa điểm (tuỳ chọn)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaMapMarkerAlt className="text-red-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Địa điểm diễn ra hoạt động"
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          {/* Thời gian */}
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Thời gian hoạt động
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-sky-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Bắt đầu
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-sky-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Kết thúc
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>
            </div>

            {durationMinutes != null && (
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Thời lượng ước tính:{" "}
                <span className="font-semibold">{durationMinutes} phút</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CHI PHÍ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Chi phí
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Ước lượng, chi thực tế và chi phí phát sinh
          </span>
        </div>

        <div className={sectionCard + " space-y-3"}>
          {/* ƯỚC LƯỢNG + THỰC TẾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Chi phí ước lượng
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="VD: 100.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Chi tiêu thực tế (chính)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Điền sau khi hoàn thành"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>

          {/* PHÁT SINH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Chi phí phát sinh (tuỳ chọn)
              </label>
              <button
                type="button"
                onClick={handleAddExtra}
                className="text-[11px] text-sky-500 hover:text-sky-400"
              >
                + Thêm dòng
              </button>
            </div>

            {extraItems.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Thêm từng khoản phát sinh (ví dụ: gửi xe, phụ phí, đồ uống...).
              </p>
            )}

            <div className="space-y-2 mt-1">
              {extraItems.map((it, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-2 md:items-center"
                >
                  <input
                    value={it.reason}
                    onChange={(e) =>
                      handleChangeExtra(idx, "reason", e.target.value)
                    }
                    placeholder={`Khoản phát sinh ${idx + 1}`}
                    className={`${inputBase} flex-1`}
                  />

                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={it.amount}
                      onChange={(e) =>
                        handleChangeExtra(idx, "amount", e.target.value)
                      }
                      placeholder="Số tiền"
                      className={`${inputBase} w-32`}
                    />
                    <span className="text-xs text-slate-500">đ</span>

                    <button
                      type="button"
                      onClick={() => handleRemoveExtra(idx)}
                      className="px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NGÂN SÁCH + TÓM TẮT */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Ngân sách cho hoạt động (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-sky-500" />
                <input
                  type="number"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="VD: 500.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Ước lượng ban đầu:{" "}
                <span className="font-semibold">
                  {estimatedValue.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Chi chính thực tế:{" "}
                <span className="font-semibold">
                  {actualValue.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">
                  {extraValue.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Tổng dùng để chia:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {parsedActual.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {budgetAmount && Number(budgetAmount) > 0 && (
                <div>
                  Ngân sách:{" "}
                  <span className="font-semibold">
                    {Number(budgetAmount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* CHIA TIỀN */}
      <section className="space-y-4">
        <SplitMoneySection
          planMembers={planMembers}
          splitEnabled={splitEnabled}
          setSplitEnabled={setSplitEnabled}
          splitType={splitType}
          setSplitType={setSplitType}
          participantCount={participantCount}
          handleParticipantCount={handleParticipantCount}
          splitNames={splitNames}
          setSplitNames={setSplitNames}
          exactAmounts={exactAmounts}
          setExactAmounts={setExactAmounts}
          payerChoice={payerChoice}
          setPayerChoice={setPayerChoice}
          payerExternalName={payerExternalName}
          setPayerExternalName={setPayerExternalName}
          parsedParticipants={parsedParticipants}
          parsedActual={parsedActual}
          evenShare={evenShare}
          evenRemainder={evenRemainder}
          totalExact={totalExact}
        />
      </section>

      {/* THÔNG TIN THÊM */}
      <section className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Thông tin thêm (tuỳ chọn)
          </label>
          <button
            type="button"
            onClick={handleAddField}
            className="text-[11px] text-sky-500 hover:text-sky-400"
          >
            + Thêm trường
          </button>
        </div>

        <div className={sectionCard}>
          {customFields.map((f, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
              <input
                placeholder="Tên trường (vd: Dresscode, mua quà, ...)"
                value={f.key}
                onChange={(e) =>
                  handleChangeField(idx, "key", e.target.value)
                }
                className={inputBase}
              />

              <div className="flex items-center gap-2">
                <input
                  placeholder="Giá trị (vd: Trang phục màu đỏ, 500.000đ, ...)"
                  value={f.value}
                  onChange={(e) =>
                    handleChangeField(idx, "value", e.target.value)
                  }
                  className={`${inputBase} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-red-500 hover:text-red-600 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GHI CHÚ */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Ghi chú
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Mô tả thêm cho cả nhóm
          </span>
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mô tả thêm về hoạt động..."
          className={`${inputBase} w-full`}
        />
      </section>
    </ActivityModalShell>
  );
}
