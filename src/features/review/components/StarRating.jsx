import { FaStar } from "react-icons/fa";

function HalfStar({ size }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <FaStar size={size} className="text-gray-300" />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: "50%" }}
      >
        <FaStar size={size} className="text-yellow-400" />
      </span>
    </span>
  );
}

export default function StarRating({ value = 0, onChange, size = 24, readonly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (!readonly) {
          return (
            <FaStar
              key={star}
              size={size}
              className={`transition-colors cursor-pointer hover:text-yellow-300 ${
                star <= value ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => onChange?.(star)}
            />
          );
        }

        const isFull = value >= star;
        const isHalf = !isFull && value >= star - 0.5;

        if (isFull) return <FaStar key={star} size={size} className="text-yellow-400" />;
        if (isHalf) return <HalfStar key={star} size={size} />;
        return <FaStar key={star} size={size} className="text-gray-300" />;
      })}
    </div>
  );
}
