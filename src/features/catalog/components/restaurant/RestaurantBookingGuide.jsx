const ILLUS_BEFORE =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573663215-8914daf44487459499d53841698c0f64.png?tr=q-75";

const ILLUS_AFTER_1 =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573699621-e60af089536085fc82cb2b1d1c69f68f.png?tr=q-75";

const ILLUS_AFTER_2 =
  "https://ik.imagekit.io/tvlk/image/imageResource/2019/01/04/1546573805676-2b0e54865059eaec6e462e02423013de.png?tr=q-75";

export default function RestaurantBookingGuide() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* ===== TIÊU ĐỀ + ĐOẠN MỞ ĐẦU ===== */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Đặt Bàn Tại Mravel Giúp Bạn Thoải Mái Tận Hưởng Bữa Ăn
        </h2>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify">
          Hãy sẵn sàng tận hưởng nhiều tiện ích hơn khi lên kế hoạch cho bữa ăn
          cùng gia đình, bạn bè với dịch vụ{" "}
          <strong>đặt nhà hàng trực tuyến tại Mravel</strong>. Chỉ với vài cú
          nhấp chuột, bạn đã có thể tìm và giữ chỗ tại những quán ăn phù hợp
          nhất với lịch trình của mình. Bạn chỉ cần{" "}
          <strong>chọn nhà hàng, chọn thời gian, xác nhận đặt chỗ</strong> –
          phần còn lại cứ để Mravel lo. Dưới đây là một số{" "}
          <strong>mẹo đặt bàn trên Mravel</strong> để trải nghiệm của bạn luôn
          suôn sẻ.
        </p>

        {/* ===== BLOCK 1: TRƯỚC KHI ĐẶT BÀN (Hình trái – chữ phải) ===== */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Hình */}
          <div className="flex justify-center">
            <img
              src={ILLUS_BEFORE}
              alt="Lên kế hoạch đặt bàn"
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>

          {/* Nội dung */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Trước Khi Đặt Bàn
            </h3>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              <strong>
                Liệt kê các thông tin chính về bữa ăn của bạn
              </strong>
              , chẳng hạn như số người, ngày dùng bữa, khung giờ mong muốn,
              khu vực và ngân sách. Điều này giúp bạn lọc nhanh các nhà hàng
              phù hợp trên Mravel.
            </p>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              <strong>Chọn thời điểm đặt bàn hợp lý.</strong> Vào cuối tuần hoặc
              dịp lễ, các nhà hàng thường rất đông. Hãy đặt bàn trước để tránh
              phải chờ đợi lâu hoặc không còn chỗ trống.
            </p>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              <strong>Xem kỹ thông tin nhà hàng.</strong> Trên Mravel, bạn có
              thể xem menu tham khảo, vị trí trên bản đồ, khung giờ phục vụ,
              hình ảnh không gian và đánh giá của khách trước. Hãy đọc kỹ để
              chọn nơi phù hợp với nhu cầu và phong cách của bạn.
            </p>
          </div>
        </div>

        {/* ===== BLOCK 2: SAU KHI ĐẶT BÀN (1–2, chữ trái – hình phải) ===== */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Text trái */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Sau Khi Đặt Bàn
            </h3>

            <ol className="list-decimal pl-5 space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <li>
                <strong>Kiểm tra lại thông tin trong xác nhận đặt chỗ</strong>{" "}
                được gửi qua email hoặc ứng dụng Mravel: tên nhà hàng, địa chỉ,
                thời gian, số lượng khách, ghi chú đặc biệt (nếu có).
              </li>
              <li>
                <strong>Chú ý các mã đặt chỗ quan trọng</strong> để xuất trình
                khi đến nhà hàng, giúp quá trình check-in nhanh chóng hơn và
                tránh nhầm lẫn.
              </li>
            </ol>
          </div>

          {/* Hình phải */}
          <div className="flex justify-center">
            <img
              src={ILLUS_AFTER_1}
              alt="Xem lại thông tin đặt bàn"
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* ===== BLOCK 3: TIẾP TỤC 3–5 (Hình trái – chữ phải) ===== */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Hình trái */}
          <div className="flex justify-center">
            <img
              src={ILLUS_AFTER_2}
              alt="Chuẩn bị cho bữa ăn"
              className="max-w-xs md:max-w-sm w-full h-auto object-contain"
            />
          </div>

          {/* Text phải – tiếp tục số 3,4,5 */}
          <div>
            <ol
              start={3}
              className="list-decimal pl-5 space-y-3 text-sm md:text-base text-gray-700 leading-relaxed"
            >
              <li>
                <strong>Chuẩn bị những vật dụng cần mang theo</strong>{" "}
                như điện thoại đã đăng nhập tài khoản Mravel, sạc dự phòng,
                voucher/ưu đãi (nếu có) và các nhu yếu phẩm cần thiết cho bữa ăn
                hoặc chuyến đi.
              </li>
              <li>
                <strong>Đến nhà hàng đúng hoặc sớm hơn giờ đã đặt</strong>{" "}
                một chút, đặc biệt trong khung giờ cao điểm, để đảm bảo trải
                nghiệm được trọn vẹn và không ảnh hưởng đến thời gian phục vụ.
              </li>
              <li>
                <strong>Tận hưởng bữa ăn của bạn!</strong> Nếu hài lòng, đừng
                quên để lại đánh giá trên Mravel để giúp những khách hàng khác
                có thêm thông tin hữu ích, và để chúng tôi tiếp tục cải thiện
                trải nghiệm đặt chỗ cho bạn.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}