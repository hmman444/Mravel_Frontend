// src/features/hotels/components/hotel/HotelStorySection.jsx
import { useState } from "react";

export default function HotelStorySection({ hotel }) {
  // Hook luôn đứng ở top, không nằm sau bất kỳ early return nào
  const [expanded, setExpanded] = useState(false);

  if (!hotel) return null;

  // BE có thể trả "content" hoặc (sau này) "contentBlocks", check cả 2
  const content = Array.isArray(hotel.content)
    ? hotel.content
    : Array.isArray(hotel.contentBlocks)
    ? hotel.contentBlocks
    : [];

  if (!content.length) return null;

  // Ưu tiên lọc theo section = STORY nếu BE có trả
  const storyBlocks = content.filter((b) => {
    let rawSection = "";

    if (typeof b.section === "string") {
      rawSection = b.section;
    } else if (
      b.section &&
      typeof b.section === "object" &&
      typeof b.section.name === "string"
    ) {
      rawSection = b.section.name;
    } else if (typeof b.sectionLabel === "string") {
      rawSection = b.sectionLabel;
    }

    const section = rawSection.toUpperCase();

    if (section === "STORY") return true;
    if (!section) return true; // fallback khi BE chưa set

    return false;
  });

  if (!storyBlocks.length) return null;

  // --- Logic xem thêm / thu gọn ---
  const MAX_BLOCKS_COLLAPSED = 6; // số block hiển thị khi thu gọn

  const shouldShowToggle = storyBlocks.length > MAX_BLOCKS_COLLAPSED;
  const visibleBlocks = expanded
    ? storyBlocks
    : storyBlocks.slice(0, MAX_BLOCKS_COLLAPSED);

  return (
    // Dính liền card trên: chỉ border-top + padding
    <section className="border-t border-gray-100 px-6 py-5">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        Giới thiệu về {hotel.name}
      </h2>

      <div className="mt-3 space-y-3 md:space-y-4 text-sm md:text-[15px] leading-relaxed text-gray-800">
        {visibleBlocks.map((block, idx) => {
          const key = block.id || block._id || idx;

          const type =
            typeof block.type === "string" ? block.type.toUpperCase() : "";

          if (type === "HEADING") {
            return (
              <h3
                key={key}
                className="pt-2 text-base md:text-lg font-semibold text-gray-900"
              >
                {block.text}
              </h3>
            );
          }

          if (type === "PARAGRAPH" || !type) {
            return (
              <p key={key} className="text-justify">
                {block.text}
              </p>
            );
          }

          // bỏ qua IMAGE / MAP / GALLERY...
          return null;
        })}
      </div>

      {shouldShowToggle && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs md:text-sm font-semibold text-[#0064d2] hover:underline"
          >
            {expanded ? "Thu gọn" : "Xem thêm >"}
          </button>
        </div>
      )}
    </section>
  );
}