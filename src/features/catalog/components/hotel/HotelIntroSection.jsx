// src/features/components/hotel/HotelIntroSection.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function HotelIntroSection() {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  /* ─ SHORT CONTENT (2 đoạn đầu) ─ */
  const shortHtmlVi = `
<p>
  Mravel là một trong những nền tảng du lịch trực tuyến hàng đầu Đông Nam Á, cung cấp đầy đủ tiện ích cho một chuyến đi trọn vẹn với các sản phẩm chính gồm: Vé máy bay, Khách sạn, Vé xe khách cùng Hoạt động du lịch như vé vui chơi, tour.
</p>
<p>
  Với mạng lưới hơn 1 triệu khách sạn toàn cầu, Mravel mang đến vô vàn lựa chọn phù hợp mọi nhu cầu và sở thích. Từ khách sạn giá rẻ gần bạn đến những nơi lưu trú sang trọng với view đẳng cấp, tất cả đều dễ dàng tìm kiếm nhờ bộ lọc thông minh. Đặc biệt, việc đặt phòng trực tuyến trên Mravel còn đi kèm các tiện ích như thanh toán linh hoạt, hỗ trợ 24/7, giúp bạn an tâm tận hưởng chuyến đi.
</p>
`;

  /* ─ FULL CONTENT (giữ nguyên nội dung, đổi Traveloka -> Mravel) ─ */
  const fullHtmlVi = `
${shortHtmlVi}

<p><strong>Tại sao nên đặt phòng khách sạn trên Mravel?</strong></p>
<p>
  Để tận hưởng trải nghiệm đặt phòng nhanh chóng, giá hợp lý và vô vàn ưu đãi hấp dẫn, Mravel chính là lựa chọn hàng đầu dành cho bạn. Vậy vì sao nên đặt phòng qua Mravel? Cùng khám phá ngay nhé!
</p>

<p><strong>1. Đa dạng lựa chọn lưu trú</strong></p>
<p>
  Khi lên kế hoạch cho chuyến đi, việc chọn nơi lưu trú là một trong những yếu tố quan trọng nhất. Vậy đặt phòng khách sạn trên Mravel có uy tín không? Câu trả lời là hoàn toàn có! Với hơn 1 triệu đối tác khách sạn trong và ngoài nước, cùng các chính sách bảo vệ khách hàng rõ ràng, Mravel mang đến sự an tâm và tin cậy tuyệt đối cho mỗi chuyến đi của bạn.
</p>

<p><strong>Loại hình lưu trú:</strong> Mravel mang đến cho bạn một kho tàng lựa chọn vô cùng phong phú và đa dạng. Từ những resort 5 sao sang trọng, biệt thự nghỉ dưỡng, đến các homestay ấm cúng, du thuyền đẳng cấp, khách sạn tiện lợi, cắm trại gần gũi, phòng nhà nghỉ gần nhất hay căn hộ tiện nghi, bạn đều có thể tìm thấy loại hình lưu trú phù hợp với nhu cầu và ngân sách của mình. Bạn có thể tham khảo thêm những homestay tại những điểm đến nổi tiếng ở trong nước như là</p>

<ul>
  <li>Homestay Đà Lạt</li>
  <li>Homestay Vũng Tàu</li>
  <li>Homestay Đà Nẵng</li>
  <li>Homestay Hà Nội</li>
  <li>Homestay TP.HCM</li>
</ul>

<p><strong>Khách sạn nội địa:</strong> Nếu bạn yêu thích du lịch trong nước, Mravel mang đến vô vàn lựa chọn phòng tại các điểm đến nổi tiếng như Đà Lạt, Vũng Tàu, Phan Thiết, Huế, Hội An và nhiều tỉnh thành khác. Hệ thống khách sạn tại đây cực kỳ phong phú, từ 1 đến 5 sao, linh hoạt về mức giá – giúp bạn dễ dàng lựa chọn chỗ ở phù hợp với ngân sách, mà vẫn tận hưởng kỳ nghỉ một cách trọn vẹn.</p>

<p><strong>Khách sạn quốc tế:</strong> Không chỉ dừng lại ở trong nước, Mravel còn mở rộng mạng lưới lưu trú ra nhiều quốc gia như Thái Lan, Singapore, Trung Quốc, Nhật Bản và nhiều điểm đến hấp dẫn khác. Các khách sạn quốc tế trên nền tảng cũng đa dạng từ bình dân đến cao cấp (1–5 sao), đáp ứng mọi nhu cầu, dù bạn du lịch tiết kiệm hay tận hưởng kỳ nghỉ sang trọng.</p>

<p>Bạn có thể tham khảo một vài danh mục khách sạn ở Thái Lan dưới đây:</p>
<ul>
  <li>Khách sạn Bangkok 5 sao</li>
  <li>Khách sạn Bangkok 4 sao</li>
  <li>Khách sạn Bangkok 3 sao</li>
  <li>Khách sạn Bangkok giá rẻ</li>
</ul>

<p>Một số danh mục khách sạn ở Singapore bạn có thể tham khảo:</p>
<ul>
  <li>Khách sạn Singapore 5 sao</li>
  <li>Khách sạn Singapore 4 sao</li>
  <li>Khách sạn Singapore 3 sao</li>
  <li>Khách sạn Singapore giá rẻ</li>
  <li>Khách sạn Singapore gần MRT</li>
</ul>

<p>Tại Nhật Bản, bạn có thể tham khảo một số khách sạn sau:</p>
<ul>
  <li>Khách sạn Tokyo giá rẻ</li>
  <li>Khách sạn Kyoto giá rẻ</li>
  <li>Khách sạn Osaka giá rẻ</li>
</ul>

<p>Khi du lịch Trung Quốc, bạn có thể tham khảo khách sạn tại những thành phố lớn:</p>
<ul>
  <li>Khách sạn Bắc Kinh</li>
  <li>Khách sạn Thượng Hải</li>
  <li>Khách sạn Quảng Châu</li>
</ul>

<p><strong>Tùy chọn tìm kiếm theo mong muốn:</strong> Mravel mang đến trải nghiệm tìm phòng linh hoạt và cá nhân hóa với hệ thống bộ lọc chi tiết, giúp bạn dễ dàng chọn được nơi lưu trú lý tưởng theo đúng sở thích và nhu cầu. Bạn có thể tùy chọn tìm kiếm theo các tiêu chí cụ thể như view phòng yêu thích (city view, garden view, sea view), diện tích phòng theo mét vuông, vị trí khách sạn gần bạn nhất hoặc gần điểm đến mong muốn. Đặc biệt, bạn còn có cơ hội tận hưởng ưu đãi nâng hạng phòng miễn phí tùy theo tình trạng phòng, mang lại trải nghiệm lưu trú thoải mái và trọn vẹn hơn.</p>

<p>Nếu bạn đang tìm kiếm một số khách sạn view đẹp, bạn có thể tham khảo những danh mục sau:</p>
<ul>
  <li>Khách sạn view núi Phú Sĩ</li>
  <li>Khách sạn Đà Lạt view săn mây</li>
  <li>Khách sạn Đà Lạt view rừng thông</li>
</ul>

<p><strong>Xuất hóa đơn VAT:</strong> Đối với các chuyến đi công tác, Mravel còn hỗ trợ lựa chọn khách sạn có xuất hóa đơn VAT đầy đủ, giúp bạn tiết kiệm thời gian và dễ dàng hơn trong việc thanh toán, quyết toán công tác phí.</p>

<p><strong>2. Trải nghiệm đặt phòng mượt mà</strong></p>

<p><strong>2.1. So sánh giá cả dễ dàng</strong><br/>
Khi tìm nơi lưu trú cho chuyến đi, khả năng so sánh giá và săn ưu đãi là yếu tố không thể thiếu. Trên Mravel, bạn sẽ trải nghiệm quy trình đặt phòng mượt mà, tiết kiệm thời gian và dễ dàng đưa ra lựa chọn phù hợp. Tính năng so sánh giá giúp bạn nhanh chóng đối chiếu mức giá giữa các khách sạn trong cùng khu vực. Đồng thời, Mravel còn hiển thị rõ các mức giá ưu đãi và khuyến mãi hấp dẫn như ưu đãi giờ chót, giúp bạn dễ dàng chọn được khách sạn vừa túi tiền. Với Mravel, việc đặt phòng trở nên đơn giản, liền mạch và cực kỳ tiện lợi.</p>

<p><strong>2.2. Quản lý giao dịch chỉ với vài thao tác</strong><br/>
Một trong những lý do khiến Mravel trở thành lựa chọn hàng đầu khi đặt phòng khách sạn chính là trải nghiệm đặt phòng mượt mà và khả năng quản lý giao dịch cực kỳ tiện lợi. Sau khi hoàn tất đặt phòng, bạn sẽ nhận ngay phiếu xác nhận qua cả ứng dụng và email, giúp bạn luôn nắm chắc thông tin hành trình và yên tâm hơn cho chuyến đi sắp tới.</p>

<p>Giao diện thân thiện của ứng dụng Mravel cho phép bạn dễ dàng tra cứu các booking chỉ với vài thao tác. Chỉ cần vào mục “Đặt chỗ của tôi”, bạn sẽ thấy đầy đủ thông tin từ tên khách sạn, thời gian lưu trú, mã đặt phòng đến các dịch vụ đi kèm – tất cả được sắp xếp rõ ràng, dễ theo dõi và quản lý.</p>

<p>Bên cạnh đó, email xác nhận từ Mravel cũng rất chi tiết, bao gồm: tên khách sạn, thời gian check-in/check-out, thông tin thanh toán, chính sách hủy phòng và các dịch vụ bổ sung. Mọi thứ đều minh bạch và đầy đủ, giúp bạn kiểm soát giao dịch dễ dàng mà không lo thiếu sót.</p>

<p><strong>2.3. Bảo mật an toàn</strong><br/>
Khi đặt phòng khách sạn qua Mravel, bạn không chỉ được tận hưởng sự tiện lợi mà còn hoàn toàn yên tâm với mức độ bảo mật cao nhất cho mọi giao dịch. Mravel cam kết bảo vệ tuyệt đối thông tin cá nhân và tài chính của người dùng thông qua công nghệ mã hóa hiện đại 256-bit, giúp ngăn chặn mọi rủi ro tấn công từ bên ngoài. Hệ thống bảo mật đa lớp này đảm bảo an toàn không chỉ cho thông tin thẻ tín dụng mà còn theo dõi, giám sát toàn bộ quá trình thanh toán một cách chặt chẽ.</p>

<p>Đặc biệt, Mravel không lưu trữ trực tiếp thông tin thẻ tín dụng của bạn. Thay vào đó, dữ liệu được mã hóa và lưu dưới dạng “mã khóa token” bởi nhà cung cấp dịch vụ thanh toán trực tuyến hàng đầu, giúp bạn an tâm tuyệt đối khi giao dịch.</p>

<p>Bên cạnh đó, hệ thống quản lý gian lận thông minh của Mravel luôn hoạt động liên tục để phát hiện và ngăn chặn kịp thời các hành vi đáng ngờ, bảo vệ tài khoản của bạn khỏi những rủi ro không mong muốn.</p>

<p><strong>2.4. Dịch vụ chăm sóc khách hàng trực tuyến</strong><br/>
Một trong những yếu tố tạo nên trải nghiệm booking hotel tuyệt vời trên Mravel chính là dịch vụ chăm sóc khách hàng trực tuyến chuyên nghiệp và tiện lợi.</p>

<p>Nếu bạn có bất kỳ thắc mắc nào trong quá trình đặt phòng – từ giờ check-in, dịch vụ đi kèm, đến chính sách hủy phòng – chỉ cần mở ứng dụng Mravel và chọn biểu tượng chatbox tại mục “Trò chuyện với chúng tôi”. Tại đây, trợ lý ảo thông minh sẽ hỗ trợ bạn giải đáp nhanh chóng các câu hỏi cơ bản. Nếu vấn đề phức tạp hơn, hệ thống sẽ tự động kết nối bạn với chuyên viên chăm sóc khách hàng, luôn sẵn sàng hỗ trợ 24/7.</p>

<p>Với Mravel, mọi thắc mắc đều được giải quyết nhanh gọn, giúp bạn yên tâm tuyệt đối trong suốt quá trình đặt phòng và tận hưởng chuyến đi một cách trọn vẹn.</p>

<p><strong>3. Review khách sạn, nhận xu Mravel</strong></p>
<p>
  Trên Mravel, việc chia sẻ đánh giá về khách sạn bạn đã trải nghiệm không chỉ giúp cộng đồng du khách có thêm thông tin đáng tin cậy mà còn mang lại phần thưởng hấp dẫn dành cho bạn. Điểm đặc biệt là chỉ những người đã đặt phòng và hoàn tất lưu trú qua Mravel mới có thể viết review. Điều này đảm bảo mọi đánh giá đều đến từ trải nghiệm thực tế, giúp tăng độ tin cậy và chất lượng cho từng nhận xét.
</p>
<p>
  Cách để lại review khách sạn cũng cực kỳ đơn giản: bạn chỉ cần viết một đánh giá tối thiểu 30 ký tự, kèm theo một ảnh thực tế, và sẽ nhận ngay phần thưởng vào tài khoản Mravel. Đây là hình thức thưởng nhanh gọn, khuyến khích người dùng chia sẻ trải nghiệm chân thực, đồng thời tạo nên một cộng đồng đánh giá khách quan và hữu ích cho tất cả mọi người.
</p>

<p><strong>4. Khuyến mãi khách sạn hấp dẫn</strong></p>

<p><strong>4.1 Ưu đãi cho khách hàng mới</strong><br/>
Mã giảm giá Mravel lần đầu sẽ giúp bạn tiết kiệm đáng kể chi phí khi đặt phòng khách sạn hoặc sử dụng các dịch vụ khác như vé máy bay, vui chơi, đưa đón sân bay,... Đây là cơ hội tuyệt vời để bạn trải nghiệm dịch vụ tiện lợi, nhanh chóng và tiết kiệm ngay từ lần đầu tiên cùng Mravel!</p>

<p><strong>4.2 Ưu đãi từ đối tác</strong><br/>
Bạn cũng sẽ nhận được những ưu đãi đặc biệt từ các đối tác của Mravel như các tổ chức du lịch hay đối tác ngân hàng. Các mã giảm giá đặt phòng Mravel này mang lại cơ hội tiết kiệm cho bạn khi đặt khách sạn hoặc sử dụng dịch vụ khác trên nền tảng.</p>

<p><strong>4.3 Ưu đãi độc quyền cho Thành viên Mravel Priority</strong><br/>
Nếu bạn là người đam mê du lịch và thường xuyên sử dụng dịch vụ của Mravel, thì đây chính là thời điểm để săn ngay các ưu đãi độc quyền từ chương trình Thành viên Mravel Priority! Không chỉ mang đến những chuyến đi tuyệt vời, Mravel còn giúp bạn tiết kiệm đáng kể nhờ các mã giảm giá dành riêng cho hội viên. Mỗi khi bạn đặt phòng khách sạn, bạn sẽ tích lũy được điểm Priority – dùng để nâng hạng và mở khóa các quyền lợi hấp dẫn. Đặc biệt, khi đặt phòng, bạn sẽ thấy lượng điểm tích lũy hiển thị ngay trên màn hình, giúp bạn dễ dàng theo dõi tiến độ nâng hạng.</p>

<p><strong>Các cấp bậc Thành viên Mravel Priority:</strong></p>
<ul>
  <li>Bronze</li>
  <li>Silver</li>
  <li>Gold</li>
  <li>Platinum</li>
  <li>Diamond</li>
</ul>

<p><strong>Những lợi ích nổi bật khi tham gia Mravel Priority:</strong></p>
<ul>
  <li>Mã giảm giá độc quyền dành riêng cho từng cấp thành viên</li>
  <li>Ưu tiên nhận thông tin khuyến mãi sớm</li>
  <li>Tích điểm &amp; đổi quà dễ dàng</li>
  <li>Ưu đãi đặc biệt tại khách sạn &amp; dịch vụ cao cấp</li>
</ul>

<p><strong>4.4 Săn mã giảm giá khách sạn Mravel ở đâu?</strong><br/>
Để luôn cập nhật những ưu đãi mới nhất, bạn chỉ cần truy cập vào trang Mã giảm giá Mravel – nơi tổng hợp đầy đủ các chương trình khuyến mãi đang diễn ra, từ mã giảm giá cho khách hàng mới, ưu đãi theo từng cấp bậc thành viên đến các chương trình giảm giá theo mùa, dịp lễ hấp dẫn.</p>

<p>Không dừng lại ở đó, bạn cũng có thể tìm hiểu chi tiết cách áp dụng mã tại trang hướng dẫn sử dụng Mã giảm giá Mravel. Tại đây, bạn sẽ được hướng dẫn từng bước cụ thể: từ cách chọn ưu đãi phù hợp, cách nhập mã khi thanh toán cho đến mẹo tiết kiệm tối đa.</p>

<p>Một điểm nổi bật khi sử dụng Mravel là sau khi đặt vé máy bay thành công, bạn sẽ nhận được mã giảm giá để tiếp tục đặt các dịch vụ khác như đặt khách sạn, vé vui chơi, đưa đón sân bay, thuê xe. Điều này không chỉ giúp bạn tiết kiệm chi phí mà còn tạo nên một hành trình trọn gói, dễ dàng và tối ưu.</p>

<p><strong>5. Phương thức thanh toán đa dạng</strong></p>
<p>
  Khi đặt phòng khách sạn trên Mravel, bạn sẽ được tận hưởng trải nghiệm thanh toán nhanh chóng, mượt mà và linh hoạt nhờ vào sự đa dạng trong các phương thức thanh toán được hỗ trợ. Để tối ưu hóa quá trình thanh toán, bạn có thể lưu thông tin thẻ trước, giúp các lần thanh toán sau chỉ cần một chạm là hoàn tất – tiết kiệm thời gian và cực kỳ tiện lợi.
</p>
<p>
  Mravel hỗ trợ đến 8 phương thức thanh toán phổ biến, giúp bạn dễ dàng lựa chọn theo nhu cầu và thói quen của mình bao gồm: mã Viet QR, chuyển khoản ngân hàng, ví điện tử, thẻ ATM nội địa, thẻ tín dụng, dịch vụ mua trước trả sau và thanh toán trực tiếp tại khách sạn.
</p>
<p>
  Một lưu ý nhỏ khi chuyển khoản là bạn cần chuyển đúng số tiền theo yêu cầu, vì nếu sai, giao dịch sẽ không được hoàn tất và có thể gây lỗi thanh toán.
</p>

<p><strong>6. Đa dạng các gợi ý đặt khách sạn</strong></p>
<p>
  Tại trang khách sạn của Mravel, bạn sẽ dễ dàng tìm thấy những gợi ý tuyệt vời cho chuyến đi tiếp theo, nhờ vào hệ thống gợi ý thông minh và thông tin luôn được cập nhật mới nhất. Dưới đây là 3 dạng gợi ý nổi bật giúp bạn lên kế hoạch du lịch một cách dễ dàng và tiết kiệm:
</p>

<p><strong>6.1. Gợi ý theo điểm đến đang thịnh hành trong nước và quốc tế</strong><br/>
Mravel liên tục cập nhật danh sách các điểm đến hot nhất, từ những địa danh nổi bật trong nước như Đà Nẵng, Phú Quốc, Đà Lạt đến các điểm đến quốc tế được yêu thích như Bali, Bangkok, Singapore…</p>

<p><strong>6.2. Gợi ý các khách sạn giá rẻ được lựa chọn hàng đầu</strong><br/>
Mravel gợi ý những khách sạn giá rẻ, được đánh giá cao từ cộng đồng người dùng, giúp bạn tối ưu chi phí mà vẫn đảm bảo chất lượng lưu trú.</p>

<p><strong>6.3. Gợi ý theo các ưu đãi hiện hành</strong><br/>
Bạn sẽ luôn thấy các chương trình khuyến mãi đang diễn ra ngay tại trang khách sạn, từ mã giảm giá, combo đến ưu đãi theo mùa.</p>

<p><strong>Câu hỏi thường gặp khi đặt phòng khách sạn</strong></p>

<p><strong>1. Có thể mang theo vật nuôi vào khách sạn không?</strong><br/>
Việc mang theo vật nuôi vào khách sạn phụ thuộc vào chính sách của từng khách sạn. Khi đặt khách sạn qua Mravel, bạn có thể kiểm tra thông tin trong phần "Tiện ích" hoặc liên hệ trực tiếp khách sạn để xác nhận trước khi đặt phòng.</p>

<p><strong>2. Thời gian check-in và check-out phòng khách sạn là khi nào?</strong><br/>
Thời gian check-in và check-out tùy thuộc vào quy định của từng khách sạn, thông thường sẽ có hai khung giờ check in là 12h00 và 14h00. Khi tìm khách sạn trên Mravel, bạn hoàn toàn có thể kiểm tra thông tin này trong phần chi tiết khách sạn.</p>

<p><strong>3. Làm thế nào để biết được giá phòng tốt nhất?</strong><br/>
Để biết giá phòng tốt nhất khi đặt khách sạn, bạn có thể sử dụng tính năng so sánh giá trên Mravel, xem các ưu đãi hiện có và áp dụng mã giảm giá. Một gợi ý là bạn có thể tìm khách sạn gần nơi mọi người muốn lưu trú, và kiểm tra phần khuyến mãi, ưu đãi từ đối tác để tiết kiệm tối đa.</p>

<p><strong>4. Làm sao để biết khách sạn có các tiện ích nào?</strong><br/>
Với Mravel, bạn có thể dễ dàng xem đầy đủ danh sách tiện ích trong phần mô tả khách sạn hoặc mục "Tiện ích", giúp bạn nắm rõ thông tin và lựa chọn nơi lưu trú phù hợp nhất một cách nhanh chóng.</p>

<p><strong>5. Đặt khách sạn có được thanh toán sau không?</strong><br/>
Một số khách sạn trên Mravel cho phép thanh toán sau tại quầy lễ tân. Bạn chỉ cần kiểm tra hình thức thanh toán được hiển thị rõ ràng trong phần chi tiết đặt phòng trước khi xác nhận.</p>

<p><strong>6. Mravel có uy tín không?</strong><br/>
Mravel là một trong những nền tảng du lịch hàng đầu tại khu vực, được hàng triệu khách hàng tin dùng, với hệ thống đặt phòng khách sạn, vé máy bay, vé vui chơi giải trí và nhiều dịch vụ khác, cùng giá cả minh bạch và hỗ trợ khách hàng 24/7.</p>

<p><strong>7. Hướng dẫn cách đặt phòng trên Mravel</strong><br/>
Bước 1: Truy cập Mravel qua website hoặc ứng dụng.<br/>
Bước 2: Nhập điểm đến, ngày nhận/trả phòng và số lượng khách.<br/>
Bước 3: Xem danh sách khách sạn, sử dụng bộ lọc để tìm phòng phù hợp.<br/>
Bước 4: Chọn khách sạn, kiểm tra thông tin chi tiết và nhấn "Đặt ngay".<br/>
Bước 5: Nhập thông tin đặt phòng và chọn phương thức thanh toán phù hợp.<br/>
Bước 6: Xác nhận thanh toán, nhận phiếu điện tử qua email/app.
</p>

<p><strong>8. Có bao nhiêu phương thức thanh toán trên Mravel?</strong><br/>
Mravel hỗ trợ nhiều phương thức thanh toán phổ biến, linh hoạt cho mọi nhu cầu của bạn: mã Viet QR, chuyển khoản ngân hàng, ví điện tử, thẻ ATM nội địa, dịch vụ mua trước trả sau, thẻ thanh toán quốc tế và thanh toán trực tiếp tại khách sạn.</p>

<p><strong>9. Săn mã giảm giá khách sạn Mravel ở đâu?</strong><br/>
Bạn có thể truy cập trang khuyến mãi Mravel, theo dõi các kênh truyền thông chính thức hoặc đăng ký nhận thông báo qua email.</p>

<p><strong>10. Mravel có chương trình khách hàng thân thiết không?</strong><br/>
Mravel Priority hoạt động theo hệ thống cấp bậc (Bronze, Silver, Gold, Platinum, Diamond), dựa trên tổng chi tiêu của bạn trên nền tảng. Càng sử dụng nhiều, bạn càng dễ thăng hạng và nhận thêm nhiều quyền lợi.
</p>

<p>
Mravel không chỉ là một ứng dụng đặt phòng mà là người bạn đồng hành lý tưởng, mang đến trải nghiệm tiện lợi và đa dạng. Trải nghiệm hành trình tuyệt vời từ A đến Z chỉ với một ứng dụng duy nhất. Đi du lịch, đặt Mravel!
</p>
`;

  /* ─ SHORT CONTENT (EN) ─ */
  const shortHtmlEn = `
<p>
  Mravel is one of the leading online travel platforms in Southeast Asia, providing everything you need for a complete trip with key products including: Flights, Hotels, Bus tickets, and Travel activities such as attraction tickets and tours.
</p>
<p>
  With a network of more than 1 million hotels worldwide, Mravel offers countless options to suit every need and preference. From budget hotels near you to luxurious stays with stunning views, everything is easy to find thanks to smart filters. In particular, booking online on Mravel comes with conveniences such as flexible payment and 24/7 support, helping you enjoy your trip with peace of mind.
</p>
`;

  /* ─ FULL CONTENT (EN) ─ */
  const fullHtmlEn = `
${shortHtmlEn}

<p><strong>Why should you book hotels on Mravel?</strong></p>
<p>
  To enjoy a fast booking experience, reasonable prices, and countless attractive deals, Mravel is the top choice for you. So why book through Mravel? Let's find out right away!
</p>

<p><strong>1. A wide range of accommodation options</strong></p>
<p>
  When planning a trip, choosing where to stay is one of the most important factors. So is booking hotels on Mravel reliable? The answer is absolutely yes! With more than 1 million domestic and international hotel partners, along with clear customer protection policies, Mravel brings absolute peace of mind and trust to every trip.
</p>

<p><strong>Types of accommodation:</strong> Mravel offers you an incredibly rich and diverse range of options. From luxurious 5-star resorts, holiday villas, to cozy homestays, premium cruises, convenient hotels, friendly campsites, the nearest guesthouse rooms, or comfortable apartments, you can always find a type of accommodation that suits your needs and budget. You can also explore homestays at famous domestic destinations such as</p>

<ul>
  <li>Da Lat homestays</li>
  <li>Vung Tau homestays</li>
  <li>Da Nang homestays</li>
  <li>Hanoi homestays</li>
  <li>Ho Chi Minh City homestays</li>
</ul>

<p><strong>Domestic hotels:</strong> If you love traveling within the country, Mravel offers countless room options at famous destinations such as Da Lat, Vung Tau, Phan Thiet, Hue, Hoi An, and many other provinces and cities. The hotel system here is extremely rich, from 1 to 5 stars, with flexible pricing - helping you easily choose a place to stay that fits your budget while still fully enjoying your vacation.</p>

<p><strong>International hotels:</strong> Not stopping within the country, Mravel also expands its accommodation network to many countries such as Thailand, Singapore, China, Japan, and many other attractive destinations. The international hotels on the platform are also diverse, from budget to high-end (1-5 stars), meeting every need, whether you are traveling on a budget or enjoying a luxurious vacation.</p>

<p>You can refer to a few hotel categories in Thailand below:</p>
<ul>
  <li>5-star Bangkok hotels</li>
  <li>4-star Bangkok hotels</li>
  <li>3-star Bangkok hotels</li>
  <li>Budget Bangkok hotels</li>
</ul>

<p>Some hotel categories in Singapore you can refer to:</p>
<ul>
  <li>5-star Singapore hotels</li>
  <li>4-star Singapore hotels</li>
  <li>3-star Singapore hotels</li>
  <li>Budget Singapore hotels</li>
  <li>Singapore hotels near MRT</li>
</ul>

<p>In Japan, you can refer to some of the following hotels:</p>
<ul>
  <li>Budget Tokyo hotels</li>
  <li>Budget Kyoto hotels</li>
  <li>Budget Osaka hotels</li>
</ul>

<p>When traveling to China, you can refer to hotels in major cities:</p>
<ul>
  <li>Beijing hotels</li>
  <li>Shanghai hotels</li>
  <li>Guangzhou hotels</li>
</ul>

<p><strong>Search options based on your preferences:</strong> Mravel offers a flexible and personalized room-finding experience with a detailed filter system, helping you easily choose the ideal place to stay according to your exact preferences and needs. You can search by specific criteria such as your favorite room view (city view, garden view, sea view), room area in square meters, the hotel location nearest to you or close to your desired destination. In particular, you also have the chance to enjoy a free room upgrade depending on room availability, bringing a more comfortable and complete stay experience.</p>

<p>If you are looking for hotels with beautiful views, you can refer to the following categories:</p>
<ul>
  <li>Hotels with Mount Fuji views</li>
  <li>Da Lat hotels with cloud-hunting views</li>
  <li>Da Lat hotels with pine forest views</li>
</ul>

<p><strong>VAT invoices:</strong> For business trips, Mravel also supports choosing hotels that provide full VAT invoices, helping you save time and making it easier to handle payments and settle business expenses.</p>

<p><strong>2. A smooth booking experience</strong></p>

<p><strong>2.1. Easy price comparison</strong><br/>
When finding a place to stay for your trip, the ability to compare prices and hunt for deals is essential. On Mravel, you will experience a smooth booking process that saves time and makes it easy to make the right choice. The price comparison feature helps you quickly compare prices between hotels in the same area. At the same time, Mravel clearly displays attractive deals and promotions such as last-minute offers, helping you easily choose a hotel that fits your budget. With Mravel, booking becomes simple, seamless, and extremely convenient.</p>

<p><strong>2.2. Manage transactions with just a few taps</strong><br/>
One of the reasons Mravel has become a top choice for booking hotels is the smooth booking experience and the extremely convenient transaction management. After completing your booking, you will immediately receive a confirmation voucher via both the app and email, helping you always stay on top of your itinerary information and feel more secure about your upcoming trip.</p>

<p>The friendly interface of the Mravel app allows you to easily look up your bookings with just a few taps. Simply go to the "My Bookings" section, and you will see all the information from the hotel name, length of stay, booking code to the included services - all clearly arranged, easy to track and manage.</p>

<p>In addition, the confirmation email from Mravel is also very detailed, including: the hotel name, check-in/check-out times, payment information, cancellation policy, and additional services. Everything is transparent and complete, helping you easily control your transactions without worrying about missing anything.</p>

<p><strong>2.3. Safe and secure</strong><br/>
When booking hotels through Mravel, you not only enjoy convenience but also have complete peace of mind with the highest level of security for every transaction. Mravel is committed to absolutely protecting users' personal and financial information through modern 256-bit encryption technology, helping prevent any risk of external attacks. This multi-layered security system ensures safety not only for credit card information but also closely monitors and supervises the entire payment process.</p>

<p>In particular, Mravel does not directly store your credit card information. Instead, the data is encrypted and stored as a "token key" by a leading online payment service provider, giving you absolute peace of mind when transacting.</p>

<p>In addition, Mravel's intelligent fraud management system operates continuously to detect and promptly prevent suspicious activities, protecting your account from unwanted risks.</p>

<p><strong>2.4. Online customer care service</strong><br/>
One of the factors that makes for a great hotel booking experience on Mravel is the professional and convenient online customer care service.</p>

<p>If you have any questions during the booking process - from check-in times, included services, to cancellation policies - simply open the Mravel app and select the chatbox icon in the "Chat with us" section. Here, the smart virtual assistant will help you quickly answer basic questions. If the issue is more complex, the system will automatically connect you with a customer care specialist, always ready to support you 24/7.</p>

<p>With Mravel, every question is resolved quickly, giving you absolute peace of mind throughout the booking process and helping you fully enjoy your trip.</p>

<p><strong>3. Review hotels, earn Mravel coins</strong></p>
<p>
  On Mravel, sharing reviews about the hotels you have experienced not only helps the travel community gain more reliable information but also brings attractive rewards to you. What's special is that only those who have booked and completed their stay through Mravel can write reviews. This ensures that every review comes from real experience, helping increase the reliability and quality of each comment.
</p>
<p>
  Leaving a hotel review is also extremely simple: you just need to write a review of at least 30 characters, attach a real photo, and you will immediately receive a reward into your Mravel account. This is a quick and easy reward format that encourages users to share genuine experiences while creating an objective and useful review community for everyone.
</p>

<p><strong>4. Attractive hotel promotions</strong></p>

<p><strong>4.1 Offers for new customers</strong><br/>
The first-time Mravel discount code will help you save significant costs when booking hotels or using other services such as flights, entertainment, airport transfers, etc. This is a great opportunity for you to experience convenient, fast, and money-saving service right from your first time with Mravel!</p>

<p><strong>4.2 Offers from partners</strong><br/>
You will also receive special offers from Mravel's partners such as travel organizations or banking partners. These Mravel booking discount codes bring you the opportunity to save when booking hotels or using other services on the platform.</p>

<p><strong>4.3 Exclusive offers for Mravel Priority Members</strong><br/>
If you are a travel enthusiast and frequently use Mravel's services, then now is the time to grab exclusive offers from the Mravel Priority Membership program! Not only does it bring you wonderful trips, but Mravel also helps you save significantly thanks to discount codes exclusively for members. Every time you book a hotel, you accumulate Priority points - used to level up and unlock attractive benefits. In particular, when booking, you will see the accumulated points displayed right on the screen, helping you easily track your upgrade progress.</p>

<p><strong>Mravel Priority Membership tiers:</strong></p>
<ul>
  <li>Bronze</li>
  <li>Silver</li>
  <li>Gold</li>
  <li>Platinum</li>
  <li>Diamond</li>
</ul>

<p><strong>Notable benefits of joining Mravel Priority:</strong></p>
<ul>
  <li>Exclusive discount codes for each membership tier</li>
  <li>Priority access to early promotion information</li>
  <li>Easy point accumulation &amp; gift redemption</li>
  <li>Special offers at premium hotels &amp; services</li>
</ul>

<p><strong>4.4 Where to hunt for Mravel hotel discount codes?</strong><br/>
To always stay updated with the latest offers, simply visit the Mravel Discount Codes page - where all ongoing promotions are gathered, from discount codes for new customers, offers by membership tier, to seasonal and holiday discount programs.</p>

<p>Not stopping there, you can also learn the details of how to apply codes on the Mravel Discount Code usage guide page. Here, you will be guided step by step: from how to choose the right offer, how to enter the code at checkout, to tips for maximum savings.</p>

<p>A standout feature of using Mravel is that after successfully booking a flight, you will receive a discount code to continue booking other services such as hotels, entertainment tickets, airport transfers, and car rentals. This not only helps you save costs but also creates a complete, easy, and optimized journey.</p>

<p><strong>5. Diverse payment methods</strong></p>
<p>
  When booking hotels on Mravel, you will enjoy a fast, smooth, and flexible payment experience thanks to the variety of supported payment methods. To optimize the payment process, you can save your card information in advance, making subsequent payments just a single tap to complete - saving time and being extremely convenient.
</p>
<p>
  Mravel supports up to 8 popular payment methods, helping you easily choose according to your needs and habits, including: Viet QR code, bank transfer, e-wallet, domestic ATM card, credit card, buy-now-pay-later service, and direct payment at the hotel.
</p>
<p>
  A small note when making a bank transfer is that you need to transfer the exact amount required, because if it is wrong, the transaction will not be completed and may cause a payment error.
</p>

<p><strong>6. Diverse hotel booking suggestions</strong></p>
<p>
  On Mravel's hotel page, you will easily find great suggestions for your next trip, thanks to the smart suggestion system and information that is always kept up to date. Below are 3 outstanding types of suggestions that help you plan your travel easily and economically:
</p>

<p><strong>6.1. Suggestions based on trending domestic and international destinations</strong><br/>
Mravel continuously updates the list of hottest destinations, from outstanding domestic locations such as Da Nang, Phu Quoc, Da Lat to popular international destinations such as Bali, Bangkok, Singapore…</p>

<p><strong>6.2. Suggestions for top-rated budget hotels</strong><br/>
Mravel suggests budget hotels that are highly rated by the user community, helping you optimize costs while still ensuring quality of stay.</p>

<p><strong>6.3. Suggestions based on current offers</strong><br/>
You will always see ongoing promotion programs right on the hotel page, from discount codes, combos to seasonal offers.</p>

<p><strong>Frequently asked questions when booking hotels</strong></p>

<p><strong>1. Can I bring pets into the hotel?</strong><br/>
Bringing pets into a hotel depends on each hotel's policy. When booking a hotel through Mravel, you can check the information in the "Amenities" section or contact the hotel directly to confirm before booking.</p>

<p><strong>2. When are the hotel check-in and check-out times?</strong><br/>
Check-in and check-out times depend on each hotel's regulations, usually there are two check-in time slots at 12:00 and 14:00. When searching for hotels on Mravel, you can fully check this information in the hotel details section.</p>

<p><strong>3. How do I know the best room price?</strong><br/>
To know the best room price when booking a hotel, you can use the price comparison feature on Mravel, view available offers, and apply discount codes. A suggestion is to find hotels near where people want to stay, and check the promotions and partner offers section to save as much as possible.</p>

<p><strong>4. How do I know what amenities a hotel has?</strong><br/>
With Mravel, you can easily view the full list of amenities in the hotel description or the "Amenities" section, helping you clearly understand the information and quickly choose the most suitable place to stay.</p>

<p><strong>5. Can I pay later when booking a hotel?</strong><br/>
Some hotels on Mravel allow payment later at the reception desk. You just need to check the payment method clearly displayed in the booking details before confirming.</p>

<p><strong>6. Is Mravel reliable?</strong><br/>
Mravel is one of the leading travel platforms in the region, trusted by millions of customers, with a system for booking hotels, flights, entertainment tickets, and many other services, along with transparent pricing and 24/7 customer support.</p>

<p><strong>7. Guide on how to book a room on Mravel</strong><br/>
Step 1: Access Mravel via the website or app.<br/>
Step 2: Enter your destination, check-in/check-out dates, and number of guests.<br/>
Step 3: View the hotel list, use filters to find a suitable room.<br/>
Step 4: Choose a hotel, check the detailed information, and click "Book now".<br/>
Step 5: Enter your booking information and choose a suitable payment method.<br/>
Step 6: Confirm payment, receive the electronic voucher via email/app.
</p>

<p><strong>8. How many payment methods are there on Mravel?</strong><br/>
Mravel supports many popular payment methods, flexible for all your needs: Viet QR code, bank transfer, e-wallet, domestic ATM card, buy-now-pay-later service, international payment card, and direct payment at the hotel.</p>

<p><strong>9. Where to hunt for Mravel hotel discount codes?</strong><br/>
You can visit the Mravel promotions page, follow the official media channels, or sign up to receive notifications via email.</p>

<p><strong>10. Does Mravel have a loyalty program?</strong><br/>
Mravel Priority operates on a tier system (Bronze, Silver, Gold, Platinum, Diamond), based on your total spending on the platform. The more you use, the easier it is to level up and receive more benefits.
</p>

<p>
Mravel is not just a booking app but an ideal travel companion, bringing a convenient and diverse experience. Experience a wonderful journey from A to Z with just a single app. Go traveling, book Mravel!
</p>
`;

  const isEn = i18n.language === "en";
  const shortHtml = isEn ? shortHtmlEn : shortHtmlVi;
  const fullHtml = isEn ? fullHtmlEn : fullHtmlVi;

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">
        {t("hotel.intro_heading")}
      </h2>

      {/* CONTENT */}
      <div
        className="prose prose-slate max-w-none text-gray-700 dark:text-gray-300 transition-all duration-300 text-[15px]"
        style={{
          maxHeight: expanded ? "9999px" : "320px",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{
          __html: expanded ? fullHtml : shortHtml,
        }}
      />

      {/* GRADIENT OVERLAY KHI THU GỌN */}
      {!expanded && (
        <div className="mt-[-80px] h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}

      {/* BUTTON */}
      <div className="text-center mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-5 py-2 rounded-lg text-sky-600 font-semibold hover:underline"
        >
          {expanded ? t("common.collapse") : t("common.see_more")}
        </button>
      </div>
    </section>
  );
}