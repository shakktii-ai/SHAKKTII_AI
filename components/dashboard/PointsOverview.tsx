// components/dashboard/PointsOverview.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Flame, TrendingUp, Star, ChevronRight, Gift } from 'lucide-react';
import { LevelBadge } from './LevelBadge';
import Link from 'next/link';

interface Badge {
  badgeId: string;
  name: string;
  type: string;
  awardedAt: string;
}

interface PointsData {
  totalPoints: number;
  weeklyPoints: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  nextLevelName: string | null;
  currentStreak: number;
  longestStreak: number;
  percentile: number;
  rank: number | string;
  totalUsers: number | string;
  badges: Badge[];
  bonusMockCredits: number;
  recentLog: any[];
}

interface PointsOverviewProps {
  email: string;
}

// Animated counter hook
function useCounter(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const from = 0;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// Level thresholds for progress bar
const LEVEL_MINS = [0, 200, 500, 1000, 2000, 3500];
const LEVEL_MAXES = [200, 500, 1000, 2000, 3500, Infinity];

function getLevelProgress(totalPoints: number, level: number) {
  const min = LEVEL_MINS[Math.min(level - 1, 5)];
  const max = LEVEL_MAXES[Math.min(level - 1, 5)];
  if (max === Infinity) return 100;
  return Math.round(((totalPoints - min) / (max - min)) * 100);
}

export function PointsOverview({ email }: PointsOverviewProps) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const animatedPoints = useCounter(data?.totalPoints || 0, 1200);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/points/summary?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card animate-pulse">
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const pts = data?.totalPoints ?? 0;
  const level = data?.level ?? 1;
  const levelName = data?.levelName ?? 'Starter';
  const streak = data?.currentStreak ?? 0;
  const percentile = data?.percentile ?? 0;
  const weeklyPts = data?.weeklyPoints ?? 0;
  const pointsToNext = data?.pointsToNextLevel ?? 0;
  const nextLevelName = data?.nextLevelName ?? null;
  const badges = data?.badges ?? [];
  const levelProgress = getLevelProgress(pts, level);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <LevelBadge level={level} levelName={levelName} size="lg" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Points</p>
            <p className="text-4xl font-extrabold text-foreground leading-none tracking-tight">
              {animatedPoints.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{weeklyPts} pts this week</p>
          </div>
        </div>

        {/* Percentile badge */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full bg-lavender px-3 py-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-purple" />
            <span className="text-xs font-bold text-purple">Top {100 - percentile}%</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{streak}-day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Level progress bar */}
      <div className="relative mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-foreground">{levelName}</span>
          {nextLevelName && (
            <span className="text-muted-foreground">{pointsToNext} pts to {nextLevelName}</span>
          )}
          {!nextLevelName && (
            <span className="text-purple font-semibold">Max Level!</span>
          )}
        </div>
        <div className="h-2.5 rounded-full bg-lavender overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-1000 ease-out"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{LEVEL_MINS[Math.min(level-1, 5)]} pts</span>
          {level < 6 && <span>{LEVEL_MAXES[Math.min(level-1, 5)]} pts</span>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-lavender/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground">Rank</p>
          <p className="text-sm font-bold text-foreground">#{data?.rank ?? '--'}</p>
          <p className="text-[10px] text-muted-foreground">of {data?.totalUsers ?? '--'}</p>
        </div>
        <div className="rounded-xl bg-lavender/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground">Percentile</p>
          <p className="text-sm font-bold text-purple">Top {100 - percentile}%</p>
          <p className="text-[10px] text-muted-foreground">global rank</p>
        </div>
        <div className="rounded-xl bg-lavender/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground">Best Streak</p>
          <p className="text-sm font-bold text-orange-500">{data?.longestStreak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Badges Earned</p>
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(-6).map((b) => (
              <span
                key={b.badgeId}
                className="inline-flex items-center gap-1 rounded-full bg-gold/10 border border-gold/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
                title={b.name}
              >
                <Star className="h-3 w-3 text-gold" />
                {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bonus credits */}
      {(data?.bonusMockCredits ?? 0) > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4">
          <Gift className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-700">
            You have <strong>{data?.bonusMockCredits}</strong> bonus mock interview credit{data?.bonusMockCredits !== 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Footer link */}
      <Link href="/leaderboard" className="flex items-center gap-1 text-xs font-medium text-purple hover:underline">
        <Trophy className="h-3.5 w-3.5" />
        View full leaderboard
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
