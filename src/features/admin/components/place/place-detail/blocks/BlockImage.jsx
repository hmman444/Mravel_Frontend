import { PhotoIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockImage({ idx, block, isLockedReadOnly, onPatch, onUpload }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label required>{t("admin.block_image_url_label")}</Label>
          <input
            className={ui.input}
            disabled={isLockedReadOnly}
            value={block.image?.url || ""}
            onChange={(e) =>
              onPatch(idx, { image: { ...(block.image || {}), url: e.target.value } })
            }
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Caption</Label>
          <input
            className={ui.input}
            disabled={isLockedReadOnly}
            value={block.image?.caption || ""}
            onChange={(e) =>
              onPatch(idx, { image: { ...(block.image || {}), caption: e.target.value } })
            }
            placeholder={t("admin.block_image_caption_placeholder")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className={`${ui.btn} ${ui.btnGhost} gap-2 ${isLockedReadOnly ? "pointer-events-none opacity-50" : ""}`}>
          <PhotoIcon className="h-5 w-5" />
          {t("admin.block_image_upload")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isLockedReadOnly}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(idx, f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {block.image?.url && (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <img src={block.image.url} alt={block.image.caption || "image-block"} className="h-64 w-full object-cover" loading="lazy" />
        </div>
      )}
    </div>
  );
}
