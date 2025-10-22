export const REACTIONS = [
  { key: "like", emoji: "👍", label: "Thích" },
  { key: "love", emoji: "❤️", label: "Yêu thích" },
  { key: "haha", emoji: "😂", label: "Haha" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "sad", emoji: "😢", label: "Buồn" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ" },
];

export const reactionsMeta = REACTIONS.reduce((acc, r) => {
  acc[r.key] = { emoji: r.emoji, label: r.label };
  return acc;
}, {});
