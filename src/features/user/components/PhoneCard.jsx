// src/features/user/components/PhoneCard.jsx
import { Phone, Plus } from "lucide-react";

export default function PhoneCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-500" />
            Số di động
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chỉ có thể sử dụng tối đa 3 số di động
          </p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
          <Plus className="w-3 h-3" />
          Thêm số di động
        </button>
      </div>
      <div className="px-4 md:px-6 py-3 text-sm text-slate-500 dark:text-slate-300">
        Chưa có số di động. Thêm số để bảo mật tài khoản tốt hơn.
      </div>
    </div>
  );
}