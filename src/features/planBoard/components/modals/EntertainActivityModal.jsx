"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaGamepad,
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
  { value: "RENTAL", label: "Thuê đồ" },
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "OTHER", label: "Khác" },
];

export default function EntertainActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketCount, setTicketCount] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  // dùng format extraCosts chung
  const [extraCosts, setExtraCosts] = useState([]);

  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalEntertainLocation, setInternalEntertainLocation] =
    useState(null);
  const effectiveEntertainLocation = internalEntertainLocation || null;

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
      setPlaceName(data.placeName || "");
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

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }
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

      setBudgetAmount(
        cost.budgetAmount !== undefined && cost.budgetAmount !== null
          ? String(cost.budgetAmount)
          : ""
      );

      setNote(editingCard.description || "");

      // location object (nếu đã từng lưu)
      if (data.entertainLocation) {
        setInternalEntertainLocation(data.entertainLocation);
      } else {
        setInternalEntertainLocation(null);
      }

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
      // reset khi tạo mới
      setTitle("");
      setPlaceName("");
      setAddress("");

      setStartTime("");
      setEndTime("");

      setTicketPrice("");
      setTicketCount("1");
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

      setInternalEntertainLocation(null);
    }
  }, [open, editingCard]);

  // SYNC từ location chọn trên bản đồ vào tên + địa chỉ
  useEffect(() => {
    if (!effectiveEntertainLocation) return;

    if (effectiveEntertainLocation.label || effectiveEntertainLocation.name) {
      setPlaceName(
        effectiveEntertainLocation.label ||
          effectiveEntertainLocation.name ||
          ""
      );
    }

    if (
      effectiveEntertainLocation.address ||
      effectiveEntertainLocation.fullAddress
    ) {
      setAddress(
        effectiveEntertainLocation.address ||
          effectiveEntertainLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveEntertainLocation]);

  const baseEstimated = useMemo(() => {
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

  const estimatedCost = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  // Số tiền dùng để chia: ưu tiên actualCost
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

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
      extraTotal: extraTotalNormalized,
    };
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!placeName.trim()) {
      newErrors.placeName = "Vui lòng nhập hoặc chọn địa điểm vui chơi.";
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
      type: "ENTERTAIN",
      title: title || `Vui chơi: ${placeName}`,
      text: title || `Vui chơi: ${placeName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        placeName,
        address,
        entertainLocation: effectiveEntertainLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        ticketCount: ticketCount ? Number(ticketCount) : null,
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

  const headerRight =
    parsedActual > 0 || (budgetAmount && Number(budgetAmount) > 0) ? (
      <div className="hidden sm:flex flex-col items-end text-xs">
        {parsedActual > 0 && (
          <>
            <span className="text-slate-500 dark:text-slate-400">
              Tổng chi dùng để chia
            </span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
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
        {placeName
          ? `Vui chơi: ${placeName}`
          : "Điền/chọn địa điểm vui chơi để lưu hoạt động."}
      </span>
      {(effectiveEntertainLocation || address) && (
        <span>
          Địa điểm:{" "}
          <b>
            {effectiveEntertainLocation?.address ||
              effectiveEntertainLocation?.fullAddress ||
              address}
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition"
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động vui chơi"}
      </button>
    </div>
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaGamepad />,
          close: <FaTimes size={14} />,
          bg: "from-emerald-500 to-teal-500",
        }}
        title="Hoạt động vui chơi"
        typeLabel="Entertain"
        subtitle="Công viên, trò chơi, khu giải trí, thuê đồ chơi..."
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
              Địa điểm + địa chỉ + thời gian
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
                placeholder="Ví dụ: Chơi moto nước, công viên nước..."
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
                  hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/70
                  dark:hover:border-emerald-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.placeName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }
                `}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-emerald-50 text-emerald-500 border border-emerald-100
                                dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveEntertainLocation || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveEntertainLocation?.label ||
                          effectiveEntertainLocation?.name ||
                          placeName ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveEntertainLocation?.address ||
                        effectiveEntertainLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveEntertainLocation?.address ||
                            effectiveEntertainLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveEntertainLocation?.lat != null &&
                          effectiveEntertainLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                              {effectiveEntertainLocation.lat.toFixed(4)},{" "}
                              {effectiveEntertainLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm vui chơi trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn khu vui chơi / công viên / bãi biển.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-300
                                dark:group-hover:text-emerald-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.placeName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.placeName}
                </p>
              )}
            </div>

            {/* Thời gian: bắt đầu / kết thúc */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Thời gian vui chơi
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
                  <FaClock
                    className={errors.time ? "text-rose-500" : "text-emerald-500"}
                  />
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
                      color="emerald"
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
                  <FaClock
                    className={errors.time ? "text-rose-500" : "text-emerald-500"}
                  />
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
                      color="emerald"
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

        {/* CHI PHÍ VUI CHƠI */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí vui chơi
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Giá vé / lượt + chi phí phát sinh + ngân sách + chi phí thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Giá vé & số lượt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá vé / lượt
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="VD: 150.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số lượt / người tham gia
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

            {/* Chi phí phát sinh – dùng ExtraCostsSection */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chi phí thực tế */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho hoạt động này (nếu có)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Điền sau khi chơi và thanh toán xong"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống, hệ thống sẽ dùng{" "}
                  <b>chi phí vé + phát sinh</b> để chia tiền.
                </p>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho hoạt động (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-teal-500" />
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

            {/* Tóm tắt chi phí */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Chi phí vé:{" "}
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
                Tổng dự kiến (vé + phát sinh):{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
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
            placeholder="Ví dụ: nên thuê phao, đồ bảo hộ, tới sớm để xếp hàng..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO ENTERTAIN */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          setInternalEntertainLocation(loc || null);
          if (loc?.label || loc?.name) {
            setPlaceName(loc.label || loc.name);
            setErrors((prev) => ({ ...prev, placeName: "" }));
          }
          if (loc?.address || loc?.fullAddress) {
            setAddress(loc.address || loc.fullAddress);
          }
        }}
        initialTab="ENTERTAIN"
        activityType="ENTERTAIN"
        field="entertain"
        initialLocation={effectiveEntertainLocation}
      />
    </>
  );
}
