"use client";

import { useState, useEffect } from "react";
import {
  FaTimes,
  FaRoute,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import ExtraCostsSection from "../ExtraCostsSection";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard, pillBtn } from "../activityStyles";

const TRANSPORT_METHODS = [
  { value: "taxi", label: "Taxi / Grab" },
  { value: "motorbike", label: "Xe máy" },
  { value: "car", label: "Ô tô riêng" },
  { value: "bus", label: "Xe buýt" },
  { value: "walk", label: "Đi bộ" },
  { value: "other", label: "Khác" },
];

const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

export default function TransportActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [stops, setStops] = useState([]);
  const [method, setMethod] = useState("taxi");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [estimatedCost, setEstimatedCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [note, setNote] = useState("");

  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN"); // EVEN | EXACT
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  const [payerChoice, setPayerChoice] = useState(""); // "", "member:<id>", "external"
  const [payerExternalName, setPayerExternalName] = useState("");

  // ===== LOAD DATA =====
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};
      const split = editingCard.split || {};

      setTitle(editingCard.text || "");
      setFromPlace(data.fromPlace || "");
      setToPlace(data.toPlace || "");
      setStops(data.stops || []);
      setMethod(data.method || "taxi");

      setStartTime(editingCard.startTime || "");
      setEndTime(editingCard.endTime || "");

      // Ước lượng base
      setEstimatedCost(
        cost.estimatedCost !== undefined && cost.estimatedCost !== null
          ? String(cost.estimatedCost)
          : ""
      );

      // Ngân sách
      setBudgetAmount(
        cost.budgetAmount !== undefined && cost.budgetAmount !== null
          ? String(cost.budgetAmount)
          : ""
      );

      // Chi phí thực tế: ưu tiên activityData rồi cost.actualCost
      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      // Extra costs
      setExtraCosts(cost.extraCosts || []);

      setNote(editingCard.description || "");

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
      // reset khi tạo mới
      setTitle("");
      setFromPlace("");
      setToPlace("");
      setStops([]);
      setMethod("taxi");

      setStartTime("");
      setEndTime("");

      setEstimatedCost("");
      setBudgetAmount("");
      setActualCost("");
      setExtraCosts([]);
      setNote("");

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
    }
  }, [open, editingCard]);

  // ===== GHÉ NGANG =====
  const addStop = () => setStops((prev) => [...prev, ""]);

  const changeStop = (v, idx) => {
    const arr = [...stops];
    arr[idx] = v;
    setStops(arr);
  };

  const removeStop = (idx) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  // ===== EXTRA COSTS HANDLER =====
  const addExtraCost = () =>
    setExtraCosts((prev) => [
      ...prev,
      { reason: "", type: "OTHER", estimatedAmount: null, actualAmount: "" },
    ]);

  const updateExtraCost = (idx, key, value) => {
    const arr = [...extraCosts];
    arr[idx] = { ...arr[idx], [key]: value };
    setExtraCosts(arr);
  };

  const removeExtraCost = (idx) =>
    setExtraCosts((prev) => prev.filter((_, i) => i !== idx));

  // ===== CHIA TIỀN =====
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

  // ===== TÍNH TIỀN =====
  const baseEstimated = Number(estimatedCost || 0);

  const extraTotal = extraCosts
    .map((e) => Number(e.actualAmount) || 0)
    .reduce((a, b) => a + b, 0);

  const estimatedTotal = baseEstimated + extraTotal;

  // Số tiền dùng để chia: ưu tiên chi phí thực tế, fallback ước tính
  const parsedActual = (() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedTotal;
  })();

  const parsedParticipants = splitEnabled
    ? Math.max(1, Number(participantCount) || 1)
    : 0;

  const evenShare =
    splitEnabled &&
    splitType === "EVEN" &&
    parsedParticipants > 0 &&
    parsedActual > 0
      ? Math.floor(parsedActual / parsedParticipants)
      : null;

  const evenRemainder =
    splitEnabled &&
    splitType === "EVEN" &&
    parsedParticipants > 0 &&
    parsedActual > 0
      ? parsedActual % parsedParticipants
      : 0;

  const totalExact = exactAmounts
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  // ===== THỜI GIAN =====
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

  // ===== PAYER =====
  const selectedMemberId = payerChoice.startsWith("member:")
    ? Number(payerChoice.split(":")[1])
    : null;

  const selectedMember = selectedMemberId
    ? planMembers.find((m) => m.userId === selectedMemberId)
    : null;

  // ===== BUILD PAYLOAD =====
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

    const normalizedExtraCosts = extraCosts
      .map((e) => ({
        reason: e.reason || "",
        type: e.type || "OTHER",
        estimatedAmount: null,
        actualAmount:
          e.actualAmount !== undefined &&
          e.actualAmount !== null &&
          e.actualAmount !== ""
            ? Number(e.actualAmount)
            : 0,
      }))
      .filter(
        (e) =>
          (e.actualAmount && e.actualAmount > 0) ||
          (e.reason && e.reason.trim() !== "")
      );

    const cost = {
      currencyCode: "VND",
      // lưu tổng ước tính (cả phát sinh)
      estimatedCost: estimatedTotal || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? parsedParticipants : null,
      participants,
      extraCosts: normalizedExtraCosts,
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

    return { cost, split, participants, extraTotal, estimatedTotal };
  };

  const handleSubmit = () => {
    if (!fromPlace.trim() || !toPlace.trim()) return;

    const { cost, split, participants, extraTotal, estimatedTotal } =
      buildPayload();

    onSubmit?.({
      type: "TRANSPORT",
      title: title || `Di chuyển: ${fromPlace} → ${toPlace}`,
      text: title || `Di chuyển: ${fromPlace} → ${toPlace}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        fromPlace,
        toPlace,
        stops: stops.filter((s) => s.trim()),
        method,
        estimatedCost: estimatedTotal || null,
        actualCost: actualCost ? Number(actualCost) : null,
        extraTotal: extraTotal || null,
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
            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
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
      <span>
        {fromPlace && toPlace
          ? `Di chuyển: ${fromPlace} → ${toPlace}`
          : "Điền đầy đủ điểm đi và điểm đến để lưu hoạt động."}
      </span>
      {durationMinutes != null && (
        <span>
          Thời lượng: <b>{durationMinutes.toLocaleString("vi-VN")} phút</b>
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-500
         to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl
          hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!fromPlace.trim() || !toPlace.trim()}
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động di chuyển"}
      </button>
    </div>
  );

  return (
    <ActivityModalShell
      open={open}
      onClose={onClose}
      icon={{
        main: <FaRoute />,
        close: <FaTimes size={14} />,
        bg: "from-sky-500  to-indigo-500",
      }}
      title="Hoạt động di chuyển"
      typeLabel="Transport"
      subtitle="Ghi lại quãng đường, thời gian, chi phí và chia tiền cho nhóm."
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
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500
           dark:text-slate-400">
            Tên + điểm đi/đến + điểm ghé
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
              className={`${inputBase} w-full mt-1`}
              placeholder="VD: Taxi từ khách sạn về phố đi bộ"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Đi từ <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaMapMarkerAlt className="text-rose-400" />
                <input
                  value={fromPlace}
                  onChange={(e) => setFromPlace(e.target.value)}
                  className={`${inputBase} flex-1`}
                  placeholder="Khách sạn..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Đến <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaMapMarkerAlt className="text-emerald-500" />
                <input
                  value={toPlace}
                  onChange={(e) => setToPlace(e.target.value)}
                  className={`${inputBase} flex-1`}
                  placeholder="Điểm đến..."
                />
              </div>
            </div>
          </div>

          <div className="pt-1 mt-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Ghé ngang
              </label>
              <button
                onClick={addStop}
                type="button"
                className="flex items-center gap-1 text-[11px] font-medium text-sky-600
                 dark:text-sky-300 hover:text-sky-500"
              >
                + Thêm điểm dừng
              </button>
            </div>

            {stops.length > 0 && (
              <div className="space-y-2 mt-2">
                {stops.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={s}
                      onChange={(e) => changeStop(e.target.value, i)}
                      className={`${inputBase} flex-1`}
                      placeholder={`Điểm dừng ${i + 1}`}
                    />
                    <button
                      onClick={() => removeStop(i)}
                      type="button"
                      className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50
                       dark:hover:bg-rose-950/40 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PHƯƠNG TIỆN & THỜI GIAN */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Phương tiện & Thời gian
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Chọn cách đi + giờ đi/đến
          </span>
        </div>

        <div className={sectionCard + " space-y-3"}>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Phương tiện
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {TRANSPORT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`${pillBtn} ${
                    m.value === method
                      ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/30"
                      : "bg-white/80 border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Thời gian
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80
                 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-sky-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Bắt đầu
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 
                dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
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
                Thời lượng dự kiến:{" "}
                <span className="font-semibold">{durationMinutes} phút</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* NGÂN SÁCH & CHI PHÍ (FULL WIDTH + CHI PHÍ PHÁT SINH BÊN TRONG) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Ngân sách & chi phí
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Ước lượng + phát sinh + thực tế
          </span>
        </div>

        <div className={sectionCard + " space-y-4"}>
          {/* ƯỚC LƯỢNG & NGÂN SÁCH + THỰC TẾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Chi phí ước lượng (cước chính)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className={`${inputBase} flex-1`}
                  placeholder="VD: 50.000"
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Ngân sách cho hoạt động (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaMoneyBillWave className="text-indigo-500" />
                <input
                  type="number"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Không bắt buộc"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>

          {/* CHI PHÍ THỰC TẾ */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tổng chi phí thực tế cho chuyến này (nếu có)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaMoneyBillWave className="text-emerald-500" />
              <input
                type="number"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Điền sau khi trả tiền xong"
                className={`${inputBase} flex-1`}
              />
              <span className="text-xs text-slate-500">đ</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Nếu để trống, hệ thống sẽ dùng <b>chi phí ước lượng + phát sinh</b>{" "}
              để chia tiền.
            </p>
          </div>

          {/* CHI PHÍ PHÁT SINH (TRONG CÙNG Ô CHI PHÍ) */}
          <div>
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />
          </div>

          {/* TÓM TẮT CHI PHÍ */}
          <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
            <div>
              Cước chính ước lượng:{" "}
              <span className="font-semibold">
                {baseEstimated.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Phát sinh (phí dịch vụ, thuế...):{" "}
              <span className="font-semibold">
                {extraTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Tổng dự kiến:{" "}
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                {estimatedTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {actualCost && Number(actualCost) > 0 && (
              <div>
                Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {Number(actualCost).toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
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

      {/* GHI CHÚ */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Ghi chú
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Thêm thông tin nhỏ cho cả nhóm
          </span>
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputBase} w-full`}
          placeholder="VD: Nhớ mang tiền lẻ, nhắn trước cho tài xế..."
        />
      </section>
    </ActivityModalShell>
  );
}
