import bg from "../../../assets/mountain-bg.jpg";
export default function HeroSection() {
  return (
    <section
      className="relative h-[600px] bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-neutral dark:text-white">
          Du lịch tự do – Trọn vẹn hành trình
        </h1>
        <p className="mt-3 text-lg text-secondary dark:text-gray-300">
          Khám phá dịch vụ, địa điểm và lịch trình dễ dàng
        </p>
      </div>
    </section>

  );
}
