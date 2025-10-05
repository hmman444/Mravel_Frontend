import { useState } from "react";
import Button from "../../components/Button";

export default function SharePlanModal({ open, onClose }) {
  const [email, setEmail] = useState("");

  if (!open) return null;

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
          <Button onClick={onClose} className="bg-gray-300">Hủy</Button>
          <Button className="bg-primary hover:bg-primaryHover">Mời</Button>
        </div>
      </div>
    </div>
  );
}
