"use client";

import { useEffect, useState } from "react";
import { X, Camera, Image as ImageIcon } from "lucide-react";
import { useEditProfile } from "../hooks/useEditProfile";

// Helpers format input
const cleanPhone = (value) => value.replace(/\D/g, ""); // chỉ giữ số
const cleanUsername = (value) => value.trim();
const cleanEmail = (value) => value.trim();

export default function EditProfileModal({
  open,
  onClose,
  initialData,
  onUpdated,
}) {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    avatar: "",
    coverImage: "",
    bio: "",
    city: "",
    country: "",
    hometown: "",
    occupation: "",
    gender: "", // MALE | FEMALE | OTHER | "" 
    dateOfBirth: "",
    phone1: "",
    phone2: "",
    phone3: "",
    secondaryEmail: "",
    tertiaryEmail: "",
    addressLine: "",
  });

  const [errors, setErrors] = useState({});
  const { uploadImage, saveProfile } = useEditProfile();
  const [saving, setSaving] = useState(false);

  // Đổ data khi mở modal
  useEffect(() => {
    if (!open || !initialData) return;

    setForm({
      fullname: initialData.fullname || "",
      username: initialData.username || "",
      avatar: initialData.avatar || "",
      coverImage: initialData.coverImage || initialData.cover || "",
      bio: initialData.bio || "",
      city: initialData.city || "",
      country: initialData.country || "",
      hometown: initialData.hometown || "",
      occupation: initialData.occupation || "",

      gender: initialData.gender || "", // giữ enum BE

      dateOfBirth: initialData.dateOfBirth || "",
      phone1: initialData.phone1 || "",
      phone2: initialData.phone2 || "",
      phone3: initialData.phone3 || "",
      secondaryEmail: initialData.secondaryEmail || "",
      tertiaryEmail: initialData.tertiaryEmail || "",
      addressLine: initialData.addressLine || "",
    });

    setErrors({});
  }, [open, initialData]);

  if (!open) return null;

  // Validate từng field đơn giản
  const validateField = (field, value) => {
    let msg = "";

    if (["phone1", "phone2", "phone3"].includes(field)) {
      if (value && value.length < 9) {
        msg = "Số điện thoại phải có ít nhất 9 số";
      }
    }

    if (field === "secondaryEmail" || field === "tertiaryEmail") {
      if (
        value &&
        !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
      ) {
        msg = "Email không hợp lệ";
      }
    }

    if (field === "username") {
      if (value && value.length < 4) {
        msg = "Username phải có ít nhất 4 ký tự";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: msg }));
    return msg;
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (["phone1", "phone2", "phone3"].includes(field)) {
      value = cleanPhone(value);
    }
    if (field === "username") {
      value = cleanUsername(value);
    }
    if (field === "secondaryEmail" || field === "tertiaryEmail") {
      value = cleanEmail(value);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Nếu còn lỗi -> không gửi
    const fieldsToCheck = [
      "phone1",
      "phone2",
      "phone3",
      "secondaryEmail",
      "tertiaryEmail",
      "username",
    ];
    let hasError = false;
    const newErrors = {};

    fieldsToCheck.forEach((f) => {
      const msg = validateField(f, form[f]);
      if (msg) {
        hasError = true;
        newErrors[f] = msg;
      }
    });

    if (hasError) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setSaving(true);
    const payload = { ...form };

    await saveProfile(payload, () => {
      onUpdated?.();
      onClose();
    });

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-3">
      <div className="w-full max-w-4xl max-h-[calc(100vh-64px)] rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden">
        {/* COVER + AVATAR */}
        <div className="relative h-32 sm:h-40 bg-slate-200 dark:bg-slate-800 shrink-0">
          {form.coverImage ? (
            <img
              src={form.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400 gap-1">
              <ImageIcon className="w-6 h-6" />
              <span>Thêm ảnh cover để hồ sơ nổi bật hơn</span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="coverUpload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              if (url) setForm((p) => ({ ...p, coverImage: url }));
            }}
          />

          <button
            type="button"
            className="absolute right-3 top-3 px-2.5 py-1.5 rounded-full bg-black/60 text-xs text-white hover:bg-black/70 transition flex items-center gap-1.5"
            onClick={() => document.getElementById("coverUpload")?.click()}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Đổi ảnh bìa
          </button>

          {/* AVATAR */}
          <div className="absolute left-6 bottom-[-32px] flex items-end gap-3">
            <div className="relative">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-slate-950 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-950 flex items-center justify-center text-lg font-semibold text-slate-700 dark:text-slate-100 shadow-lg">
                  {form.fullname?.[0] || "U"}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatarUpload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file);
                  if (url) setForm((prev) => ({ ...prev, avatar: url }));
                }}
              />

              <button
                type="button"
                className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md hover:bg-sky-600 transition"
                onClick={() => document.getElementById("avatarUpload")?.click()}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* BODY: SCROLLABLE */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto pt-10 px-5 pb-4 space-y-5"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Chỉnh sửa hồ sơ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tất cả thông tin này sẽ hiển thị trên trang cá nhân của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* HỌ TÊN + USERNAME */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              value={form.fullname}
              onChange={handleChange("fullname")}
              error={errors.fullname}
              placeholder="Nhập họ tên đầy đủ"
            />
            <Input
              label="Username"
              prefix="@"
              value={form.username}
              onChange={handleChange("username")}
              error={errors.username}
              placeholder="mravel.traveler"
            />
          </div>

          {/* BIO */}
          <TextArea
            label="Giới thiệu ngắn"
            value={form.bio}
            onChange={handleChange("bio")}
            placeholder="Ví dụ: Yêu thích du lịch tự phát, cà phê ngon và những cung đường vắng."
          />

          {/* LOCATION */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Thành phố đang sống"
              value={form.city}
              onChange={handleChange("city")}
              placeholder="TP. Hồ Chí Minh"
            />
            <Input
              label="Quốc gia"
              value={form.country}
              onChange={handleChange("country")}
              placeholder="Việt Nam"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Quê quán"
              value={form.hometown}
              onChange={handleChange("hometown")}
              placeholder="Quê quán"
            />
            <Input
              label="Nghề nghiệp"
              value={form.occupation}
              onChange={handleChange("occupation")}
              placeholder="Ví dụ: Kỹ sư phần mềm..."
            />
          </div>

          {/* GENDER + DOB */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Select giới tính */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Giới tính
              </label>
              <select
                value={form.gender || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 text-sm border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-400 outline-none"
              >
                <option value="">Không chọn</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <Input
              label="Ngày sinh"
              type="date"
              value={form.dateOfBirth || ""}
              onChange={handleChange("dateOfBirth")}
            />
          </div>

          {/* PHONES */}
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Số điện thoại 1"
              value={form.phone1}
              onChange={handleChange("phone1")}
              error={errors.phone1}
              placeholder="Chỉ nhập số"
            />
            <Input
              label="Số điện thoại 2"
              value={form.phone2}
              onChange={handleChange("phone2")}
              error={errors.phone2}
              placeholder="Tuỳ chọn"
            />
            <Input
              label="Số điện thoại 3"
              value={form.phone3}
              onChange={handleChange("phone3")}
              error={errors.phone3}
              placeholder="Tuỳ chọn"
            />
          </div>

          {/* EMAILS */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email phụ"
              type="email"
              value={form.secondaryEmail}
              onChange={handleChange("secondaryEmail")}
              error={errors.secondaryEmail}
              placeholder="Ví dụ: email 2"
            />
            <Input
              label="Email khác"
              type="email"
              value={form.tertiaryEmail}
              onChange={handleChange("tertiaryEmail")}
              error={errors.tertiaryEmail}
              placeholder="Ví dụ: email 3"
            />
          </div>

          {/* ADDRESS */}
          <Input
            label="Địa chỉ chi tiết"
            value={form.addressLine}
            onChange={handleChange("addressLine")}
            placeholder="Số nhà, đường, phường/xã..."
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-1.5 rounded-full text-xs font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* REUSABLE INPUT COMPONENTS */

function Input({ label, prefix, error, className = "", ...props }) {
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl border px-3 py-2 bg-white dark:bg-slate-900 transition
        ${
          hasError
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-400"
            : "border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-sky-400"
        }`}
      >
        {prefix && (
          <span className="text-slate-400 mr-1 text-xs select-none">{prefix}</span>
        )}
        <input
          {...props}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
      {hasError && (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

function TextArea({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        {...props}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 resize-none"
      />
    </div>
  );
}
