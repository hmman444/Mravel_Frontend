export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white  rounded-lg shadow hover:shadow-lg transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
