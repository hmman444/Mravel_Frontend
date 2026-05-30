import { useTranslation } from "react-i18next";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockInfo({ idx, block, isLockedReadOnly, onPatch }) {
  const { t } = useTranslation();
  return (
    <div>
      <Label>Info box</Label>
      <textarea
        className={ui.textarea}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder={t("admin.block_info_placeholder")}
      />
    </div>
  );
}
