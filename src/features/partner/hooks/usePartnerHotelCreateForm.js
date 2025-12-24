// src/features/partner/hooks/usePartnerHotelCreateForm.js
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";
import { geocodeByAddress } from "../services/geocodeService";

const updateItemAt = (arr, idx, patch) =>
  arr.map((x, i) => (i === idx ? { ...x, ...patch } : x));

export function usePartnerHotelCreateForm({
  initialForm,
  onCreate,
  buildPayload, // (draftForm) => payload
}) {
  const [form, setForm] = useState(() => initialForm);

  // ✅ khi initialForm đổi (edit service khác), reset lại
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const requiredOk = !!(form?.name?.trim() && form?.slug?.trim());

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const reset = () => setForm(initialForm);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
      if (next.length > 0 && !next.some((x) => x.cover))
        next[0] = { ...next[0], cover: true };
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
          url: previews[i], // preview
          file, // ✅ upload thật
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

  // ===== content =====
  const addBlock = (payload) => {
    setForm((p) => {
      const fallback = {
        type: "PARAGRAPH",
        section: "OVERVIEW",
        text: "",
        imageUrl: "",
        imageCaption: "",
        imageFile: null,
      };
      const b = payload && typeof payload === "object" ? payload : fallback;

      return {
        ...p,
        content: [...(p.content || []), { ...fallback, ...b, sortOrder: (p.content || []).length }],
      };
    });
  };

  const removeBlockAt = (idx) => {
    setForm((p) => {
      const next = (p.content || []).filter((_, i) => i !== idx);
      return { ...p, content: next.map((x, i) => ({ ...x, sortOrder: i })) };
    });
  };

  const updateBlockField = (idx, patch) => {
    setForm((p) => ({ ...p, content: updateItemAt(p.content || [], idx, patch) }));
  };

  const onPickBlockImage = async (idx, e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const preview = await fileToDataUrl(file);
      updateBlockField(idx, { imageUrl: preview, imageFile: file });
    } finally {
      e.target.value = "";
    }
  };

  // ===== upload helpers =====
  const uploadIfNeeded = async (item) => {
    if (item?.file instanceof File) {
      const remoteUrl = await uploadToCloudinary(item.file);
      return { ...item, url: remoteUrl, file: null };
    }
    return item;
  };

  const submit = async () => {
    if (!requiredOk) return;

    // clone nhẹ
    let draft = JSON.parse(JSON.stringify(form));

    // upload hotel images
    if (Array.isArray(form.images)) {
      const uploaded = await Promise.all(form.images.map(uploadIfNeeded));
      draft.images = uploaded.map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption,
        cover,
        sortOrder,
      }));
    }

    // upload block images
    if (Array.isArray(form.content)) {
      const nextBlocks = [];
      for (let i = 0; i < form.content.length; i++) {
        const b = form.content[i];
        if (b?.imageFile instanceof File) {
          const remoteUrl = await uploadToCloudinary(b.imageFile);
          nextBlocks.push({ ...b, imageUrl: remoteUrl, imageFile: null });
        } else {
          nextBlocks.push(b);
        }
      }
      draft.content = nextBlocks.map((b) => {
        const x = { ...b };
        delete x.imageFile;
        return x;
      });
    }

    // ✅ geocode -> draft.location = [lng, lat]
    try {
      const geo = await geocodeByAddress(draft);
      if (geo?.lng != null && geo?.lat != null) {
        // BE: new double[]{ 108.3270, 15.8790 } => [lon, lat]
        draft.location = [geo.lng, geo.lat];
        // optional: để debug/hiển thị
        draft.geoDisplayName = geo.displayName;
      }
    } catch (err) {
      console.warn("Geocode failed:", err);
      // Nếu backend bắt buộc location thì đổi thành:
      // throw err;
    }

    const payload = buildPayload(draft);
    await onCreate?.(payload);
  };

  return {
    form,
    setField,
    reset,
    requiredOk,

    addImageByUrl,
    removeImageAt,
    setCover,
    updateImageField,
    onPickFiles,

    addBlock,
    removeBlockAt,
    updateBlockField,
    onPickBlockImage,

    submit,
  };
}