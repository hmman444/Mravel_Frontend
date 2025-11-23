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
  FaTrashAlt,
  FaImage,
  FaCircleNotch,
} from "react-icons/fa";

import ConfirmModal from "../../../components/ConfirmModal";
import PlanDateInputs from "./PlanDateInputs";
import { usePlanGeneral } from "../hooks/usePlanGeneral";
import { showSuccess, showError } from "../../../utils/toastUtils";

const COLORS = ["#6366F1", "#22C55E", "#FACC15", "#F97316"];

const formatDate = (date) => {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (value) => {
  if (!value) return null;
  // BE trả LocalDate "yyyy-MM-dd"
  return new Date(value);
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "ACTIVE", label: "Đang diễn ra" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

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
  } = usePlanGeneral();

  const [description, setDescription] = useState(plan?.description || "");
  const [startDate, setStartDate] = useState(parseDate(plan?.startDate));
  const [endDate, setEndDate] = useState(parseDate(plan?.endDate));
  const [status, setStatus] = useState(plan?.status || "DRAFT");
  const [thumbnail, setThumbnail] = useState(
    plan?.thumbnail || (plan?.images?.[0] ?? null)
  );
  const [images, setImages] = useState(plan?.images || []);
  const totalCost = plan?.totalCost ?? 0;

  const [descSaving, setDescSaving] = useState(false);
  const [datesSaving, setDatesSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [thumbSaving, setThumbSaving] = useState(false);
  const [imagesSaving, setImagesSaving] = useState(false);

  // dropdown trạng thái
  const [statusOpen, setStatusOpen] = useState(false);
  const statusBtnRef = useRef(null);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0 });
  const [statusPosReady, setStatusPosReady] = useState(false);

  // quản lý confirm khi rút ngắn ngày
  const originalStartRef = useRef(startDate);
  const originalEndRef = useRef(endDate);
  const [pendingDates, setPendingDates] = useState(null);
  const [showConfirmDates, setShowConfirmDates] = useState(false);

  // sync khi plan thay đổi
  useEffect(() => {
    const s = parseDate(plan?.startDate);
    const e = parseDate(plan?.endDate);

    setDescription(plan?.description || "");
    setStartDate(s);
    setEndDate(e);
    setStatus(plan?.status || "DRAFT");
    setThumbnail(plan?.thumbnail || (plan?.images?.[0] ?? null));
    setImages(plan?.images || []);

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
  ]);

  // tính vị trí dropdown trạng thái
  useEffect(() => {
    if (statusOpen && statusBtnRef.current) {
      const rect = statusBtnRef.current.getBoundingClientRect();
      const dropdownWidth = 224; // w-56
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
      if (
        statusBtnRef.current &&
        !statusBtnRef.current.contains(e.target)
      ) {
        setStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [statusOpen]);

  const statusData = useMemo(() => {
    let done = 0;
    let active = 0;
    lists.forEach((l) => {
      const cards = l.cards || [];
      const total = cards.length;
      const finished = cards.filter((c) => c.done).length;
      if (total > 0 && finished === total) done++;
      else if (finished > 0) active++;
    });
    return [
      { name: "Hoàn thành", value: done },
      { name: "Đang diễn ra", value: active },
    ];
  }, [lists]);

  const priorityData = useMemo(() => {
    const map = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        if (c.priority === "HIGH") map.HIGH++;
        else if (c.priority === "MEDIUM") map.MEDIUM++;
        else map.LOW++;
      });
    });

    return [
      { name: "Cao", value: map.HIGH },
      { name: "Trung bình", value: map.MEDIUM },
      { name: "Thấp", value: map.LOW },
    ];
  }, [lists]);

  const typeData = useMemo(() => {
    const map = {};
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        const t = c.type || "Khác";
        map[t] = (map[t] || 0) + 1;
      });
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([type, count]) => ({
      type,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
  }, [lists]);

  const teamWork = useMemo(() => {
    const map = {};
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        const name = c.assigneeName || "Chưa gán";
        map[name] = (map[name] || 0) + 1;
      });
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([name, count]) => ({
      name,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
  }, [lists]);

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

      // update lại khoảng gốc sau khi BE lưu thành công
      originalStartRef.current = s;
      originalEndRef.current = e;
    } catch {
      showError("Không thể cập nhật ngày");
    } finally {
      setDatesSaving(false);
    }
  };

  const computeDays = (s, e) => {
    if (!s || !e) return null;
    return Math.max(
      1,
      Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const handlePickDates = (s, e) => {
    // cập nhật UI trước cho DatePicker
    setStartDate(s);
    setEndDate(e);

    if (!canEdit || !planId || !s || !e) return;

    const oldS = originalStartRef.current;
    const oldE = originalEndRef.current;

    // lần đầu chưa có khoảng gốc thì commit luôn
    if (!oldS || !oldE) {
      applyDatesChange(s, e);
      return;
    }

    const oldDays = computeDays(oldS, oldE);
    const newDays = computeDays(s, e);

    // Điều kiện "rút ngắn":
    // - start mới > start cũ (đi muộn hơn)
    // - hoặc end mới < end cũ (về sớm hơn)
    // - hoặc tổng số ngày giảm
    const shrink =
      (newDays !== null && oldDays !== null && newDays < oldDays) ||
      s > oldS ||
      e < oldE;

    if (shrink) {
      // chỉ lưu lại, chờ user confirm
      setPendingDates({ start: s, end: e });
      setShowConfirmDates(true);
    } else {
      // mở rộng khoảng thời gian -> không xoá ngày -> commit thẳng
      applyDatesChange(s, e);
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImagesSaving(true);
    try {
      for (const f of files) {
        const action = await addImage(planId, f).unwrap();
        const url = typeof action === "string" ? action : action?.url || action;
        if (url) {
          setImages((prev) => [...prev, url]);
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

  // dropdown trạng thái qua portal (giống AccessRow)
  const statusDropdown =
    statusOpen && statusPosReady
      ? createPortal(
          <div
            className="
              fixed z-[99999]
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              w-56 rounded-xl shadow-lg
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
                  className={`
                    w-full text-left px-3 py-1.5 text-sm
                    flex items-center justify-between
                    transition
                    ${
                      status === opt.value
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }
                    ${
                      !canEdit ? "opacity-60 cursor-not-allowed" : ""
                    }
                  `}
                >
                  <span>{opt.label}</span>
                  {status === opt.value && (
                    <span className="text-[10px] text-blue-500">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-transparent">
      {/* dòng trạng thái saving */}
      {saving && (
        <div className="mb-1 flex items-center gap-2 text-xs text-blue-500 animate-pulse">
          <FaCircleNotch className="animate-spin" />
          <span>Đang lưu thay đổi...</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr,1fr] gap-6">
        {/* THÔNG TIN CHUNG + THUMBNAIL */}
        <div
          className="
            rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
            p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
            transition-all hover:shadow-xl 
          "
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* THUMBNAIL LỚN BÊN TRÁI */}
            <div className="w-full lg:w-1/3">
              <div
                className="
                  relative overflow-hidden rounded-xl
                  bg-gray-100 dark:bg-gray-800
                  border border-dashed border-gray-300 dark:border-gray-700
                  h-48 flex items-center justify-center
                  group
                "
              >
                {thumbnail ? (
                  <>
                    <img
                      src={thumbnail}
                      alt="thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {canEdit && (
                      <label
                        className="
                          absolute inset-0 flex flex-col items-center justify-center
                          bg-black/40 opacity-0 group-hover:opacity-100
                          text-xs text-white cursor-pointer transition
                        "
                      >
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
                    className={`
                      flex flex-col items-center justify-center gap-2
                      text-xs cursor-pointer
                      ${
                        canEdit
                          ? "text-gray-500 hover:text-blue-500"
                          : "text-gray-400"
                      }
                    `}
                  >
                    <FaImage className="text-2xl" />
                    <span>{canEdit ? "Thêm ảnh bìa" : "Chưa có ảnh bìa"}</span>
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
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs gap-2">
                    <FaCircleNotch className="animate-spin" />
                    <span>Đang lưu...</span>
                  </div>
                )}
              </div>
            </div>

            {/* MÔ TẢ + THỜI GIAN + TRẠNG THÁI */}
            <div className="flex-1 space-y-4">
              {/* MÔ TẢ */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Mô tả kế hoạch
                  </h3>
                  {descSaving && (
                    <span className="text-[10px] text-blue-500 flex items-center gap-1">
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
                      ? "Mô tả ngắn gọn về hành trình, mục tiêu chuyến đi..."
                      : "Chưa có mô tả."
                  }
                  disabled={!canEdit}
                  className={`
                    w-full mt-2 p-3 rounded-xl border text-sm
                    bg-white/70 dark:bg-gray-900/60
                    shadow-inner focus:outline-none
                    transition-all duration-200
                    ${
                      canEdit
                        ? "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400/70"
                        : "border-gray-200/60 dark:border-gray-800/60 text-gray-500 cursor-default"
                    }
                  `}
                  rows={4}
                />
              </div>

              {/* THỜI GIAN + TỔNG NGÀY + CHI PHÍ + TRẠNG THÁI */}
              <div className="flex flex-col gap-3">
                {/* THỜI GIAN TỪ / ĐẾN */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Thời gian dự kiến
                  </span>
                  {datesSaving && (
                    <span className="text-[10px] text-blue-500 flex items-center gap-1">
                      <FaCircleNotch className="animate-spin" /> Lưu...
                    </span>
                  )}
                </div>

                <PlanDateInputs
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={(d) => handlePickDates(d, endDate)}
                  setEndDate={(d) => handlePickDates(startDate, d)}
                />

                {/* DÒNG: [Tổng ngày | Chi phí] ........ [Trạng thái] */}
                <div className="flex items-start justify-between gap-3">
                  {/* Tổng ngày + chi phí bên trái */}
                  <div className="flex flex-col text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tổng số ngày
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                      {startDate && endDate
                        ? Math.max(
                            1,
                            Math.round(
                              (endDate - startDate) / (1000 * 60 * 60 * 24)
                            ) + 1
                          )
                        : "—"}
                    </span>

                    <div className="flex flex-col text-xs pt-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Tổng chi phí dự kiến
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                        {totalCost.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  {/* Trạng thái bên phải */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Trạng thái kế hoạch
                    </span>

                    <div className="relative" ref={statusBtnRef}>
                      <button
                        type="button"
                        onClick={() =>
                          canEdit && setStatusOpen((prev) => !prev)
                        }
                        disabled={!canEdit}
                        className={`
                          text-xs rounded-full px-4 py-1.5 pr-6 w-30
                          flex items-center justify-between
                          border bg-white/80 dark:bg-gray-900/80
                          shadow-sm transition-all
                          ${
                            canEdit
                              ? "border-gray-200 dark:border-gray-700 hover:border-blue-400 focus:ring-1 focus:ring-blue-400"
                              : "border-gray-200/70 dark:border-gray-800/70 text-gray-500 cursor-default"
                          }
                        `}
                      >
                        {
                          STATUS_OPTIONS.find((x) => x.value === status)
                            ?.label
                        }
                        <span
                          className={`
                            text-gray-400 text-[10px] ml-2
                            inline-block transition-transform
                            ${statusOpen ? "rotate-180" : ""}
                          `}
                        >
                          ▼
                        </span>
                      </button>

                      {statusSaving && (
                        <span className="absolute -right-4 inset-y-0 flex items-center">
                          <FaCircleNotch className="animate-spin text-[10px] text-blue-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS OVERVIEW */}
        <div
          className="
            rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
            p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
            transition-all hover:shadow-xl 
          "
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Tổng quan trạng thái các ngày
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dựa trên số lượng thẻ hoàn thành trong từng ngày của hành trình.
          </p>

          <div className="h-56 mt-3">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  innerRadius={55}
                  label
                >
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex justify-center gap-6 text-[11px] text-gray-600 dark:text-gray-400">
            <span>
              Tổng số ngày:{" "}
              <strong>{statusData.reduce((a, b) => a + b.value, 0)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* PRIORITY + TYPES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="
            rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
            p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
            transition-all hover:shadow-xl 
          "
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Mức độ ưu tiên
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Phân bố thẻ theo mức độ ưu tiên trong toàn bộ hành trình.
          </p>

          <div className="h-56 mt-3">
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="
            rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
            p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
            transition-all hover:shadow-xl 
          "
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Loại hoạt động
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tỉ lệ các loại hoạt động: di chuyển, tham quan, ăn uống,...
          </p>

          <div className="space-y-3 mt-4">
            {typeData.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                Chưa có thẻ nào được gán loại hoạt động.
              </p>
            )}

            {typeData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-200">
                    {item.type}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.percent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM WORKLOAD */}
      <div
        className="
          rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
          p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
          transition-all hover:shadow-xl 
        "
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Phân bổ công việc theo thành viên
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Số lượng thẻ được gán cho từng thành viên tham gia kế hoạch.
        </p>

        <div className="mt-4 space-y-3">
          {teamWork.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              Chưa có thẻ nào được gán cho thành viên cụ thể.
            </p>
          )}

          {teamWork.map((m, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-200">
                  {m.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {m.percent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEDIA */}
      <div
        className="
          rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur
          p-5 shadow-lg border border-gray-200/60 dark:border-gray-800
          transition-all hover:shadow-xl 
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Hình ảnh & kỷ niệm
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lưu lại những khoảnh khắc đặc biệt trong hành trình.
            </p>
          </div>

          {imagesSaving && (
            <span className="text-[10px] text-blue-500 flex items-center gap-1">
              <FaCircleNotch className="animate-spin" /> Đang xử lý...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {images?.length ? (
            images.map((url, i) => (
              <div
                key={i}
                className="
                  relative group rounded-xl overflow-hidden
                  bg-gray-100 dark:bg-gray-800
                  shadow-sm hover:shadow-md transition-all
                "
              >
                <img
                  src={url}
                  alt={`media-${i}`}
                  className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="
                      absolute top-1.5 right-1.5
                      p-1.5 rounded-full
                      bg-black/60 text-white
                      opacity-0 group-hover:opacity-100
                      transition-all text-[10px] flex items-center justify-center
                    "
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">
              Chưa có nội dung media cho kế hoạch này.
            </p>
          )}
        </div>

        {canEdit && (
          <label
            className="
              inline-flex items-center gap-2 px-4 py-2 mt-4
              rounded-full border text-xs font-medium cursor-pointer
              bg-white/60 dark:bg-gray-900/60
              border-gray-200 dark:border-gray-700
              hover:border-blue-400 hover:text-blue-500
              dark:hover:border-blue-500 dark:hover:text-blue-300
              shadow-sm transition-all
            "
          >
            <FaCloudUploadAlt className="text-sm" />
            <span>Thêm ảnh kỷ niệm</span>
            <input
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>

      {/* Confirm rút ngắn ngày */}
      {showConfirmDates && (
        <ConfirmModal
          open={showConfirmDates}
          title="Điều chỉnh thời gian kế hoạch"
          message="Rút ngắn thời gian sẽ xoá bớt các ngày tương ứng và chuyển các hoạt động trong đó vào thùng rác. Bạn có chắc chắn muốn tiếp tục?"
          confirmText="Tiếp tục"
          onClose={() => {
            // user huỷ -> revert lại khoảng cũ
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
