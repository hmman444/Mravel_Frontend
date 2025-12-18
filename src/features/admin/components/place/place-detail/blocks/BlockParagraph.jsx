import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockParagraph({ idx, block, isLockedReadOnly, onPatch }) {
  return (
    <div>
      <Label>Paragraph</Label>
      <textarea
        className={ui.textarea}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder="Viết đoạn mô tả chi tiết..."
      />
    </div>
  );
}
