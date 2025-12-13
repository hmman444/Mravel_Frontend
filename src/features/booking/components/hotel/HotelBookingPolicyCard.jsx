// src/features/booking/components/hotel/HotelBookingPolicyCard.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { Info, FileText, X } from "lucide-react";
import { FaUtensils, FaSmokingBan, FaDog } from "react-icons/fa";

export default function HotelBookingPolicyCard() {
  const [open, setOpen] = useState(false);

  const importantNote = {
    title: "Lưu ý quan trọng",
    subtitle: "Chính sách tài liệu",
    text:
      "Khi nhận phòng, bạn phải mang theo Chứng minh thư. Các tài liệu cần thiết có thể ở dạng bản mềm.",
  };

  const sections = [
    {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      title: "Giấy Tờ Bắt Buộc",
      text:
        "Khi nhận phòng, bạn cần cung cấp CMND/CCCD. Các giấy tờ cần thiết có thể ở dạng bản mềm.",
    },
    {
      icon: <FaUtensils className="h-4 w-4 text-orange-500" />,
      title: "Bữa sáng",
      text: "Bữa sáng tại cơ sở lưu trú được phục vụ từ 06:30 đến 10:00.",
    },
    {
      icon: <FaSmokingBan className="h-4 w-4 text-red-500" />,
      title: "Hút Thuốc",
      text: "Chỉ được phép hút thuốc trong khu vực chỉ định.",
    },
    {
      icon: <FaDog className="h-4 w-4 text-red-500" />,
      title: "Thú cưng",
      text: "Không được mang theo thú cưng.",
    },
    {
      icon: <FileText className="h-4 w-4 text-gray-600" />,
      title: "Chính Sách Bổ Sung",
      text: `Child Policy:
- Baby cot will be setup free of charge, subject to availability.
- Children under 06 years old will be free of charge, sharing bed with parents, maximum 01 free child per room.
- Children from 06 to 11 years old will be surcharged at 250,000VND/child/night, sharing bed with parents, maximum 01 child per room.
- Children from 12 years old will be surcharged as adult at 550,000VND/child/night, including extra bed, maximum 01 extra child per room.

Chính sách trẻ em:
- Cũi trẻ em được cung cấp miễn phí cho trẻ sơ sinh và tùy thuộc vào tình trạng sẵn có.
- Trẻ em dưới 06 tuổi được miễn phí khi ngủ chung giường với bố mẹ, tối đa 01 trẻ mỗi phòng.
- Trẻ em từ 06 đến 11 tuổi sẽ áp dụng phụ thu 250,000VND/trẻ/đêm, không bao gồm giường phụ, tối đa 01 trẻ em phát sinh mỗi phòng.
- Trẻ em từ 12 tuổi được tính như người lớn, áp dụng phụ thu 550,000VND/trẻ/đêm, bao gồm giường phụ, tối đa 01 trẻ phát sinh mỗi phòng.`,
    },
    {
      icon: <FileText className="h-4 w-4 text-purple-500" />,
      title: "Tiệc Gala",
      text:
        "Giá phòng của bạn đã bao gồm chi phí cho buổi tiệc Gala (GALA DINNER 2024) trong thời gian 31-12-2024 - 1-1-2025.",
    },
    {
      icon: <FileText className="h-4 w-4 text-gray-600" />,
      title: "Hướng Dẫn Nhận Phòng Chung",
      text:
        "Child Policy:\n- Baby cot will be setup free of charge, subject to availability.\n- Children under 06 years old will be free of charge, sharing bed with parents, maximum 01 free child per room. Children from 06 to 11 years old will be surcharged at 250,000VND/child/night, sharing bed with parents, maximum 01 child per room.\n- Children from 12 years old will be surcharged as adult at 650,000VND/child/night, including extra bed, maximum 01 extra child per room.",
    },
  ];

  return (
    <>
      {/* CARD CHÍNH TRONG PAGE BOOKING */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900 md:text-base">
              Chính sách Chỗ ở
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

        {/* Tóm tắt Giấy tờ bắt buộc bên dưới */}
        <div className="mt-4 flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs font-semibold text-gray-900 md:text-sm">
              Giấy Tờ Bắt Buộc
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 md:text-sm">
              Khi nhận phòng, bạn cần cung cấp CMND/CCCD. Các giấy tờ cần thiết
              có thể ở dạng bản mềm.
            </p>
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

              {/* Body scrollable */}
              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-5">
                {/* Block Lưu ý trong modal */}
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

                {/* Các section chi tiết */}
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