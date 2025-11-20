// src/components/PaymentPartners.jsx
const paymentPartners = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/993px-JCB_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/2560px-Visa_2021.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/6/68/VietQR_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Techcombank_logo.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VPBank_logo.svg/2560px-VPBank_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/5/55/LOGO-VIB-Blue.png",
  "https://upload.wikimedia.org/wikipedia/vi/8/85/Vietcombank_Logo.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZQJphadUVSX1qomAtC0W6tDT_9nWbpbkgZA&s",
  "https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_MB_new.png",
];

export default function PaymentPartners() {
  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left text */}
        <div>
          <h2 className="text-2xl font-bold">Đối tác thanh toán</h2>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Chúng tôi hợp tác với các nhà cung cấp dịch vụ thanh toán hàng đầu để
            đảm bảo mọi giao dịch đều suôn sẻ, an toàn và dễ dàng.
          </p>
        </div>

        {/* Right logos */}
        <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 place-items-center">
          {paymentPartners.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="payment partner"
              className="h-10 object-contain opacity-80 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}