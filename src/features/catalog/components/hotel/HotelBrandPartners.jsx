// src/components/hotel/HotelBrandPartners.jsx
const hotelPartners = [
  "https://upload.wikimedia.org/wikipedia/vi/thumb/7/72/AccorHotels_logo.svg/1200px-AccorHotels_logo.svg.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbkmFAbt4Lm8mr77tSlRhNjK3bVNm_FSeqvg&s",
  "https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/company_logos/GOKAg0I5vqNJA2LnMIn8hMObUJ7gtYfV_1683186519____791f82e7b28afe696cab22542d831747.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/0f/FLC_Group_Logo.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSznvF2bskkx7gFFylrfIOqB-4n8gjH0p_FWQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7CEap6Ni6VPBPdWFB5K_c-xiibgZUrztJGg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqvp1LIQpy-iIt20hyeRh6v6N_QLNldXIrTw&s",
  "https://muongthanh.com/images/config/hospitality-01_1573532076.png",
];

export default function HotelBrandPartners() {
  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left text */}
        <div>
          <h2 className="text-2xl font-bold">Đối tác khách sạn</h2>
          <p className="text-gray-500 mt-1">
            Đối tác khách sạn trong nước & quốc tế
          </p>

          <p className="text-gray-600 mt-4 leading-relaxed">
            Chúng tôi hợp tác với các chuỗi khách sạn uy tín toàn cầu để mang đến
            cho bạn chỗ ở thoải mái và đáng tin cậy, dù bạn đi bất cứ đâu.
          </p>
        </div>

        {/* Right logos */}
        <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 place-items-center">
          {hotelPartners.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="hotel partner"
              className="h-10 object-contain opacity-80 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}