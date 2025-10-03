function gridClass(len) {
  switch (len) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-2";    // 1 ảnh lớn + 2 ảnh nhỏ
    case 4: return "grid-cols-2";
    default: return "grid-cols-3";   // 5+ ảnh
  }
}

export default function PlanMedia({ images = [] }) {
  if (!images.length) return null;
  const shown = images.slice(0, 5);
  const remain = images.length - shown.length;

  return (
    <div className={`grid ${gridClass(shown.length)} gap-2 rounded-xl overflow-hidden`}>
      {shown.map((src, idx) => {
        const common = "w-full h-52 object-cover";
        // layout đẹp hơn cho 3 ảnh: ảnh đầu full height
        if (images.length === 3 && idx === 0) {
          return <img key={idx} src={src} className="col-span-2 h-72 w-full object-cover" />;
        }
        if (idx === 4 && remain > 0) {
          return (
            <div key={idx} className="relative">
              <img src={src} className={common} />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                +{remain}
              </div>
            </div>
          );
        }
        return <img key={idx} src={src} className={common} />;
      })}
    </div>
  );
}
