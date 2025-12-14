import { useState } from "react";
import { createPortal } from "react-dom";
import { Info, FileText, X, Clock, CreditCard, PhoneCall, Ban } from "lucide-react";
import { FaUserClock, FaGlassCheers, FaParking, FaWheelchair } from "react-icons/fa";

export default function RestaurantBookingPolicyCard() {
  const [open, setOpen] = useState(false);

  const importantNote = {
    title: "Lưu ý quan trọng",
    subtitle: "Chính sách giữ bàn & đặt cọc",
    text:
      "Sau khi đặt cọc thành công, hệ thống sẽ giữ bàn theo khung giờ bạn chọn. Vui lòng đến đúng giờ để đảm bảo có chỗ ngồi.",
  };

  const sections = [
    {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      title: "Giữ bàn",
      text:
        "Bàn được giữ theo khung giờ đã chọn.\n- Thời gian giữ bàn: 10–15 phút (tuỳ nhà hàng).\n- Nếu đến muộn quá thời gian giữ, nhà hàng có thể huỷ giữ bàn để phục vụ khách khác.",
    },
    {
      icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
      title: "Đặt cọc & thanh toán",
      text:
        "Khoản đặt cọc dùng để giữ bàn và được trừ vào hoá đơn (tuỳ chính sách nhà hàng).\n- Đặt cọc tính theo số bàn và loại bàn.\n- Nếu nhà hàng có chương trình đặc biệt (set menu/tiệc), phí có thể thay đổi theo thời điểm.",
    },
    {
      icon: <FaUserClock className="h-4 w-4 text-orange-500" />,
      title: "Thay đổi giờ / loại bàn",
      text:
        "Bạn có thể liên hệ nhà hàng để hỗ trợ điều chỉnh.\n- Việc đổi giờ/loại bàn phụ thuộc tình trạng bàn trống.\n- Một số nhà hàng có thể yêu cầu đặt lại nếu thay đổi quá sát giờ.",
    },
    {
      icon: <Ban className="h-4 w-4 text-red-500" />,
      title: "Huỷ & hoàn cọc",
      text:
        "Chính sách hoàn cọc phụ thuộc từng nhà hàng.\nVí dụ thường gặp:\n- Huỷ trước X giờ: hoàn cọc (hoặc hoàn một phần).\n- Huỷ sát giờ hoặc không đến: có thể mất cọc.\nVui lòng đọc kỹ phần mô tả của nhà hàng hoặc liên hệ trực tiếp để xác nhận.",
    },
    {
      icon: <PhoneCall className="h-4 w-4 text-purple-600" />,
      title: "Liên hệ hỗ trợ",
      text:
        "Nếu bạn cần hỗ trợ (đổi giờ, đổi số bàn, ghi chú dị ứng…), hãy gọi trực tiếp nhà hàng.\nKhi liên hệ, vui lòng cung cấp:\n- Tên người đặt\n- Số điện thoại\n- Ngày/giờ đặt\n- Loại bàn & số bàn",
    },
    {
      icon: <FaGlassCheers className="h-4 w-4 text-pink-500" />,
      title: "Sự kiện / ngày lễ",
      text:
        "Vào ngày lễ/Tết hoặc giờ cao điểm, nhà hàng có thể áp dụng:\n- Set menu bắt buộc\n- Thời lượng ngồi tối đa\n- Mức đặt cọc cao hơn\nThông tin sẽ hiển thị ở trang chi tiết (nếu có).",
    },
    {
      icon: <FaParking className="h-4 w-4 text-gray-700" />,
      title: "Gửi xe",
      text:
        "Chỗ gửi xe tuỳ thuộc từng cơ sở.\n- Một số nhà hàng có bãi xe riêng hoặc hỗ trợ gửi xe gần đó.\n- Phí gửi xe (nếu có) do bãi xe thu, không bao gồm trong tiền cọc.",
    },
    {
      icon: <FaWheelchair className="h-4 w-4 text-indigo-600" />,
      title: "Hỗ trợ đặc biệt",
      text:
        "Nếu bạn cần hỗ trợ (xe lăn, ghế trẻ em, bàn gần cửa sổ…), hãy ghi chú khi đặt.\nNhà hàng sẽ cố gắng sắp xếp nhưng không đảm bảo 100% do phụ thuộc tình trạng bàn thực tế.",
    },
  ];

  return (
    <>
      {/* CARD CHÍNH */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900 md:text-base">
              Chính sách đặt bàn
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline md:text-sm"
          >
            Đọc tất cả
          </button>
        </div>

        {/* Lưu ý quan trọng */}
        <div className="overflow-hidden rounded-2xl bg-blue-50">
          <div className="flex items-start gap-2 px-4 py-3 md:px-5">
            <div className="mt-0.5">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-700 md:text-sm">
                {importantNote.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-900 md:text-sm">
                {importantNote.subtitle}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-700 md:text-sm">
                {importantNote.text}
              </p>
            </div>
          </div>
        </div>

        {/* Tóm tắt 2 mục bên dưới (cho “thật” như Hotel) */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-gray-900 md:text-sm">
                Giữ bàn theo khung giờ
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 md:text-sm">
                Bàn sẽ được giữ trong một khoảng thời gian ngắn. Nếu đến muộn quá thời gian giữ,
                nhà hàng có thể huỷ giữ bàn.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold text-gray-900 md:text-sm">
                Đặt cọc theo loại bàn
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 md:text-sm">
                Tiền cọc tính theo số bàn và loại bàn. Một số nhà hàng có chính sách hoàn cọc tuỳ thời điểm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL ĐỌC TẤT CẢ */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-2 md:px-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900 md:text-lg">
                  {importantNote.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-5">
                {/* Block note trong modal */}
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700 md:text-sm">
                    {importantNote.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-900 md:text-sm">
                    {importantNote.subtitle}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 md:text-sm">
                    {importantNote.text}
                  </p>
                </div>

                {/* Sections chi tiết */}
                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-50">
                      {sec.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {sec.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-700 whitespace-pre-line md:text-sm">
                        {sec.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}