import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BarChart3, Headphones } from "lucide-react";

export default function PartnerHeroSection() {
  return (
    <section className="relative pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-7 md:p-10 lg:p-12 items-center">
            {/* LEFT */}
            <div className="text-slate-900">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
                Trở thành{" "}
                <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  Đối tác Mravel
                </span>
                <br />
                và đăng dịch vụ của bạn
              </h1>

              <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                Dành cho chủ <b>khách sạn/nhà nghỉ</b> và <b>quán ăn</b>. Bạn có thể
                tạo hồ sơ đối tác, đăng dịch vụ, cập nhật thông tin, và theo dõi hiệu quả
                — mọi thứ gói gọn trong một khu vực quản trị rõ ràng, dễ demo luồng nghiệp vụ
                cho báo cáo.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Pill icon={<Sparkles className="w-4 h-4" />}>
                  Tăng khả năng tiếp cận khách du lịch
                </Pill>
                <Pill icon={<ShieldCheck className="w-4 h-4" />}>
                  Quy trình duyệt minh bạch, an toàn
                </Pill>
                <Pill icon={<BarChart3 className="w-4 h-4" />}>
                  Theo dõi đơn đặt & trạng thái dịch vụ
                </Pill>
                <Pill icon={<Headphones className="w-4 h-4" />}>
                  Hỗ trợ vận hành nhanh – gọn – rõ
                </Pill>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="px-7 py-6">
                <p className="text-slate-900 font-semibold text-lg">Đăng ký miễn phí</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tạo tài khoản đối tác để bắt đầu đăng dịch vụ trên Mravel.
                </p>

                <ul className="mt-5 space-y-4 text-slate-700">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>
                      Tạo hồ sơ đối tác và đăng dịch vụ <b>Khách sạn</b> / <b>Quán ăn</b>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>
                      Dịch vụ mới hoặc chỉnh sửa sẽ ở trạng thái <b>pending</b> chờ Admin duyệt.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>
                      Chủ động <b>tạm khóa</b> khi hết phòng/hết bàn, tránh nhận đơn ngoài ý muốn.
                    </span>
                  </li>
                </ul>

                <div className="mt-6">
                  <Link
                    to="/partner/register"
                    className="w-full inline-flex items-center justify-center gap-2
                               rounded-xl py-4 font-semibold
                               bg-sky-600 text-white hover:bg-sky-700 transition"
                  >
                    Bắt đầu ngay
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="text-center mt-4 text-sm text-slate-600">
                    Bạn đã có tài khoản?{" "}
                    <Link to="/partner/login" className="text-sky-700 font-semibold hover:underline">
                      Đăng nhập
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* END CARD */}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-white/70 text-slate-700">
      <span className="text-sky-700">{icon}</span>
      {children}
    </span>
  );
}