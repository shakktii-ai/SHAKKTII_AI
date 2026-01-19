import { Flame } from "lucide-react";
import React from 'react'
interface StreakBadgeProps {
  days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 shadow-card animate-float">
      <Flame className="h-5 w-5 text-gold-foreground" />
      <span className="font-bold text-gold-foreground">{days}-Day Streak</span>
    </div>
  );
}
