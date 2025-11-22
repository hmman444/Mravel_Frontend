const restaurantPartners = [
  "https://media-cdn.tripadvisor.com/media/photo-s/08/73/13/d9/logo.jpg",
  "https://inkythuatso.com/uploads/images/2021/12/gogi-house-logo-inkythuatso-01-15-08-51-51.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWfJUWKecfedJtsuTOPzmzy51L7szK8FDYfw&s",
  "https://upload.wikimedia.org/wikipedia/vi/f/fd/Lotteria_logo.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzwzd1cnSt6Ps-I0RIqz9Wfhtklk_0Grni3A&s",
  "https://upload.wikimedia.org/wikipedia/sco/thumb/b/bf/KFC_logo.svg/2048px-KFC_logo.svg.png",
  "https://images.seeklogo.com/logo-png/7/1/jollibee-logo-png_seeklogo-75962.png",
  "https://images.seeklogo.com/logo-png/46/1/texas-chicken-logo-png_seeklogo-463089.png",
];

export default function RestaurantPartners() {
  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left text */}
        <div>
          <h2 className="text-2xl font-bold">Đối tác nhà hàng</h2>
          <p className="text-gray-500 mt-1">
            Chuỗi nhà hàng, quán ăn được khách hàng tin tưởng
          </p>

          <p className="text-gray-600 mt-4 leading-relaxed">
            Từ thương hiệu lớn đến quán ăn địa phương, chúng tôi hợp tác cùng các
            đối tác uy tín để mang đến cho bạn trải nghiệm ẩm thực đa dạng.
          </p>
        </div>

        {/* Right logos */}
        <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 place-items-center">
          {restaurantPartners.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="restaurant partner"
              className="h-10 object-contain opacity-80 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}