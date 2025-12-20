import { useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import PartnerHeroSection from "../components/landing/PartnerHeroSection";
import PartnerSpotlight from "../components/landing/PartnerSpotlight";
import PartnerDetailsFaq from "../components/landing/PartnerDetailsFaq";

import FadeInSection from "../../../components/FadeInSection";

export default function PartnerLandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7FAFF]">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <div className="relative flex-1">
        {/* LIGHT BACKDROP */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-white" />
          <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute top-20 -right-40 h-[520px] w-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-200/30 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.10) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <FadeInSection>
            <PartnerHeroSection />
          </FadeInSection>

          <FadeInSection delay={120}>
            <PartnerSpotlight />
          </FadeInSection>

          <FadeInSection delay={220}>
            <PartnerDetailsFaq />
          </FadeInSection>
        </div>
      </div>

      <Footer />
    </div>
  );
}