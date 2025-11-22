// src/features/hotels/pages/HotelDetailPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import FadeInSection from "../../../components/FadeInSection";
import { fetchHotelDetail } from "../../catalog/slices/catalogSlice";
import HotelMainInfoPanel from "../components/hotel/HotelMainInfoPanel";
import HotelRoomsSection from "../components/hotel/HotelRoomsSection";
import HotelNearbySection from "../components/hotel/HotelNearbySection";
import HotelStorySection from "../components/hotel/HotelStorySection";
import HotelAmenitiesSection from "../components/hotel/HotelAmenitiesSection";
import HotelPolicySection from "../components/hotel/HotelPolicySection";
import HotelFaqSection from "../components/hotel/HotelFaqSection";
import HotelSimilarSection from "../components/hotel/HotelSimilarSection";

export default function HotelDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { data: hotel, loading, error } = useSelector(
    (s) => s.catalog.hotelDetail
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (slug) {
      dispatch(fetchHotelDetail(slug));
    }
  }, [slug, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {loading && (
            <p className="py-10 text-center text-gray-500">
              Đang tải thông tin khách sạn...
            </p>
          )}

          {!loading && error && (
            <p className="py-10 text-center text-red-600">{error}</p>
          )}

          {!loading && !error && hotel && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
              {/* 🔥 Chỉ bọc phần trên bằng FadeInSection */}
              <FadeInSection>
                <div>
                  <HotelMainInfoPanel hotel={hotel} />
                  <HotelRoomsSection hotel={hotel} />
                  <HotelNearbySection hotel={hotel} />
                </div>
              </FadeInSection>

              {/* Story nằm trong cùng card, ngay dưới Nearby, không tách card */}
              <HotelStorySection hotel={hotel} />
              <HotelAmenitiesSection hotel={hotel} />
              <HotelPolicySection hotel={hotel} />
              <HotelFaqSection hotel={hotel} />
              <HotelSimilarSection hotel={hotel} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}