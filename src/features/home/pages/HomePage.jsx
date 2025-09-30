import Navbar from "../../../components/Navbar";
import HeroSection from "../components/HeroSection";
import SearchBar from "../../../components/SearchBar";
import ServiceList from "../components/ServiceList";
import PlanSection from "../components/PlanSection";
import ReviewSection from "../components/ReviewSection";
import PartnerSection from "../components/PartnerSection";
import Footer from "../../../components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <SearchBar/>
      <main>
        <ServiceList />
        <PlanSection />
        <ReviewSection />
        <PartnerSection />
      </main>
      <Footer />
    </div>
  );
}
