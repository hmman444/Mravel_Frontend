// src/features/hotels/components/hotel/HotelFaqSection.jsx
import { useState } from "react";
import { ChevronDown, ChevronRight, X, HelpCircle, MessageCircle } from "lucide-react";

export default function HotelFaqSection({ hotel }) {
  // state cho accordion ở section chính
  const [openIndex, setOpenIndex] = useState(null);

  // state cho drawer “Xem tất cả”
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState(null);

  // Nếu không có faq thì bỏ qua
  if (!hotel || !Array.isArray(hotel.faqs) || hotel.faqs.length === 0)
    return null;

  const faqs = hotel.faqs;
  const previewFaqs = faqs.slice(0, 4);

  const toggleMainItem = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const toggleDrawerItem = (idx) => {
    setDrawerOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const drawerTitle = `Câu hỏi thường gặp tại ${hotel.name}`;
  const sectionTitle = `Câu hỏi thường gặp về ${hotel.name}`;

  const heroImage =
    Array.isArray(hotel.images) && hotel.images.length > 0
      ? hotel.images[0].url || hotel.images[0].src
      : null;

  return (
    <>
      {/* SECTION CHÍNH */}
      <section className="mt-0 border border-gray-200 bg-white">
        <div className="grid gap-0 md:grid-cols-[270px,1fr]">
          {/* LEFT PANEL */}
          <div className="flex flex-col gap-4 bg-gradient-to-b from-[#dbeeff] to-[#f4f9ff] px-6 py-6 md:py-8">
            <h2 className="text-base font-semibold leading-relaxed text-gray-900 md:text-lg">
              {sectionTitle}
            </h2>

            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-sm">
                <HelpCircle className="h-9 w-9 text-[#0064d2]" />
              </div>
              <p className="text-[11px] text-gray-600 text-center">
                Các câu hỏi phổ biến về tiện ích, giá phòng,
                thời gian nhận/trả phòng tại {hotel.name}.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE – LIST 4 FAQ ĐẦU */}
          <div className="border-l border-gray-100 px-0 py-3 md:py-4">
            <div className="divide-y divide-gray-100">
              {previewFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const question = faq.question || faq.title;
                const answer = faq.answer || faq.content;

                return (
                  <div key={question || idx} className="bg-white">
                    <button
                      type="button"
                      onClick={() => toggleMainItem(idx)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f5f7fb]"
                    >
                      <span className="text-sm text-gray-900">
                        {question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && answer && (
                      <div className="bg-[#f9fafb]">
                        <div className="mx-4 mb-3 rounded-xl border border-[#e0e7ff] bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-700 shadow-sm">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2ebff] text-[#0064d2]">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1d4ed8]">
                              Trả lời
                            </span>
                          </div>
                          <p className="text-[13px]">{answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* NÚT XEM TẤT CẢ */}
            {faqs.length > 4 && (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0064d2] hover:underline"
                >
                  Xem tất cả
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DRAWER XEM TẤT CẢ – CỐ ĐỊNH MÉP PHẢI, CAO = VIEWPORT */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* overlay mờ, click để đóng */}
          <button
            type="button"
            className="flex-1 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* PANEL PHẢI */}
          <div className="relative flex h-screen w-full max-w-xl flex-col bg-white shadow-xl">
            {/* HERO */}
            <div className="relative h-44 w-full overflow-hidden bg-black">
              {heroImage && (
                <img
                  src={heroImage}
                  alt={hotel.name}
                  className="h-full w-full object-cover opacity-80"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  {hotel.name}
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">
                  {drawerTitle}
                </h3>
              </div>
            </div>

            {/* LIST FAQ – SCROLL TRONG PANEL, KHÔNG ẢNH HƯỞNG PAGE */}
            <div className="flex-1 overflow-y-auto bg-[#f5f7fb] px-0 py-3">
              <div className="divide-y divide-gray-100 bg-white">
                {faqs.map((faq, idx) => {
                  const isOpen = drawerOpenIndex === idx;
                  const question = faq.question || faq.title;
                  const answer = faq.answer || faq.content;

                  return (
                    <div key={question || idx} className="bg-white">
                      <button
                        type="button"
                        onClick={() => toggleDrawerItem(idx)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f5f7fb]"
                      >
                        <span className="text-sm text-gray-900">
                          {question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && answer && (
                        <div className="bg-[#f9fafb]">
                          <div className="mx-4 mb-3 rounded-xl border border-[#e0e7ff] bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-700 shadow-sm">
                            <div className="mb-1 flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2ebff] text-[#0064d2]">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1d4ed8]">
                                Trả lời
                              </span>
                            </div>
                            <p className="text-[13px]">{answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}