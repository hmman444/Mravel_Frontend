// src/features/restaurants/components/RestaurantHero.jsx
export default function RestaurantHero() {
  const banner =
    "https://ik.imagekit.io/tvlk/image/imageResource/2025/05/22/1747889814840-c3994b87577ea07541413dace0a20193.jpeg?tr=h-329,q-75,w-1305";

  return (
    <section className="bg-[#f5f7fb]">
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">
        <div className="relative h-[220px] md:h-[280px] rounded-3xl overflow-hidden shadow-lg">
          {/* Ảnh nền full width, KHÔNG làm tối nữa */}
          <img
            src={banner}
            alt="Nhà hàng, quán ăn"
            className="w-full h-full object-cover"
          />

          {/* Text đẩy xuống phía dưới ảnh */}
          <div className="absolute inset-x-0 bottom-0 pb-5 md:pb-7">
            <div className="px-6 md:px-10 max-w-xl text-white">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug drop-shadow">
                Tìm & đặt quán ăn với Mravel
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-base text-white/95 drop-shadow">
                Đặt bàn trước cho chuyến đi của bạn: quán ăn địa phương,
                nhà hàng sang trọng hay quán nhậu tụ họp cùng bạn bè.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}