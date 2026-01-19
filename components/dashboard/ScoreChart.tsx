import { TrendingUp } from "lucide-react";
import React from 'react'
interface ScoreData {
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
}

interface ScoreChartProps {
  scores: ScoreData[];
}

export function ScoreChart({ scores }: ScoreChartProps) {
  const maxValue = Math.max(...scores.map(s => s.value));
  
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Performance Overview</h3>
        <div className="flex items-center gap-1 text-success">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Improving</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {scores.map((score, index) => (
          <div key={score.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{score.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple">{score.value}/10</span>
                {score.trend === "up" && (
                  <span className="text-xs text-success">↑</span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-lavender overflow-hidden">
              <div
                className="h-full rounded-full bg-purple transition-all duration-700 ease-out"
                style={{ 
                  width: `${(score.value / 10) * 100}%`,
                  transitionDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
