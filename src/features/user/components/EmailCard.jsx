// src/features/user/components/EmailCard.jsx
import { Mail, Plus } from "lucide-react";

export default function EmailCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-500" />
            Email
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chỉ có thể sử dụng tối đa 3 email
          </p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
          <Plus className="w-3 h-3" />
          Thêm email
        </button>
      </div>
      <div className="px-4 md:px-6 py-3 text-sm">
        <p className="font-medium">
          1. <span className="text-sky-600">example@email.com</span>
        </p>
        <p className="text-xs text-emerald-600 mt-1">Nơi nhận thông báo</p>
      </div>
    </div>
  );
}