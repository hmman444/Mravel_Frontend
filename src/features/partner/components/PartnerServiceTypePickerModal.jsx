import { AnimatePresence, motion } from "framer-motion";
import {
  XMarkIcon,
  BuildingOffice2Icon,
  CakeIcon,
} from "@heroicons/react/24/outline";

const backdrop = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const panel = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.99 },
};

export default function PartnerServiceTypePickerModal({ open, onClose, onPick }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(2,6,23,0.2)]"
          >
            <div className="relative border-b p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold text-gray-900">Chọn loại dịch vụ</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Chọn loại bạn muốn tạo. (Restaurant bạn làm sau cũng được)
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-2xl p-2 hover:bg-gray-100"
                  title="Đóng"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onPick?.("HOTEL")}
                className="group rounded-3xl border p-5 text-left hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition">
                    <BuildingOffice2Icon className="h-6 w-6 text-blue-700" />
                  </span>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Khách sạn</div>
                    <div className="text-sm text-gray-600">Tạo khách sạn + tiện ích + loại phòng</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Sau khi tạo/ cập nhật sẽ về <b>PENDING</b> chờ admin duyệt (theo rule BE).
                </div>
              </button>

              <button
                type="button"
                onClick={() => onPick?.("RESTAURANT")}
                className="group rounded-3xl border p-5 text-left hover:border-indigo-400 hover:shadow-md transition opacity-70"
                title="Bạn có thể làm sau"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 transition">
                    <CakeIcon className="h-6 w-6 text-indigo-700" />
                  </span>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Nhà hàng</div>
                    <div className="text-sm text-gray-600">Tạm để sau cho dễ control</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  (Bạn đang ưu tiên Hotel trước)
                </div>
              </button>
            </div>

            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}