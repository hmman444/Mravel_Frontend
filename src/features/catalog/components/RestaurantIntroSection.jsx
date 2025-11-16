// src/features/restaurants/components/RestaurantIntroSection.jsx
import { useState } from "react";

export default function RestaurantIntroSection() {
  const [expanded, setExpanded] = useState(false);

  // ───────── SHORT CONTENT: 3 đoạn mở đầu ─────────
  const shortHtml = `
<p>
  Vào năm 2025, Mravel ra mắt dịch vụ <strong>đặt bàn nhà hàng trực tuyến</strong> ngay trên website và ứng dụng của mình. Dịch vụ này giúp người dùng dễ dàng tìm kiếm và giữ chỗ tại các nhà hàng yêu thích mà không cần phải gọi điện nhiều nơi hay mất thời gian đến trực tiếp để đặt chỗ.
</p>

<p>
  Hiện tại, hệ thống đặt bàn của Mravel đã hợp tác với nhiều chuỗi nhà hàng, quán ăn và quán cà phê nổi tiếng trên khắp Việt Nam, từ những quán ăn đường phố, quán lẩu nướng, buffet đến các nhà hàng sang trọng phục vụ ẩm thực Á – Âu. Bạn có thể tìm thấy đa dạng phong cách ẩm thực như món Việt, Hàn, Nhật, Thái, Âu, BBQ, lẩu – nướng… phù hợp với nhiều dịp khác nhau: hẹn hò, gặp gỡ bạn bè, liên hoan công ty hay bữa ăn gia đình.
</p>

<p>
  Bên cạnh những tiện ích cơ bản như đặt bàn nhanh chóng, Mravel còn mang đến nhiều lợi ích khác giúp cho trải nghiệm dùng bữa của bạn trở nên trọn vẹn hơn. Dưới đây là những lý do bạn nên <strong>đặt nhà hàng trực tuyến qua Mravel</strong>.
</p>
`;

  // ───────── FULL CONTENT: toàn bộ phần còn lại ─────────
  const fullHtml = `
${shortHtml}

<p><strong>1. Chọn – Đặt – Thưởng thức</strong></p>
<p>
  Việc đặt bàn qua Mravel trở nên đơn giản hơn bao giờ hết. Tất cả những gì bạn cần làm là mở website hoặc ứng dụng Mravel, chọn địa điểm, ngày – giờ, số lượng khách và nhà hàng yêu thích. Toàn bộ quá trình đặt chỗ được thực hiện chỉ trong vài bước, nhanh chóng và an toàn, giúp bạn tránh cảnh phải gọi điện nhiều lần hoặc chờ đợi tại nhà hàng trong giờ cao điểm.
</p>
<p>
  Nếu có vấn đề phát sinh trong quá trình đặt bàn, đội ngũ <strong>hỗ trợ khách hàng 24/7</strong> của Mravel luôn sẵn sàng trợ giúp bạn qua tính năng chat, email hoặc điện thoại, giúp bạn yên tâm hơn trong mọi bữa ăn.
</p>

<p><strong>2. Tùy chọn không giới hạn</strong></p>
<p>
  Mravel hợp tác với hàng trăm nhà hàng và quán ăn tại nhiều thành phố du lịch lớn như Hà Nội, Đà Nẵng, Nha Trang, Đà Lạt, TP.HCM… cũng như các điểm đến nổi tiếng khác. Bạn có thể dễ dàng tìm kiếm theo <strong>khu vực, loại ẩm thực, mức giá, phong cách không gian</strong> hay đánh giá từ người dùng.
</p>
<p>
  Nhờ đó, bạn luôn có nhiều lựa chọn từ quán ăn bình dân giá tốt đến nhà hàng cao cấp, phù hợp với mọi ngân sách và nhu cầu trải nghiệm ẩm thực của mình.
</p>

<p><strong>3. Thông tin đầy đủ</strong></p>
<p>
  Khi đặt bàn qua Mravel, bạn có thể xem <strong>đầy đủ thông tin về nhà hàng</strong> như địa chỉ, bản đồ chỉ đường, khung giờ hoạt động, mức giá tham khảo, thực đơn mẫu, hình ảnh không gian, chính sách đặt chỗ và đánh giá chi tiết từ khách đã sử dụng dịch vụ.
</p>
<p>
  Nhờ những thông tin này, bạn có thể dễ dàng so sánh giữa các nhà hàng và đưa ra lựa chọn phù hợp nhất với sở thích và mong đợi của mình chỉ trong vài thao tác.
</p>

<p><strong>4. Phương thức thanh toán đa dạng</strong></p>
<p>
  Mravel hỗ trợ nhiều lựa chọn thanh toán linh hoạt: <strong>thanh toán online</strong> qua thẻ ngân hàng, ví điện tử, hoặc <strong>giữ chỗ trước – thanh toán tại nhà hàng</strong> (tùy vào chính sách từng đối tác). Tất cả giao dịch đều được đảm bảo an toàn nhờ kết nối với các cổng thanh toán và ngân hàng uy tín.
</p>

<p><strong>5. Ưu đãi hấp dẫn</strong></p>
<p>
  Mravel thường xuyên mang đến <strong>các mã giảm giá, combo ưu đãi, khuyến mãi giờ vàng</strong> cho người dùng đặt bàn trực tuyến. Nhờ đó, bạn có thể thưởng thức những bữa ăn chất lượng với mức chi phí tiết kiệm hơn so với giá niêm yết thông thường tại nhà hàng.
</p>

<p><strong>6. Đảm bảo đặt chỗ chính thức</strong></p>
<p>
  Mravel thiết lập quan hệ đối tác chính thức với các nhà hàng và quán ăn trên hệ thống. Mọi thông tin về <strong>đặt chỗ của bạn đều được đồng bộ trực tiếp</strong> đến nhà hàng. Bạn chỉ cần xuất trình mã xác nhận hoặc vé điện tử trên Mravel là có thể nhận bàn.
</p>
<p>
  Trong trường hợp hiếm hoi xảy ra sự cố như nhầm lẫn đặt chỗ, quá tải chỗ ngồi hoặc thay đổi đột xuất từ phía nhà hàng, Mravel luôn sẵn sàng hỗ trợ làm việc lại với đối tác hoặc đề xuất phương án thay thế phù hợp cho bạn. Hãy tận dụng sức mạnh công nghệ để mỗi bữa ăn của bạn diễn ra <strong>nhanh chóng, thuận tiện và trọn vẹn</strong> hơn cùng Mravel.
</p>
`;

  return (
    <section className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Tiêu đề */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Đặt Bàn Nhà Hàng Trực Tuyến Tại Mravel Với Giá Tốt
        </h2>

        {/* CONTENT giống HotelIntroSection */}
        <div
          className="prose prose-slate max-w-none text-gray-700 transition-all duration-300 text-[15px]"
          style={{
            maxHeight: expanded ? "9999px" : "320px",
            overflow: "hidden",
          }}
          dangerouslySetInnerHTML={{
            __html: expanded ? fullHtml : shortHtml,
          }}
        />

        {/* Gradient phủ nhẹ khi thu gọn */}
        {!expanded && (
          <div className="mt-[-80px] h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {/* Button xem thêm / thu gọn */}
        <div className="text-center mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-5 py-2 rounded-lg text-sky-600 font-semibold hover:underline"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>
    </section>
  );
}