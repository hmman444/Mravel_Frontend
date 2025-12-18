export default function PartnerSpotlight() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Nổi bật ngay từ đầu
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <SpotItem
            icon={<BillboardIcon />}
            title="Hồ sơ dịch vụ rõ ràng"
            desc="Tối ưu trang dịch vụ với ảnh, mô tả, tiện ích và thông tin quan trọng để khách dễ quyết định đặt."
          />
          <SpotItem
            icon={<PuzzleIcon />}
            title="Nhập thông tin nhanh"
            desc="Form gọn gàng, có cấu trúc — giúp bạn đăng khách sạn/quán ăn nhanh chóng và hạn chế sai sót."
          />
          <SpotItem
            icon={<SearchIcon />}
            title="Dễ được tìm thấy"
            desc="Dịch vụ xuất hiện trong tìm kiếm theo địa điểm, mức giá, đánh giá và gợi ý theo lịch trình du lịch."
          />
        </div>
      </div>
    </section>
  );
}

function SpotItem({ icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="h-28 flex items-center justify-center">{icon}</div>
      <h3 className="mt-2 text-lg font-extrabold text-slate-900 text-center">
        {title}
      </h3>
      <p className="mt-3 text-slate-600 leading-relaxed text-center">{desc}</p>
    </div>
  );
}

/** Icon bigger */
function BillboardIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 84 84" fill="none">
      <rect x="10" y="18" width="46" height="28" rx="6" fill="#E6F0FF" stroke="#CFE0FF" />
      <circle cx="23" cy="32" r="6" fill="#FF8A00" />
      <path d="M21.2 31.8l1.5 1.6 3.6-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <rect x="34" y="27" width="18" height="4" rx="2" fill="#9DB7E8" />
      <rect x="34" y="35" width="14" height="4" rx="2" fill="#B5C8EE" />
      <rect x="18" y="50" width="6" height="16" rx="3" fill="#1E3A8A" opacity="0.9" />
      <rect x="40" y="50" width="6" height="16" rx="3" fill="#1E3A8A" opacity="0.7" />
    </svg>
  );
}

function PuzzleIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 84 84" fill="none">
      <path
        d="M24 30c0-3.3 2.7-6 6-6h8c0 3 2.5 5.5 5.5 5.5S49 27 49 24h5c3.3 0 6 2.7 6 6v7
           c-3 0-5.5 2.5-5.5 5.5S57 48 60 48v6c0 3.3-2.7 6-6 6H30c-3.3 0-6-2.7-6-6V48
           c3 0 5.5-2.5 5.5-5.5S27 37 24 37v-7z"
        fill="#E8F0FF"
        stroke="#CFE0FF"
      />
      <path d="M49 24h5c3.3 0 6 2.7 6 6v6" stroke="#FF8A00" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 84 84" fill="none">
      <circle cx="38" cy="38" r="18" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
      <circle cx="46" cy="34" r="4" fill="#FF8A00" />
      <path d="M52 52l16 16" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
      <path d="M29 38h18" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}