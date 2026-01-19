import { Trophy, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import React from "react";

interface RankingCardProps {
  percentile: number;
  pointsToNext: number;
  currentPoints: number;
  maxPoints: number;
}

export function RankingCard({ percentile, pointsToNext, currentPoints, maxPoints }: RankingCardProps) {
  const progressPercent = (currentPoints / maxPoints) * 100;
  
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lavender">
            <Trophy className="h-6 w-6 text-purple" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Your Ranking</p>
            <p className="text-xl font-bold text-foreground">Top {percentile}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-success">+5%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{currentPoints} points</span>
          <span className="font-medium text-purple">{pointsToNext} to next rank</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-lavender [&>div]:bg-purple" />
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center">
          <span className="text-xs font-bold text-gold-foreground">🏅</span>
        </div>
        <span className="text-sm font-medium text-foreground">Rising Star Badge</span>
      </div>
    </div>
  );
}
