import { ui } from "./uiTokens";
import { Label } from "./pills";

export default function PlaceBasicCard({ form, setField, isLockedReadOnly }) {
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>Thông tin cơ bản</div>
          <div className={ui.sub}>Các trường cốt lõi của PlaceDoc</div>
        </div>
      </div>

      <div className={ui.cardBody}>
        <div className="space-y-4">
          <div>
            <Label required>Tên địa điểm</Label>
            <input
              className={ui.input}
              disabled={isLockedReadOnly}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ví dụ: Hội An"
            />
          </div>

          <div>
            <Label required>Slug (đường dẫn)</Label>
            <input
              className={ui.input}
              disabled={isLockedReadOnly}
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="hoi-an"
            />
            <div className={ui.hint}>Dùng để truy cập URL, nên là chữ thường, gạch ngang.</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Loại địa điểm</Label>
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
              <Label>Trạng thái</Label>
              <select
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.active ? "true" : "false"}
                onChange={(e) => setField("active", e.target.value === "true")}
              >
                <option value="true">Đang hoạt động</option>
                <option value="false">Đã khóa</option>
              </select>
              <div className={ui.hint}>Gợi ý: nên dùng nút “Khóa/Mở khóa” khi không chỉnh sửa.</div>
            </div>
          </div>

          {form.kind !== "DESTINATION" && (
            <div>
              <Label required>Parent slug</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.parentSlug}
                onChange={(e) => setField("parentSlug", e.target.value)}
                placeholder="hoi-an"
              />
              <div className={ui.hint}>POI phải thuộc về 1 điểm đến (DESTINATION).</div>
            </div>
          )}

          <div>
            <Label>Mô tả ngắn</Label>
            <textarea
              className={ui.textarea}
              disabled={isLockedReadOnly}
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="Một câu mô tả ngắn gọn..."
            />
          </div>

          <div>
            <Label>Mô tả chi tiết</Label>
            <textarea
              className={ui.textarea}
              disabled={isLockedReadOnly}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả tổng quan..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
