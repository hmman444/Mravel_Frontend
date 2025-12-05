// src/features/catalog/pages/RestaurantDetailPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import FadeInSection from "../../../components/FadeInSection";
import { fetchRestaurantDetail } from "../slices/catalogSlice";
import RestaurantGallery from "../components/restaurant/RestaurantGallery";
import RestaurantMainInfoPanel from "../components/restaurant/RestaurantMainInfoPanel";
import RestaurantBookingBox from "../components/restaurant/RestaurantBookingBox";
import RestaurantSummarySection from "../components/restaurant/RestaurantSummarySection";
import RestaurantMenuGallery from "../components/restaurant/RestaurantMenuGallery";
import RestaurantPolicySection from "../components/restaurant/RestaurantPolicySection";
import RestaurantParkingSection from "../components/restaurant/RestaurantParkingSection";
import RestaurantAmenitiesSection from "../components/restaurant/RestaurantAmenitiesSection";
import RestaurantDirectionsSection from "../components/restaurant/RestaurantDirectionsSection";
import RestaurantOpeningHoursSection from "../components/restaurant/RestaurantOpeningHoursSection";

export default function RestaurantDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { data: restaurant, loading, error } = useSelector(
    (s) => s.catalog.restaurantDetail
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (slug) dispatch(fetchRestaurantDetail(slug));
  }, [slug, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <div data-navbar>
        <Navbar />
      </div>
      <div className="h-[68px] md:h-[76px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {loading && (
            <p className="py-10 text-center text-gray-500">Đang tải thông tin quán ăn...</p>
          )}

          {!loading && error && (
            <p className="py-10 text-center text-red-600">{error}</p>
          )}

          {!loading && !error && restaurant && (
            <>
              <FadeInSection>
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                  <RestaurantGallery restaurant={restaurant} />
                </div>
              </FadeInSection>
              <div className="h-3" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantMainInfoPanel restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantSummarySection restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantMenuGallery restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantPolicySection restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantParkingSection restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantAmenitiesSection restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantDirectionsSection restaurant={restaurant} />
                  </div>
                  <div className="h-3" />
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <RestaurantOpeningHoursSection  restaurant={restaurant} />
                  </div>
                </div>
                <aside className="hidden lg:block">
                  <div className="lg:sticky lg:top-[88px]">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative">
                      <RestaurantBookingBox restaurant={restaurant} />
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}