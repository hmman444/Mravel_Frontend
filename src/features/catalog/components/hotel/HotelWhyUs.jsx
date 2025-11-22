export default function HotelWhyUs() {
  const items = [
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407528373-a0e2c450b5cfac244d687d6fa8f5dd98.png?tr=dpr-2,h-150,q-75,w-150",
      title: "Giá rẻ mỗi ngày với ưu đãi đặc biệt dành riêng cho ứng dụng",
      desc: "Đặt phòng qua ứng dụng để nhận giá tốt nhất với các khuyến mãi tuyệt vời!",
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407536280-ddcb70cab4907fa78468540ba722d25b.png?tr=dpr-2,h-150,q-75,w-150",
      title: "Phương thức thanh toán an toàn và linh hoạt",
      desc: "Giao dịch trực tuyến an toàn với nhiều lựa chọn như thanh toán tại cửa hàng tiện lợi, chuyển khoản ngân hàng, thẻ tín dụng đến Internet Banking. Không tính phí giao dịch.",
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407541562-61b4438f5439c253d872e70dd7633791.png?tr=dpr-2,h-150,q-75,w-150",
      title: "Hỗ trợ khách hàng 24/7",
      desc: "Đội ngũ nhân viên hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn trong từng bước của quá trình đặt phòng.",
    },
    {
      icon: "https://ik.imagekit.io/tvlk/image/imageResource/2017/05/10/1494407562736-ea624be44aec195feffac615d37ab492.png?tr=dpr-2,h-150,q-75,w-150",
      title: "Khách thực, đánh giá thực",
      desc: "Hơn 10.000.000 đánh giá, bình chọn đã được xác thực từ du khách để giúp bạn đưa ra lựa chọn đúng đắn.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-10">
        Tại sao nên đặt chỗ với Mravel?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            {/* Icon */}
            <img
              src={item.icon}
              alt={item.title}
              className="w-20 h-20 object-contain mb-4"
            />

            {/* Title */}
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}