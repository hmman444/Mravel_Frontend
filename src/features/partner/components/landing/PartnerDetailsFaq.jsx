import { useMemo, useState } from "react";
import { ChevronDown, ShieldCheck, FileText, TrendingUp, Lock, EyeOff, BadgeCheck } from "lucide-react";

export default function PartnerDetailsFaq() {
  const faqs = useMemo(
    () => [
      {
        q: "Vì sao dịch vụ của tôi khi đăng lên lại ở trạng thái pending?",
        a: "Vì Mravel có cơ chế kiểm duyệt. Dịch vụ mới hoặc chỉnh sửa quan trọng sẽ chuyển về pending để Admin duyệt, nhằm đảm bảo thông tin hiển thị cho khách là chính xác và nhất quán.",
      },
      {
        q: "Trong lúc pending thì khách có thấy dịch vụ của tôi không?",
        a: "Trong lúc pending, dịch vụ sẽ bị ẩn khỏi trang người dùng để tránh khách đặt nhầm theo thông tin chưa được duyệt. Khi quản trị viên duyệt thì tự động hiển thị lại.",
      },
      {
        q: "Tôi có thể tạm dừng nhận khách không?",
        a: "Có. Bạn có thể tạm khóa dịch vụ khi hết phòng/hết bàn hoặc cần bảo trì. Tạm khóa không làm mất dữ liệu và bạn có thể mở lại bất cứ lúc nào.",
      },
      {
        q: "Khi tôi xóa dịch vụ là xóa hẳn hay sao?",
        a: "Đúng vậy, khi xóa thì dịch vụ không hiển thị với cả các nhóm người dùng, nhưng vẫn giữ lịch sử để đảm bảo không ảnh hưởng các đơn đặt và lịch trình liên quan.",
      },
    ],
    []
  );

  return (
    <section className="mt-10 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: 3 cards nội dung */}
        <div className="lg:col-span-2 space-y-6">
          <InfoBlock
            id="safe"
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Vận hành an tâm"
            subtitle="Trạng thái rõ ràng, kiểm soát hiển thị"
            bullets={[
              { icon: <Lock className="w-4 h-4" />, text: "Tạo mới/chỉnh sửa → chuyển về pending để Admin duyệt." },
              { icon: <EyeOff className="w-4 h-4" />, text: "Trong lúc chờ duyệt có thể ẩn khỏi phía người dùng để tránh sai thông tin." },
              { icon: <BadgeCheck className="w-4 h-4" />, text: "Có thể tạm khóa/mở lại dịch vụ khi hết phòng/hết bàn mà không mất dữ liệu." },
            ]}
            desc="Cách tổ chức này giúp bạn demo cực rõ trong báo cáo: phân quyền (partner/admin), vòng đời dịch vụ (pending/approved/locked), và tính nhất quán dữ liệu."
          />

          <InfoBlock
            id="start"
            icon={<FileText className="w-5 h-5" />}
            title="Đăng dịch vụ chuẩn"
            subtitle="Ảnh – mô tả – tiện ích – giờ hoạt động"
            bullets={[
              { icon: <span className="w-4 h-4 rounded-full bg-sky-600" />, text: "Form nhập dữ liệu có cấu trúc: tên, địa chỉ, mô tả, ảnh, amenities." },
              { icon: <span className="w-4 h-4 rounded-full bg-indigo-600" />, text: "Khách sạn: có thể mở rộng loại phòng, số lượng, giá theo ngày, chính sách." },
              { icon: <span className="w-4 h-4 rounded-full bg-cyan-600" />, text: "Quán ăn: giờ mở cửa, danh mục, mức giá, bàn/đặt cọc (nếu cần)." },
            ]}
            desc="Mục tiêu là làm trang dịch vụ ‘đủ thông tin để khách ra quyết định’, đồng thời đủ logic để thuyết trình quy trình kiểm duyệt – cập nhật."
          />

          <InfoBlock
            id="reach"
            icon={<TrendingUp className="w-5 h-5" />}
            title="Tăng cơ hội có khách"
            subtitle="Hiển thị trong tìm kiếm & gợi ý theo lịch trình"
            bullets={[
              { icon: <span className="w-4 h-4 rounded-full bg-emerald-600" />, text: "Dịch vụ xuất hiện trong kết quả tìm kiếm theo địa điểm, giá, đánh giá, bộ lọc." },
              { icon: <span className="w-4 h-4 rounded-full bg-amber-500" />, text: "Gợi ý theo plan: khách lập lịch trình → hệ thống đề xuất dịch vụ phù hợp theo ngày." },
              { icon: <span className="w-4 h-4 rounded-full bg-rose-500" />, text: "Tiếp cận đúng nhu cầu (đi theo lịch trình), không chỉ chờ khách tự tìm." },
            ]}
            desc="Đây là điểm ăn điểm ‘giá trị ứng dụng’: partner được hưởng lợi trực tiếp từ tính năng quản lý lịch trình của Mravel."
          />
        </div>

        {/* RIGHT: FAQ accordion */}
        <div id="faq" className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Câu hỏi thường gặp</h3>

          <div className="mt-5 space-y-3">
            {faqs.map((f, idx) => (
              <FaqItem key={idx} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ id, icon, title, subtitle, bullets, desc }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-700">
            {icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-sky-700">{title}</div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{subtitle}</h2>

            <div className="mt-4 space-y-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex gap-3 text-slate-700">
                  <div className="mt-1 text-slate-500">{b.icon}</div>
                  <div className="leading-relaxed">{b.text}</div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-slate-600 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="font-semibold text-slate-900">{q}</div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}