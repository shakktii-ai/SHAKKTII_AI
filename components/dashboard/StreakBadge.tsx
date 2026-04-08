// components/dashboard/StreakBadge.tsx
import { Flame } from "lucide-react";
import React from "react";

interface StreakBadgeProps {
  days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  if (!days || days === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 shadow-card">
        <Flame className="h-5 w-5 text-muted-foreground" />
        <span className="font-bold text-muted-foreground">Start a streak!</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 shadow-card animate-float">
      <Flame className="h-5 w-5 text-gold-foreground" />
      <span className="font-bold text-gold-foreground">{days}-Day Streak</span>
    </div>
  );
}
