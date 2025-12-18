"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../../../components/ConfirmModal";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useAdminPlaces } from "../hooks/useAdminPlaces";
import api from "../../../utils/axiosInstance";

import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MapPinIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

/* ===================== CLOUDINARY UPLOAD (giống planGeneralService) ===================== */
async function uploadToCloudinary(file) {
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

/* ===================== OPTIONAL CREATE API (nếu BE có POST /admin/places) ===================== */
async function createAdminPlace(payload) {
  const res = await api.post("/admin/places", payload);
  // tương thích với ensureOk kiểu bạn đang dùng
  const body = res?.data;
  if (body?.success === false) throw new Error(body?.message || "Tạo thất bại");
  return body?.data ?? body;
}

/* ===================== UI TOKENS ===================== */
const ui = {
  pageBg: "min-h-screen bg-slate-50/70 dark:bg-slate-950",
  card: "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950",
  cardHeader: "flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70",
  cardBody: "px-5 py-5",
  title: "text-lg font-bold text-slate-900 dark:text-white",
  sub: "text-sm text-slate-500 dark:text-slate-300",
  label: "text-sm font-semibold text-slate-800 dark:text-slate-100",
  hint: "mt-1 text-xs text-slate-500 dark:text-slate-400",

  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
  textarea:
    "w-full min-h-[92px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",

  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  btnDanger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  pill:
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
};

function Label({ children, required }) {
  return (
    <div className={ui.label}>
      {children} {required && <span className="text-rose-600">*</span>}
    </div>
  );
}

function KindPill({ kind }) {
  const cls =
    kind === "DESTINATION"
      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-200 dark:border-sky-900"
      : kind === "POI"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900"
      : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900";
  const label =
    kind === "DESTINATION" ? "Điểm đến" : kind === "POI" ? "Địa điểm (POI)" : "Cơ sở (VENUE)";
  return <span className={`${ui.pill} ${cls}`}>{label}</span>;
}

/* ===================== CONTENT BLOCK MODEL ===================== */
/**
 * seed đang dùng kiểu: heading(), paragraph(), quote(), imageBlock(img()), gallery([...]), infoBox(), divider(), mapBlock([lon,lat])
 * => FE mình map thành:
 * { type: "HEADING"|"PARAGRAPH"|"QUOTE"|"IMAGE"|"GALLERY"|"INFO"|"DIVIDER"|"MAP", text?, image?, gallery?, mapLocation? }
 */

const BLOCK_TYPES = [
  { type: "HEADING", label: "Heading", icon: DocumentTextIcon },
  { type: "PARAGRAPH", label: "Paragraph", icon: DocumentTextIcon },
  { type: "QUOTE", label: "Quote", icon: DocumentTextIcon },
  { type: "IMAGE", label: "Image", icon: PhotoIcon },
  { type: "GALLERY", label: "Gallery", icon: RectangleGroupIcon },
  { type: "INFO", label: "Info box", icon: DocumentTextIcon },
  { type: "DIVIDER", label: "Divider", icon: DocumentTextIcon },
  { type: "MAP", label: "Map", icon: MapPinIcon },
];

const emptyBlock = (type) => {
  switch (type) {
    case "HEADING":
      return { type, text: "" };
    case "PARAGRAPH":
      return { type, text: "" };
    case "QUOTE":
      return { type, text: "" };
    case "IMAGE":
      return { type, image: { url: "", caption: "" } };
    case "GALLERY":
      return { type, gallery: [{ url: "", caption: "", sortOrder: 0 }] };
    case "INFO":
      return { type, text: "" };
    case "DIVIDER":
      return { type };
    case "MAP":
      return { type, mapLocation: { lon: "", lat: "" } };
    default:
      return { type: "PARAGRAPH", text: "" };
  }
};

function normalizePlaceToForm(place) {
  const loc = Array.isArray(place?.location) ? place.location : [null, null];
  const lon = loc?.[0] ?? "";
  const lat = loc?.[1] ?? "";

  return {
    id: place?.id ?? null,
    active: place?.active ?? true,

    kind: place?.kind ?? "DESTINATION",
    venueType: place?.venueType ?? null,

    parentSlug: place?.parentSlug ?? "",
    ancestors: Array.isArray(place?.ancestors) ? place.ancestors : [],
    childrenCount: place?.childrenCount ?? 0,

    name: place?.name ?? "",
    slug: place?.slug ?? "",
    shortDescription: place?.shortDescription ?? "",
    description: place?.description ?? "",

    phone: place?.phone ?? "",
    email: place?.email ?? "",
    website: place?.website ?? "",

    addressLine: place?.addressLine ?? "",
    countryCode: place?.countryCode ?? "VN",
    provinceName: place?.provinceName ?? "",
    districtName: place?.districtName ?? "",
    wardName: place?.wardName ?? "",

    lon: lon === null ? "" : String(lon),
    lat: lat === null ? "" : String(lat),

    // images: [{url, caption, cover, sortOrder}]
    images: Array.isArray(place?.images)
      ? place.images.map((im, idx) => ({
          url: im?.url ?? "",
          caption: im?.caption ?? "",
          cover: !!im?.cover,
          sortOrder:
            typeof im?.sortOrder === "number" ? im.sortOrder : idx,
        }))
      : [],

    // content blocks
    content: Array.isArray(place?.content)
      ? place.content.map((b) => {
          // cố gắng tương thích nhiều shape
          const t = (b?.type || b?.blockType || "").toString().toUpperCase();
          if (t.includes("HEADING")) return { type: "HEADING", text: b?.text ?? "" };
          if (t.includes("PARAGRAPH")) return { type: "PARAGRAPH", text: b?.text ?? "" };
          if (t.includes("QUOTE")) return { type: "QUOTE", text: b?.text ?? "" };
          if (t.includes("INFO")) return { type: "INFO", text: b?.text ?? "" };
          if (t.includes("DIVIDER")) return { type: "DIVIDER" };
          if (t.includes("MAP")) {
            const ml = b?.mapLocation || b?.map || b?.location || b?.coords;
            const lon2 = Array.isArray(ml) ? ml[0] : ml?.lon;
            const lat2 = Array.isArray(ml) ? ml[1] : ml?.lat;
            return {
              type: "MAP",
              mapLocation: {
                lon: lon2 === undefined || lon2 === null ? "" : String(lon2),
                lat: lat2 === undefined || lat2 === null ? "" : String(lat2),
              },
            };
          }
          if (t.includes("GALLERY")) {
            const g = b?.gallery || b?.images || [];
            return {
              type: "GALLERY",
              gallery: Array.isArray(g)
                ? g.map((x, idx) => ({
                    url: x?.url ?? "",
                    caption: x?.caption ?? "",
                    sortOrder: typeof x?.sortOrder === "number" ? x.sortOrder : idx,
                  }))
                : [{ url: "", caption: "", sortOrder: 0 }],
            };
          }
          if (t.includes("IMAGE")) {
            const im = b?.image || b?.img || b;
            return { type: "IMAGE", image: { url: im?.url ?? "", caption: im?.caption ?? "" } };
          }
          // fallback
          return { type: "PARAGRAPH", text: b?.text ?? "" };
        })
      : [],
  };
}

function buildPayloadFromForm(form) {
  const lon = form.lon === "" ? null : Number(form.lon);
  const lat = form.lat === "" ? null : Number(form.lat);
  const location =
    lon === null || lat === null || Number.isNaN(lon) || Number.isNaN(lat)
      ? null
      : [lon, lat];

  const images = (form.images || [])
    .filter((im) => (im?.url || "").trim() !== "")
    .map((im, idx) => ({
      url: im.url.trim(),
      caption: (im.caption || "").trim(),
      cover: !!im.cover,
      sortOrder: typeof im.sortOrder === "number" ? im.sortOrder : idx,
    }));

  // ensure cover exists (nếu có ảnh)
  if (images.length > 0 && !images.some((x) => x.cover)) {
    images[0].cover = true;
  }

  const content = (form.content || []).map((b) => {
    const t = (b?.type || "").toUpperCase();
    if (t === "HEADING") return { type: "HEADING", text: b.text || "" };
    if (t === "PARAGRAPH") return { type: "PARAGRAPH", text: b.text || "" };
    if (t === "QUOTE") return { type: "QUOTE", text: b.text || "" };
    if (t === "INFO") return { type: "INFO", text: b.text || "" };
    if (t === "DIVIDER") return { type: "DIVIDER" };
    if (t === "MAP") {
      const lon2 = b?.mapLocation?.lon === "" ? null : Number(b?.mapLocation?.lon);
      const lat2 = b?.mapLocation?.lat === "" ? null : Number(b?.mapLocation?.lat);
      return {
        type: "MAP",
        mapLocation:
          lon2 === null || lat2 === null || Number.isNaN(lon2) || Number.isNaN(lat2)
            ? null
            : [lon2, lat2],
      };
    }
    if (t === "IMAGE") {
      const url = (b?.image?.url || "").trim();
      const caption = (b?.image?.caption || "").trim();
      return { type: "IMAGE", image: { url, caption } };
    }
    if (t === "GALLERY") {
      const g = (b?.gallery || [])
        .filter((x) => (x?.url || "").trim() !== "")
        .map((x, idx) => ({
          url: x.url.trim(),
          caption: (x.caption || "").trim(),
          sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : idx,
        }));
      return { type: "GALLERY", gallery: g };
    }
    return { type: "PARAGRAPH", text: b?.text || "" };
  });

  return {
    active: !!form.active,
    kind: form.kind,
    venueType: form.venueType ?? null,

    parentSlug: form.kind === "DESTINATION" ? null : (form.parentSlug || null),
    ancestors: form.kind === "DESTINATION" ? [] : (form.ancestors || []),
    childrenCount: Number(form.childrenCount || 0),

    name: (form.name || "").trim(),
    slug: (form.slug || "").trim(),

    shortDescription: (form.shortDescription || "").trim(),
    description: (form.description || "").trim(),

    phone: (form.phone || "").trim() || null,
    email: (form.email || "").trim() || null,
    website: (form.website || "").trim() || null,

    addressLine: (form.addressLine || "").trim() || null,
    countryCode: (form.countryCode || "VN").trim(),
    provinceName: (form.provinceName || "").trim() || null,
    districtName: (form.districtName || "").trim() || null,
    wardName: (form.wardName || "").trim() || null,

    location,
    images,
    content,
  };
}

/* ===================== PAGE ===================== */
export default function AdminPlaceDetailPage() {
  const nav = useNavigate();
  const { slug } = useParams();

  const isCreate = !slug || slug === "new";

  const { detail, loadDetail, update, remove, clearDetail } = useAdminPlaces();

  // editing control
  const [isEditing, setIsEditing] = useState(isCreate);
  const [dirty, setDirty] = useState(false);

  // confirm modals
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pendingNavRef = useRef(null);

  // form
  const [form, setForm] = useState(() =>
    normalizePlaceToForm({
      active: true,
      kind: "DESTINATION",
      images: [],
      content: [emptyBlock("HEADING"), emptyBlock("PARAGRAPH")],
    })
  );

  const loading = detail?.loading;
  const saving = detail?.saving;
  const deleting = detail?.deleting;
  const lock = !isEditing && !isCreate;

  // load data
  useEffect(() => {
    clearDetail();
    if (!isCreate) {
      loadDetail(slug).catch((e) => showError(String(e)));
    } else {
      setIsEditing(true);
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // hydrate form when detail loaded
  useEffect(() => {
    if (!isCreate && detail?.data) {
      setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      setDirty(false);
    }
  }, [detail?.data, isCreate]);

  // warn on browser close
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if ((isCreate || isEditing) && dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, isCreate, isEditing]);

  const setField = (key, val) => {
    setForm((s) => ({ ...s, [key]: val }));
    setDirty(true);
  };

  const goBack = () => {
    if ((isCreate || isEditing) && dirty) {
      pendingNavRef.current = () => nav(-1);
      setLeaveOpen(true);
      return;
    }
    nav(-1);
  };

  const startCancelEdit = () => {
    if (!dirty) {
      // revert
      if (!isCreate && detail?.data) setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      return;
    }
    pendingNavRef.current = () => {
      if (!isCreate && detail?.data) setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      setDirty(false);
    };
    setLeaveOpen(true);
  };

  const validate = () => {
    const errs = [];
    if (!form.name?.trim()) errs.push("Tên địa điểm là bắt buộc.");
    if (!form.slug?.trim()) errs.push("Slug (đường dẫn) là bắt buộc.");
    if (!form.kind) errs.push("Loại địa điểm là bắt buộc.");
    if (form.kind !== "DESTINATION" && !form.parentSlug?.trim())
      errs.push("Địa điểm con phải có Parent slug.");

    // location numeric if provided
    if (form.lon !== "" && Number.isNaN(Number(form.lon))) errs.push("Kinh độ phải là số.");
    if (form.lat !== "" && Number.isNaN(Number(form.lat))) errs.push("Vĩ độ phải là số.");

    return errs;
  };

  const onSave = async () => {
    const errs = validate();
    if (errs.length) {
      showError(errs[0]);
      return;
    }

    const payload = buildPayloadFromForm(form);

    try {
      if (isCreate) {
        const created = await createAdminPlace(payload);
        const createdSlug = created?.slug || payload.slug;
        showSuccess("Đã tạo địa điểm");
        setDirty(false);
        setIsEditing(false);
        nav(`/admin/places/${encodeURIComponent(createdSlug)}`, { replace: true });
        return;
      }

      if (!form.id) {
        showError("Thiếu id địa điểm để cập nhật.");
        return;
      }

      const updated = await update(form.id, payload);
      showSuccess("Đã lưu thay đổi");
      setDirty(false);
      setIsEditing(false);

      // nếu slug đổi -> chuyển route
      const newSlug = updated?.slug || payload.slug;
      if (newSlug && newSlug !== slug) {
        nav(`/admin/places/${encodeURIComponent(newSlug)}`, { replace: true });
      } else {
        // refresh detail local
        setForm(normalizePlaceToForm(updated || detail.data));
      }
    } catch (e) {
      showError(String(e));
    }
  };

  const askDelete = () => setDeleteOpen(true);

  const confirmDelete = async () => {
    try {
      if (!form.id) {
        showError("Thiếu id để xóa.");
        return;
      }
      await remove(form.id);
      showSuccess("Đã xóa (mềm)");
      setDeleteOpen(false);
      nav("/admin/places");
    } catch (e) {
      showError(String(e));
    }
  };

  /* ===================== IMAGES EDITOR ===================== */
  const addImage = () => {
    setForm((s) => ({
      ...s,
      images: [
        ...(s.images || []),
        { url: "", caption: "", cover: (s.images || []).length === 0, sortOrder: (s.images || []).length },
      ],
    }));
    setDirty(true);
  };

  const updateImageField = (idx, key, val) => {
    setForm((s) => {
      const next = [...(s.images || [])];
      next[idx] = { ...next[idx], [key]: val };
      // cover độc nhất
      if (key === "cover" && val === true) {
        for (let i = 0; i < next.length; i++) {
          if (i !== idx) next[i].cover = false;
        }
      }
      return { ...s, images: next };
    });
    setDirty(true);
  };

  const removeImageRow = (idx) => {
    setForm((s) => {
      const next = [...(s.images || [])];
      next.splice(idx, 1);
      // ensure at least one cover if exist
      if (next.length > 0 && !next.some((x) => x.cover)) next[0].cover = true;
      return { ...s, images: next };
    });
    setDirty(true);
  };

  const uploadImageToRow = async (idx, file) => {
    try {
      const url = await uploadToCloudinary(file);
      updateImageField(idx, "url", url);
      showSuccess("Đã tải ảnh lên cloud");
    } catch (e) {
      showError(String(e));
    }
  };

  /* ===================== CONTENT BLOCKS EDITOR ===================== */
  const addBlock = (type) => {
    setForm((s) => ({ ...s, content: [...(s.content || []), emptyBlock(type)] }));
    setDirty(true);
  };

  const patchBlock = (idx, patch) => {
    setForm((s) => {
      const next = [...(s.content || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...s, content: next };
    });
    setDirty(true);
  };

  const removeBlock = (idx) => {
    setForm((s) => {
      const next = [...(s.content || [])];
      next.splice(idx, 1);
      return { ...s, content: next };
    });
    setDirty(true);
  };

  const moveBlock = (idx, dir) => {
    setForm((s) => {
      const next = [...(s.content || [])];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return s;
      const tmp = next[idx];
      next[idx] = next[to];
      next[to] = tmp;
      return { ...s, content: next };
    });
    setDirty(true);
  };

  const uploadBlockImage = async (idx, file) => {
    try {
      const url = await uploadToCloudinary(file);
      patchBlock(idx, { image: { ...(form.content[idx]?.image || {}), url } });
      showSuccess("Đã tải ảnh lên cloud");
    } catch (e) {
      showError(String(e));
    }
  };

  const uploadGalleryItem = async (blockIdx, itemIdx, file) => {
    try {
      const url = await uploadToCloudinary(file);
      const block = form.content?.[blockIdx];
      const g = Array.isArray(block?.gallery) ? [...block.gallery] : [];
      g[itemIdx] = { ...(g[itemIdx] || {}), url };
      patchBlock(blockIdx, { gallery: g });
      showSuccess("Đã tải ảnh lên cloud");
    } catch (e) {
      showError(String(e));
    }
  };

  const addGalleryItem = (blockIdx) => {
    const block = form.content?.[blockIdx];
    const g = Array.isArray(block?.gallery) ? [...block.gallery] : [];
    g.push({ url: "", caption: "", sortOrder: g.length });
    patchBlock(blockIdx, { gallery: g });
  };

  const updateGalleryItem = (blockIdx, itemIdx, key, val) => {
    const block = form.content?.[blockIdx];
    const g = Array.isArray(block?.gallery) ? [...block.gallery] : [];
    g[itemIdx] = { ...(g[itemIdx] || {}), [key]: val };
    patchBlock(blockIdx, { gallery: g });
  };

  const removeGalleryItem = (blockIdx, itemIdx) => {
    const block = form.content?.[blockIdx];
    const g = Array.isArray(block?.gallery) ? [...block.gallery] : [];
    g.splice(itemIdx, 1);
    patchBlock(blockIdx, { gallery: g });
  };

  const headerTitle = useMemo(() => {
    if (isCreate) return "Thêm địa điểm";
    return "Chi tiết địa điểm";
  }, [isCreate]);

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          {/* Top bar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={goBack}
                className={`${ui.btn} ${ui.btnGhost} px-3`}
                title="Quay lại"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {headerTitle}
                  </h1>
                  {!isCreate && <KindPill kind={form.kind} />}
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  {isCreate
                    ? "Tạo địa điểm theo phong cách seed (nội dung dạng blocks)."
                    : "Xem chi tiết – bấm Chỉnh sửa để thay đổi."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {!isCreate && !isEditing && (
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnGhost} gap-2`}
                  onClick={() => setIsEditing(true)}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Chỉnh sửa
                </button>
              )}

              {(isCreate || isEditing) && (
                <>
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnGhost} gap-2`}
                    onClick={startCancelEdit}
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Hủy
                  </button>

                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnPrimary} gap-2`}
                    onClick={onSave}
                    disabled={loading || saving}
                  >
                    <CheckIcon className="h-5 w-5" />
                    Lưu
                  </button>
                </>
              )}

              {!isCreate && (
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnDanger} gap-2`}
                  onClick={askDelete}
                  disabled={loading || deleting}
                >
                  <TrashIcon className="h-5 w-5" />
                  Xóa (mềm)
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* LEFT: meta */}
              <div className="space-y-4 lg:col-span-1">
                {/* Basic */}
                <div className={ui.card}>
                  <div className={ui.cardHeader}>
                    <div>
                      <div className={ui.title}>Thông tin cơ bản</div>
                      <div className={ui.sub}>Các trường cốt lõi của PlaceDoc</div>
                    </div>
                  </div>

                  <div className={ui.cardBody}>
                    <div className="space-y-4">
                      <div>
                        <Label required>Tên địa điểm</Label>
                        <input
                          className={ui.input}
                          disabled={lock}
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          placeholder="Ví dụ: Hội An"
                        />
                      </div>

                      <div>
                        <Label required>Slug (đường dẫn)</Label>
                        <input
                          className={ui.input}
                          disabled={lock || (!isCreate && !isEditing)} // vẫn lock theo chế độ
                          value={form.slug}
                          onChange={(e) => setField("slug", e.target.value)}
                          placeholder="hoi-an"
                        />
                        <div className={ui.hint}>
                          Dùng để truy cập URL, nên là chữ thường, gạch ngang.
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label required>Loại địa điểm</Label>
                          <select
                            className={ui.input}
                            disabled={lock}
                            value={form.kind}
                            onChange={(e) => setField("kind", e.target.value)}
                          >
                            <option value="DESTINATION">DESTINATION</option>
                            <option value="POI">POI</option>
                            <option value="VENUE">VENUE</option>
                          </select>
                        </div>

                        <div>
                          <Label>Trạng thái</Label>
                          <select
                            className={ui.input}
                            disabled={lock}
                            value={form.active ? "true" : "false"}
                            onChange={(e) => setField("active", e.target.value === "true")}
                          >
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Tạm ẩn</option>
                          </select>
                        </div>
                      </div>

                      {form.kind !== "DESTINATION" && (
                        <div>
                          <Label required>Parent slug</Label>
                          <input
                            className={ui.input}
                            disabled={lock}
                            value={form.parentSlug}
                            onChange={(e) => setField("parentSlug", e.target.value)}
                            placeholder="hoi-an"
                          />
                          <div className={ui.hint}>
                            POI/VENUE phải thuộc về 1 điểm đến (DESTINATION).
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Mô tả ngắn</Label>
                        <textarea
                          className={ui.textarea}
                          disabled={lock}
                          value={form.shortDescription}
                          onChange={(e) => setField("shortDescription", e.target.value)}
                          placeholder="Một câu mô tả ngắn gọn..."
                        />
                      </div>

                      <div>
                        <Label>Mô tả chi tiết</Label>
                        <textarea
                          className={ui.textarea}
                          disabled={lock}
                          value={form.description}
                          onChange={(e) => setField("description", e.target.value)}
                          placeholder="Mô tả tổng quan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className={ui.card}>
                  <div className={ui.cardHeader}>
                    <div>
                      <div className={ui.title}>Địa chỉ & tọa độ</div>
                      <div className={ui.sub}>location = [lon, lat]</div>
                    </div>
                  </div>

                  <div className={ui.cardBody}>
                    <div className="space-y-4">
                      <div>
                        <Label>Địa chỉ</Label>
                        <input
                          className={ui.input}
                          disabled={lock}
                          value={form.addressLine}
                          onChange={(e) => setField("addressLine", e.target.value)}
                          placeholder="TP. Hội An, Quảng Nam, Việt Nam"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Quốc gia</Label>
                          <input
                            className={ui.input}
                            disabled={lock}
                            value={form.countryCode}
                            onChange={(e) => setField("countryCode", e.target.value)}
                            placeholder="VN"
                          />
                        </div>
                        <div>
                          <Label>Tỉnh/Thành phố</Label>
                          <input
                            className={ui.input}
                            disabled={lock}
                            value={form.provinceName}
                            onChange={(e) => setField("provinceName", e.target.value)}
                            placeholder="Quảng Nam"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Kinh độ (Longitude)</Label>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className={ui.input}
                            disabled={lock}
                            value={form.lon}
                            onChange={(e) => setField("lon", e.target.value)}
                            placeholder="108.3380"
                          />
                        </div>
                        <div>
                          <Label>Vĩ độ (Latitude)</Label>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            className={ui.input}
                            disabled={lock}
                            value={form.lat}
                            onChange={(e) => setField("lat", e.target.value)}
                            placeholder="15.8801"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: images + content */}
              <div className="space-y-4 lg:col-span-2">
                {/* Images */}
                <div className={ui.card}>
                  <div className={ui.cardHeader}>
                    <div>
                      <div className={ui.title}>Ảnh</div>
                      <div className={ui.sub}>
                        Quản lý cover + caption + upload cloud
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`${ui.btn} ${ui.btnGhost} gap-2`}
                      onClick={addImage}
                      disabled={lock}
                    >
                      <PlusIcon className="h-5 w-5" />
                      Thêm ảnh
                    </button>
                  </div>

                  <div className={ui.cardBody}>
                    {(!form.images || form.images.length === 0) ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        Chưa có ảnh. Thêm ảnh để có cover cho trang chi tiết.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.images.map((im, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800/80"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <div>
                                    <Label required>URL ảnh</Label>
                                    <input
                                      className={ui.input}
                                      disabled={lock}
                                      value={im.url}
                                      onChange={(e) =>
                                        updateImageField(idx, "url", e.target.value)
                                      }
                                      placeholder="https://..."
                                    />
                                  </div>

                                  <div>
                                    <Label>Caption (tên ảnh)</Label>
                                    <input
                                      className={ui.input}
                                      disabled={lock}
                                      value={im.caption}
                                      onChange={(e) =>
                                        updateImageField(idx, "caption", e.target.value)
                                      }
                                      placeholder="Ví dụ: Phố cổ về đêm"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div>
                                    <Label>Thứ tự (sortOrder)</Label>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      min={0}
                                      step={1}
                                      className={ui.input}
                                      disabled={lock}
                                      value={im.sortOrder ?? idx}
                                      onChange={(e) =>
                                        updateImageField(
                                          idx,
                                          "sortOrder",
                                          e.target.value === "" ? 0 : Number(e.target.value)
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="flex items-end gap-3">
                                    <label
                                      className={`${ui.btn} ${ui.btnGhost} gap-2 w-full ${
                                        lock ? "pointer-events-none opacity-50" : ""
                                      }`}
                                    >
                                      <PhotoIcon className="h-5 w-5" />
                                      Tải ảnh lên
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={lock}
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (f) uploadImageToRow(idx, f);
                                          e.target.value = "";
                                        }}
                                      />
                                    </label>
                                  </div>

                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      className={`${ui.btn} ${ui.btnGhost} w-full`}
                                      disabled={lock}
                                      onClick={() => updateImageField(idx, "cover", true)}
                                    >
                                      {im.cover ? "✓ Ảnh bìa" : "Đặt làm bìa"}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`${ui.btn} ${ui.btnGhost} px-3`}
                                  disabled={lock}
                                  onClick={() => removeImageRow(idx)}
                                  title="Xóa ảnh"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {im.url && (
                              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                                <img
                                  src={im.url}
                                  alt={im.caption || "image"}
                                  className="h-52 w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content blocks */}
                <div className={ui.card}>
                  <div className={ui.cardHeader}>
                    <div>
                      <div className={ui.title}>Nội dung (Content blocks)</div>
                      <div className={ui.sub}>
                        Thêm nội dung liên tục – đa chiều như seed: Heading/Paragraph/Quote/Image/Gallery/Info/Divider/Map
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className={`${ui.btn} ${ui.btnGhost} gap-2`}
                        onClick={() => addBlock("HEADING")}
                        disabled={lock}
                      >
                        + Heading
                      </button>

                      <button
                        type="button"
                        className={`${ui.btn} ${ui.btnGhost} gap-2`}
                        onClick={() => addBlock("PARAGRAPH")}
                        disabled={lock}
                      >
                        + Paragraph
                      </button>

                      <button
                        type="button"
                        className={`${ui.btn} ${ui.btnGhost} gap-2`}
                        onClick={() => addBlock("IMAGE")}
                        disabled={lock}
                      >
                        + Image
                      </button>

                      <div className="relative">
                        <details className={lock ? "pointer-events-none opacity-50" : ""}>
                          <summary className={`${ui.btn} ${ui.btnPrimary} gap-2 cursor-pointer list-none`}>
                            <PlusIcon className="h-5 w-5" />
                            Thêm khác
                          </summary>
                          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                            {BLOCK_TYPES.filter((b) => !["HEADING","PARAGRAPH","IMAGE"].includes(b.type)).map((b) => (
                              <button
                                key={b.type}
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={() => addBlock(b.type)}
                              >
                                <b.icon className="h-5 w-5 text-slate-500" />
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  <div className={ui.cardBody}>
                    {(!form.content || form.content.length === 0) ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        Chưa có nội dung. Hãy thêm Heading/Paragraph để bắt đầu.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.content.map((b, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800/80"
                          >
                            {/* Block header */}
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                  #{idx + 1}
                                </span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                  {b.type}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`${ui.btn} ${ui.btnGhost} px-3`}
                                  disabled={lock}
                                  onClick={() => moveBlock(idx, -1)}
                                  title="Lên"
                                >
                                  <ChevronUpIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className={`${ui.btn} ${ui.btnGhost} px-3`}
                                  disabled={lock}
                                  onClick={() => moveBlock(idx, 1)}
                                  title="Xuống"
                                >
                                  <ChevronDownIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className={`${ui.btn} ${ui.btnGhost} px-3`}
                                  disabled={lock}
                                  onClick={() => removeBlock(idx)}
                                  title="Xóa block"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {/* Block body */}
                            {b.type === "HEADING" && (
                              <div>
                                <Label>Tiêu đề (Heading)</Label>
                                <input
                                  className={ui.input}
                                  disabled={lock}
                                  value={b.text || ""}
                                  onChange={(e) => patchBlock(idx, { text: e.target.value })}
                                  placeholder="Ví dụ: Hội An – di sản sống..."
                                />
                              </div>
                            )}

                            {b.type === "PARAGRAPH" && (
                              <div>
                                <Label>Đoạn văn (Paragraph)</Label>
                                <textarea
                                  className={ui.textarea}
                                  disabled={lock}
                                  value={b.text || ""}
                                  onChange={(e) => patchBlock(idx, { text: e.target.value })}
                                  placeholder="Viết đoạn mô tả chi tiết như seed..."
                                />
                              </div>
                            )}

                            {b.type === "QUOTE" && (
                              <div>
                                <Label>Trích dẫn (Quote)</Label>
                                <textarea
                                  className={ui.textarea}
                                  disabled={lock}
                                  value={b.text || ""}
                                  onChange={(e) => patchBlock(idx, { text: e.target.value })}
                                  placeholder={`Ví dụ:\nĐêm thắp nghìn hoa lửa,\nsông Hoài soi bóng...`}
                                />
                              </div>
                            )}

                            {b.type === "INFO" && (
                              <div>
                                <Label>Info box (mẹo nhỏ / lưu ý)</Label>
                                <textarea
                                  className={ui.textarea}
                                  disabled={lock}
                                  value={b.text || ""}
                                  onChange={(e) => patchBlock(idx, { text: e.target.value })}
                                  placeholder="Ví dụ: Mẹo nhỏ: đi sớm 15–20 phút..."
                                />
                              </div>
                            )}

                            {b.type === "DIVIDER" && (
                              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                Divider (ngăn cách nội dung)
                              </div>
                            )}

                            {b.type === "MAP" && (
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <Label>Kinh độ (Longitude)</Label>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    className={ui.input}
                                    disabled={lock}
                                    value={b.mapLocation?.lon ?? ""}
                                    onChange={(e) =>
                                      patchBlock(idx, {
                                        mapLocation: { ...(b.mapLocation || {}), lon: e.target.value },
                                      })
                                    }
                                    placeholder="108.3380"
                                  />
                                </div>
                                <div>
                                  <Label>Vĩ độ (Latitude)</Label>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    className={ui.input}
                                    disabled={lock}
                                    value={b.mapLocation?.lat ?? ""}
                                    onChange={(e) =>
                                      patchBlock(idx, {
                                        mapLocation: { ...(b.mapLocation || {}), lat: e.target.value },
                                      })
                                    }
                                    placeholder="15.8801"
                                  />
                                </div>
                              </div>
                            )}

                            {b.type === "IMAGE" && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <div>
                                    <Label required>URL ảnh</Label>
                                    <input
                                      className={ui.input}
                                      disabled={lock}
                                      value={b.image?.url || ""}
                                      onChange={(e) =>
                                        patchBlock(idx, {
                                          image: { ...(b.image || {}), url: e.target.value },
                                        })
                                      }
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <Label>Caption (tên ảnh)</Label>
                                    <input
                                      className={ui.input}
                                      disabled={lock}
                                      value={b.image?.caption || ""}
                                      onChange={(e) =>
                                        patchBlock(idx, {
                                          image: { ...(b.image || {}), caption: e.target.value },
                                        })
                                      }
                                      placeholder="Ví dụ: Phố cổ lung linh"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <label
                                    className={`${ui.btn} ${ui.btnGhost} gap-2 ${
                                      lock ? "pointer-events-none opacity-50" : ""
                                    }`}
                                  >
                                    <PhotoIcon className="h-5 w-5" />
                                    Tải ảnh lên
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={lock}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) uploadBlockImage(idx, f);
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                </div>

                                {b.image?.url && (
                                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                                    <img
                                      src={b.image.url}
                                      alt={b.image.caption || "image-block"}
                                      className="h-64 w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {b.type === "GALLERY" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label>Gallery</Label>
                                  <button
                                    type="button"
                                    className={`${ui.btn} ${ui.btnGhost} gap-2`}
                                    disabled={lock}
                                    onClick={() => addGalleryItem(idx)}
                                  >
                                    <PlusIcon className="h-5 w-5" />
                                    Thêm ảnh trong gallery
                                  </button>
                                </div>

                                {(b.gallery || []).length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                    Gallery đang trống.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {(b.gallery || []).map((g, gi) => (
                                      <div
                                        key={gi}
                                        className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800/70"
                                      >
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                          <div className="md:col-span-2">
                                            <Label required>URL ảnh</Label>
                                            <input
                                              className={ui.input}
                                              disabled={lock}
                                              value={g.url || ""}
                                              onChange={(e) =>
                                                updateGalleryItem(idx, gi, "url", e.target.value)
                                              }
                                              placeholder="https://..."
                                            />
                                          </div>

                                          <div>
                                            <Label>Thứ tự</Label>
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              min={0}
                                              step={1}
                                              className={ui.input}
                                              disabled={lock}
                                              value={g.sortOrder ?? gi}
                                              onChange={(e) =>
                                                updateGalleryItem(
                                                  idx,
                                                  gi,
                                                  "sortOrder",
                                                  e.target.value === "" ? 0 : Number(e.target.value)
                                                )
                                              }
                                            />
                                          </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                          <div>
                                            <Label>Caption</Label>
                                            <input
                                              className={ui.input}
                                              disabled={lock}
                                              value={g.caption || ""}
                                              onChange={(e) =>
                                                updateGalleryItem(idx, gi, "caption", e.target.value)
                                              }
                                              placeholder="Ví dụ: Chùa Cầu biểu tượng"
                                            />
                                          </div>

                                          <div className="flex items-end gap-2">
                                            <label
                                              className={`${ui.btn} ${ui.btnGhost} gap-2 w-full ${
                                                lock ? "pointer-events-none opacity-50" : ""
                                              }`}
                                            >
                                              <PhotoIcon className="h-5 w-5" />
                                              Tải ảnh lên
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={lock}
                                                onChange={(e) => {
                                                  const f = e.target.files?.[0];
                                                  if (f) uploadGalleryItem(idx, gi, f);
                                                  e.target.value = "";
                                                }}
                                              />
                                            </label>

                                            <button
                                              type="button"
                                              className={`${ui.btn} ${ui.btnGhost} px-3`}
                                              disabled={lock}
                                              onClick={() => removeGalleryItem(idx, gi)}
                                              title="Xóa ảnh"
                                            >
                                              <TrashIcon className="h-5 w-5" />
                                            </button>
                                          </div>
                                        </div>

                                        {g.url && (
                                          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                                            <img
                                              src={g.url}
                                              alt={g.caption || "gallery-item"}
                                              className="h-48 w-full object-cover"
                                              loading="lazy"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <b>Gợi ý seed-style:</b> Heading → Quote → Paragraph → Image → Paragraph → Gallery → InfoBox → Divider → Map.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm leave */}
          <ConfirmModal
            open={leaveOpen}
            title="Chưa lưu thay đổi"
            message="Bạn có thay đổi chưa được lưu. Rời trang sẽ mất dữ liệu. Bạn chắc chắn muốn thoát?"
            confirmText="Thoát"
            cancelText="Ở lại"
            onClose={() => setLeaveOpen(false)}
            onConfirm={() => {
              setLeaveOpen(false);
              const fn = pendingNavRef.current;
              pendingNavRef.current = null;
              fn?.();
            }}
          />

          {/* Confirm delete */}
          <ConfirmModal
            open={deleteOpen}
            title="Xóa địa điểm"
            message={`Bạn có chắc muốn xóa "${form.name || form.slug || ""}" không?`}
            confirmText="Xóa"
            cancelText="Hủy"
            onClose={() => setDeleteOpen(false)}
            onConfirm={confirmDelete}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
