// src/features/partner/hooks/usePartnerRestaurantForm.js
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { geocodeByAddress } from "../services/geocodeService";

const updateItemAt = (arr, idx, patch) =>
  arr.map((x, i) => (i === idx ? { ...(x || {}), ...(patch || {}) } : x));

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(rd.result);
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });

export function usePartnerRestaurantForm({ initialForm, onSubmit, buildPayload }) {
  const [form, setForm] = useState(() => initialForm);

  useEffect(() => setForm(initialForm), [initialForm]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const reset = () => setForm(initialForm);

  // required by @Valid: name + destinationSlug
  const requiredOk = !!(
    String(form?.name || "").trim() &&
    String(form?.destinationSlug || "").trim()
  );

  // ===== images =====
  const addImageByUrl = () => {
    setForm((p) => ({
      ...p,
      images: [
        ...(p.images || []),
        {
          url: "",
          caption: "",
          cover: (p.images || []).length === 0,
          sortOrder: (p.images || []).length,
        },
      ],
    }));
  };

  const removeImageAt = (idx) => {
    setForm((p) => {
      const next = (p.images || []).filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((x) => x.cover)) next[0] = { ...next[0], cover: true };
      return { ...p, images: next.map((x, i) => ({ ...x, sortOrder: i })) };
    });
  };

  const setCover = (idx) => {
    setForm((p) => ({
      ...p,
      images: (p.images || []).map((img, i) => ({ ...img, cover: i === idx })),
    }));
  };

  const updateImageField = (idx, patch) => {
    setForm((p) => ({ ...p, images: updateItemAt(p.images || [], idx, patch) }));
  };

  const onPickFiles = async (e) => {
    const files = Array.from(e?.target?.files || []);
    if (!files.length) return;

    try {
      const previews = await Promise.all(files.map(fileToDataUrl));
      setForm((p) => {
        const base = p.images || [];
        const appended = files.map((file, i) => ({
          url: previews[i], // preview base64 để hiện UI
          file,             // file thật để upload
          caption: "",
          cover: base.length === 0 && i === 0,
          sortOrder: base.length + i,
        }));
        return { ...p, images: [...base, ...appended] };
      });
    } finally {
      if (e?.target) e.target.value = "";
    }
  };

  // ✅ ĐỂ uploadIfNeeded TRƯỚC, CÙNG SCOPE với uploadArray
  const uploadIfNeeded = async (item) => {
    // item có file thì upload lên cloudinary
    if (item?.file instanceof File) {
      const remoteUrl = await uploadToCloudinary(item.file);
      return { ...item, url: remoteUrl, file: null };
    }
    return item;
  };

  // ✅ uploadArray nằm TRONG hook (cùng scope) => không còn "not defined"
  const uploadArray = async (arr) => {
    if (!Array.isArray(arr)) return [];
    const uploaded = await Promise.all(arr.map(uploadIfNeeded));
    return uploaded
      .filter((x) => x && String(x.url || "").trim())
      .map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption: caption || "",
        cover: !!cover,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
      }));
  };

  const submit = async () => {
    if (!requiredOk) return;

    // ❗ Đừng JSON.stringify vì sẽ làm mất File object
    let draft = {
      ...form,
      images: Array.isArray(form.images) ? [...form.images] : [],
      menuImages: Array.isArray(form.menuImages) ? [...form.menuImages] : [],
    };

    // upload images + menuImages đúng 1 lần
    draft.images = await uploadArray(form.images);
    draft.menuImages = await uploadArray(form.menuImages);

    // optional: geocode nếu thiếu lat/lng
    try {
      const lat = Number(draft.latitude);
      const lng = Number(draft.longitude);
      const has = Number.isFinite(lat) && Number.isFinite(lng);

      if (!has) {
        const geo = await geocodeByAddress(draft);
        if (geo?.lat != null && geo?.lng != null) {
          draft.latitude = geo.lat;
          draft.longitude = geo.lng;
          draft.geoDisplayName = geo.displayName;
        }
      }
    } catch (err) {
      console.warn("Geocode failed:", err);
    }

    const payload = buildPayload(draft);
    await onSubmit?.(payload);
  };

  return {
    form,
    setField,
    reset,
    requiredOk,

    // images
    addImageByUrl,
    removeImageAt,
    setCover,
    updateImageField,
    onPickFiles,

    submit,
  };
}