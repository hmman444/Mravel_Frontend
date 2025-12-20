export const pickStartEndFromCard = (editingCard, data = {}) => {
  const start = editingCard?.startTime || data?.startTime || data?.time || "";
  const end =
    editingCard?.endTime ||
    data?.endTime ||
    editingCard?.startTime ||
    data?.time ||
    "";
  return { start, end };
};