import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CameraIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { createPlan } from "../services/planService";
import { useSelector } from "react-redux";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function NewPlanModal({ open, onClose, onCreated }) {
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    visibility: "PRIVATE",
    images: [],
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      showError("Bạn cần đăng nhập để tạo lịch trình!");
      return;
    }

    setUploading(true);
    try {
      const res = await createPlan(form, user);
      showSuccess("🎉 Đã tạo lịch trình thành công!");
      onCreated?.(res);
      onClose();
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        visibility: "PRIVATE",
        images: [],
      });
    } catch {
      showError("Tạo thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const visibilityIcon = {
    PUBLIC: <GlobeAltIcon className="w-5 h-5 text-blue-500" />,
    FRIENDS: <UserGroupIcon className="w-5 h-5 text-emerald-500" />,
    PRIVATE: <LockClosedIcon className="w-5 h-5 text-gray-500" />,
  }[form.visibility];

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[120]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-gray-900/90 shadow-2xl shadow-gray-300/40 dark:shadow-black/50 backdrop-blur-xl p-6">
              <Dialog.Title className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                ✈️ Tạo lịch trình mới
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-inner hover:shadow transition text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                  placeholder="Tiêu đề"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />

                <textarea
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-inner hover:shadow transition text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <div className="flex gap-3">
                  <input
                    type="date"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-inner hover:shadow transition text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />

                  <input
                    type="date"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-inner hover:shadow transition text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    {visibilityIcon}
                    {form.visibility}
                  </span>

                  <select
                    className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                    value={form.visibility}
                    onChange={(e) =>
                      setForm({ ...form, visibility: e.target.value })
                    }
                  >
                    <option value="PRIVATE">Riêng tư</option>
                    <option value="FRIENDS">Bạn bè</option>
                    <option value="PUBLIC">Công khai</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <label
                    htmlFor="upload"
                    className="cursor-pointer text-gray-500 text-sm"
                  >
                    <CameraIcon className="w-7 h-7 mx-auto mb-1 text-gray-500" />
                    Thêm ảnh
                  </label>
                  <input
                    id="upload"
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-full h-20 rounded-lg object-cover shadow"
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50"
                  >
                    {uploading ? "Đang tạo..." : "Tạo"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
