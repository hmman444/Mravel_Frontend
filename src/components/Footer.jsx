import { Link } from "react-router-dom";
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
  { src: iataLogo, alt: "IATA" },
  { src: iso27001Logo, alt: "ISO 27001" },
  { src: boCongThuongLogo, alt: "Đã đăng ký Bộ Công Thương" },
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

// Map link hợp lý (bạn đổi lại path theo routing Mravel của bạn)
const FOOTER_LINKS = [
  {
    title: "Về Mravel",
    items: [
      { label: "Về chúng tôi", to: "/about" },
      { label: "Tuyển dụng", to: "/careers" },
      { label: "Liên hệ", to: "/contact" },
      { label: "Trung tâm trợ giúp", to: "/help" },
    ],
  },
  {
    title: "Sản phẩm",
    items: [
      { label: "Khách sạn", to: "/hotels" },
      { label: "Nhà hàng", to: "/restaurants" },
      { label: "Địa điểm", to: "/places" },
      { label: "Lịch trình", to: "/plans" },
      { label: "Đặt dịch vụ", to: "/booking" },
    ],
  },
  {
    title: "Pháp lý & Chính sách",
    items: [
      { label: "Điều khoản & Điều kiện", to: "/terms" },
      { label: "Chính sách quyền riêng tư", to: "/privacy" },
      { label: "Chính sách hoàn hủy", to: "/refund" },
      { label: "Quy chế hoạt động", to: "/policy" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FaFacebookF />,
    hover: "hover:text-[#1877F2]",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: <FaInstagram />,
    hover: "hover:text-[#E1306C]",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: <FaTiktok />,
    hover: "hover:text-[#00F2EA]",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <FaYoutube />,
    hover: "hover:text-[#FF0000]",
  },
  {
    label: "Telegram",
    href: "https://t.me",
    icon: <FaTelegramPlane />,
    hover: "hover:text-[#229ED9]",
  },
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
              <Link to="/" className="inline-flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-wide">Mravel</span>
                <span className="text-sky-400 text-xl">✈️</span>
              </Link>

              <p className="mt-3 text-sm text-slate-400 max-w-md">
                Nền tảng du lịch giúp bạn tìm kiếm, đặt dịch vụ và quản lý hành
                trình dễ dàng – từ khách sạn, nhà hàng đến các hoạt động trải
                nghiệm.
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-4">
              {TRUST_BADGES.map((b) => (
                <img
                  key={b.alt}
                  src={b.src}
                  alt={b.alt}
                  className="h-10 md:h-11 object-contain"
                  loading="lazy"
                />
              ))}
            </div>

            {/* CTA hợp tác */}
            <Link
              to="/partner"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition"
            >
              🤝 Hợp tác với Mravel
            </Link>

            {/* Payment partners */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold tracking-wide">
                Đối tác thanh toán
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {PAYMENT_PARTNERS.map((name) => (
                  <div
                    key={name}
                    className="h-9 rounded-md bg-white flex items-center justify-center text-[10px] font-semibold text-slate-700 shadow-sm"
                    title={name}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right: link columns */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-3 text-slate-100">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-slate-400">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <Link
                        to={it.to}
                        className="font-medium text-slate-400 hover:text-slate-100 hover:underline underline-offset-4"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* row dưới: social + app (full width) */}
            <div className="col-span-2 md:col-span-3 space-y-5 pt-2">
              {/* Social */}
              <div>
                <h4 className="font-semibold mb-3 text-slate-100">
                  Theo dõi chúng tôi
                </h4>

                <div className="flex flex-wrap gap-4 text-xl">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className={[
                        "text-slate-400 transition-colors",
                        s.hover,
                      ].join(" ")}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* App buttons */}
              <div>
                <h4 className="font-semibold mb-3 text-slate-100">
                  Tải ứng dụng Mravel
                </h4>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="#"
                    className="w-40 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium transition-all hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
                  >
                    <FaGooglePlay />
                    <span className="text-left">
                      Tải trên <br />
                      <span className="font-semibold">Google Play</span>
                    </span>
                  </a>

                  <a
                    href="#"
                    className="w-40 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium transition-all hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-400"
                  >
                    <FaApple />
                    <span className="text-left">
                      Tải trên <br />
                      <span className="font-semibold">App Store</span>
                    </span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mravel. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/privacy" className="hover:text-slate-200 hover:underline">
              Privacy
            </Link>
            <span className="text-slate-700">•</span>
            <Link to="/terms" className="hover:text-slate-200 hover:underline">
              Terms
            </Link>
            <span className="text-slate-700">•</span>
            <Link to="/contact" className="hover:text-slate-200 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
