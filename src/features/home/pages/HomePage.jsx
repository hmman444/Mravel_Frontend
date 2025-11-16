// src/features/home/pages/HomePage.jsx (đoán đường dẫn)
import Navbar from "../../../components/Navbar";
import HeroSection from "../components/HeroSection";
import SearchBar from "../../../components/SearchBar";
import ServiceList from "../components/ServiceList";
import PlanSection from "../components/PlanSection";
import ReviewSection from "../components/ReviewSection";
import PartnerSection from "../components/PartnerSection";
import Footer from "../../../components/Footer";

import FadeInSection from "../../../components/FadeInSection"; // <-- thêm

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <HeroSection>
        <SearchBar />
      </HeroSection>

      {/* giảm khoảng cách giữa các section */}
      <main className="space-y-8 md:space-y-12">
        <FadeInSection>
          <ServiceList />
        </FadeInSection>

        <FadeInSection delay={100}>
          <PlanSection />
        </FadeInSection>

        <FadeInSection delay={200}>
          <ReviewSection />
        </FadeInSection>

        <FadeInSection delay={300}>
          <PartnerSection />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
}