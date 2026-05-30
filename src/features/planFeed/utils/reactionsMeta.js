import i18n from "../../../i18n";

export const REACTIONS = [
  { key: "like", emoji: "👍", get label() { return i18n.t("feed.reaction.like"); } },
  { key: "love", emoji: "❤️", get label() { return i18n.t("feed.reaction.love"); } },
  { key: "haha", emoji: "😂", get label() { return i18n.t("feed.reaction.haha"); } },
  { key: "wow", emoji: "😮", get label() { return i18n.t("feed.reaction.wow"); } },
  { key: "sad", emoji: "😢", get label() { return i18n.t("feed.reaction.sad"); } },
  { key: "angry", emoji: "😡", get label() { return i18n.t("feed.reaction.angry"); } },
];

export const reactionsMeta = REACTIONS.reduce((acc, r) => {
  acc[r.key] = {
    emoji: r.emoji,
    get label() {
      return r.label;
    },
  };
  return acc;
}, {});
