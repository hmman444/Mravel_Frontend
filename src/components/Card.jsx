export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
