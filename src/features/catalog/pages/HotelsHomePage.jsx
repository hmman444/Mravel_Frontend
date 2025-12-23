import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import HotelHero from "../components/hotel/HotelHero";
import HotelSearchCard from "../components/hotel/HotelSearchCard";
import HotelWhyUs from "../components/hotel/HotelWhyUs";
import HotelIntroSection from "../components/hotel/HotelIntroSection";
import FadeInSection from "../../../components/FadeInSection";
import HotelBrandPartners from "../components/hotel/HotelBrandPartners";
import PaymentPartners from "../components/PaymentPartners";
import WeekendNearbyHotels from "../components/hotel/WeekendNearbyHotels";
import HotelSearchResultsSection from "../components/hotel/HotelSearchResultsSection";

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
      <FadeInSection delay={80} className="relative z-20">
        <div className="relative max-w-7xl mx-auto px-6 -mt-8">
          <HotelSearchCard onSubmit={goSearch} />
        </div>
      </FadeInSection>

      {/* Nội dung phía dưới */}
      <main className="flex-1 w-full">
        {/* Chơi cuối tuần gần nhà (thay cho Khách sạn phổ biến) */}
        <FadeInSection className="max-w-7xl mx-auto px-6 pt-10 pb-10">
          <HotelSearchResultsSection />
          <WeekendNearbyHotels />
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