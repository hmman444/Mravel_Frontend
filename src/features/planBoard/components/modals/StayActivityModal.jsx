"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaBed,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard } from "../activityStyles";

export default function StayActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // chi phí cho lần nghỉ / phần ngày này
  const [pricePerTime, setPricePerTime] = useState("");
  // số đêm của toàn booking (thông tin thêm)
  const [nights, setNights] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  // nhiều dòng chi phí phát sinh
  const [extraItems, setExtraItems] = useState([{ note: "", amount: "" }]);

  // ===== CHIA TIỀN =====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  // payer: "", "member:<id>", "external"
  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  // ===== LOAD MODAL =====
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};
      const split = editingCard.split || {};

      setTitle(editingCard.text || "");
      setHotelName(data.hotelName || "");
      setAddress(data.address || "");

      setCheckIn(editingCard.startTime || data.checkIn || "");
      setCheckOut(editingCard.endTime || data.checkOut || "");

      setPricePerTime(
        data.pricePerNight != null
          ? String(data.pricePerNight)
          : data.pricePerTime != null
          ? String(data.pricePerTime)
          : ""
      );

      setNights(data.nights != null ? String(data.nights) : "1");

      // actualCost: ưu tiên activityData, rồi cost.actualCost
      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      // load extraItems từ activityData / cost.extraCosts / extraSpend cũ
      let extras = [];
      if (
        data.extraItems &&
        Array.isArray(data.extraItems) &&
        data.extraItems.length > 0
      ) {
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
        extras = [
          {
            note: "Chi phí phát sinh",
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

      setNote(editingCard.description || "");

      // ===== LOAD SPLIT =====
      if (split.splitType && split.splitType !== "NONE") {
        setSplitEnabled(true);
        setSplitType(split.splitType);

        const pc =
          cost.participantCount ||
          split.splitMembers?.length ||
          split.splitDetails?.length ||
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
      // reset new
      setTitle("");
      setHotelName("");
      setAddress("");
      setCheckIn("");
      setCheckOut("");
      setPricePerTime("");
      setNights("1");
      setActualCost("");
      setBudgetAmount("");
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

  // ===== COST LOGIC (cho 1 hoạt động / 1 phần ngày) =====
  const baseEstimated = useMemo(
    () => Number(pricePerTime || 0),
    [pricePerTime]
  );

  const extraTotal = useMemo(
    () =>
      extraItems
        .map((it) => Number(it.amount) || 0)
        .reduce((a, b) => a + b, 0),
    [extraItems]
  );

  // tổng ước tính = chi phí cơ bản + phát sinh
  const estimatedCost = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  // Số tiền dùng để chia: ưu tiên actualCost, fallback estimatedCost
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

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
        reason: row.note?.trim() || "Chi phí phát sinh",
        type: "OTHER",
        estimatedAmount: null,
        actualAmount: row.amount ? Number(row.amount) : 0,
      }))
      .filter(
        (e) =>
          (e.actualAmount && e.actualAmount > 0) ||
          (e.reason && e.reason.trim() !== "")
      );

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedCost || null,
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

    return { cost, split, participants };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    if (!hotelName.trim()) return;

    const { cost, split, participants } = buildPayload();

    onSubmit?.({
      type: "STAY",
      title: title || `Nghỉ tại ${hotelName}`,
      text: title || `Nghỉ tại ${hotelName}`,
      description: note || "",
      startTime: checkIn || null,
      endTime: checkOut || null,
      durationMinutes: null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        hotelName,
        address,
        checkIn,
        checkOut,
        pricePerTime: pricePerTime ? Number(pricePerTime) : null,
        pricePerNight: pricePerTime ? Number(pricePerTime) : null, // compat cũ
        nights: nights ? Number(nights) : null,
        actualCost: actualCost ? Number(actualCost) : null,
        extraSpend: extraTotal || null,
        extraItems: cost.extraCosts,
        estimatedCost: estimatedCost || null,
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
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
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
        {hotelName
          ? `Nghỉ tại: ${hotelName}`
          : "Điền tên chỗ nghỉ để lưu hoạt động nghỉ ngơi."}
      </span>
      {nights && (
        <span>
          Số đêm của booking: <b>{nights}</b>
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!hotelName.trim()}
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động nghỉ ngơi"}
      </button>
    </div>
  );

  return (
    <ActivityModalShell
      open={open}
      onClose={onClose}
      icon={{
        main: <FaBed />,
        close: <FaTimes size={14} />,
        bg: "from-violet-500 to-purple-500",
      }}
      title="Hoạt động nghỉ ngơi"
      typeLabel="Stay"
      subtitle="Chỗ nghỉ cho một phần trong ngày (trưa, tối, qua đêm...)."
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
            Chỗ nghỉ + địa chỉ + thời gian nghỉ
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
              placeholder="Ví dụ: Nghỉ trưa homestay A, ngủ đêm khách sạn B..."
              className={`${inputBase} w-full mt-1`}
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên chỗ nghỉ{" "}
              <span className="text-red-500 align-middle">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaBed className="text-violet-500" />
              <input
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Khách sạn / homestay / chỗ nghỉ..."
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ chỗ nghỉ..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Giờ bắt đầu nghỉ
              </label>
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-violet-500" />
                <TimePicker value={checkIn} onChange={setCheckIn} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Giờ kết thúc nghỉ
              </label>
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-violet-500" />
                <TimePicker value={checkOut} onChange={setCheckOut} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHI PHÍ NGHỈ NGƠI */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Chi phí nghỉ ngơi
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Chi phí cho một lần nghỉ trong ngày + phát sinh + ngân sách + thực tế
          </span>
        </div>

        <div className={sectionCard + " space-y-4"}>
          {/* Chi phí chính cho lần nghỉ này */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Chi phí dự kiến cho lần nghỉ này
            </label>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" />
              <input
                type="number"
                min="0"
                value={pricePerTime}
                onChange={(e) => setPricePerTime(e.target.value)}
                placeholder="VD: 450.000"
                className={`${inputBase} flex-1`}
              />
              <span className="text-xs text-slate-500">đ</span>
            </div>
          </div>

          {/* Số đêm booking (thông tin) */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Số đêm của cả booking (thông tin thêm)
            </label>
            <input
              type="number"
              min="1"
              value={nights}
              onChange={(e) => setNights(e.target.value)}
              className={`${inputBase} w-full`}
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Dùng để ghi chú tổng thời gian lưu trú, nhưng chi phí chia cho ngày
              này chỉ lấy <b>một phần tương ứng với lần nghỉ này</b>.
            </p>
          </div>

          {/* Chi phí phát sinh nhiều dòng */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Chi phí phát sinh (gửi xe, minibar, phụ thu...)
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
                    placeholder="Ví dụ: gửi xe, phụ thu check-in sớm..."
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
                Tổng chi phí thực tế cho lần nghỉ này (nếu có)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Điền sau khi thanh toán"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Nếu để trống, hệ thống sẽ dùng <b>chi phí dự kiến + phát sinh</b>{" "}
                để chia tiền.
              </p>
            </div>

            {/* Ngân sách */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Ngân sách cho lần nghỉ này (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="VD: 1.000.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>
          {/* TÓM TẮT CHI PHÍ kiểu card (giống Food/Transport) */}
          <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
            <div>
              Chi phí cơ bản:{" "}
              <span className="font-semibold">
                {baseEstimated.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Phát sinh:{" "}
              <span className="font-semibold">
                {extraTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Tổng dự kiến (cơ bản + phát sinh):{" "}
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                {estimatedCost.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {actualCost && Number(actualCost) > 0 && (
              <div>
                Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
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
          placeholder="Ví dụ: yêu cầu phòng yên tĩnh, gần thang máy, có hồ bơi..."
          className={`${inputBase} w-full`}
        />
      </section>
    </ActivityModalShell>
  );
}
