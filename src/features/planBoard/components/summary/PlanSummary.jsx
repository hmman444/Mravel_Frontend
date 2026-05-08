"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FaCloudUploadAlt,
  FaImage,
  FaVideo,
  FaCircleNotch,
  FaUserFriends,
  FaMoneyBillWave,
  FaRoute,
  FaBed,
  FaTicketAlt,
} from "react-icons/fa";
import ConfirmModal from "../../../../components/ConfirmModal";
import PlanDateInputs from "./PlanDateInputs";
import PlanMedia from "../../../planFeed/components/PlanMedia";
import { usePlanGeneral } from "../../hooks/usePlanGeneral";
import { showSuccess, showError } from "../../../../utils/toastUtils";

// mapping icon + nhãn theo activity type
const TYPE_CONFIG = {
  TRANSPORT: { label: "Di chuyển", icon: "🚕" },
  FOOD: { label: "Ăn uống", icon: "🥘" },
  STAY: { label: "Nghỉ ngơi", icon: "🛏️" },
  ENTERTAIN: { label: "Vui chơi", icon: "🎡" },
  SIGHTSEEING: { label: "Tham quan", icon: "🏛️" },
  EVENT: { label: "Sự kiện", icon: "🎤" },
  SHOPPING: { label: "Mua sắm", icon: "🛍️" },
  CINEMA: { label: "Xem phim", icon: "🎬" },
  OTHER: { label: "Khác", icon: "📝" },
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "ACTIVE", label: "Đang diễn ra" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// màu dịu, đồng bộ sky/indigo/emerald
const CHART_COLORS = [
  "#0EA5E9", // sky-500
  "#6366F1", // indigo-500
  "#22C55E", // emerald-500
  "#F97316", // orange-500
  "#E11D48", // rose-600
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#14B8A6", // teal-500
];

const formatDate = (date) => {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (value) => {
  if (!value) return null;
  return new Date(value);
};

export default function PlanSummary({ plan, planId, canEdit, reloadBoard }) {
  const lists = plan?.lists || [];

  const {
    saving,
    updateDescription,
    updateDates,
    updateStatus,
    uploadThumbnail,
    addImage,
    removeImage,
    addVideo,
    removeVideo,
    updateBudget,
  } = usePlanGeneral();

  const [description, setDescription] = useState(plan?.description || "");
  const [startDate, setStartDate] = useState(parseDate(plan?.startDate));
  const [endDate, setEndDate] = useState(parseDate(plan?.endDate));
  const [status, setStatus] = useState(plan?.status || "DRAFT");
  const [thumbnail, setThumbnail] = useState(
    plan?.thumbnail || (plan?.images?.[0] ?? null)
  );
  const [images, setImages] = useState(plan?.images || []);
  const [videos, setVideos] = useState(plan?.videos || []);

  const [descSaving, setDescSaving] = useState(false);
  const [datesSaving, setDatesSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [thumbSaving, setThumbSaving] = useState(false);
  const [imagesSaving, setImagesSaving] = useState(false);
  const [videosSaving, setVideosSaving] = useState(false);

  // trạng thái dropdown status
  const [statusOpen, setStatusOpen] = useState(false);
  const statusBtnRef = useRef(null);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0 });
  const [statusPosReady, setStatusPosReady] = useState(false);

  // confirm khi rút ngắn ngày
  const originalStartRef = useRef(startDate);
  const originalEndRef = useRef(endDate);
  const [pendingDates, setPendingDates] = useState(null);
  const [showConfirmDates, setShowConfirmDates] = useState(false);

  // budget
  const currency = plan?.budgetCurrency || "VND";

  const [budgetTotalLocal, setBudgetTotalLocal] = useState(
    plan?.budgetTotal ?? 0
  );
  const [budgetInput, setBudgetInput] = useState(
    budgetTotalLocal ? String(budgetTotalLocal) : ""
  );

  const [budgetPerPersonLocal, setBudgetPerPersonLocal] = useState(
    plan?.budgetPerPerson ?? 0
  );
  const [budgetPerPersonInput, setBudgetPerPersonInput] = useState(
    plan?.budgetPerPerson ? String(plan?.budgetPerPerson) : ""
  );

  const [budgetSaving, setBudgetSaving] = useState(false);

  const totalEstimated = plan?.totalEstimatedCost ?? 0;
  const totalActual = plan?.totalActualCost ?? 0;

  const used = totalActual > 0 ? totalActual : totalEstimated;
  const hasBudget = budgetTotalLocal > 0;
  const remaining = hasBudget ? budgetTotalLocal - used : null;
  const overBudget = hasBudget && remaining < 0;

  const usagePercent =
    hasBudget && used > 0
      ? Math.min(100, Math.round((used / budgetTotalLocal) * 100))
      : 0;

  const participantsCount = plan?.members?.length || 0;

  const computedBudgetPerPerson =
    budgetPerPersonLocal && budgetPerPersonLocal > 0
      ? budgetPerPersonLocal
      : hasBudget && participantsCount > 0
      ? Math.floor(budgetTotalLocal / participantsCount)
      : null;

  const fmtMoney = (value) => {
    if (value == null) return "—";
    return value.toLocaleString("vi-VN");
  };

  const currencySuffix =
    currency === "VND" || currency === "VNĐ" ? "đ" : ` ${currency}`;

  // load list card (k lấy trash)
  const dayLists = useMemo(
    () => lists.filter((l) => l.type !== "TRASH"),
    [lists]
  );

  const allCards = useMemo(
    () => dayLists.flatMap((l) => l.cards || []),
    [dayLists]
  );

  const totalCardsCount = allCards.length;

  // thống kê nhịp độ
  const totalDays =
    startDate && endDate
      ? Math.max(
          1,
          Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        )
      : null;

  const avgPerDay =
    totalDays && used > 0 ? Math.round(used / totalDays) : null;
        
  const computeDays = (s, e) => {
    if (!s || !e) return null;
    return Math.max(
      1,
      Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const handlePickDates = (s, e, changedField /* "start" | "end" */) => {
    setStartDate(s);
    setEndDate(e);

    if (!canEdit || !planId || !s || !e) return;

    const oldS = originalStartRef.current;
    const oldE = originalEndRef.current;

    if (!oldS || !oldE) {
      applyDatesChange(s, e);
      return;
    }

    const oldDays = computeDays(oldS, oldE);
    const newDays = computeDays(s, e);

    let shrink = false;

    if (changedField === "end") {
      if (newDays !== null && oldDays !== null && newDays < oldDays) {
        shrink = true;
      }
    }

    if (shrink) {
      setPendingDates({ start: s, end: e });
      setShowConfirmDates(true);
    } else {
      applyDatesChange(s, e);
    }
  };

  const handleStartDateChange = (newStart) => {
    if (!newStart) {
      setStartDate(null);
      return;
    }

    const oldS = originalStartRef.current;
    const oldE = originalEndRef.current;

    let baseStart = oldS ?? startDate;
    let baseEnd = oldE ?? endDate;

    if (!baseStart || !baseEnd) {
      handlePickDates(newStart, baseEnd || newStart, "start");
      return;
    }

    const oldDays = computeDays(baseStart, baseEnd);
    if (!oldDays || oldDays <= 0) {
      handlePickDates(newStart, baseEnd, "start");
      return;
    }

    // dời endDate theo duration cũ
    const newEnd = new Date(newStart.getTime());
    newEnd.setDate(newEnd.getDate() + (oldDays - 1));

    handlePickDates(newStart, newEnd, "start");
  };

  const handleEndDateChange = (newEnd) => {
    if (!newEnd) {
      setEndDate(null);
      return;
    }
    if (startDate && newEnd < startDate) {
      showError("Ngày kết thúc không thể trước ngày bắt đầu!");
      return;
    }
    handlePickDates(startDate, newEnd, "end");
  };

  // effect khi plan thay đổi
  useEffect(() => {
    const s = parseDate(plan?.startDate);
    const e = parseDate(plan?.endDate);

    setDescription(plan?.description || "");
    setStartDate(s);
    setEndDate(e);
    setStatus(plan?.status || "DRAFT");
    setThumbnail(plan?.thumbnail || (plan?.images?.[0] ?? null));
    setImages(plan?.images || []);
    setVideos(plan?.videos || []);

    const newBudgetTotal = plan?.budgetTotal ?? 0;
    const newBudgetPerPerson = plan?.budgetPerPerson ?? 0;

    setBudgetTotalLocal(newBudgetTotal);
    setBudgetInput(newBudgetTotal ? String(newBudgetTotal) : "");

    setBudgetPerPersonLocal(newBudgetPerPerson);
    setBudgetPerPersonInput(
      newBudgetPerPerson ? String(newBudgetPerPerson) : ""
    );

    originalStartRef.current = s;
    originalEndRef.current = e;
  }, [
    plan?.id,
    plan?.description,
    plan?.startDate,
    plan?.endDate,
    plan?.status,
    plan?.thumbnail,
    plan?.images,
    plan?.budgetTotal,
    plan?.budgetPerPerson,
  ]);

  // dropdown vị trí
  useEffect(() => {
    if (statusOpen && statusBtnRef.current) {
      const rect = statusBtnRef.current.getBoundingClientRect();
      const dropdownWidth = 224;
      setStatusPos({
        top: rect.bottom + 4,
        left: rect.right - dropdownWidth,
      });
      requestAnimationFrame(() => setStatusPosReady(true));
    } else {
      setStatusPosReady(false);
    }
  }, [statusOpen]);

  // click outside để đóng dropdown
  useEffect(() => {
    if (!statusOpen) return;

    const close = (e) => {
      if (statusBtnRef.current && !statusBtnRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [statusOpen]);

  // handlers
  const handleSaveDescription = async () => {
    if (!canEdit || !planId) return;
    setDescSaving(true);
    try {
      await updateDescription(planId, description.trim()).unwrap();
      showSuccess("Đã cập nhật mô tả");
    } catch {
      showError("Không thể cập nhật mô tả");
    } finally {
      setDescSaving(false);
    }
  };

  const applyDatesChange = async (s, e) => {
    if (!canEdit || !planId) return;
    if (!s || !e) return;

    setDatesSaving(true);
    try {
      await updateDates(planId, formatDate(s), formatDate(e)).unwrap();
      showSuccess("Đã cập nhật ngày");

      if (typeof reloadBoard === "function") {
        reloadBoard();
      }
      
      originalStartRef.current = s;
      originalEndRef.current = e;
    } catch {
      showError("Không thể cập nhật ngày");
    } finally {
      setDatesSaving(false);
    }
  };

  const handleStatusChange = async (value) => {
    setStatus(value);
    if (!canEdit || !planId) return;
    setStatusSaving(true);
    try {
      await updateStatus(planId, value).unwrap();
      showSuccess("Đã cập nhật trạng thái");
    } catch {
      showError("Không thể cập nhật trạng thái");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    if (!canEdit || !planId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbSaving(true);
    try {
      const action = await uploadThumbnail(planId, file).unwrap();
      const url = typeof action === "string" ? action : action?.url || null;
      if (url) {
        setThumbnail(url);
        showSuccess("Đã cập nhật ảnh bìa");
      } else {
        showError("Upload thành công nhưng không lấy được URL");
      }
    } catch (err) {
      console.error(err);
      showError("Không thể upload ảnh bìa");
    } finally {
      setThumbSaving(false);
      e.target.value = "";
    }
  };

  const handleImageUpload = async (e) => {
    if (!canEdit || !planId) return;

    if (imagesSaving) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImagesSaving(true);

    try {
      for (const f of files) {
        const action = await addImage(planId, f).unwrap();
        const url = typeof action === "string" ? action : action?.url || action;

        if (url) {
          setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
        }
      }

      showSuccess("Đã thêm hình ảnh");
    } catch (err) {
      console.error(err);
      showError("Không thể upload một số ảnh");
    } finally {
      setImagesSaving(false);
      e.target.value = "";
    }
  };


  const handleRemoveImage = async (url) => {
    if (!canEdit || !planId) return;
    setImagesSaving(true);
    try {
      await removeImage(planId, url).unwrap();
      setImages((prev) => prev.filter((x) => x !== url));
      showSuccess("Đã xoá ảnh");
    } catch {
      showError("Không thể xoá ảnh");
    } finally {
      setImagesSaving(false);
    }
  };

  const handleVideoUpload = async (e) => {
    if (!canEdit || !planId) return;
    if (videosSaving) { e.target.value = ""; return; }
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideosSaving(true);
    try {
      for (const f of files) {
        const action = await addVideo(planId, f).unwrap();
        const url = typeof action === "string" ? action : action?.url || action;
        if (url) setVideos((prev) => (prev.includes(url) ? prev : [...prev, url]));
      }
      showSuccess("Đã thêm video");
    } catch {
      showError("Không thể upload video");
    } finally {
      setVideosSaving(false);
      e.target.value = "";
    }
  };

  const handleRemoveVideo = async (url) => {
    if (!canEdit || !planId) return;
    setVideosSaving(true);
    try {
      await removeVideo(planId, url).unwrap();
      setVideos((prev) => prev.filter((x) => x !== url));
      showSuccess("Đã xoá video");
    } catch {
      showError("Không thể xoá video");
    } finally {
      setVideosSaving(false);
    }
  };

  const saveBudget = async (nextTotal, nextPerPerson) => {
    if (!canEdit || !planId) return;

    setBudgetSaving(true);
    try {
      await updateBudget(planId, {
        budgetTotal: nextTotal,
        budgetPerPerson: nextPerPerson,
        budgetCurrency: currency,
      }).unwrap();

      setBudgetTotalLocal(nextTotal);
      setBudgetPerPersonLocal(nextPerPerson);

      setBudgetInput(nextTotal ? String(nextTotal) : "");
      setBudgetPerPersonInput(nextPerPerson ? String(nextPerPerson) : "");

      showSuccess("Đã cập nhật ngân sách");
    } catch {
      showError("Không thể cập nhật ngân sách");
      setBudgetInput(budgetTotalLocal ? String(budgetTotalLocal) : "");
      setBudgetPerPersonInput(
        budgetPerPersonLocal ? String(budgetPerPersonLocal) : ""
      );
    } finally {
      setBudgetSaving(false);
    }
  };

  const handleBudgetTotalBlur = async () => {
    if (!canEdit || !planId) return;
    const raw = budgetInput.replace(/[^\d]/g, "");
    const newTotal = raw ? parseInt(raw, 10) : 0;

    if (Number.isNaN(newTotal) || newTotal === budgetTotalLocal) {
      setBudgetInput(budgetTotalLocal ? String(budgetTotalLocal) : "");
      return;
    }

    await saveBudget(newTotal, budgetPerPersonLocal);
  };

  const handleBudgetPerPersonBlur = async () => {
    if (!canEdit || !planId) return;
    const raw = budgetPerPersonInput.replace(/[^\d]/g, "");
    const newPerPerson = raw ? parseInt(raw, 10) : 0;

    if (
      Number.isNaN(newPerPerson) ||
      newPerPerson === budgetPerPersonLocal
    ) {
      setBudgetPerPersonInput(
        budgetPerPersonLocal ? String(budgetPerPersonLocal) : ""
      );
      return;
    }

    await saveBudget(budgetTotalLocal, newPerPerson);
  };

  // dropdown trạng thái dùng portal
  const statusDropdown =
    statusOpen && statusPosReady
      ? createPortal(
          <div
            className="
              fixed z-[99999]
              bg-white dark:bg-slate-950
              border border-slate-200 dark:border-slate-700
              w-56 rounded-xl shadow-xl shadow-slate-900/15
              backdrop-blur
            "
            style={{ top: statusPos.top, left: statusPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatusOpen(false);
                    handleStatusChange(opt.value);
                  }}
                  disabled={!canEdit}
                  className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between
                    ${
                      status === opt.value
                        ? "bg-sky-50 dark:bg-sky-900/40 text-sky-600 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }
                    ${!canEdit ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <span>{opt.label}</span>
                  {status === opt.value && (
                    <span className="text-[10px] text-sky-500">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {saving && (
        <div className="mb-1 flex items-center gap-2 text-xs text-sky-600 animate-pulse">
          <FaCircleNotch className="animate-spin" />
          <span>Đang lưu thay đổi...</span>
        </div>
      )}

      {/* hàng 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr,1.1fr] gap-6">
        {/* Thông tin chung */}
        <div className="rounded-2xl bg-white/95 dark:bg-slate-950/80 backdrop-blur p-5 shadow-lg shadow-slate-900/10 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                {plan?.title || "Kế hoạch du lịch"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tóm tắt chuyến đi để dễ lặp lại và so sánh với các plan khác.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-[11px]">
              {participantsCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <FaUserFriends className="text-[10px]" />
                  <span>{participantsCount} người tham gia</span>
                </div>
              )}
              {plan?.views != null && (
                <span className="text-xs text-slate-400">
                  {plan.views.toLocaleString("vi-VN")} lượt xem
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Thumbnail */}
            <div className="w-full lg:w-1/3">
              <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 h-44 sm:h-48 flex items-center justify-center group">
                {thumbnail ? (
                  <>
                    <img
                      src={thumbnail}
                      alt="thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {canEdit && (
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/45 opacity-0 group-hover:opacity-100 text-xs text-white cursor-pointer transition-opacity duration-200">
                        <FaCloudUploadAlt className="mb-1" />
                        <span>Cập nhật ảnh bìa</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleThumbnailUpload}
                        />
                      </label>
                    )}
                  </>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center gap-2 text-xs cursor-pointer text-center px-2
                      ${
                        canEdit
                          ? "text-slate-500 hover:text-sky-500"
                          : "text-slate-400 cursor-default"
                      }
                    `}
                  >
                    <FaImage className="text-2xl" />
                    <span>
                      {canEdit
                        ? "Thêm ảnh bìa để nhận diện nhanh chuyến đi"
                        : "Chưa có ảnh bìa"}
                    </span>
                    {canEdit && (
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleThumbnailUpload}
                      />
                    )}
                  </label>
                )}

                {thumbSaving && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-xs gap-2">
                    <FaCircleNotch className="animate-spin" />
                    <span>Đang lưu...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mô tả + thời gian + nhịp độ + trạng thái */}
            <div className="flex-1 space-y-4">
              {/* Mô tả */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Ghi chú / mô tả kế hoạch
                  </h3>
                  {descSaving && (
                    <span className="text-[10px] text-sky-600 flex items-center gap-1">
                      <FaCircleNotch className="animate-spin" /> Lưu...
                    </span>
                  )}
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  placeholder={
                    canEdit
                      ? "Ví dụ: Đà Nẵng 3N2Đ, ưu tiên ăn uống – biển – cafe view đẹp..."
                      : "Chưa có mô tả."
                  }
                  disabled={!canEdit}
                  className={`w-full mt-2 p-3 rounded-xl border text-sm bg-white/80 dark:bg-slate-950/70 shadow-inner focus:outline-none transition-all duration-200 resize-none
                    ${
                      canEdit
                        ? "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-400/70"
                        : "border-slate-200/60 dark:border-slate-800/60 text-slate-500 cursor-default"
                    }
                  `}
                  rows={4}
                />
              </div>

              {/* Thời gian + trạng thái + nhịp độ */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Thời gian dự kiến
                  </span>
                  {datesSaving && (
                    <span className="text-[10px] text-sky-600 flex items-center gap-1">
                      <FaCircleNotch className="animate-spin" /> Lưu...
                    </span>
                  )}
                </div>

                <PlanDateInputs
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={handleStartDateChange}
                  setEndDate={handleEndDateChange}
                  disabled={!canEdit}
                />

                <div className="flex flex-wrap items-start justify-between gap-3 mt-1">
                  <div className="flex flex-col text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Tổng thời gian & hoạt động
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {totalDays ?? "—"} ngày
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {totalCardsCount} hoạt động
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Trạng thái kế hoạch
                    </span>

                    <div className="relative" ref={statusBtnRef}>
                      <button
                        type="button"
                        onClick={() =>
                          canEdit && setStatusOpen((prev) => !prev)
                        }
                        disabled={!canEdit}
                        className={`text-xs rounded-full px-4 py-1.5 pr-6 flex items-center justify-between border bg-white/90 dark:bg-slate-950/80 shadow-sm transition-all duration-200
                          ${
                            canEdit
                              ? "border-slate-200 dark:border-slate-700 hover:border-sky-400 focus:ring-1 focus:ring-sky-400"
                              : "border-slate-200/70 dark:border-slate-800/70 text-slate-500 cursor-default"
                          }
                        `}
                      >
                        {
                          STATUS_OPTIONS.find((x) => x.value === status)
                            ?.label
                        }
                        <span
                          className={`text-slate-400 text-[10px] ml-2 inline-block transition-transform
                            ${statusOpen ? "rotate-180" : ""}
                          `}
                        >
                          ▼
                        </span>
                      </button>

                      {statusSaving && (
                        <span className="absolute -right-4 inset-y-0 flex items-center">
                          <FaCircleNotch className="animate-spin text-[10px] text-sky-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Ngân sách */}
        <div className="rounded-2xl bg-white/95 dark:bg-slate-950/80 backdrop-blur p-5 shadow-lg shadow-slate-900/10 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/40 flex items-center justify-center">
                <FaMoneyBillWave className="text-sky-600 dark:text-sky-300 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ngân sách & chi phí
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chỉnh ngân sách, xem tổng quan chi thực tế & mức trung bình.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* input ngân sách tổng */}
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">
                Ngân sách toàn chuyến
              </span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                    {currencySuffix}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={budgetInput}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setBudgetInput(e.target.value.replace(/[^\d]/g, ""))
                    }
                    onBlur={handleBudgetTotalBlur}
                    placeholder={canEdit ? "VD: 5000000" : "Chưa thiết lập"}
                    className={`w-full rounded-full border bg-white/90 dark:bg-slate-950/80 pl-10 pr-3 py-1.5 text-xs focus:outline-none
                      ${
                        canEdit
                          ? "border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-sky-400"
                          : "border-slate-200/70 dark:border-slate-800/70 text-slate-400 cursor-default"
                      }
                    `}
                  />
                </div>
                {budgetSaving && (
                  <FaCircleNotch className="animate-spin text-[11px] text-sky-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Để trống hoặc nhập 0 nếu không muốn set ngân sách cố định.
              </p>
            </div>

            {/* input ngân sách / người */}
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">
                Ngân sách / người (tùy chọn)
              </span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                    {currencySuffix}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={budgetPerPersonInput}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setBudgetPerPersonInput(
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    onBlur={handleBudgetPerPersonBlur}
                    placeholder={
                      canEdit
                        ? "VD: 2000000 / người (hoặc để trống)"
                        : "Chưa thiết lập"
                    }
                    className={`w-full rounded-full border bg-white/90 dark:bg-slate-950/80 pl-10 pr-3 py-1.5 text-xs focus:outline-none
                      ${
                        canEdit
                          ? "border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-sky-400"
                          : "border-slate-200/70 dark:border-slate-800/70 text-slate-400 cursor-default"
                      }
                    `}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Nếu bỏ trống, hệ thống sẽ tự ước lượng từ ngân sách tổng.
              </p>
            </div>

            {/* quick stats – trình bày theo hàng, rõ ràng hơn */}
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 px-3 py-2.5 flex flex-col">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  TB / ngày
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {avgPerDay != null
                    ? `${fmtMoney(avgPerDay)}${currencySuffix}`
                    : "—"}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 px-3 py-2.5 flex flex-col">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ngân sách / người
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {computedBudgetPerPerson != null
                    ? `${fmtMoney(computedBudgetPerPerson)}${currencySuffix}`
                    : "—"}
                </span>
              </div>
            </div>

            {/* progress bar */}
            {hasBudget && (
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Đã dùng (thực tế / ước tính)
                  </span>
                  <span
                    className={`font-semibold ${
                      overBudget
                        ? "text-rose-600 dark:text-rose-300"
                        : "text-emerald-600 dark:text-emerald-300"
                    }`}
                  >
                    {used > 0
                      ? `${fmtMoney(used)}${currencySuffix}`
                      : "Chưa có chi phí"}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      overBudget
                        ? "bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"
                    }`}
                    style={{ width: `${Math.min(usagePercent, 120)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    Ước tính:{" "}
                    <span className="font-semibold">
                      {fmtMoney(totalEstimated)}
                      {currencySuffix}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    Thực tế:{" "}
                    <span className="font-semibold">
                      {fmtMoney(totalActual)}
                      {currencySuffix}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      overBudget
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                    }`}
                  >
                    {remaining != null
                      ? remaining >= 0
                        ? `Còn lại: ${fmtMoney(
                            remaining
                          )}${currencySuffix}`
                        : `Vượt: ${fmtMoney(
                            Math.abs(remaining)
                          )}${currencySuffix}`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* media */}
      <div className="grid grid-cols-1">
        <div className="rounded-2xl bg-white/95 dark:bg-slate-950/80 backdrop-blur p-5 shadow-lg shadow-slate-900/10 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Hình ảnh & kỷ niệm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lưu lại quán ăn, homestay, view đẹp... để mở plan là nhớ
                ngay.
              </p>
            </div>

            {(imagesSaving || videosSaving) && (
              <span className="text-[10px] text-sky-600 flex items-center gap-1">
                <FaCircleNotch className="animate-spin" /> Đang xử lý...
              </span>
            )}
          </div>

          {images?.length || videos?.length ? (
            <div className="mt-4">
              <PlanMedia
                images={images}
                videos={videos}
                full
                canEdit={canEdit}
                onRemove={(type, url) =>
                  type === "image" ? handleRemoveImage(url) : handleRemoveVideo(url)
                }
              />
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500 italic">
              Chưa có ảnh hoặc video cho kế hoạch này.
            </p>
          )}

          {canEdit && (
            <div className="flex flex-wrap gap-2 mt-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-300 shadow-sm transition-all duration-200">
                <FaCloudUploadAlt className="text-sm" />
                <span>Thêm hình ảnh</span>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-300 shadow-sm transition-all duration-200">
                <FaVideo className="text-sm" />
                <span>Thêm video</span>
                <input
                  hidden
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Confirm rút ngắn ngày */}
      {showConfirmDates && (
        <ConfirmModal
          open={showConfirmDates}
          title="Điều chỉnh thời gian kế hoạch"
          message="Rút ngắn thời gian sẽ xoá bớt các ngày tương ứng và chuyển các hoạt động trong đó vào thùng rác. Bạn có chắc chắn muốn tiếp tục?"
          confirmText="Tiếp tục"
          onClose={() => {
            setShowConfirmDates(false);
            setPendingDates(null);
            setStartDate(originalStartRef.current);
            setEndDate(originalEndRef.current);
          }}
          onConfirm={async () => {
            if (pendingDates) {
              await applyDatesChange(pendingDates.start, pendingDates.end);
            }
            setShowConfirmDates(false);
            setPendingDates(null);
          }}
        />
      )}

      {statusDropdown}
    </div>
  );
}
