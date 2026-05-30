import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ui } from "./uiTokens";
import PlaceImageRow from "./PlaceImageRow";

export default function PlaceImagesCard({
  images,
  isLockedReadOnly,
  onAdd,
  onChangeField,
  onRemoveRow,
  onUploadRow,
}) {
  const { t } = useTranslation();
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>{t("admin.place_images_title")}</div>
          <div className={ui.sub}>{t("admin.place_images_subtitle")}</div>
        </div>

        <button
          type="button"
          className={`${ui.btn} ${ui.btnGhost} gap-2`}
          onClick={onAdd}
          disabled={isLockedReadOnly}
        >
          <PlusIcon className="h-5 w-5" />
          {t("admin.place_images_add")}
        </button>
      </div>

      <div className={ui.cardBody}>
        {!images || images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:text-slate-300">
            {t("admin.place_images_empty")}
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((im, idx) => (
              <PlaceImageRow
                key={idx}
                idx={idx}
                image={im}
                isLockedReadOnly={isLockedReadOnly}
                onChangeField={onChangeField}
                onRemove={onRemoveRow}
                onUpload={onUploadRow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
