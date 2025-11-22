const items = [
  {
    id: 1,
    icon:
      "https://ik.imagekit.io/tvlk/image/imageResource/2023/02/13/1676271014827-66a85fef46fbb06a6143f6011b6d0151.png?tr=q-75",
    title: "Tiện lợi",
    desc: "Đặt bàn mọi lúc, mọi nơi với Mravel mà không cần phải gọi điện hay đến trực tiếp nhà hàng. Chỉ vài thao tác là giữ chỗ xong.",
  },
  {
    id: 2,
    icon:
      "https://ik.imagekit.io/tvlk/image/imageResource/2023/04/13/1681374757603-3023eeea63594c91ac6cc0f8c0322bb9.webp?tr=q-75",
    title: "Chăm sóc khách hàng 24/7",
    desc: "Khi có vấn đề về đặt chỗ, thanh toán hoặc thay đổi thời gian, đội ngũ hỗ trợ của Mravel luôn sẵn sàng trợ giúp bạn.",
  },
  {
    id: 3,
    icon:
      "https://ik.imagekit.io/tvlk/image/imageResource/2023/04/13/1681374760363-fa047511b3aab4913d3eedd195092fda.webp?tr=q-75",
    title: "Thông tin đầy đủ, minh bạch",
    desc: "Xem trước menu, hình ảnh, vị trí, khung giờ đông khách, review thực tế… giúp bạn chọn được nhà hàng phù hợp nhất.",
  },
  {
    id: 4,
    icon:
      "https://ik.imagekit.io/tvlk/image/imageResource/2023/04/13/1681374762931-6f7c4778fd58363e7de9f940b8d1b611.webp?tr=q-75",
    title: "Thanh toán dễ dàng",
    desc: "Hỗ trợ nhiều phương thức: thanh toán online, giữ chỗ trước và trả tại nhà hàng, voucher/ưu đãi… linh hoạt theo nhu cầu của bạn.",
  },
];

export default function RestaurantWhyUs() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900">
          Tại sao bạn nên đặt nhà hàng trực tuyến tại Mravel?
        </h2>

        <div className="mt-8 space-y-8">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex flex-col items-center gap-6 md:gap-10 ${
                idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-[#e6f1ff] flex items-center justify-center shadow-sm">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              </div>

              {/* Text */}
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}