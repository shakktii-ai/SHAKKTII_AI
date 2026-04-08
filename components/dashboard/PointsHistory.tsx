// components/dashboard/PointsHistory.tsx
import React from 'react';
import { Zap, Target, BookOpen, Gamepad2, TrendingUp, Flame } from 'lucide-react';

interface PointsLogEntry {
  activity: string;
  points: number;
  description: string;
  earnedAt: string;
}

interface PointsHistoryProps {
  log: PointsLogEntry[];
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  mock_interview:    { icon: Target,     color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  feedback_reviewed: { icon: BookOpen,   color: 'text-violet-500',  bg: 'bg-violet-500/10' },
  skill_practice:    { icon: Zap,        color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  domain_game:       { icon: Gamepad2,   color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  improvement_bonus: { icon: TrendingUp, color: 'text-teal-500',    bg: 'bg-teal-500/10' },
  streak_bonus:      { icon: Flame,      color: 'text-orange-500',  bg: 'bg-orange-500/10' },
};

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function PointsHistory({ log }: PointsHistoryProps) {
  if (!log || log.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          Complete activities to earn points and see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {log.slice(0, 8).map((entry, i) => {
          const config = ACTIVITY_CONFIG[entry.activity] || ACTIVITY_CONFIG['skill_practice'];
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-center gap-3 group">
              <div className={`h-9 w-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4.5 w-4.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.description}</p>
                <p className="text-xs text-muted-foreground">{formatRelative(entry.earnedAt)}</p>
              </div>
              <span className={`text-sm font-bold ${config.color} shrink-0`}>
                +{entry.points}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
