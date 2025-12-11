// src/features/profile/components/EditPublicProfileModal.jsx
"use client";

import { useEffect, useState } from "react";
import { X, Camera, Image as ImageIcon } from "lucide-react";
import { useEditPublicProfile } from "../hooks/useEditPublicProfile";

export default function EditPublicProfileModal({
  open,
  onClose,
  initialData, // userView
  onUpdated,   // callback reload profile
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
  });

  const { uploadImage, saveProfile, uploading } = useEditPublicProfile();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !initialData) return;
    setForm({
      fullname: initialData.fullname || "",
      username: initialData.username || "",
      avatar: initialData.avatar || "",
      coverImage: initialData.cover || "",
      bio: initialData.bio === "Người dùng chưa thêm giới thiệu." ? "" : (initialData.bio || ""),
      city: initialData.city && initialData.city !== "Chưa cập nhật" ? initialData.city : "",
      country: initialData.country || "",
      hometown: initialData.hometown || "",
      occupation: initialData.occupation || "",
    });
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fullname: form.fullname.trim(),
      username: form.username.trim(),
      avatar: form.avatar.trim(),
      coverImage: form.coverImage.trim(),
      bio: form.bio.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      hometown: form.hometown.trim(),
      occupation: form.occupation.trim(),
    };

    saveProfile(payload, () => {
      onUpdated?.();
      onClose();
    });
  };


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-3">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden">
        {/* Header cover preview */}
        <div className="relative h-32 sm:h-40 bg-slate-200 dark:bg-slate-800">
          {form.coverImage ? (
            <img
              src={form.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <ImageIcon className="w-6 h-6" />
              <span>Thêm ảnh cover để hồ sơ nổi bật hơn</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none" />
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            className="hidden"
            id="coverUpload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const url = await uploadImage(file);
              if (url) setForm((prev) => ({ ...prev, coverImage: url }));
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/55 text-xs text-white hover:bg-black/70 transition"
            onClick={() => document.getElementById("coverUpload").click()}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Đổi ảnh bìa
          </button>

          {/* avatar preview */}
          <div className="absolute left-4 bottom-[-32px] flex items-end gap-3">
            <div className="relative">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-slate-950 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-lg font-semibold text-slate-700 dark:text-slate-100 shadow-lg">
                  {form.fullname?.[0] || "U"}
                </div>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
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
                className="absolute right-0 bottom-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white shadow-md hover:bg-sky-600 transition"
                onClick={() => document.getElementById("avatarUpload").click()}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="pt-10 px-4 sm:px-6 pb-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Chỉnh sửa hồ sơ công khai
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Những thông tin này sẽ hiển thị cho mọi người khi xem trang cá nhân của bạn.
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

          {/* fullname + username */}
          <div className="grid sm:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={form.fullname}
                onChange={handleChange("fullname")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Tên hiển thị trên hồ sơ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="flex items-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm">
                <span className="text-slate-400 text-xs mr-1">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={handleChange("username")}
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="mravel.traveler"
                />
              </div>
            </div>
          </div>

          {/* bio */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Giới thiệu ngắn
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={handleChange("bio")}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none"
              placeholder="Ví dụ: Yêu thích du lịch tự phát, cà phê ngon và những cung đường vắng."
            />
          </div>

          {/* location */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Thành phố đang sống
              </label>
              <input
                type="text"
                value={form.city}
                onChange={handleChange("city")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="TP. Hồ Chí Minh, Việt Nam"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Quốc gia
              </label>
              <input
                type="text"
                value={form.country}
                onChange={handleChange("country")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Việt Nam"
              />
            </div>
          </div>

          {/* hometown + occupation */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Quê quán
              </label>
              <input
                type="text"
                value={form.hometown}
                onChange={handleChange("hometown")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Bình Phước, Việt Nam"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Công việc hiện tại
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={handleChange("occupation")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Ví dụ: Kỹ sư phần mềm, Freelancer du lịch..."
              />
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
