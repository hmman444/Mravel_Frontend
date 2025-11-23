import Navbar from "../../../components/Navbar";
import HeroSection from "../components/HeroSection";
import SearchBar from "../../../components/SearchBar";
import ServiceList from "../components/ServiceList";
import PlanSection from "../components/PlanSection";
import ReviewSection from "../components/ReviewSection";
import PartnerSection from "../components/PartnerSection";
import Footer from "../../../components/Footer";
import FadeInSection from "../../../components/FadeInSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />

      <HeroSection>
        <SearchBar />
      </HeroSection>

      <main className="flex-1 space-y-8 md:space-y-12">
        <FadeInSection>
          <ServiceList />
        </FadeInSection>

        <FadeInSection delay={120}>
          <PlanSection />
        </FadeInSection>

        <FadeInSection delay={220}>
          <ReviewSection />
        </FadeInSection>

        <FadeInSection delay={320}>
          <PartnerSection />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
}
