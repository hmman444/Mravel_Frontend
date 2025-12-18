"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { useAdminPlaces } from "./useAdminPlaces";

import { emptyBlock } from "../components/place/place-detail/blockTypes";
import { normalizePlaceToForm, buildPayloadFromForm } from "../components/place/place-detail/placeFormUtils";

const toastErr = (e) => {
  const msg =
    typeof e === "string"
      ? e
      : e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Có lỗi xảy ra";
  showError(msg);
};

export function useAdminPlaceDetail() {
  const nav = useNavigate();
  const { slug } = useParams();
  const isCreate = !slug || slug === "new";

  const { detail, loadDetail, update, remove, create, lock, unlock, clearDetail } = useAdminPlaces();

  const [isEditing, setIsEditing] = useState(isCreate);
  const [dirty, setDirty] = useState(false);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pendingNavRef = useRef(null);

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

  const isLockedReadOnly = !isEditing && !isCreate;
  const headerTitle = useMemo(() => (isCreate ? "Thêm địa điểm" : "Chi tiết địa điểm"), [isCreate]);

  // ------- effects -------
  useEffect(() => {
    clearDetail();
    if (!isCreate) loadDetail(slug).catch(toastErr);
    else {
      setIsEditing(true);
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!isCreate && detail?.data) {
      setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      setDirty(false);
    }
  }, [detail?.data, isCreate]);

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

  // ------- helpers -------
  const markDirty = () => setDirty(true);

  const setField = (key, val) => {
    setForm((s) => ({ ...s, [key]: val }));
    setDirty(true);
  };

  const openLeaveConfirm = (nextFn) => {
    pendingNavRef.current = nextFn;
    setLeaveOpen(true);
  };

  // ------- navigation / edit -------
  const goBack = () => {
    if ((isCreate || isEditing) && dirty) return openLeaveConfirm(() => nav(-1));
    nav(-1);
  };

  const startEdit = () => setIsEditing(true);

  const startCancelEdit = () => {
    if (!dirty) {
      if (!isCreate && detail?.data) setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      return;
    }

    openLeaveConfirm(() => {
      if (!isCreate && detail?.data) setForm(normalizePlaceToForm(detail.data));
      setIsEditing(false);
      setDirty(false);
    });
  };

  const onConfirmLeave = () => {
    setLeaveOpen(false);
    const fn = pendingNavRef.current;
    pendingNavRef.current = null;
    fn?.();
  };

  const validate = () => {
    const errs = [];
    if (!form.name?.trim()) errs.push("Tên địa điểm là bắt buộc.");
    if (!form.slug?.trim()) errs.push("Slug (đường dẫn) là bắt buộc.");
    if (!form.kind) errs.push("Loại địa điểm là bắt buộc.");
    if (form.kind !== "DESTINATION" && !form.parentSlug?.trim())
      errs.push("Địa điểm con phải có Parent slug.");
    if (form.lon !== "" && Number.isNaN(Number(form.lon))) errs.push("Kinh độ phải là số.");
    if (form.lat !== "" && Number.isNaN(Number(form.lat))) errs.push("Vĩ độ phải là số.");
    return errs;
  };

  const onSave = async () => {
    const errs = validate();
    if (errs.length) return showError(errs[0]);

    const payload = buildPayloadFromForm(form);

    try {
      if (isCreate) {
        const created = await create(payload);
        const createdSlug = created?.slug || payload.slug;

        showSuccess("Đã tạo địa điểm");
        setDirty(false);
        setIsEditing(false);

        nav(`/admin/places/${encodeURIComponent(createdSlug)}`, { replace: true });
        return;
      }

      if (!form.id) return showError("Thiếu id địa điểm để cập nhật.");

      const updated = await update(form.id, payload);
      showSuccess("Đã lưu thay đổi");

      setDirty(false);
      setIsEditing(false);

      const newSlug = updated?.slug || payload.slug;
      if (newSlug && newSlug !== slug) {
        nav(`/admin/places/${encodeURIComponent(newSlug)}`, { replace: true });
      } else {
        setForm(normalizePlaceToForm(updated || detail.data));
      }
    } catch (e) {
      toastErr(e);
    }
  };

  const onToggleLock = async () => {
    try {
      if (!form.id) return showError("Thiếu id.");

      if (form.active) {
        await lock(form.id);
        showSuccess("Đã khóa");
        setForm((s) => ({ ...s, active: false }));
      } else {
        await unlock(form.id);
        showSuccess("Đã mở khóa");
        setForm((s) => ({ ...s, active: true }));
      }
    } catch (e) {
      toastErr(e);
    }
  };

  const askDelete = () => setDeleteOpen(true);

  const confirmDelete = async () => {
    try {
      if (!form.id) return showError("Thiếu id để xóa.");
      await remove(form.id);
      showSuccess("Đã xóa");
      setDeleteOpen(false);
      nav("/admin/places");
    } catch (e) {
      toastErr(e);
    }
  };

  // ------- IMAGES -------
  const addImage = () => {
    setForm((s) => ({
      ...s,
      images: [
        ...(s.images || []),
        {
          url: "",
          caption: "",
          cover: (s.images || []).length === 0,
          sortOrder: (s.images || []).length,
        },
      ],
    }));
    setDirty(true);
  };

  const updateImageField = (idx, key, val) => {
    setForm((s) => {
      const next = [...(s.images || [])];
      next[idx] = { ...next[idx], [key]: val };

      if (key === "cover" && val === true) {
        for (let i = 0; i < next.length; i++) if (i !== idx) next[i].cover = false;
      }

      return { ...s, images: next };
    });
    setDirty(true);
  };

  const removeImageRow = (idx) => {
    setForm((s) => {
      const next = [...(s.images || [])];
      next.splice(idx, 1);
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
      toastErr(e);
    }
  };

  // ------- CONTENT BLOCKS -------
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
      const cur = form.content?.[idx]?.image || {};
      patchBlock(idx, { image: { ...cur, url } });
      showSuccess("Đã tải ảnh lên cloud");
    } catch (e) {
      toastErr(e);
    }
  };

  // ------- GALLERY inside blocks -------
  const uploadGalleryItem = async (blockIdx, itemIdx, file) => {
    try {
      const url = await uploadToCloudinary(file);
      const block = form.content?.[blockIdx];
      const g = Array.isArray(block?.gallery) ? [...block.gallery] : [];
      g[itemIdx] = { ...(g[itemIdx] || {}), url };
      patchBlock(blockIdx, { gallery: g });
      showSuccess("Đã tải ảnh lên cloud");
    } catch (e) {
      toastErr(e);
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

  return {
    // route/meta
    slug,
    isCreate,
    headerTitle,

    // state
    form,
    isEditing,
    dirty,
    leaveOpen,
    deleteOpen,

    // flags
    loading,
    saving,
    deleting,
    isLockedReadOnly,

    // setters / ui actions
    setField,
    setLeaveOpen,
    setDeleteOpen,

    // top actions
    goBack,
    startEdit,
    startCancelEdit,
    onConfirmLeave,
    onSave,
    onToggleLock,
    askDelete,
    confirmDelete,

    // images
    addImage,
    updateImageField,
    removeImageRow,
    uploadImageToRow,

    // content blocks
    addBlock,
    patchBlock,
    removeBlock,
    moveBlock,

    // uploads
    uploadBlockImage,
    uploadGalleryItem,

    // gallery operations
    addGalleryItem,
    updateGalleryItem,
    removeGalleryItem,

    // misc
    markDirty,
  };
}
