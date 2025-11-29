"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaFilm,
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard, pillBtn } from "../activityStyles";

const FORMATS = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "4DX", label: "4DX" },
];

export default function CinemaActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [cinemaName, setCinemaName] = useState("");
  const [address, setAddress] = useState("");
  const [movieName, setMovieName] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [format, setFormat] = useState("2D");
  const [seats, setSeats] = useState("");

  const [ticketPrice, setTicketPrice] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [extraSpend, setExtraSpend] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState(""); // ⬅️ THỰC TẾ
  const [note, setNote] = useState("");

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

      setTitle(editingCard.text || "");
      setCinemaName(data.cinemaName || "");
      setAddress(data.address || "");
      setMovieName(data.movieName || "");
      setFormat(data.format || "2D");
      setSeats(data.seats || "");

      const loadedStart =
        editingCard.startTime || data.startTime || data.showtime || "";
      const loadedEnd =
        editingCard.endTime ||
        data.endTime ||
        editingCard.startTime ||
        data.showtime ||
        "";

      setStartTime(loadedStart);
      setEndTime(loadedEnd);

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );
      setComboPrice(
        data.comboPrice != null ? String(data.comboPrice) : ""
      );

      if (data.extraSpend != null) {
        setExtraSpend(String(data.extraSpend));
      } else if (cost.extraCosts && cost.extraCosts.length > 0) {
        const sumExtra = cost.extraCosts
          .map((e) => Number(e.actualAmount) || 0)
          .reduce((a, b) => a + b, 0);
        setExtraSpend(sumExtra ? String(sumExtra) : "");
      } else {
        setExtraSpend("");
      }

      // THỰC TẾ: ưu tiên activityData, sau đó cost.actualCost
      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

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
      setCinemaName("");
      setAddress("");
      setMovieName("");
      setFormat("2D");
      setSeats("");

      setStartTime("");
      setEndTime("");

      setTicketPrice("");
      setComboPrice("");
      setExtraSpend("");
      setBudgetAmount("");
      setActualCost("");
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

  // ===== COST LOGIC =====
  const baseCost = useMemo(() => {
    const t = Number(ticketPrice || 0);
    const c = Number(comboPrice || 0);
    return t + c;
  }, [ticketPrice, comboPrice]);

  const extraValue = useMemo(
    () => Number(extraSpend || 0),
    [extraSpend]
  );

  // tổng tạm tính vé + combo + phát sinh
  const estimatedCost = baseCost + extraValue;

  // số tiền dùng để chia: ưu tiên chi phí thực tế
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

  const totalWithExtra = estimatedCost;

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

    const extraCosts = extraValue
      ? [
          {
            reason: "Chi phí phát sinh",
            type: "OTHER",
            estimatedAmount: null,
            actualAmount: extraValue,
          },
        ]
      : [];

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedCost || null, // gồm vé + combo + phát sinh
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
    if (!cinemaName.trim() || !movieName.trim()) return;

    const { cost, split, participants } = buildPayload();

    onSubmit?.({
      type: "CINEMA",
      title: title || `Xem phim: ${movieName}`,
      text: title || `Xem phim: ${movieName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        cinemaName,
        address,
        movieName,
        format,
        seats,
        showtime: startTime || "",
        startTime,
        endTime,
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        comboPrice: comboPrice ? Number(comboPrice) : null,
        extraSpend: extraSpend ? Number(extraSpend) : null,
        actualCost: actualCost ? Number(actualCost) : null,
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
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
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
        {movieName
          ? `Xem phim: ${movieName}`
          : "Điền tên phim và rạp để lưu hoạt động xem phim."}
      </span>
      {cinemaName && (
        <span>
          Rạp: <b>{cinemaName}</b>
        </span>
      )}
      {startTime && endTime && durationMinutes != null && (
        <span>
          Suất:{" "}
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!cinemaName.trim() || !movieName.trim()}
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động xem phim"}
      </button>
    </div>
  );

  return (
    <ActivityModalShell
      open={open}
      onClose={onClose}
      icon={{
        main: <FaFilm />,
        close: <FaTimes size={14} />,
        bg: "from-rose-500 to-pink-500",
      }}
      title="Hoạt động xem phim"
      typeLabel="Cinema"
      subtitle="Chọn rạp, phim, giờ chiếu và chi phí đi xem phim."
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
            Rạp + phim + thời gian
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
              placeholder="Ví dụ: Xem phim tối tại CGV..."
              className={`${inputBase} w-full mt-1`}
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Rạp chiếu phim <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaFilm className="text-rose-500" />
              <input
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                placeholder="CGV, Lotte Cinema..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Địa chỉ rạp
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaMapMarkerAlt className="text-red-400" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ chi tiết"
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên phim <span className="text-red-500">*</span>
            </label>
            <input
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              placeholder="Tên bộ phim..."
              className={`${inputBase} w-full mt-1`}
            />
          </div>

          {/* Thời gian chiếu: bắt đầu / kết thúc */}
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Thời gian chiếu
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-rose-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Bắt đầu
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-rose-500" />
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

      {/* ĐỊNH DẠNG + GHẾ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Định dạng & ghế ngồi
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Chọn format phim & ghế (nếu muốn)
          </span>
        </div>

        <div className={sectionCard + " space-y-3"}>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Định dạng phim
            </label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => {
                const active = f.value === format;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    className={`${pillBtn} ${
                      active
                        ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.03]"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Ghế ngồi (tuỳ chọn)
            </label>
            <div className="flex items-center gap-2">
              <FaChair className="text-indigo-500" />
              <input
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder="VD: H8, H9"
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CHI PHÍ XEM PHIM */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Chi phí xem phim
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Vé + combo bắp nước + phát sinh + ngân sách
          </span>
        </div>

        <div className={sectionCard + " space-y-3"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Giá vé
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="VD: 90.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Giá combo bắp nước (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value)}
                  placeholder="VD: 50.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>

          {/* PHÁT SINH + NGÂN SÁCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Chi phí phát sinh (gửi xe, đồ ăn thêm...)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={extraSpend}
                  onChange={(e) => setExtraSpend(e.target.value)}
                  placeholder="VD: 10.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Ngân sách cho lần xem phim (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-rose-500" />
                <input
                  type="number"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="VD: 300.000"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>

          {/* THỰC TẾ + NOTE */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Tổng chi phí thực tế cho lần xem phim (nếu có)
            </label>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" />
              <input
                type="number"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Điền sau khi thanh toán hoá đơn"
                className={`${inputBase} flex-1`}
              />
              <span className="text-xs text-slate-500">đ</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Nếu để trống <b>chi phí thực tế</b>, hệ thống sẽ dùng{" "}
              <b>giá vé + combo + phát sinh</b> để chia tiền.
            </p>
          </div>

          {/* TÓM TẮT DẠNG CARD DỌC (giống Shopping) */}
          <div className="mt-1 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 px-4 py-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200 space-y-0.5">
            <div>
              Giá vé:{" "}
              <span className="font-semibold">
                {Number(ticketPrice || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Combo bắp nước:{" "}
              <span className="font-semibold">
                {Number(comboPrice || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Dự kiến vé + combo:{" "}
              <span className="font-semibold">
                {baseCost.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Chi phí phát sinh:{" "}
              <span className="font-semibold">
                {extraValue.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div>
              Tổng dự kiến (sau phát sinh):{" "}
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {totalWithExtra.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {actualCost && Number(actualCost) > 0 && (
              <div>
                Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
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
            Thêm cảm nhận / lưu ý sau khi xem phim
          </span>
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Phim hay, nên đi sớm 10 phút..."
          className={`${inputBase} w-full`}
        />
      </section>
    </ActivityModalShell>
  );
}
