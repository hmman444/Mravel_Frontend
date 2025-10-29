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
    } catch (err) {
      console.error(err);
      showError("Tạo thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const visibilityIcon = {
    PUBLIC: <GlobeAltIcon className="w-5 h-5 text-blue-500" />,
    FRIENDS: <UserGroupIcon className="w-5 h-5 text-green-500" />,
    PRIVATE: <LockClosedIcon className="w-5 h-5 text-gray-500" />,
  }[form.visibility];

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* Overlay mờ nền */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        {/* Nội dung modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-3 py-8 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-2"
            >
              <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
                  ✈️ Tạo lịch trình mới
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Tiêu đề"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Mô tả"
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                  <div className="flex gap-3">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      {visibilityIcon}
                      {form.visibility}
                    </span>
                    <select
                      value={form.visibility}
                      onChange={(e) =>
                        setForm({ ...form, visibility: e.target.value })
                      }
                      className="border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="PRIVATE">Riêng tư</option>
                      <option value="FRIENDS">Bạn bè</option>
                      <option value="PUBLIC">Công khai</option>
                    </select>
                  </div>

                  {/* Upload ảnh */}
                  <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <label
                      htmlFor="upload"
                      className="cursor-pointer text-gray-500 text-sm"
                    >
                      <CameraIcon className="w-6 h-6 mx-auto mb-1" />
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
                          className="w-full h-20 object-cover rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {uploading ? "Đang tạo..." : "Tạo"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
