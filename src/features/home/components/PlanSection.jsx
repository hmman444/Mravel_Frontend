export default function PlanSection() {
  const plans = [
    {
      id: 1,
      name: "Hành trình Đà Lạt 3N2Đ",
      desc: "Khám phá thành phố ngàn hoa, check-in những góc chill nhất.",
      img: "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
      days: "3N2Đ",
      tag: "Cặp đôi / Nhóm nhỏ",
    },
    {
      id: 2,
      name: "Tour Hà Nội – Sapa",
      desc: "Trải nghiệm vùng núi Tây Bắc, săn mây và khám phá văn hoá bản địa.",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6Zj-MzfrcsirNx_6em61KGqPd5VaEUm57w&s",
      days: "4N3Đ",
      tag: "Phong cảnh / Trekking",
    },
  ];

  return (
    <section className="
      py-14 md:py-16 
      bg-gradient-to-br from-sky-50 via-blue-50/40 to-emerald-50/30 
      dark:from-slate-900 dark:via-slate-900 dark:to-slate-950
      border-t border-white/20 dark:border-white/5
    ">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              Lịch trình gợi ý
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Tham khảo những hành trình mẫu rồi tùy chỉnh theo phong cách của bạn.
            </p>
          </div>

          <a
            href="/plans"
            className="
              hidden sm:inline-flex items-center gap-1
              text-sm font-medium text-sky-700 dark:text-sky-300
              hover:text-sky-900 dark:hover:text-sky-200 transition
            "
          >
            Xem bảng tin → 
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {plans.map(p => (
            <div
              key={p.id}
              className="
                group rounded-2xl overflow-hidden 
                bg-white/90 dark:bg-gray-900/80
                border border-slate-100 dark:border-slate-800
                shadow-md hover:shadow-2xl 
                backdrop-blur-sm 
                transition-all duration-300
                hover:-translate-y-1
              "
            >
              {/* Image */}
              <div className="relative h-48 md:h-52 overflow-hidden">
                <img
                  src={p.img}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="
                    px-2.5 py-1 rounded-full text-[11px] font-semibold
                    bg-black/50 text-white backdrop-blur
                  ">
                    {p.days}
                  </span>
                  <span className="
                    px-2.5 py-1 rounded-full text-[11px] font-semibold
                    bg-white/85 text-gray-900 backdrop-blur
                  ">
                    Gợi ý Mravel
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-50 mb-1">
                  {p.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {p.desc}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="
                    inline-flex px-2.5 py-1 rounded-full 
                    bg-sky-50 text-sky-700 
                    dark:bg-sky-900/40 dark:text-sky-200
                  ">
                    {p.tag}
                  </span>
                  <span className="
                    text-primary hover:text-primaryHover cursor-pointer 
                    font-medium transition
                  ">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call-to-action */}
        <div className="text-center mt-10">
          <a
            href="/plans/my-plans"
            className="
              inline-flex items-center gap-2 px-6 py-3 
              rounded-full bg-gradient-to-r from-sky-500 to-blue-600
              text-white text-sm font-semibold 
              shadow-md hover:shadow-xl 
              hover:-translate-y-0.5 active:translate-y-0
              transition-all duration-200
            "
          >
            ✨ Tạo lịch trình mới trên Mravel
          </a>
        </div>

      </div>
    </section>
  );
}
