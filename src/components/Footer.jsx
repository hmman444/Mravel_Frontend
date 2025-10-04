export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Mravel</h3>
          <p>Ứng dụng du lịch giúp bạn lên kế hoạch, đặt dịch vụ và quản lý hành trình dễ dàng.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Liên kết</h3>
          <ul className="space-y-2">
            <li><a href="/services" className="hover:underline">Dịch vụ</a></li>
            <li><a href="/plan" className="hover:underline">Lịch trình</a></li>
            <li><a href="/partner" className="hover:underline">Đối tác</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Liên hệ</h3>
          <p>Email: 22110372@student.hcmute.edu.vn</p>
          <p>Hotline: 0862267674</p>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-6 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} Mravel. All rights reserved.
      </div>
    </footer>
  );
}
