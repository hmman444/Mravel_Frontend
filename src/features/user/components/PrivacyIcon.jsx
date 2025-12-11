"use client";

import { Globe2, Users2, Lock } from "lucide-react";

export default function PrivacyIcon({ privacy }) {
  if (privacy === "PUBLIC" || privacy === "Public") {
    return <Globe2 className="w-3.5 h-3.5" />;
  }
  if (privacy === "FRIENDS" || privacy === "Friends") {
    return <Users2 className="w-3.5 h-3.5" />;
  }
  return <Lock className="w-3.5 h-3.5" />;
}
