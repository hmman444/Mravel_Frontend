import { Link } from "react-router-dom";
import { Wrench, Clock, ArrowLeft, Home } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FadeInSection from "../components/FadeInSection";

export default function FeatureComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      {/* Navbar cố định trên cùng */}
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <FadeInSection>
            <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header có gradient nhẹ + icon */}
              <div className="relative px-6 sm:px-10 py-8 sm:py-10 bg-gradient-to-r from-indigo-500/90 via-indigo-500 to-sky-500 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                      <Wrench className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Feature in progress</span>
                      </div>
                      <h1 className="mt-3 text-2xl sm:text-3xl font-bold">
                        Tính năng đang được phát triển
                      </h1>
                      <p className="mt-1 text-sm sm:text-base text-white/90">
                        Chúng tôi đang hoàn thiện tính năng này để mang lại trải nghiệm tốt hơn cho bạn.
                      </p>
                    </div>
                  </div>

                  {/* “Thẻ” nhỏ mô tả tình trạng */}
                  <div className="md:text-right">
                    <p className="text-xs uppercase tracking-wider text-white/70">
                      Trạng thái
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-200" />
                      </span>
                      Đang phát triển
                    </p>
                  </div>
                </div>
              </div>

              {/* Nội dung chính */}
              <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-6">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Tính năng này hiện chưa sẵn sàng sử dụng, nhưng chắc chắn sẽ xuất hiện trong những bản cập nhật tiếp theo.
                  Đội ngũ phát triển đang làm việc chăm chỉ để hoàn thiện giao diện, tối ưu hiệu năng và đảm bảo mọi thứ hoạt động ổn định.
                </p>

                <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Dự kiến
                    </p>
                    <p className="mt-1 text-sm text-gray-800">
                      Ra mắt trong các bản cập nhật sắp tới.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                      Bạn sẽ nhận được
                    </p>
                    <ul className="mt-1 space-y-1.5 text-sm text-gray-800 list-disc list-inside">
                      <li>Trải nghiệm mượt mà hơn</li>
                      <li>Thêm nhiều tiện ích hữu ích</li>
                      <li>Giao diện thân thiện & rõ ràng</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Góp ý của bạn
                    </p>
                    <p className="mt-1 text-sm text-gray-800">
                      Nếu bạn có ý tưởng hoặc góp ý cho tính năng này, hãy gửi phản hồi để chúng tôi cải thiện tốt hơn.
                    </p>
                  </div>
                </div>

                {/* Nút điều hướng */}
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại trang trước
                    </button>

                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Về trang chủ
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Cảm ơn bạn đã trải nghiệm ứng dụng. Tính năng mới sẽ sớm ra mắt ✨
                  </p>
                </div>
              </div>
            </section>
          </FadeInSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}