"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";
import { buildSplitBase } from "../../../planBoard/utils/splitUtils";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import ExtraCostsSection from "../ExtraCostsSection";
import PlacePickerModal from "../PlacePickerModal";
import { inputBase, sectionCard } from "../activityStyles";

const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

export default function EventActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketCount, setTicketCount] = useState("1");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);

  // ===== CHIA TIỀN =====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  // ===== PLACE PICKER =====
  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalEventLocation, setInternalEventLocation] = useState(null);
  const effectiveEventLocation = internalEventLocation || null;

  // ===== ERRORS =====
  const [errors, setErrors] = useState({});

  // ===== LOAD KHI EDIT / RESET =====
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
      setEventName(data.eventName || "");
      setVenue(data.venue || "");
      setAddress(data.address || "");

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

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );
      setTicketCount(
        data.ticketCount != null ? String(data.ticketCount) : "1"
      );

      // ---- EXTRA COSTS ----
      let extras = [];

      if (
        data.extraItems &&
        Array.isArray(data.extraItems) &&
        data.extraItems.length > 0
      ) {
        extras = data.extraItems.map((it) => ({
          reason: it.reason || it.note || "Chi phí phụ",
          type: it.type || "OTHER",
          estimatedAmount: null,
          actualAmount:
            it.actualAmount != null
              ? it.actualAmount
              : it.amount != null
              ? Number(it.amount)
              : 0,
        }));
      } else if (
        cost.extraCosts &&
        Array.isArray(cost.extraCosts) &&
        cost.extraCosts.length > 0
      ) {
        extras = cost.extraCosts.map((e) => ({
          reason: e.reason || "Chi phí phụ",
          type: e.type || "OTHER",
          estimatedAmount: null,
          actualAmount:
            e.actualAmount != null && e.actualAmount !== ""
              ? Number(e.actualAmount)
              : 0,
        }));
      } else if (data.extraSpend != null) {
        extras = [
          {
            reason: "Chi phí phụ",
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

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setNote(editingCard.description || "");

      if (data.eventLocation) {
        setInternalEventLocation(data.eventLocation);
      } else {
        setInternalEventLocation(null);
      }

      // ===== LOAD SPLIT dùng chung buildSplitBase =====
      const splitObj = split || {};
      if (splitObj.splitType && splitObj.splitType !== "NONE") {
        setSplitEnabled(true);
        setSplitType(splitObj.splitType);

        const pc =
          cost.participantCount ||
          splitObj.splitMembers?.length ||
          splitObj.splitDetails?.length ||
          data.ticketCount ||
          editingCard.participantCount ||
          2;

        setParticipantCount(String(pc));

        let names = [];
        if (splitObj.splitMembers?.length) {
          names = splitObj.splitMembers.map((m) => m.displayName || "");
        }
        if (names.length < pc) {
          names = [...names, ...Array(pc - names.length).fill("")];
        }
        setSplitNames(names);

        if (splitObj.splitType === "EXACT" && splitObj.splitDetails) {
          setExactAmounts(
            splitObj.splitDetails.map((d) =>
              d.amount != null ? String(d.amount) : ""
            )
          );
        } else {
          setExactAmounts([]);
        }

        setPayerChoice("");
        setPayerExternalName("");
        if (splitObj.payerId) {
          setPayerChoice(`member:${splitObj.payerId}`);
        } else if (splitObj.payments && splitObj.payments.length > 0) {
          const first = splitObj.payments[0];
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
      // RESET khi mở mới
      setTitle("");
      setEventName("");
      setVenue("");
      setAddress("");

      setStartTime("");
      setEndTime("");

      setTicketPrice("");
      setTicketCount("1");
      setBudgetAmount("");
      setActualCost("");
      setNote("");
      setExtraCosts([]);

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");

      setInternalEventLocation(null);
    }
  }, [open, editingCard]);

  // SYNC từ effectiveEventLocation vào venue + address
  useEffect(() => {
    if (!effectiveEventLocation) return;

    if (effectiveEventLocation.label || effectiveEventLocation.name) {
      setVenue(
        effectiveEventLocation.label || effectiveEventLocation.name || ""
      );
    }
    if (
      effectiveEventLocation.address ||
      effectiveEventLocation.fullAddress
    ) {
      setAddress(
        effectiveEventLocation.address ||
          effectiveEventLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveEventLocation]);

  // ===== DỰ KIẾN & TỔNG =====
  const ticketTotal = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(ticketCount || 0);
    return p * c;
  }, [ticketPrice, ticketCount]);

  const extraTotal = useMemo(
    () =>
      extraCosts
        .map((e) => Number(e.actualAmount) || 0)
        .reduce((a, b) => a + b, 0),
    [extraCosts]
  );

  const estimatedTotal = useMemo(
    () => ticketTotal + extraTotal,
    [ticketTotal, extraTotal]
  );

  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedTotal;
  }, [actualCost, estimatedTotal]);

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

  // ===== SPLIT UTILS (dùng chung buildSplitBase) =====
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
        reason: e.reason || "Chi phí phụ",
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

    const extraTotalNormalized = normalizedExtraCosts
      .map((e) => e.actualAmount || 0)
      .reduce((a, b) => a + b, 0);

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedTotal || null,
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
      extraTotal: extraTotalNormalized,
    };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!eventName.trim()) {
      newErrors.eventName = "Vui lòng nhập tên sự kiện.";
    }

    // BẮT BUỘC CÓ ĐỊA ĐIỂM: venue / address / chọn trên bản đồ
    if (
      !effectiveEventLocation &&
      !venue.trim() &&
      !address.trim()
    ) {
      newErrors.venue =
        "Vui lòng chọn địa điểm sự kiện trên bản đồ hoặc nhập venue / địa chỉ.";
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants, normalizedExtraCosts, extraTotal } =
      buildPayload();

    onSubmit?.({
      type: "EVENT",
      title: title || `Sự kiện: ${eventName}`,
      text: title || `Sự kiện: ${eventName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        eventName,
        venue,
        address,
        eventLocation: effectiveEventLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        ticketCount: ticketCount ? Number(ticketCount) : null,
        extraSpend: extraTotal || null,
        extraItems: normalizedExtraCosts,
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
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
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
        {eventName
          ? `Sự kiện: ${eventName}`
          : "Điền tên sự kiện để lưu hoạt động."}
      </span>
      {(effectiveEventLocation || venue || address) && (
        <span>
          Địa điểm:{" "}
            <b>
              {effectiveEventLocation?.label ||
                effectiveEventLocation?.name ||
                venue ||
                "Đã chọn"}
            </b>
        </span>
      )}
      {startTime && endTime && durationMinutes != null && !errors.time && (
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition"
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động sự kiện"}
      </button>
    </div>
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaCalendarAlt />,
          close: <FaTimes size={14} />,
          bg: "from-indigo-500 to-purple-500",
        }}
        title="Hoạt động sự kiện"
        typeLabel="Event"
        subtitle="Concert, lễ hội, workshop, show..."
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
              Tên sự kiện + địa điểm + thời gian
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
                placeholder="Ví dụ: Concert Đen Vâu, lễ hội ánh sáng..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tên sự kiện{" "}
                <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaCalendarAlt className="text-indigo-500" />
                <input
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value);
                    setErrors((prev) => ({ ...prev, eventName: "" }));
                  }}
                  placeholder="Tên concert, show, workshop..."
                  className={`${inputBase} flex-1 ${
                    errors.eventName
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                      : ""
                  }`}
                />
              </div>
              {errors.eventName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.eventName}
                </p>
              )}
            </div>

            {/* ĐỊA ĐIỂM - chọn trên bản đồ */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa điểm tổ chức / venue{" "}
                <span className="text-red-500 align-middle">*</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setPlacePickerOpen(true);
                  setErrors((prev) => ({ ...prev, venue: "" }));
                }}
                className={`group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                          border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                          flex items-start gap-3 text-left
                          hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/70
                          dark:hover:border-indigo-500 dark:hover:bg-slate-900
                          transition
                          ${
                            errors.venue
                              ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                              : ""
                          }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-indigo-50 text-indigo-500 border border-indigo-100
                                dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveEventLocation || venue || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveEventLocation?.label ||
                          effectiveEventLocation?.name ||
                          venue ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveEventLocation?.address ||
                        effectiveEventLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveEventLocation?.address ||
                            effectiveEventLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveEventLocation?.lat != null &&
                          effectiveEventLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                              {effectiveEventLocation.lat.toFixed(4)},{" "}
                              {effectiveEventLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm sự kiện trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, tìm sân vận động, hội trường, venue
                        tổ chức...
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-300
                                dark:group-hover:text-indigo-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.venue && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* Địa chỉ chi tiết (tuỳ chọn) */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa chỉ chi tiết (tuỳ chọn)
              </label>
              <input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, venue: "" }));
                  }
                }}
                placeholder="Địa chỉ cụ thể, ghi chú chỗ gửi xe, cổng vào..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* Thời gian sự kiện */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Thời gian sự kiện
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
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
                  <FaClock className="text-indigo-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Bắt đầu
                  </span>
                  <div className="flex-1 flex justify-end">
                    <TimePicker
                      value={startTime}
                      onChange={(val) => {
                        setStartTime(val);
                        setErrors((prev) => ({ ...prev, time: "" }));
                      }}
                      error={Boolean(errors.time)}
                      color="indigo"
                    />
                  </div>
                </div>

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
                  <FaClock className="text-indigo-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Kết thúc
                  </span>
                  <div className="flex-1 flex justify-end">
                    <TimePicker
                      value={endTime}
                      onChange={(val) => {
                        setEndTime(val);
                        setErrors((prev) => ({ ...prev, time: "" }));
                      }}
                      error={Boolean(errors.time)}
                      color="indigo"
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
                  Thời lượng ước tính:{" "}
                  <span className="font-semibold">{durationMinutes} phút</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* CHI PHÍ SỰ KIỆN */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí sự kiện
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Vé + phát sinh (gửi xe, đồ ăn, merch...) + ngân sách + thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Vé / số vé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá vé / người
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="VD: 500.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số vé (ước tính)
                </label>
                <input
                  type="number"
                  min="1"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(e.target.value)}
                  className={`${inputBase} w-full`}
                />
              </div>
            </div>

            {/* CHI PHÍ PHÁT SINH – dùng ExtraCostsSection chung */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
              label="Chi phí phát sinh (gửi xe, đồ ăn, merch...)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chi phí thực tế */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho sự kiện (nếu có)
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
                  <b>tổng giá vé + chi phí phát sinh</b> để chia tiền.
                </p>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho sự kiện (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-indigo-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 1.500.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            {/* TÓM TẮT CHI PHÍ */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Tổng giá vé (ước tính):{" "}
                <span className="font-semibold">
                  {ticketTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Tổng dự kiến:{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
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
            splitType={setSplitType}
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
          <div className="flex items-center justify_between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Ghi chú
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Thêm lưu ý nhỏ cho cả nhóm
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: đến sớm 30 phút, mang áo mưa nhẹ, hẹn nhau cổng số 3..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO EVENT */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          const next = loc || null;
          setInternalEventLocation(next);
          setErrors((prev) => ({ ...prev, venue: "" }));
          if (next?.label || next?.name) {
            setVenue(next.label || next.name);
          }
          if (next?.address || next?.fullAddress) {
            setAddress(next.address || next.fullAddress);
          }
        }}
        initialTab="PLACE"
        activityType="EVENT"
        field="event"
        initialLocation={effectiveEventLocation}
      />
    </>
  );
}
