// src/features/partner/components/PartnerServiceEditPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const asString = (v) => (v == null ? "" : String(v));

function normalizeImages(rawImages) {
  const arr = Array.isArray(rawImages) ? rawImages : [];
  return arr.map((x, idx) => ({
    url: asString(x?.url),
    caption: asString(x?.caption),
    cover: !!x?.cover,
    sortOrder: Number.isFinite(Number(x?.sortOrder)) ? Number(x?.sortOrder) : idx,
  }));
}

function normalizeContent(rawContent) {
  const arr = Array.isArray(rawContent) ? rawContent : [];
  return arr.map((b, idx) => ({
    type: asString(b?.type || "PARAGRAPH"),
    section: asString(b?.section || "OVERVIEW"),
    text: asString(b?.text),
    imageUrl: asString(b?.image?.url),
    imageCaption: asString(b?.image?.caption),
    sortOrder: Number.isFinite(Number(b?.sortOrder)) ? Number(b?.sortOrder) : idx,
  }));
}

export default function PartnerServiceEditPage({
  service,
  loading,
  onBack,
  onSave, // async ({ type, id, payload }) => void
}) {
  const raw = service?.raw || {};
  const type = service?.type; // HOTEL | RESTAURANT

  const initial = useMemo(() => {
    return {
      // core
      name: asString(raw?.name ?? raw?.title),
      slug: asString(raw?.slug),
      shortDescription: asString(raw?.shortDescription),
      description: asString(raw?.description),

      // contact
      phone: asString(raw?.phone),
      email: asString(raw?.email),
      website: asString(raw?.website),

      // address
      addressLine: asString(raw?.addressLine),
      cityName: asString(raw?.cityName),
      districtName: asString(raw?.districtName),
      wardName: asString(raw?.wardName),

      // location
      latitude: raw?.location?.[1] ?? raw?.latitude ?? "",
      longitude: raw?.location?.[0] ?? raw?.longitude ?? "",

      // images & content
      images: normalizeImages(raw?.images),
      content: normalizeContent(raw?.content),
    };
  }, [raw]);

  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const requiredOk = form.name.trim() && form.slug.trim();

  const dirty = useMemo(() => {
    // so sánh “nhẹ” theo json
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, initial]);

  const tryBack = () => {
    if (dirty) {
      const ok = window.confirm("Bạn có thay đổi chưa lưu. Trở về sẽ mất thay đổi. Vẫn trở về?");
      if (!ok) return;
    }
    onBack?.();
  };

  // ===== IMAGES =====
  const addImageByUrl = () => {
    setForm((p) => ({
      ...p,
      images: [
        ...p.images,
        { url: "", caption: "", cover: p.images.length === 0, sortOrder: p.images.length },
      ],
    }));
  };

  const removeImageAt = (idx) => {
    setForm((p) => {
      const next = p.images.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((x) => x.cover)) next[0].cover = true;
      return { ...p, images: next };
    });
  };

  const setCover = (idx) => {
    setForm((p) => ({
      ...p,
      images: p.images.map((img, i) => ({ ...img, cover: i === idx })),
    }));
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setForm((p) => ({
        ...p,
        images: [
          ...p.images,
          ...dataUrls.map((url, i) => ({
            url,
            caption: "",
            cover: p.images.length === 0 && i === 0,
            sortOrder: p.images.length + i,
          })),
        ],
      }));
    } finally {
      e.target.value = "";
    }
  };

  // ===== CONTENT BLOCKS =====
  const addBlock = () => {
    setForm((p) => ({
      ...p,
      content: [
        ...p.content,
        {
          type: "PARAGRAPH",
          section: "OVERVIEW",
          text: "",
          imageUrl: "",
          imageCaption: "",
          sortOrder: p.content.length,
        },
      ],
    }));
  };

  const removeBlockAt = (idx) => {
    setForm((p) => ({ ...p, content: p.content.filter((_, i) => i !== idx) }));
  };

  const moveBlock = (idx, dir) => {
    setForm((p) => {
      const next = [...p.content];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return p;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...p, content: next };
    });
  };

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const latitude = form.latitude === "" ? null : Number(form.latitude);
    const longitude = form.longitude === "" ? null : Number(form.longitude);

    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),

      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,

      addressLine: form.addressLine.trim() || null,
      cityName: form.cityName.trim() || null,
      districtName: form.districtName.trim() || null,
      wardName: form.wardName.trim() || null,

      latitude,
      longitude,

      // giữ nguyên các code nếu BE cần
      provinceCode: raw?.provinceCode ?? null,
      provinceName: raw?.provinceName ?? null,
      districtCode: raw?.districtCode ?? null,
      wardCode: raw?.wardCode ?? null,

      // images
      images: (form.images || [])
        .filter((x) => x.url && x.url.trim())
        .map((x, idx) => ({
          url: x.url.trim(),
          caption: x.caption?.trim() || null,
          cover: !!x.cover,
          sortOrder: Number.isFinite(Number(x.sortOrder)) ? Number(x.sortOrder) : idx,
        })),

      // content (tối giản)
      content: (form.content || []).map((b, idx) => ({
        type: b.type,
        section: b.section,
        text: b.text || null,
        image: b.imageUrl
          ? { url: b.imageUrl, caption: b.imageCaption || null, cover: false, sortOrder: 0 }
          : null,
        sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : idx,
      })),
    };
  };

  const submit = async () => {
    if (!requiredOk) return;
    const payload = buildPayload();
    await onSave?.({ type, id: service?.id, payload });
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-bold">Chỉnh sửa dịch vụ</div>
          <div className="text-xs text-gray-500">
            {type} • ID: <span className="font-mono">{service?.id}</span>
            {dirty ? <span className="ml-2 text-orange-600">• Chưa lưu</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={tryBack}
            disabled={loading}
            className="px-3 py-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Trở về
          </button>

          <button
            type="button"
            onClick={() => setForm(initial)}
            disabled={loading || !dirty}
            className="px-3 py-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            title="Quay lại trạng thái trước khi chỉnh"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Hoàn tác
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={loading || !requiredOk || !dirty}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Blocks */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <details open className="group">
          <summary className="cursor-pointer select-none font-semibold">
            Thông tin cơ bản
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="font-medium mb-1">Tên *</div>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Slug *</div>
              <input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <div className="font-medium mb-1">Mô tả ngắn</div>
              <input
                value={form.shortDescription}
                onChange={(e) => setField("shortDescription", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <div className="font-medium mb-1">Mô tả</div>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full border rounded-md px-3 py-2 min-h-[140px]"
              />
            </label>
          </div>
        </details>

        <details className="group">
          <summary className="cursor-pointer select-none font-semibold">
            Liên hệ & Vị trí
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm">
              <div className="font-medium mb-1">SĐT</div>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <div className="font-medium mb-1">Email</div>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <div className="font-medium mb-1">Website</div>
              <input
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <div className="font-medium mb-1">Địa chỉ</div>
              <input
                value={form.addressLine}
                onChange={(e) => setField("addressLine", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Thành phố</div>
              <input
                value={form.cityName}
                onChange={(e) => setField("cityName", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Quận/Huyện</div>
              <input
                value={form.districtName}
                onChange={(opt) => {
                  setField("districtCode", opt?.code ?? "");
                  setField("districtName", opt?.name ?? "");
                }}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Phường/Xã</div>
              <input
                value={form.wardName}
                onChange={(e) => setField("wardName", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Latitude</div>
              <input
                value={form.latitude}
                onChange={(e) => setField("latitude", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Longitude</div>
              <input
                value={form.longitude}
                onChange={(e) => setField("longitude", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </label>
          </div>
        </details>

        <details open className="group">
          <summary className="cursor-pointer select-none font-semibold">
            Ảnh (Gallery)
          </summary>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              {form.images.length} ảnh
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addImageByUrl}
                className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Thêm link ảnh
              </button>

              <label className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                <ArrowUpTrayIcon className="w-4 h-4" />
                Tải ảnh lên
                <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
              </label>
            </div>
          </div>

          {form.images.length === 0 ? (
            <div className="mt-3 text-sm text-gray-500">Chưa có ảnh.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border rounded-lg p-3">
                  <div className="md:col-span-3">
                    <div className="w-full aspect-[16/10] bg-gray-100 rounded overflow-hidden">
                      {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCover(idx)}
                      className={`mt-2 w-full text-xs px-2 py-1 rounded border ${
                        img.cover ? "bg-green-50 border-green-200 text-green-700" : "hover:bg-gray-50"
                      }`}
                    >
                      {img.cover ? "Ảnh bìa" : "Đặt làm bìa"}
                    </button>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    <input
                      value={img.url}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          images: p.images.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)),
                        }))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="https://..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <input
                        value={img.caption}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.map((x, i) => (i === idx ? { ...x, caption: e.target.value } : x)),
                          }))
                        }
                        className="md:col-span-9 border rounded-md px-3 py-2 text-sm"
                        placeholder="Caption (tuỳ chọn)"
                      />
                      <input
                        value={img.sortOrder}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.map((x, i) => (i === idx ? { ...x, sortOrder: e.target.value } : x)),
                          }))
                        }
                        className="md:col-span-3 border rounded-md px-3 py-2 text-sm"
                        placeholder="Sort"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1 flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="p-2 rounded hover:bg-red-50"
                      title="Xóa ảnh"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            * Upload hiện tại dùng base64 để làm nhanh. Sau này muốn chuẩn thì thêm API upload trả URL.
          </div>
        </details>

        <details className="group">
          <summary className="cursor-pointer select-none font-semibold">
            Content blocks (tối giản)
          </summary>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">{form.content.length} block</div>
            <button
              type="button"
              onClick={addBlock}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Thêm block
            </button>
          </div>

          {form.content.length === 0 ? (
            <div className="mt-3 text-sm text-gray-500">Chưa có content.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {form.content.map((b, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">
                      Block #{idx + 1}
                      <span className="ml-2 text-xs text-gray-500">
                        ({b.section} • {b.type})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, -1)}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Lên"
                      >
                        <ChevronUpIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, 1)}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Xuống"
                      >
                        <ChevronDownIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlockAt(idx)}
                        className="p-2 rounded hover:bg-red-50"
                        title="Xóa block"
                      >
                        <TrashIcon className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      value={b.section}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content: p.content.map((x, i) => (i === idx ? { ...x, section: e.target.value } : x)),
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="OVERVIEW">OVERVIEW</option>
                      <option value="STORY">STORY</option>
                      <option value="OTHER">OTHER</option>
                    </select>

                    <select
                      value={b.type}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content: p.content.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)),
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="HEADING">HEADING</option>
                      <option value="PARAGRAPH">PARAGRAPH</option>
                      <option value="QUOTE">QUOTE</option>
                      <option value="IMAGE">IMAGE</option>
                      <option value="DIVIDER">DIVIDER</option>
                      <option value="INFOBOX">INFOBOX</option>
                    </select>

                    <input
                      value={b.sortOrder}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content: p.content.map((x, i) => (i === idx ? { ...x, sortOrder: e.target.value } : x)),
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder="Sort"
                    />
                  </div>

                  <textarea
                    value={b.text}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        content: p.content.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm min-h-[90px]"
                    placeholder="Nội dung..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      value={b.imageUrl}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content: p.content.map((x, i) => (i === idx ? { ...x, imageUrl: e.target.value } : x)),
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder="Image URL (nếu block có ảnh)"
                    />
                    <input
                      value={b.imageCaption}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content: p.content.map((x, i) => (i === idx ? { ...x, imageCaption: e.target.value } : x)),
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder="Image caption"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </details>

        <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-100 rounded-md p-3">
          Lưu ý: theo rule của bạn, <b>update xong sẽ bị đưa về PENDING</b> (BE xử lý).
        </div>
      </div>
    </div>
  );
}