// src/features/user/components/PersonalInfoForm.jsx
import { useSelector } from "react-redux";

export default function PersonalInfoForm() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-base md:text-lg text-slate-900 dark:text-slate-50">
        Dữ liệu cá nhân
      </h3>

      {/* Tên đầy đủ */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Tên đầy đủ
        </label>
        <input
          type="text"
          defaultValue={user?.fullname || ""}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Giới tính + Ngày sinh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Giới tính
          </label>
          <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Chọn giới tính</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Ngày sinh
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option>Ngày</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option>Tháng</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option>Năm</option>
              {Array.from({ length: 60 }).map((_, idx) => {
                const year = 2010 - idx; // 2010..1951
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Thành phố cư trú */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Thành phố cư trú
        </label>
        <input
          type="text"
          placeholder="Thành phố cư trú"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Nút action */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Có lẽ để sau
        </button>
        <button
          type="button"
          className="px-5 py-2 rounded-lg bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}