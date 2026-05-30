import { useTranslation } from "react-i18next";
import { ui } from "./uiTokens";
import { Label } from "./pills";

export default function PlaceBasicCard({ form, setField, isLockedReadOnly }) {
  const { t } = useTranslation();
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>{t("admin.place_basic_info")}</div>
          <div className={ui.sub}>{t("admin.place_core_fields")}</div>
        </div>
      </div>

      <div className={ui.cardBody}>
        <div className="space-y-4">
          <div>
            <Label required>{t("admin.place_name")}</Label>
            <input
              className={ui.input}
              disabled={isLockedReadOnly}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={t("admin.place_name_placeholder")}
            />
          </div>

          <div>
            <Label required>{t("admin.place_slug")}</Label>
            <input
              className={ui.input}
              disabled={isLockedReadOnly}
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="hoi-an"
            />
            <div className={ui.hint}>{t("admin.place_slug_hint")}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>{t("admin.place_kind")}</Label>
              <select
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.kind}
                onChange={(e) => setField("kind", e.target.value)}
              >
                <option value="DESTINATION">DESTINATION</option>
                <option value="POI">POI</option>
              </select>
            </div>

            <div>
              <Label>{t("admin.place_status")}</Label>
              <select
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.active ? "true" : "false"}
                onChange={(e) => setField("active", e.target.value === "true")}
              >
                <option value="true">{t("admin.place_status_active")}</option>
                <option value="false">{t("admin.place_status_locked")}</option>
              </select>
              <div className={ui.hint}>{t("admin.place_status_hint")}</div>
            </div>
          </div>

          {form.kind !== "DESTINATION" && (
            <div>
              <Label required>{t("admin.place_parent_slug")}</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.parentSlug}
                onChange={(e) => setField("parentSlug", e.target.value)}
                placeholder="hoi-an"
              />
              <div className={ui.hint}>{t("admin.place_parent_slug_hint")}</div>
            </div>
          )}

          <div>
            <Label>{t("admin.place_short_description")}</Label>
            <textarea
              className={ui.textarea}
              disabled={isLockedReadOnly}
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder={t("admin.place_short_description_placeholder")}
            />
          </div>

          <div>
            <Label>{t("admin.place_description")}</Label>
            <textarea
              className={ui.textarea}
              disabled={isLockedReadOnly}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("admin.place_description_placeholder")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
