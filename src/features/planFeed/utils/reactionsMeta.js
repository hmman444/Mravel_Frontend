export const REACTIONS = [
  { key: "like", label: "Thích", emoji: "👍" },
  { key: "love", label: "Yêu thích", emoji: "❤️" },
  { key: "haha", label: "Haha", emoji: "😆" },
  { key: "wow",  label: "Wow",  emoji: "😲" },
  { key: "sad",  label: "Buồn", emoji: "😢" },
  { key: "angry",label: "Phẫn nộ", emoji: "😡" },
];

export const reactionsMeta = REACTIONS.reduce((acc, r) => {
  acc[r.key] = { emoji: r.emoji, label: r.label };
  return acc;
}, {});
