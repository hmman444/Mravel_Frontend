export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-1 text-center">{title}</h2>
      {subtitle && (
        <p className="text-sm text-gray-500 mb-6 text-center">{subtitle}</p>
      )}
      {children}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}