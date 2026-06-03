// src/components/FadeInSection.jsx
import { useEffect, useRef, useState } from "react";

export default function FadeInSection({
  children,
  className = "",
  delay = 0, // ms
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // chỉ animate 1 lần
          }
        });
      },
      {
        // Hiện ngay khi BẤT KỲ phần nào lọt viewport. Tránh dùng ngưỡng theo % diện tích
        // vì khối rất cao (vd hotel nhiều loại phòng) sẽ không bao giờ đạt %, gây "trắng
        // đầu trang tới khi cuộn". rootMargin kích hoạt sớm hơn chút cho mượt.
        threshold: 0,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}