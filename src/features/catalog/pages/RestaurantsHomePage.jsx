import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import RestaurantHero from "../components/RestaurantHero";
import RestaurantSearchCard from "../components/RestaurantSearchCard";
import RestaurantPopularSection from "../components/RestaurantPopularSection";
import FadeInSection from "../../../components/FadeInSection";
import RestaurantPartners from "../components/RestaurantPartners";
import PaymentPartners from "../components/PaymentPartners";
import RestaurantWhyUs from "../components/RestaurantWhyUs";
import RestaurantBookingGuide from "../components/RestaurantBookingGuide";
import RestaurantIntroSection from "../components/RestaurantIntroSection";

export default function RestaurantsHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goSearch = (params = {}) => {
    const qs = new URLSearchParams({
      location: params.location || "",
      // tuỳ bạn dùng thêm date/time/people/mode/cuisine
      ...(params.date ? { date: params.date } : {}),
      ...(params.time ? { time: params.time } : {}),
      ...(params.people ? { people: String(params.people) } : {}),
      ...(params.cuisine ? { cuisine: params.cuisine } : {}),
      ...(params.mode ? { mode: params.mode } : {}),
      page: "0",
      size: "9",
    });

    navigate(`/restaurants/search?${qs.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* chừa chỗ cho navbar fixed */}
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      {/* Hero – cho fade-in nhẹ khi vào trang */}
      <FadeInSection>
        <RestaurantHero />
      </FadeInSection>

      {/* SEARCH CARD – nổi lên dưới chân hero giống Traveloka */}
      <FadeInSection delay={80}>
        <div className="relative max-w-7xl mx-auto px-6 -mt-10 md:-mt-12 z-10">
          <RestaurantSearchCard onSubmit={goSearch} />
        </div>
      </FadeInSection>

      {/* Nội dung phía dưới */}
            <main className="flex-1 w-full">
        <FadeInSection delay={140}>
          <RestaurantPopularSection />
        </FadeInSection>

        {/* Đối tác nhà hàng */}
        <FadeInSection delay={180}>
          <RestaurantPartners />
        </FadeInSection>

        {/* Đối tác thanh toán */}
        <FadeInSection delay={220}>
          <PaymentPartners />
        </FadeInSection>

        {/* Why Mravel */}
        <FadeInSection delay={260}>
          <RestaurantWhyUs />
        </FadeInSection>

        <FadeInSection delay={300}>
          <RestaurantBookingGuide />
        </FadeInSection>

        <FadeInSection delay={340}>
          <RestaurantIntroSection />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
}