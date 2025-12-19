// src/features/partner/components/Badge.jsx
export default function Badge({ text, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}