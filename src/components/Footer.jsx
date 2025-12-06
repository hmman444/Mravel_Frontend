import iataLogo from "../assets/iata-logo.png";
import iso27001Logo from "../assets/iso27001.png";
import boCongThuongLogo from "../assets/logo-da-dang-ky-bo-cong-thuong.png";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTelegramPlane,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";

const TRUST_BADGES = [
  {
    src: iataLogo,
    alt: "IATA",
  },
  {
    src: iso27001Logo,
    alt: "ISO 27001",
  },
  {
    src: boCongThuongLogo,
    alt: "Đã đăng ký Bộ Công Thương",
  },
];

const PAYMENT_PARTNERS = [
  "Mastercard",
  "Visa",
  "JCB",
  "Amex",
  "MoMo",
  "VietQR",
  "Vietcombank",
  "Techcombank",
  "TPBank",
  "VIB",
  "ACB",
  "BIDV",
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 space-y-10">
        {/* top area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* left: Brand + badges + payment partners */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo / brand */}
            <div>
              <span className="inline-flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-wide">Mravel</span>
                <span className="text-sky-400 text-xl">✈️</span>
              </span>

              <p className="mt-3 text-sm text-slate-400 max-w-md">
                Nền tảng du lịch giúp bạn tìm kiếm, đặt dịch vụ và quản lý
                hành trình dễ dàng – từ khách sạn, nhà hàng đến các hoạt động
                trải nghiệm.
              </p>
            </div>

            {/* Badges giống traveloka, dùng logo thật */}
            <div className="flex flex-wrap items-center gap-4">
              {TRUST_BADGES.map((b) => (
                <img
                  key={b.alt}
                  src={b.src}
                  alt={b.alt}
                  className="h-10 md:h-11 object-contain"
                />
              ))}
            </div>
            {/* CTA hợp tác */}
            <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition">
              🤝 Hợp tác với Mravel
            </button>

            {/* Partner payments */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold tracking-wide">
                Đối tác thanh toán
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {PAYMENT_PARTNERS.map((name) => (
                  <div
                    key={name}
                    className="h-9 rounded-md bg-white flex items-center justify-center text-[10px] font-semibold text-slate-700 shadow-sm"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Link columns + social/app dưới 1 hàng riêng */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {/* Về Mravel */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-100">Về Mravel</h4>
              <ul className="space-y-2 text-slate-400">
                {[
                  "Cách đặt chỗ",
                  "Liên hệ chúng tôi",
                  "Trợ giúp",
                  "Tuyển dụng",
                  "Về chúng tôi",
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="font-medium text-slate-400 hover:text-slate-100 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sản phẩm */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-100">Sản phẩm</h4>
              <ul className="space-y-2 text-slate-400">
                {[
                  "Khách sạn",
                  "Vé máy bay",
                  "Nhà hàng",
                  "Hoạt động & trải nghiệm",
                  "Đưa đón sân bay",
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="font-medium text-slate-400 hover:text-slate-100 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Khác */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-100">Khác</h4>
              <ul className="space-y-2 text-slate-400">
                {[
                  "Blog Mravel",
                  "Chính sách quyền riêng tư",
                  "Điều khoản & Điều kiện",
                  "Kênh đối tác doanh nghiệp",
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="font-medium text-slate-400 hover:text-slate-100 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hàng dưới: social + app (full width) */}
            <div className="col-span-2 md:col-span-3 space-y-5">
              {/* Social */}
              <div>
                <h4 className="font-semibold mb-3 text-slate-100">
                  Theo dõi chúng tôi
                </h4>

                {/* chỉ icon, không viền, không nền */}
                <div className="flex flex-wrap gap-4 text-xl">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="text-slate-400 transition-colors hover:text-[#1877F2]"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="text-slate-400 transition-colors hover:text-[#E1306C]"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="#"
                    aria-label="TikTok"
                    className="text-slate-400 transition-colors hover:text-[#00F2EA]"
                  >
                    <FaTiktok />
                  </a>
                  <a
                    href="#"
                    aria-label="Youtube"
                    className="text-slate-400 transition-colors hover:text-[#FF0000]"
                  >
                    <FaYoutube />
                  </a>
                  <a
                    href="#"
                    aria-label="Telegram"
                    className="text-slate-400 transition-colors hover:text-[#229ED9]"
                  >
                    <FaTelegramPlane />
                  </a>
                </div>
              </div>

              {/* App buttons */}
              <div>
                <h4 className="font-semibold mb-3 text-slate-100">
                  Tải ứng dụng Mravel
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button className="w-40 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium transition-all hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500">
                    <FaGooglePlay />
                    <span className="text-left">
                      Tải trên <br />
                      <span className="font-semibold">Google Play</span>
                    </span>
                  </button>
                  <button className="w-40 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium transition-all hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-400">
                    <FaApple />
                    <span className="text-left">
                      Tải trên <br />
                      <span className="font-semibold">App Store</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mravel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}