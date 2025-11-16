import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import HotelHero from "../components/HotelHero";
import HotelSearchCard from "../components/HotelSearchCard";
import HotelWhyUs from "../components/HotelWhyUs";
import HotelIntroSection from "../components/HotelIntroSection";
import FadeInSection from "../../../components/FadeInSection";
import HotelBrandPartners from "../components/HotelBrandPartners";
import PaymentPartners from "../components/PaymentPartners";

export default function HotelsHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goSearch = (params = {}) => {
    const qs = new URLSearchParams({
      location: params.location || "",
      checkIn: params.checkIn || "",
      nights: String(params.nights ?? 1),
      adults: String(params.adults ?? 2),
      rooms: String(params.rooms ?? 1),
      ...(params.children != null ? { children: String(params.children) } : {}),
      ...(params.childrenAges?.length
        ? { childrenAges: params.childrenAges.join(",") }
        : {}),
      page: "0",
      size: "9",
    });
    navigate(`/hotels/search?${qs.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      {/* Hero + search có thể hiện luôn, hoặc fade nhẹ nếu thích */}
      <FadeInSection>
        <HotelHero />
      </FadeInSection>

      {/* SEARCH CARD */}
      <FadeInSection delay={80}>
        <div className="relative max-w-7xl mx-auto px-6 -mt-8 z-10">
          <HotelSearchCard onSubmit={goSearch} />
        </div>
      </FadeInSection>

      {/* Nội dung phía dưới */}
            <main className="flex-1 w-full">
        {/* Khách sạn phổ biến */}
        <FadeInSection className="max-w-7xl mx-auto px-6 pt-10 pb-10">
          <h2 className="mt-4 mb-4 text-xl font-semibold">
            Khách sạn phổ biến
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden border dark:border-white/10 bg-white dark:bg-gray-900"
              >
                <div className="h-44 bg-gray-200" />
                <div className="p-4">
                  <div className="font-semibold line-clamp-1">
                    Khách sạn Demo {idx + 1}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Quận 1, TP.HCM
                  </div>
                  <div className="mt-2 text-orange-600 font-semibold">
                    từ 799.000 VND/đêm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* Đối tác khách sạn */}
        <FadeInSection delay={120}>
          <HotelBrandPartners />
        </FadeInSection>

        {/* Đối tác thanh toán */}
        <FadeInSection delay={160}>
          <PaymentPartners />
        </FadeInSection>

        {/* Các section info bên dưới */}
        <FadeInSection delay={200}>
          <HotelWhyUs />
        </FadeInSection>

        <FadeInSection delay={260}>
          <HotelIntroSection />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
}