"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaRoute,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";
import { haversineDistanceKm } from "../../../planBoard/utils/distance";
import ActivityModalShell from "../ActivityModalShell";
import ExtraCostsSection from "../ExtraCostsSection";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard, pillBtn } from "../activityStyles";
import { buildSplitBase } from "../../../planBoard/utils/splitUtils";
import PlacePickerModal from "../PlacePickerModal";

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
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [placePickerField, setPlacePickerField] = useState(null); // "from" | "to"
  const [internalFromLocation, setInternalFromLocation] = useState(null);
  const [internalToLocation, setInternalToLocation] = useState(null);

  const effectiveFromLocation = internalFromLocation || null;
  const effectiveToLocation = internalToLocation || null;

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
      setFromPlace(data.fromPlace || "");
      setToPlace(data.toPlace || "");
      setStops(data.stops || []);
      setMethod(data.method || "taxi");

      setStartTime(editingCard.startTime || "");
      setEndTime(editingCard.endTime || "");

      setEstimatedCost(
        cost.estimatedCost !== undefined && cost.estimatedCost !== null
          ? String(cost.estimatedCost)
          : ""
      );

      setBudgetAmount(
        cost.budgetAmount !== undefined && cost.budgetAmount !== null
          ? String(cost.budgetAmount)
          : ""
      );

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setExtraCosts(cost.extraCosts || []);

      setNote(editingCard.description || "");

      // load from/to location đã lưu trong activityData
      setInternalFromLocation(data.fromLocation || null);
      setInternalToLocation(data.toLocation || null);

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

      setInternalFromLocation(null);
      setInternalToLocation(null);
      setPlacePickerField(null);
      setPlacePickerOpen(false);
    }
  }, [open, editingCard]);

  // đồng bộ text nếu có location (giống Stay)
  useEffect(() => {
    if (effectiveFromLocation) {
      const label =
        effectiveFromLocation.label ||
        effectiveFromLocation.name ||
        effectiveFromLocation.address ||
        "";
      if (label) setFromPlace(label);
    }
    if (effectiveToLocation) {
      const label =
        effectiveToLocation.label ||
        effectiveToLocation.name ||
        effectiveToLocation.address ||
        "";
      if (label) setToPlace(label);
    }
  }, [effectiveFromLocation, effectiveToLocation]);

  const addStop = () => setStops((prev) => [...prev, ""]);

  const changeStop = (v, idx) => {
    const arr = [...stops];
    arr[idx] = v;
    setStops(arr);
  };

  const removeStop = (idx) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

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

  const baseEstimated = Number(estimatedCost || 0);

  const extraTotal = extraCosts
    .map((e) => Number(e.actualAmount) || 0)
    .reduce((a, b) => a + b, 0);

  const estimatedTotal = baseEstimated + extraTotal;

  const parsedActual = (() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedTotal;
  })();

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

  const distanceKm = useMemo(() => {
    if (!effectiveFromLocation || !effectiveToLocation) return null;
    return haversineDistanceKm(
      { lat: effectiveFromLocation.lat, lng: effectiveFromLocation.lng },
      { lat: effectiveToLocation.lat, lng: effectiveToLocation.lng }
    );
  }, [effectiveFromLocation, effectiveToLocation]);

  const mapsDirectionUrl =
    effectiveFromLocation && effectiveToLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          `${effectiveFromLocation.lat},${effectiveFromLocation.lng}`
        )}&destination=${encodeURIComponent(
          `${effectiveToLocation.lat},${effectiveToLocation.lng}`
        )}&travelmode=driving`
      : null;

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

  const buildPayload = () => {
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
      extraTotal,
      estimatedTotal,
      normalizedExtraCosts,
    };
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!fromPlace.trim()) {
      newErrors.from = "Vui lòng chọn điểm đi.";
    }

    if (!toPlace.trim()) {
      newErrors.to = "Vui lòng chọn điểm đến.";
    }

    if (startTime && endTime) {
      // nếu đã chọn cả 2 thì bắt buộc kết thúc > bắt đầu
      if (durationMinutes == null) {
        newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

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
        fromLocation: effectiveFromLocation || null,
        toLocation: effectiveToLocation || null,
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
      {distanceKm != null && (
        <span>
          Khoảng cách ước tính: <b>{distanceKm.toFixed(1)} km</b>
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
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-500
         to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl
          hover:brightness-105 active:scale-[0.98] transition"
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động di chuyển"}
      </button>
    </div>
  );

  let anchorPoint = null;
  if (placePickerField === "from" && effectiveToLocation?.lat != null) {
    anchorPoint = {
      lat: effectiveToLocation.lat,
      lng: effectiveToLocation.lng,
      label:
        effectiveToLocation.label ||
        effectiveToLocation.name ||
        effectiveToLocation.address ||
        "",
    };
  }
  if (placePickerField === "to" && effectiveFromLocation?.lat != null) {
    anchorPoint = {
      lat: effectiveFromLocation.lat,
      lng: effectiveFromLocation.lng,
      label:
        effectiveFromLocation.label ||
        effectiveFromLocation.name ||
        effectiveFromLocation.address ||
        "",
    };
  }

  return (
    <>
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
              {/* ĐI TỪ */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Đi từ <span className="text-red-500 align-middle">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPlacePickerField("from");
                    setPlacePickerOpen(true);
                  }}
                  className={`
                    group mt-1 w-full rounded-2xl border px-3 py-2.5
                    flex items-start gap-3 text-left
                    bg-white/90 dark:bg-slate-900/80
                    border-slate-200/80 dark:border-slate-700
                    hover:border-sky-400 hover:shadow-md hover:bg-sky-50/70
                    dark:hover:border-sky-500 dark:hover:bg-slate-900
                    transition
                    ${
                      errors.from
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }
                  `}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-sky-50 text-sky-500 border border-sky-100
                                dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800"
                  >
                    <FaMapMarkerAlt />
                  </div>

                  <div className="flex-1 min-w-0">
                    {effectiveFromLocation || fromPlace ? (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {effectiveFromLocation?.label ||
                            effectiveFromLocation?.name ||
                            fromPlace ||
                            "Điểm xuất phát đã chọn"}
                        </p>

                        {(effectiveFromLocation?.address ||
                          effectiveFromLocation?.fullAddress) && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {effectiveFromLocation.address ||
                              effectiveFromLocation.fullAddress}
                          </p>
                        )}

                        {!effectiveFromLocation && fromPlace && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {fromPlace}
                          </p>
                        )}

                        {effectiveFromLocation && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                              Đã chọn trên bản đồ
                            </span>
                            {effectiveFromLocation.lat != null &&
                              effectiveFromLocation.lng != null && (
                                <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                                  {effectiveFromLocation.lat.toFixed(4)},{" "}
                                  {effectiveFromLocation.lng.toFixed(4)}
                                </span>
                              )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                          Chọn điểm xuất phát trên bản đồ
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Nhấn để mở Map, chọn khách sạn, địa điểm hoặc quán ăn
                          làm điểm đi.
                        </p>
                      </>
                    )}
                  </div>

                  <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-sky-500 group-hover:text-sky-600 dark:text-sky-300
                                dark:group-hover:text-sky-200">
                    Mở bản đồ
                  </span>
                </button>
                {errors.from && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    {errors.from}
                  </p>
                )}
              </div>

              {/* ĐẾN */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Đến <span className="text-red-500 align-middle">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPlacePickerField("to");
                    setPlacePickerOpen(true);
                  }}
                  className={`
                    group mt-1 w-full rounded-2xl border px-3 py-2.5
                    flex items-start gap-3 text-left
                    bg-white/90 dark:bg-slate-900/80
                    border-slate-200/80 dark:border-slate-700
                    hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/70
                    dark:hover:border-emerald-500 dark:hover:bg-slate-900
                    transition
                    ${
                      errors.to
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
                    {effectiveToLocation || toPlace ? (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {effectiveToLocation?.label ||
                            effectiveToLocation?.name ||
                            toPlace ||
                            "Điểm đến đã chọn"}
                        </p>

                        {(effectiveToLocation?.address ||
                          effectiveToLocation?.fullAddress) && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {effectiveToLocation.address ||
                              effectiveToLocation.fullAddress}
                          </p>
                        )}

                        {!effectiveToLocation && toPlace && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {toPlace}
                          </p>
                        )}

                        {effectiveToLocation && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                              Đã chọn trên bản đồ
                            </span>
                            {effectiveToLocation.lat != null &&
                              effectiveToLocation.lng != null && (
                                <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                                  {effectiveToLocation.lat.toFixed(4)},{" "}
                                  {effectiveToLocation.lng.toFixed(4)}
                                </span>
                              )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                          Chọn điểm đến trên bản đồ
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Nhấn để mở Map, chọn địa điểm kế tiếp hoặc khách sạn,
                          quán ăn làm điểm đến.
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
                {errors.to && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.to}</p>
                )}
              </div>

              {mapsDirectionUrl && (
                <div className="mt-1 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => window.open(mapsDirectionUrl, "_blank")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl
                    bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-medium
                    hover:bg-sky-100 hover:border-sky-300
                    dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-800
                    dark:hover:bg-sky-900/60"
                  >
                    <FaRoute size={11} />
                    <span>Mở chỉ đường trên Google Maps</span>
                  </button>
                </div>
              )}
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
                <div
                  className={`
                    flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80
                    dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm
                    ${
                      errors.time
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }
                  `}
                >
                  <FaClock
                    className={`${
                      errors.time ? "text-rose-500" : "text-sky-500"
                    }`}
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
                      color="sky"
                    />
                  </div>
                </div>

                <div
                  className={`
                    flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 
                    dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm
                    ${
                      errors.time
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }
                  `}
                >
                  <FaClock
                    className={`${
                      errors.time ? "text-rose-500" : "text-sky-500"
                    }`}
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
                      color="sky"
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
          </div>
        </section>

        {/* NGÂN SÁCH & CHI PHÍ */}
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

            <div>
              <ExtraCostsSection
                extraCosts={extraCosts}
                addExtraCost={addExtraCost}
                updateExtraCost={updateExtraCost}
                removeExtraCost={removeExtraCost}
                extraTypes={EXTRA_TYPES}
              />
            </div>

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
                Nếu để trống, hệ thống sẽ dùng{" "}
                <b>chi phí ước lượng + phát sinh</b> để chia tiền.
              </p>
            </div>

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

      {/* PLACE PICKER CHO TRANSPORT */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          if (!loc) {
            setPlacePickerOpen(false);
            return;
          }

          const label =
            loc.label || loc.name || loc.address || loc.fullAddress || "";

          if (placePickerField === "from") {
            setInternalFromLocation(loc);
            if (label) setFromPlace(label);
            setErrors((prev) => ({ ...prev, from: "" }));
          } else if (placePickerField === "to") {
            setInternalToLocation(loc);
            if (label) setToPlace(label);
            setErrors((prev) => ({ ...prev, to: "" }));
          }

          setPlacePickerOpen(false);
        }}
        initialTab="PLACE"
        activityType="TRANSPORT"
        field={placePickerField}
        initialLocation={
          placePickerField === "from"
            ? effectiveFromLocation
            : placePickerField === "to"
            ? effectiveToLocation
            : null
        }
        anchorPoint={anchorPoint}
      />
    </>
  );
}
