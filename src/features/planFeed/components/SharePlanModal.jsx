import { useState } from "react";
import Button from "../../../components/Button";
import { useDispatch } from "react-redux";
import { sharePlanInvite } from "../slices/planSlice";

/**
 * Props:
 *  - open: boolean
 *  - onClose: function
 *  - plan: { id, title, ... }
 */
export default function SharePlanModal({ open, onClose, plan }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleShare = async () => {
    if (!email.trim()) {
      alert("⚠️ Vui lòng nhập email người được mời!");
      return;
    }

    try {
      setLoading(true);
      await dispatch(sharePlanInvite({ planId: plan.id, email })).unwrap();
      alert("✅ Đã gửi lời mời chia sẻ thành công!");
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Share failed:", error);
      alert("❌ Gửi lời mời thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Chia sẻ lịch trình</h2>

        <p className="text-sm text-gray-500 mb-3">
          Gửi lời mời đến người khác qua email để họ có thể xem hoặc cùng chỉnh sửa lịch trình này.
        </p>

        <input
          type="email"
          placeholder="Nhập email người được mời"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 mb-4 bg-gray-50 dark:bg-gray-800 text-sm"
        />

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            Hủy
          </Button>
          <Button
            disabled={loading}
            onClick={handleShare}
            className="bg-primary hover:bg-primaryHover text-white"
          >
            {loading ? "Đang gửi..." : "Mời"}
          </Button>
        </div>
      </div>
    </div>
  );
}
