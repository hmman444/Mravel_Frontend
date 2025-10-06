import React from "react";

export default function LoadingOverlay({ show, text = "Đang xử lý..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-700">{text}</p>
      </div>
    </div>
  );
}
