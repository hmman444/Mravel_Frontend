import bg from "../../../assets/mountain-bg.jpg";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex w-full max-w-7xl mr-20 px-6 md:px-12 lg:px-20">
        <div className="flex-1 hidden md:flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg text-center">
            Du Lịch Tự Do
            <br />
            Trọn Vẹn Hành Trình
          </h1>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
