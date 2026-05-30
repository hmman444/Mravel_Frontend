import { useTranslation } from "react-i18next";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockParagraph({ idx, block, isLockedReadOnly, onPatch }) {
  const { t } = useTranslation();
  return (
    <div>
      <Label>Paragraph</Label>
      <textarea
        className={ui.textarea}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder={t("admin.block_paragraph_placeholder")}
      />
    </div>
  );
}
