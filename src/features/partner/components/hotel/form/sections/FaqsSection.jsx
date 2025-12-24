import { useMemo } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const asArray = (v) => (Array.isArray(v) ? v : []);
const asString = (v) => (v == null ? "" : String(v));

const normalizeFaq = (f) => {
  const o = f && typeof f === "object" ? f : {};
  return {
    question: asString(o.question).slice(0, 200),
    answer: asString(o.answer).slice(0, 600),
  };
};

export default function FaqsSection({ form, setField, disabled = false }) {
  const faqs = useMemo(() => asArray(form?.faqs).map(normalizeFaq), [form?.faqs]);

  const emit = (next) => setField?.("faqs", next);

  const addFaq = () => {
    emit([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (idx) => {
    emit(faqs.filter((_, i) => i !== idx));
  };

  const move = (idx, dir) => {
    const arr = [...faqs];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    emit(arr);
  };

  const setFaq = (idx, patch) => {
    const arr = [...faqs];
    arr[idx] = normalizeFaq({ ...arr[idx], ...(patch || {}) });
    emit(arr);
  };

  const invalidCount = faqs.filter((f) => {
    const q = f.question.trim();
    const a = f.answer.trim();
    return (q && !a) || (!q && a);
  }).length;

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        FAQ (Câu hỏi thường gặp)
      </summary>

      <div className="mt-3 rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {faqs.length} câu hỏi
            {invalidCount ? (
              <span className="ml-2 text-xs text-red-600">
                • {invalidCount} mục đang thiếu Question/Answer (backend sẽ reject nếu gửi).
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={addFaq}
            disabled={disabled}
            className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Thêm FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có FAQ.</div>
        ) : (
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={idx} className="rounded-2xl border p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-gray-900">
                    Câu hỏi #{idx + 1}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={disabled || idx === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                      title="Lên"
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={disabled || idx === faqs.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                      title="Xuống"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      disabled={disabled}
                      className="p-2 rounded-lg hover:bg-red-50 disabled:opacity-40"
                      title="Xóa"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <label className="text-sm block">
                  <div className="font-medium mb-1">Question *</div>
                  <input
                    value={f.question}
                    disabled={disabled}
                    onChange={(e) => setFaq(idx, { question: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ví dụ: Khách sạn có cho check-in sớm không?"
                  />
                </label>

                <label className="text-sm block">
                  <div className="font-medium mb-1">Answer *</div>
                  <textarea
                    value={f.answer}
                    disabled={disabled}
                    onChange={(e) => setFaq(idx, { answer: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 min-h-[90px]"
                    placeholder="Ví dụ: Có, tùy tình trạng phòng. Vui lòng liên hệ lễ tân trước..."
                  />
                </label>

                {/* hint lỗi nhẹ */}
                {((f.question.trim() && !f.answer.trim()) ||
                  (!f.question.trim() && f.answer.trim())) && (
                  <div className="text-xs text-red-600">
                    * Bạn phải nhập đủ cả Câu hỏi và Câu trả lời.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}