import { ArrowUpTrayIcon, LinkIcon, PhotoIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { TEXT } from "./roomTypes.text";
import { asArray, asString, normalizeImage } from "./roomTypes.utils";

export default function RoomImagesEditor({ images = [], onChange }) {
  const [url, setUrl] = useState("");

  const list = useMemo(() => asArray(images).map(normalizeImage).filter((x) => x.url), [images]);

  const emit = (next) => {
    try {
      onChange?.(next);
    } catch (e) {
      console.error("RoomImagesEditor onChange error:", e);
    }
  };

  const addByUrl = () => {
    const u = asString(url, "").trim();
    if (!u) return;
    const next = [...list, { url: u, isCover: list.length === 0 }];
    emit(next);
    setUrl("");
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onPickFiles = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    const dataUrls = await Promise.all(arr.map(fileToDataUrl));
    const mapped = dataUrls.map((u) => ({ url: u, isCover: false }));

    const next = [
      ...list,
      ...mapped.map((x, i) => ({ ...x, isCover: list.length === 0 && i === 0 })),
    ];
    emit(next);
  };

  const removeAt = (idx) => {
    const next = list.filter((_, i) => i !== idx);
    if (next.length && !next.some((x) => x.isCover)) next[0].isCover = true;
    emit(next);
  };

  const setCover = (idx) => {
    const next = list.map((x, i) => ({ ...x, isCover: i === idx }));
    emit(next);
  };

  return (
    <div className="rounded-2xl border p-3 space-y-3">
      <div>
        <div className="text-sm font-semibold">{TEXT.IMAGES_TITLE}</div>
        <div className="text-xs text-gray-500 mt-0.5">{TEXT.IMAGES_HINT}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <div className="md:col-span-8 relative">
          <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={TEXT.PASTE_IMAGE_URL}
            className="w-full pl-10 pr-10 py-2 border rounded-xl"
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-2 top-2 rounded-lg p-1 hover:bg-gray-100"
              title="Clear"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={addByUrl}
          className="md:col-span-2 px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
        >
          {TEXT.ADD_BY_URL}
        </button>

        <label className="md:col-span-2 px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm flex items-center justify-center gap-2 cursor-pointer">
          <ArrowUpTrayIcon className="h-4 w-4" />
          {TEXT.UPLOAD_IMAGES}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickFiles(e.target.files)}
          />
        </label>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <PhotoIcon className="h-5 w-5" />
          {TEXT.NO_IMAGES}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((img, idx) => (
            <div
              key={img.url + idx}
              className={`rounded-2xl border overflow-hidden relative ${
                img.isCover ? "border-blue-500" : "border-slate-200"
              }`}
            >
              <div className="aspect-video bg-gray-100">
                <img src={img.url} alt="room" className="w-full h-full object-cover" />
              </div>

              <div className="p-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className={`text-xs px-2 py-1 rounded-lg border ${
                    img.isCover
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {img.isCover ? TEXT.COVER : TEXT.SET_COVER}
                </button>

                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="p-1.5 rounded-lg hover:bg-red-50"
                  title={TEXT.DELETE_IMAGE}
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}