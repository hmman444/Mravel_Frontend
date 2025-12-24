// src/features/partner/hooks/usePartnerRestaurantForm.js
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { geocodeByAddress } from "../services/geocodeService";

const updateItemAt = (arr, idx, patch) =>
  arr.map((x, i) => (i === idx ? { ...x, ...patch } : x));

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
  const requiredOk = !!(String(form?.name || "").trim() && String(form?.destinationSlug || "").trim());

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
          url: previews[i],
          file,
          caption: "",
          cover: base.length === 0 && i === 0,
          sortOrder: base.length + i,
        }));
        return { ...p, images: [...base, ...appended] };
      });
    } finally {
      e.target.value = "";
    }
  };

  const uploadIfNeeded = async (item) => {
    if (item?.file instanceof File) {
      const remoteUrl = await uploadToCloudinary(item.file);
      return { ...item, url: remoteUrl, file: null };
    }
    return item;
  };

  const submit = async () => {
    if (!requiredOk) return;

    // deep-ish clone
    let draft = JSON.parse(JSON.stringify(form));

    // upload images
    if (Array.isArray(form.images)) {
      const uploaded = await Promise.all(form.images.map(uploadIfNeeded));
      draft.images = uploaded.map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption,
        cover,
        sortOrder,
      }));
    }

    // optional: geocode nếu thiếu lat/lng (không bắt buộc)
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