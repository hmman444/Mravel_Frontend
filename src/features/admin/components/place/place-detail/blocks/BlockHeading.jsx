import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockHeading({ idx, block, isLockedReadOnly, onPatch }) {
  return (
    <div>
      <Label>Heading</Label>
      <input
        className={ui.input}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder="Ví dụ: Hội An – di sản sống..."
      />
    </div>
  );
}
