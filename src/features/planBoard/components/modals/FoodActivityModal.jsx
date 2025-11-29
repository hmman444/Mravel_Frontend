"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaUtensils,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard } from "../activityStyles";

export default function FoodActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [pricePerPerson, setPricePerPerson] = useState("");
  const [peopleCount, setPeopleCount] = useState("2");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  // nhiều dòng chi phí phát sinh
  const [extraItems, setExtraItems] = useState([{ note: "", amount: "" }]);

  // ===== CHIA TIỀN =====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN"); // EVEN | EXACT
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

      setTitle(editingCard.text || "");
      setRestaurantName(data.restaurantName || "");
      setLocation(data.location || "");

      const loadedStart =
        editingCard.startTime || data.startTime || data.time || "";
      const loadedEnd =
        editingCard.endTime ||
        data.endTime ||
        editingCard.startTime ||
        data.time ||
        "";

      setStartTime(loadedStart);
      setEndTime(loadedEnd);

      setPricePerPerson(
        data.pricePerPerson != null ? String(data.pricePerPerson) : ""
      );

      setPeopleCount(
        data.peopleCount != null ? String(data.peopleCount) : "2"
      );

      // build danh sách chi phí phát sinh từ nhiều nguồn
      let extras = [];

      if (data.extraItems && Array.isArray(data.extraItems) && data.extraItems.length > 0) {
        extras = data.extraItems.map((it) => ({
          note: it.note || it.reason || "",
          amount:
            it.amount != null
              ? String(it.amount)
              : it.actualAmount != null
              ? String(it.actualAmount)
              : "",
        }));
      } else if (cost.extraCosts && cost.extraCosts.length > 0) {
        extras = cost.extraCosts.map((e) => ({
          note: e.reason || "",
          amount: e.actualAmount != null ? String(e.actualAmount) : "",
        }));
      } else if (data.extraSpend != null) {
        // tương thích dữ liệu cũ chỉ lưu 1 số extraSpend
        extras = [
          {
            note: "Chi phí phụ",
            amount: String(data.extraSpend),
          },
        ];
      }

      setExtraItems(extras.length ? extras : [{ note: "", amount: "" }]);

      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      // Chi phí thực tế: ưu tiên activityData, rồi tới cost.actualCost
      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setNote(editingCard.description || "");

      // ===== LOAD SPLIT =====
      if (split.splitType && split.splitType !== "NONE") {
        setSplitEnabled(true);
        setSplitType(split.splitType);

        const pc =
          cost.participantCount ||
          split.splitMembers?.length ||
          split.splitDetails?.length ||
          data.peopleCount ||
          editingCard.participantCount ||
          2;

        setParticipantCount(String(pc));

        let names = [];
        if (split.splitMembers?.length) {
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
          const payer = first?.payer;
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
      // RESET
      setTitle("");
      setRestaurantName("");
      setLocation("");

      setStartTime("");
      setEndTime("");

      setPricePerPerson("");
      setPeopleCount("2");
      setBudgetAmount("");
      setActualCost("");
      setNote("");
      setExtraItems([{ note: "", amount: "" }]);

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
    }
  }, [open, editingCard]);

  // ===== DỰ KIẾN & TỔNG =====
  const totalEstimated = useMemo(() => {
    const p = Number(pricePerPerson || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [pricePerPerson, peopleCount]);

  const extraValue = useMemo(
    () =>
      extraItems
        .map((it) => Number(it.amount) || 0)
        .reduce((a, b) => a + b, 0),
    [extraItems]
  );

  const estimatedTotal = useMemo(
    () => totalEstimated + extraValue,
    [totalEstimated, extraValue]
  );

  // Số tiền dùng để chia: ưu tiên chi phí thực tế, fallback dự kiến
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedTotal;
  }, [actualCost, estimatedTotal]);

  const totalWithExtra = estimatedTotal;

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

  // ===== HANDLER EXTRA COST ROWS =====
  const handleAddExtraRow = () => {
    setExtraItems((prev) => [...prev, { note: "", amount: "" }]);
  };

  const handleChangeExtraRow = (index, field, value) => {
    setExtraItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveExtraRow = (index) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
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

    const extraCosts = extraItems
      .map((row) => ({
        reason: row.note?.trim() || "Chi phí phụ",
        type: "OTHER",
        estimatedAmount: null,
        actualAmount: row.amount ? Number(row.amount) : 0,
      }))
      .filter(
        (e) =>
          (e.actualAmount && e.actualAmount > 0) ||
          (e.reason && e.reason.trim() !== "")
      );

    const extraTotal = extraCosts
      .map((e) => e.actualAmount || 0)
      .reduce((a, b) => a + b, 0);

    const cost = {
      currencyCode: "VND",
      // lưu tổng ước tính (cả phát sinh)
      estimatedCost: estimatedTotal || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? parsedParticipants : null,
      participants,
      extraCosts,
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

    return { cost, split, participants, extraTotal };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    if (!restaurantName.trim()) return;

    const { cost, split, participants, extraTotal } = buildPayload();

    onSubmit?.({
      type: "FOOD",
      title: title || `Ăn uống: ${restaurantName}`,
      text: title || `Ăn uống: ${restaurantName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        restaurantName,
        location,
        time: startTime || "",
        startTime,
        endTime,
        pricePerPerson: pricePerPerson ? Number(pricePerPerson) : null,
        peopleCount: peopleCount ? Number(peopleCount) : null,
        extraSpend: extraTotal || null,
        extraItems: cost.extraCosts, // lưu lại detail nếu cần
        estimatedCost: estimatedTotal || null,
        actualCost: actualCost ? Number(actualCost) : null,
      },
      cost,
      split,
    });

    onClose?.();
  };

  // ===== HEADER / FOOTER CHO SHELL =====
  const headerRight =
    parsedActual > 0 || (budgetAmount && Number(budgetAmount) > 0) ? (
      <div className="hidden sm:flex flex-col items-end text-xs">
        {parsedActual > 0 && (
          <>
            <span className="text-slate-500 dark:text-slate-400">
              Tổng chi dùng để chia
            </span>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
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
        {restaurantName
          ? `Ăn uống: ${restaurantName}`
          : "Điền tên quán để lưu hoạt động ăn uống."}
      </span>
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!restaurantName.trim()}
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động ăn uống"}
      </button>
    </div>
  );

  return (
    <ActivityModalShell
      open={open}
      onClose={onClose}
      icon={{
        main: <FaUtensils />,
        close: <FaTimes size={14} />,
        bg: "from-orange-500 to-amber-500",
      }}
      title="Hoạt động ăn uống"
      typeLabel="Food"
      subtitle="Lên kế hoạch quán ăn, cafe và chi phí bữa ăn."
      headerRight={headerRight}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {/* THÔNG TIN CHUNG */}
      <section className="space-y-3">
        <div className="flex flex-wrap items_center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Thông tin chung
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Tên quán + địa chỉ + thời gian
          </span>
        </div>

        <div className={sectionCard}>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên hoạt động (tuỳ chọn)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Ăn tối bún bò, uống cafe..."
              className={`${inputBase} w-full mt-1`}
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên quán / địa điểm ăn uống{" "}
              <span className="text-red-500 align-middle">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaUtensils className="text-orange-500" />
              <input
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Tên quán ăn, cafe..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Địa chỉ
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaMapMarkerAlt className="text-red-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Địa chỉ quán..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          {/* Thời gian ăn: bắt đầu / kết thúc */}
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Thời gian ăn uống
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-orange-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Bắt đầu
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-orange-500" />
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

      {/* GIÁ / SỐ NGƯỜI / PHỤ PHÍ / NGÂN SÁCH / THỰC TẾ + TÓM TẮT */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Chi phí bữa ăn
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Ước lượng theo đầu người + phát sinh + ngân sách + thực tế
          </span>
        </div>

        <div className={sectionCard + " space-y-4"}>
          {/* Giá / số người */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Chi phí dự tính / 1 người
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(e.target.value)}
                  placeholder="VD: 70.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Số người (ước tính)
              </label>
              <input
                type="number"
                min="1"
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                className={`${inputBase} w-full`}
              />
            </div>
          </div>

          {/* Chi phí phát sinh nhiều dòng */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Chi phí phát sinh (gửi xe, đồ uống thêm...)
              </label>
              <button
                type="button"
                onClick={handleAddExtraRow}
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-600 hover:underline"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {extraItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.note}
                    onChange={(e) =>
                      handleChangeExtraRow(idx, "note", e.target.value)
                    }
                    placeholder="Ghi chú: gửi xe, đồ uống..."
                    className={`${inputBase} flex-1`}
                  />
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={item.amount}
                      onChange={(e) =>
                        handleChangeExtraRow(idx, "amount", e.target.value)
                      }
                      placeholder="0"
                      className={`${inputBase} w-24 sm:w-28`}
                    />
                    <span className="text-xs text-slate-500">đ</span>
                  </div>
                  {extraItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraRow(idx)}
                      className="text-xs text-slate-400 hover:text-red-500 px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Chi phí thực tế */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Tổng chi phí thực tế cho bữa này (nếu có)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Điền sau khi thanh toán xong"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Nếu để trống, hệ thống sẽ dùng{" "}
                <b>chi phí dự kiến (theo đầu người + phát sinh)</b> để chia tiền.
              </p>
            </div>

            {/* Ngân sách */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Ngân sách cho bữa này (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
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
          </div>
          {/* TÓM TẮT CHI PHÍ (kiểu giống Transport) */}
          <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
            <div>
              Dự kiến theo đầu người:{" "}
              <span className="font-semibold">
                {totalEstimated.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Phát sinh:{" "}
              <span className="font-semibold">
                {extraValue.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Tổng dự kiến:{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {estimatedTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {actualCost && Number(actualCost) > 0 && (
              <div>
                Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
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
          placeholder="Ví dụ: Nên đặt bàn, thử món đặc sản..."
        />
      </section>
    </ActivityModalShell>
  );
}
