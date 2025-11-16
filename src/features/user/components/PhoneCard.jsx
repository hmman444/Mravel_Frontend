// src/features/user/components/PhoneCard.jsx
import { useSelector } from "react-redux";
import { Phone, Plus } from "lucide-react";

export default function PhoneCard() {
  const { user } = useSelector((state) => state.auth);

  const phones = [
    user?.phone1 && { label: "Số di động 1", value: user.phone1 },
    user?.phone2 && { label: "Số di động 2", value: user.phone2 },
    user?.phone3 && { label: "Số di động 3", value: user.phone3 },
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-500" />
            Số di động
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Có thể sử dụng tối đa 3 số di động
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Plus className="w-3 h-3" />
          Thêm số di động
        </button>
      </div>

      <div className="px-4 md:px-6 py-3 text-sm text-slate-500 dark:text-slate-300 space-y-2">
        {phones.length === 0 && (
          <p>
            Chưa có số di động. Thêm số để bảo mật tài khoản tốt hơn và nhận thông báo đặt chỗ.
          </p>
        )}

        {phones.map((p, idx) => (
          <p key={idx} className="flex items-center justify-between">
            <span>
              {idx + 1}. <span className="font-medium">{p.value}</span>
            </span>
            {/* sau này có thể thêm tag: "Đã xác minh" */}
          </p>
        ))}
      </div>
    </div>
  );
}