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
import { buildSplitBase } from "../../../planBoard/utils/splitUtils";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import ExtraCostsSection from "../ExtraCostsSection";
import { inputBase, sectionCard } from "../activityStyles";
import PlacePickerModal from "../PlacePickerModal";

// Có thể tái sử dụng chung cho các modal khác nếu muốn
const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

export default function StayActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  stayLocation: stayLocationProp,
}) {
  const [title, setTitle] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [pricePerTime, setPricePerTime] = useState("");
  const [nights, setNights] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  // dùng chung format với Transport: { reason, type, estimatedAmount, actualAmount }
  const [extraCosts, setExtraCosts] = useState([]);

  // ===== CHIA TIỀN =====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  const [errors, setErrors] = useState({});

  // ===== PLACE PICKER LOCAL =====
  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalStayLocation, setInternalStayLocation] = useState(null);

  const effectiveStayLocation = internalStayLocation || stayLocationProp || null;

  // ===== LOAD MODAL =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

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

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      // ===== LOAD EXTRA COSTS (chuẩn hoá về {reason, type, actualAmount}) =====
      let extras = [];

      if (data.extraItems && Array.isArray(data.extraItems) && data.extraItems.length > 0) {
        // từ activityData cũ
        extras = data.extraItems.map((it) => ({
          reason: it.reason || it.note || "Chi phí phát sinh",
          type: it.type || "OTHER",
          estimatedAmount: null,
          actualAmount:
            it.actualAmount != null
              ? it.actualAmount
              : it.amount != null
              ? Number(it.amount)
              : 0,
        }));
      } else if (cost.extraCosts && Array.isArray(cost.extraCosts) && cost.extraCosts.length > 0) {
        // từ cost trong BE
        extras = cost.extraCosts.map((e) => ({
          reason: e.reason || "Chi phí phát sinh",
          type: e.type || "OTHER",
          estimatedAmount: null,
          actualAmount:
            e.actualAmount != null && e.actualAmount !== ""
              ? Number(e.actualAmount)
              : 0,
        }));
      } else if (data.extraSpend != null) {
        // chỉ lưu tổng extraSpend
        extras = [
          {
            reason: "Chi phí phát sinh",
            type: "OTHER",
            estimatedAmount: null,
            actualAmount: Number(data.extraSpend) || 0,
          },
        ];
      }

      setExtraCosts(extras);

      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      setNote(editingCard.description || "");

      // stay location từ activityData cũ (nếu có)
      if (data.hotelLocation) {
        setInternalStayLocation(data.hotelLocation);
      } else {
        setInternalStayLocation(null);
      }

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
      setExtraCosts([]);

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");

      setInternalStayLocation(stayLocationProp || null);
    }
  }, [open, editingCard, stayLocationProp]);

  // Nếu parent thay đổi stayLocationProp bên ngoài (rare) thì sync
  useEffect(() => {
    if (!editingCard && stayLocationProp) {
      setInternalStayLocation(stayLocationProp);
    }
  }, [stayLocationProp, editingCard]);

  // ===== SYNC LOCATION VÀO TÊN / ĐỊA CHỈ =====
  useEffect(() => {
    if (!effectiveStayLocation) return;

    if (effectiveStayLocation.label || effectiveStayLocation.name) {
      setHotelName(effectiveStayLocation.label || effectiveStayLocation.name || "");
    }

    if (effectiveStayLocation.address || effectiveStayLocation.fullAddress) {
      setAddress(
        effectiveStayLocation.address ||
          effectiveStayLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveStayLocation]);

  // ===== COST LOGIC =====
  const baseEstimated = useMemo(
    () => Number(pricePerTime || 0),
    [pricePerTime]
  );

  const extraTotal = useMemo(
    () =>
      extraCosts
        .map((e) => Number(e.actualAmount) || 0)
        .reduce((a, b) => a + b, 0),
    [extraCosts]
  );

  const estimatedCost = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

  // ===== TIME LOGIC =====
  const computeDurationMinutes = () => {
    if (!checkIn || !checkOut) return null;
    const [sh, sm] = checkIn.split(":").map(Number);
    const [eh, em] = checkOut.split(":").map(Number);
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

  const splitBase = useMemo(
    () =>
      buildSplitBase({
        splitEnabled,
        splitType,
        participantCount,
        splitNames,
        exactAmounts,
        payerChoice,
        payerExternalName,
        planMembers,
        parsedActual,
      }),
    [
      splitEnabled,
      splitType,
      participantCount,
      splitNames,
      exactAmounts,
      payerChoice,
      payerExternalName,
      planMembers,
      parsedActual,
    ]
  );

  const {
    parsedParticipants,
    participants,
    split: splitPayload,
    evenShare,
    evenRemainder,
    totalExact,
  } = splitBase;

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

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = extraCosts
      .map((e) => ({
        reason: e.reason || "Chi phí phát sinh",
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
      estimatedCost: estimatedCost || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? parsedParticipants : null,
      participants,
      extraCosts: normalizedExtraCosts,
    };

    return {
      cost,
      split: splitPayload,
      participants,
      normalizedExtraCosts,
    };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!hotelName.trim()) {
      newErrors.hotelName = "Vui lòng nhập hoặc chọn chỗ nghỉ.";
    }

    if (checkIn && checkOut && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants, normalizedExtraCosts } = buildPayload();

    onSubmit?.({
      type: "STAY",
      title: title || `Nghỉ tại ${hotelName}`,
      text: title || `Nghỉ tại ${hotelName}`,
      description: note || "",
      startTime: checkIn || null,
      endTime: checkOut || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        hotelName,
        address,
        hotelLocation: effectiveStayLocation || null,
        checkIn,
        checkOut,
        pricePerTime: pricePerTime ? Number(pricePerTime) : null,
        pricePerNight: pricePerTime ? Number(pricePerTime) : null,
        nights: nights ? Number(nights) : null,
        actualCost: actualCost ? Number(actualCost) : null,
        extraSpend: extraTotal || null,
        extraItems: normalizedExtraCosts,
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
          : "Điền/chọn tên chỗ nghỉ để lưu hoạt động nghỉ ngơi."}
      </span>
      {nights && (
        <span>
          Số đêm của booking: <b>{nights}</b>
        </span>
      )}
      {checkIn && checkOut && durationMinutes != null && (
        <span>
          Thời gian:{" "}
          <b>
            {checkIn} - {checkOut} ({durationMinutes} phút)
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition"
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động nghỉ ngơi"}
      </button>
    </div>
  );

  return (
    <>
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

            {/* ĐỊA CHỈ - chọn trên bản đồ */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa chỉ / vị trí trên bản đồ
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`
                  group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-violet-400 hover:shadow-md hover:bg-violet-50/70
                  dark:hover:border-violet-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.hotelName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }
                `}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-violet-50 text-violet-500 border border-violet-100
                                dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveStayLocation || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveStayLocation?.label ||
                          effectiveStayLocation?.name ||
                          hotelName ||
                          "Chỗ nghỉ đã chọn"}
                      </p>
                      {(effectiveStayLocation?.address ||
                        effectiveStayLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveStayLocation?.address ||
                            effectiveStayLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveStayLocation?.lat != null &&
                          effectiveStayLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                              {effectiveStayLocation.lat.toFixed(4)},{" "}
                              {effectiveStayLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn chỗ nghỉ trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn khách sạn/homestay làm chỗ nghỉ.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-violet-500 group-hover:text-violet-600 dark:text-violet-300
                                dark:group-hover:text-violet-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.hotelName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.hotelName}
                </p>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giờ bắt đầu nghỉ
                </label>
                <div
                  className={`
                    flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm
                    ${
                      errors.time
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }
                  `}
                >
                  <FaClock
                    className={errors.time ? "text-rose-500" : "text-violet-500"}
                  />
                  <TimePicker
                    value={checkIn}
                    onChange={(val) => {
                      setCheckIn(val);
                      setErrors((prev) => ({ ...prev, time: "" }));
                    }}
                    error={Boolean(errors.time)}
                    color="violet"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giờ kết thúc nghỉ
                </label>
                <div
                  className={`
                    flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm
                    ${
                      errors.time
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }
                  `}
                >
                  <FaClock
                    className={errors.time ? "text-rose-500" : "text-violet-500"}
                  />
                  <TimePicker
                    value={checkOut}
                    onChange={(val) => {
                      setCheckOut(val);
                      setErrors((prev) => ({ ...prev, time: "" }));
                    }}
                    error={Boolean(errors.time)}
                    color="violet"
                  />
                </div>
              </div>
            </div>

            {errors.time && (
              <p className="mt-1.5 text-[11px] text-rose-500">
                {errors.time}
              </p>
            )}

            {durationMinutes != null && !errors.time && (
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Thời lượng dự kiến:{" "}
                <span className="font-semibold">{durationMinutes} phút</span>
              </p>
            )}
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

            {/* CHI PHÍ PHÁT SINH – dùng chung ExtraCostsSection */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            {/* CHI PHÍ THỰC TẾ & NGÂN SÁCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  Nếu để trống, hệ thống sẽ dùng{" "}
                  <b>chi phí dự kiến + phát sinh</b> để chia tiền.
                </p>
              </div>

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

            {/* TÓM TẮT CHI PHÍ */}
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

      {/* PLACE PICKER CHO STAY */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          setInternalStayLocation(loc || null);
          if (loc?.label || loc?.name) {
            setHotelName(loc.label || loc.name);
            setErrors((prev) => ({ ...prev, hotelName: "" }));
          }
          if (loc?.address || loc?.fullAddress) {
            setAddress(loc.address || loc.fullAddress);
          }
        }}
        initialTab="HOTEL"
        activityType="STAY"
        field="stay"
        initialLocation={effectiveStayLocation}
      />
    </>
  );
}
