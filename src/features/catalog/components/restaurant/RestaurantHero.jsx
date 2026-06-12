// src/features/restaurants/components/restaurant/RestaurantHero.jsx
import { useTranslation } from "react-i18next";

export default function RestaurantHero() {
  const { t } = useTranslation();
  const banner =
    "https://ik.imagekit.io/tvlk/image/imageResource/2025/05/22/1747889814840-c3994b87577ea07541413dace0a20193.jpeg?tr=h-329,q-75,w-1305";

  return (
    <section className="bg-[#f5f7fb] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">
        <div className="relative h-[220px] md:h-[280px] rounded-3xl overflow-hidden shadow-lg">
          {/* Ảnh nền full width, KHÔNG làm tối nữa */}
          <img
            src={banner}
            alt={t("restaurant.hero_image_alt")}
            className="w-full h-full object-cover"
          />

          {/* Text đẩy xuống phía dưới ảnh */}
          <div className="absolute inset-x-0 bottom-0 pb-5 md:pb-7">
            <div className="px-6 md:px-10 max-w-xl text-white">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug drop-shadow">
                {t("restaurant.hero_title")}
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-base text-white/95 drop-shadow">
                {t("restaurant.hero_subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}