import { useTranslation } from "react-i18next";

const ILLUS_BEFORE =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573663215-8914daf44487459499d53841698c0f64.png?tr=q-75";

const ILLUS_AFTER_1 =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573699621-e60af089536085fc82cb2b1d1c69f68f.png?tr=q-75";

const ILLUS_AFTER_2 =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573805676-2b0e54865059eaec6e462e02423013de.png?tr=q-75";

export default function RestaurantBookingGuide() {
  const { t } = useTranslation();
  return (
    <section className="w-full bg-white dark:bg-gray-800">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/*  TIÊU ĐỀ + ĐOẠN MỞ ĐẦU  */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t("restaurant.guide_title")}
        </h2>

        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
          {t("restaurant.guide_intro_1")}{" "}
          <strong>{t("restaurant.guide_intro_online_booking")}</strong>
          {t("restaurant.guide_intro_2")}{" "}
          <strong>{t("restaurant.guide_intro_steps")}</strong>
          {t("restaurant.guide_intro_3")}{" "}
          <strong>{t("restaurant.guide_intro_tips")}</strong>
          {t("restaurant.guide_intro_4")}
        </p>

        {/*  BLOCK 1: TRƯỚC KHI ĐẶT BÀN (Hình trái – chữ phải)  */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Hình */}
          <div className="flex justify-center">
            <img
              src={ILLUS_BEFORE}
              alt={t("restaurant.guide_alt_planning")}
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>

          {/* Nội dung */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t("restaurant.guide_before_title")}
            </h3>

            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>{t("restaurant.guide_before_1_bold")}</strong>
              {t("restaurant.guide_before_1_rest")}
            </p>

            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>{t("restaurant.guide_before_2_bold")}</strong>{" "}
              {t("restaurant.guide_before_2_rest")}
            </p>

            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>{t("restaurant.guide_before_3_bold")}</strong>{" "}
              {t("restaurant.guide_before_3_rest")}
            </p>
          </div>
        </div>

        {/*  BLOCK 2: SAU KHI ĐẶT BÀN (1–2, chữ trái – hình phải)  */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Text trái */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t("restaurant.guide_after_title")}
            </h3>

            <ol className="list-decimal pl-5 space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>
                <strong>{t("restaurant.guide_after_1_bold")}</strong>{" "}
                {t("restaurant.guide_after_1_rest")}
              </li>
              <li>
                <strong>{t("restaurant.guide_after_2_bold")}</strong>{" "}
                {t("restaurant.guide_after_2_rest")}
              </li>
            </ol>
          </div>

          {/* Hình phải */}
          <div className="flex justify-center">
            <img
              src={ILLUS_AFTER_1}
              alt={t("restaurant.guide_alt_review")}
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>
        </div>

        {/*  BLOCK 3: TIẾP TỤC 3–5 (Hình trái – chữ phải)  */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Hình trái */}
          <div className="flex justify-center">
            <img
              src={ILLUS_AFTER_2}
              alt={t("restaurant.guide_alt_prepare")}
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>

          {/* Text phải – tiếp tục số 3,4,5 */}
          <div>
            <ol
              start={3}
              className="list-decimal pl-5 space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              <li>
                <strong>{t("restaurant.guide_after_3_bold")}</strong>{" "}
                {t("restaurant.guide_after_3_rest")}
              </li>
              <li>
                <strong>{t("restaurant.guide_after_4_bold")}</strong>{" "}
                {t("restaurant.guide_after_4_rest")}
              </li>
              <li>
                <strong>{t("restaurant.guide_after_5_bold")}</strong>{" "}
                {t("restaurant.guide_after_5_rest")}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}