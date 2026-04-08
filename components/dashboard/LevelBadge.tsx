// components/dashboard/LevelBadge.tsx
import React from 'react';
import { Crown, Star, Zap, Rocket, Shield, Award } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  levelName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const LEVEL_CONFIG = [
  { level: 1, icon: Zap,    gradient: 'from-gray-400 to-gray-500',       text: 'text-gray-100',   bg: 'bg-gray-500/10',  border: 'border-gray-400/30' },
  { level: 2, icon: Star,   gradient: 'from-blue-400 to-cyan-500',        text: 'text-blue-100',   bg: 'bg-blue-500/10',  border: 'border-blue-400/30' },
  { level: 3, icon: Shield, gradient: 'from-violet-400 to-purple-500',    text: 'text-violet-100', bg: 'bg-violet-500/10',border: 'border-violet-400/30' },
  { level: 4, icon: Rocket, gradient: 'from-amber-400 to-orange-500',     text: 'text-amber-100',  bg: 'bg-amber-500/10', border: 'border-amber-400/30' },
  { level: 5, icon: Award,  gradient: 'from-emerald-400 to-teal-500',     text: 'text-emerald-100',bg: 'bg-emerald-500/10',border: 'border-emerald-400/30' },
  { level: 6, icon: Crown,  gradient: 'from-rose-400 via-pink-500 to-fuchsia-500', text: 'text-rose-100', bg: 'bg-rose-500/10', border: 'border-rose-400/30' },
];

const SIZE_CONFIG = {
  sm: { badge: 'h-7 w-7', icon: 'h-3.5 w-3.5', text: 'text-xs', label: 'text-[10px]' },
  md: { badge: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-sm', label: 'text-xs' },
  lg: { badge: 'h-14 w-14', icon: 'h-7 w-7', text: 'text-base', label: 'text-sm' },
};

export function LevelBadge({ level, levelName, size = 'md', showName = false }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[Math.min(Math.max(level, 1), 6) - 1];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${showName ? `rounded-full px-3 py-1.5 border ${config.bg} ${config.border}` : ''}`}>
      <div className={`${sizeConfig.badge} rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shrink-0`}>
        <Icon className={`${sizeConfig.icon} ${config.text}`} />
      </div>
      {showName && (
        <div>
          <p className={`font-bold ${sizeConfig.text} text-foreground leading-tight`}>Lv.{level}</p>
          <p className={`${sizeConfig.label} text-muted-foreground leading-tight`}>{levelName}</p>
        </div>
      )}
    </div>
  );
}
