import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { updateUserProfile } from "../slices/userProfileSlice";
import { toast } from "react-toastify";

// Đơn giản: vài nước phổ biến, bạn muốn thì thêm
const COUNTRIES = [
  { code: "VN", name: "Việt Nam" },
  { code: "US", name: "United States" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "Korea" },
  { code: "SG", name: "Singapore" },
];

// Danh sách tỉnh/thành VN – bạn có thể mở rộng thêm
const VIETNAM_PROVINCES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bình Dương",
  "Bình Định",
  "Bình Thuận",
  "Cà Mau",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Khánh Hòa",
  "Kiên Giang",
  "Lâm Đồng",
  "Long An",
  "Nghệ An",
  "Quảng Nam",
  "Quảng Ninh",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Vĩnh Long",
  "Vĩnh Phúc",
];

export default function PersonalInfoForm() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // State form
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("VN");
  const [addressLine, setAddressLine] = useState("");

  const [locale, setLocale] = useState("vi-VN");
  const [timeZone, setTimeZone] = useState("Asia/Ho_Chi_Minh");

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load từ Redux user vào form
  useEffect(() => {
    if (!user) return;

    setFullname(user.fullname || "");
    setGender(user.gender || "");

    if (user.dateOfBirth) {
      // Backend LocalDate -> JSON: "yyyy-MM-dd"
      const [y, m, d] = user.dateOfBirth.split("-");
      setDobYear(y || "");
      setDobMonth(m || "");
      setDobDay(d || "");
    } else {
      setDobYear("");
      setDobMonth("");
      setDobDay("");
    }

    setCity(user.city || "");
    setCountry(user.country || "VN");
    setAddressLine(user.addressLine || "");

    setLocale(user.locale || "vi-VN");
    setTimeZone(user.timeZone || "Asia/Ho_Chi_Minh");

    // Vừa load xong => chưa có thay đổi
    setHasChanges(false);
  }, [user]);

  const isBusy = saving || loading;

  // Helper: mọi onChange đều bật hasChanges = true
  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || isBusy) return;

    try {
      setSaving(true);

      let dateOfBirth = null;
      if (dobDay && dobMonth && dobYear) {
        const dd = String(dobDay).padStart(2, "0");
        const mm = String(dobMonth).padStart(2, "0");
        dateOfBirth = `${dobYear}-${mm}-${dd}`;
      }

      const payload = {
        gender: gender || null,
        dateOfBirth,
        addressLine: addressLine || null,
      };

      const action = await dispatch(updateUserProfile(payload));

      if (updateUserProfile.fulfilled.match(action)) {
        toast.success("Cập nhật hồ sơ thành công!");
        setHasChanges(false);
        // Redux.user đã được update, useEffect phía trên sẽ sync lại form
      } else {
        toast.error(action.payload || "Cập nhật hồ sơ thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi cập nhật hồ sơ!");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    // Reset về đúng dữ liệu hiện tại trong Redux
    setFullname(user.fullname || "");
    setGender(user.gender || "");

    if (user.dateOfBirth) {
      const [y, m, d] = user.dateOfBirth.split("-");
      setDobYear(y || "");
      setDobMonth(m || "");
      setDobDay(d || "");
    } else {
      setDobYear("");
      setDobMonth("");
      setDobDay("");
    }

    setCity(user.city || "");
    setCountry(user.country || "VN");
    setAddressLine(user.addressLine || "");

    setLocale(user.locale || "vi-VN");
    setTimeZone(user.timeZone || "Asia/Ho_Chi_Minh");

    setHasChanges(false);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-base md:text-lg text-slate-900 dark:text-slate-50">
        Dữ liệu cá nhân
      </h3>

      {/* Giới tính + Ngày sinh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Giới tính */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Giới tính
          </label>
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              markChanged();
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Chọn giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
            <option value="UNKNOWN">Không khai báo</option>
          </select>
        </div>

        {/* Ngày sinh */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Ngày sinh
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Ngày */}
            <select
              value={dobDay}
              onChange={(e) => {
                setDobDay(e.target.value);
                markChanged();
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Ngày</option>
              {[...Array(31)].map((_, i) => {
                const d = String(i + 1).padStart(2, "0");
                return (
                  <option key={d} value={d}>
                    {d}
                  </option>
                );
              })}
            </select>

            {/* Tháng */}
            <select
              value={dobMonth}
              onChange={(e) => {
                setDobMonth(e.target.value);
                markChanged();
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Tháng</option>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = String(i + 1).padStart(2, "0");
                return (
                  <option key={m} value={m}>
                    {m}
                  </option>
                );
              })}
            </select>

            {/* Năm */}
            <select
              value={dobYear}
              onChange={(e) => {
                setDobYear(e.target.value);
                markChanged();
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Năm</option>
              {Array.from({ length: 70 }).map((_, idx) => {
                const year = new Date().getFullYear() - idx - 10; // khoảng 10-80 tuổi
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

      {/* Thành phố & Quốc gia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thành phố cư trú */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Thành phố cư trú
          </label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              markChanged();
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Chọn tỉnh / thành</option>
            {VIETNAM_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Quốc gia */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Quốc gia
          </label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              markChanged();
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Địa chỉ chi tiết */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Địa chỉ chi tiết
        </label>
        <input
          type="text"
          value={addressLine}
          onChange={(e) => {
            setAddressLine(e.target.value);
            markChanged();
          }}
          placeholder="Số nhà, đường, phường/xã..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Ngôn ngữ / Múi giờ (read-only) */}
      <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
        <p>Ngôn ngữ: {locale || "vi-VN"}</p>
        <p>Múi giờ: {timeZone || "Asia/Ho_Chi_Minh"}</p>
      </div>

      {/* Nút action */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={!hasChanges || isBusy}
          className={`px-4 py-2 rounded-lg border text-sm ${
            !hasChanges || isBusy
              ? "border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
              : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Có lẽ để sau
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isBusy}
          className={`px-5 py-2 rounded-lg text-sm font-semibold text-white ${
            !hasChanges || isBusy
              ? "bg-sky-300 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}