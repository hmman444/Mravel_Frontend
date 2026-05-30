import { useTranslation } from "react-i18next";

export default function HotelWhyUs() {
  const { t } = useTranslation();
  const items = [
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407528373-a0e2c450b5cfac244d687d6fa8f5dd98.png?tr=dpr-2,h-150,q-75,w-150",
      title: t("hotel.why_us_price_title"),
      desc: t("hotel.why_us_price_desc"),
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407536280-ddcb70cab4907fa78468540ba722d25b.png?tr=dpr-2,h-150,q-75,w-150",
      title: t("hotel.why_us_payment_title"),
      desc: t("hotel.why_us_payment_desc"),
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407541562-61b4438f5439c253d872e70dd7633791.png?tr=dpr-2,h-150,q-75,w-150",
      title: t("hotel.why_us_support_title"),
      desc: t("hotel.why_us_support_desc"),
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407562736-ea624be44aec195feffac615d37ab492.png?tr=dpr-2,h-150,q-75,w-150",
      title: t("hotel.why_us_review_title"),
      desc: t("hotel.why_us_review_desc"),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-10">
        {t("hotel.why_us_heading")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            {/* Icon */}
            <img
              src={item.icon}
              alt={item.title}
              className="w-20 h-20 object-contain mb-4"
            />

            {/* Title */}
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}