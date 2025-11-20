import bg from "../../../assets/mountain-bg.jpg";

export default function HeroSection({ children }) {
  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* nội dung hero + search bar bên trong */}
      <div className="relative z-10 flex min-h-[560px] md:min-h-[620px] items-center">
        <div className="w-full max-w-6xl mx-auto px-6">
          {/* text */}
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-neutral dark:text-white">
              Du lịch tự do – Trọn vẹn hành trình
            </h1>
            <p className="mt-3 text-lg text-secondary dark:text-gray-300">
              Khám phá dịch vụ, địa điểm và lịch trình dễ dàng
            </p>
          </div>

          {/* search bar nằm TRONG hero, ngay dưới text */}
          {children && (
            <div className="mt-6 md:mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}