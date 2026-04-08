// components/dashboard/RankingCard.tsx
import { Trophy, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import React from "react";
import { LevelBadge } from "./LevelBadge";

interface RankingCardProps {
  percentile: number | string;
  pointsToNext?: number;
  currentPoints?: number;
  maxPoints?: number;
  level?: number;
  levelName?: string;
  totalPoints?: number;
}

export function RankingCard({
  percentile,
  pointsToNext = 0,
  currentPoints = 0,
  maxPoints = 100,
  level = 1,
  levelName = 'Starter',
  totalPoints = 0,
}: RankingCardProps) {
  const progressPercent = maxPoints > 0 ? (currentPoints / maxPoints) * 100 : 0;
  const displayPercentile = typeof percentile === 'number' ? percentile : '--';
  const top = typeof percentile === 'number' ? 100 - percentile : '--';

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <LevelBadge level={level} levelName={levelName} size="md" />
          <div>
            <p className="text-sm text-muted-foreground font-medium">Your Ranking</p>
            <p className="text-xl font-bold text-foreground">
              {top !== '--' ? `Top ${top}%` : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-success">{totalPoints} pts</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{currentPoints} pts</span>
          <span className="font-medium text-purple">
            {pointsToNext > 0 ? `${pointsToNext} to next level` : 'Max level!'}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-lavender [&>div]:bg-purple" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center">
          <span className="text-xs font-bold text-gold-foreground">🏅</span>
        </div>
        <span className="text-sm font-medium text-foreground">{levelName} Badge</span>
      </div>
    </div>
  );
}
