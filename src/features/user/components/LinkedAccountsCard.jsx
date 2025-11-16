// src/features/user/components/LinkedAccountsCard.jsx
import { Link2 } from "lucide-react";

const PROVIDERS = ["Facebook", "Google", "Apple"];

export default function LinkedAccountsCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4 text-sky-500" />
            Tài khoản đã liên kết
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Liên kết tài khoản mạng xã hội để đăng nhập Mravel dễ dàng
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
        {PROVIDERS.map((provider) => (
          <div
            key={provider}
            className="flex items-center justify-between px-4 md:px-6 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                {provider[0]}
              </div>
              <span>{provider}</span>
            </div>
            <button className="text-xs font-medium text-sky-600 hover:underline">
              Liên kết
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}