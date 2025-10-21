import { useState } from "react";
import Button from "../../components/Button";
import { sharePlan } from "../services/planService";

/**
 * Props:
 *  - open: boolean (hiển thị modal)
 *  - onClose: function (đóng modal)
 *  - plan: object { id, title, ... } (để biết chia sẻ plan nào)
 */
export default function SharePlanModal({ open, onClose, plan }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleShare = async () => {
    if (!email.trim()) {
      alert("Vui lòng nhập email người được mời!");
      return;
    }
    try {
      setLoading(true);
      await sharePlan(plan.id, email);
      alert("✅ Đã gửi lời mời chia sẻ!");
      setEmail("");
      onClose();
    } catch (e) {
      console.error("Share failed:", e);
      alert("❌ Gửi lời mời thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Chia sẻ lịch trình</h2>
        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-300">
            Hủy
          </Button>
          <Button
            disabled={loading}
            onClick={handleShare}
            className="bg-primary hover:bg-primaryHover"
          >
            {loading ? "Đang gửi..." : "Mời"}
          </Button>
        </div>
      </div>
    </div>
  );
}