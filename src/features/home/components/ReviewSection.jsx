export default function ReviewSection() {
  const reviews = [
    {
      id: 1,
      user: "Nguyễn Bình An",
      comment: "Dịch vụ khách sạn đặt qua Mravel rất ổn, check-in nhanh, giá tốt.",
      rating: 5,
      trip: "Đà Lạt 3N2Đ",
    },
    {
      id: 2,
      user: "Trần Bình",
      comment:
        "Lên lịch trình Hà Nội – Sapa rất dễ, chia sẻ với bạn bè cùng chỉnh sửa được luôn.",
      rating: 4,
      trip: "Hà Nội – Sapa",
    },
  ];

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <section className="py-12 md:py-14 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              Đánh giá từ khách hàng
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Những trải nghiệm thực tế từ người dùng đã sử dụng Mravel cho
              chuyến đi của họ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-slate-50/90 dark:bg-gray-900/90 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-800 p-4 md:p-5 transition transform hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center font-semibold shadow">
                  {getInitial(r.user)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-gray-50">
                      {r.user}
                    </span>
                    <span className="text-xs text-amber-500">
                      {"★".repeat(r.rating)}{" "}
                      <span className="text-gray-400 dark:text-gray-500">
                        ({r.rating}.0)
                      </span>
                    </span>
                  </div>
                  {r.trip && (
                    <div className="mt-0.5 text-xs text-sky-600 dark:text-sky-300">
                      Đã lên kế hoạch: {r.trip}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                “{r.comment}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
