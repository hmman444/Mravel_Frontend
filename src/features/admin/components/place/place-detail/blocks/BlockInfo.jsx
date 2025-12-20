import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockInfo({ idx, block, isLockedReadOnly, onPatch }) {
  return (
    <div>
      <Label>Info box</Label>
      <textarea
        className={ui.textarea}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder="Ví dụ: Mẹo nhỏ: đi sớm 15–20 phút..."
      />
    </div>
  );
}
