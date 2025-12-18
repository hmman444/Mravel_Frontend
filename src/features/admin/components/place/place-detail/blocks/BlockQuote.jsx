import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockQuote({ idx, block, isLockedReadOnly, onPatch }) {
  return (
    <div>
      <Label>Quote</Label>
      <textarea
        className={ui.textarea}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder={`Ví dụ:\nĐêm thắp nghìn hoa lửa,\nsông Hoài soi bóng...`}
      />
    </div>
  );
}
