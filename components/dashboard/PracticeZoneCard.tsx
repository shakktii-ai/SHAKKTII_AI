import { LucideIcon, ArrowRight } from "lucide-react";
import Link from 'next/link'
import { cn } from "@/lib/utils";
import React from 'react'
interface PracticeZoneCardProps {
  title: string;
  description: string;
   link: string;
  icon: LucideIcon;
  color: "blue" | "teal" | "purple" | "gold";
  progress?: number;
  delay?: string;
}

const colorStyles = {
  blue: {
    bg: "bg-primary/10",
    icon: "text-primary",
    hover: "hover:border-primary/50",
    progressBg: "bg-primary",
  },
  teal: {
    bg: "bg-teal/10",
    icon: "text-teal",
    hover: "hover:border-teal/50",
    progressBg: "bg-teal",
  },
  purple: {
    bg: "bg-purple/10",
    icon: "text-purple",
    hover: "hover:border-purple/50",
    progressBg: "bg-purple",
  },
  gold: {
    bg: "bg-gold/10",
    icon: "text-gold",
    hover: "hover:border-gold/50",
    progressBg: "bg-gold",
  },
};

export function PracticeZoneCard({
  title,
  description,
  link,
  icon: Icon,
  color,
  progress,
  delay = "0s",
}: PracticeZoneCardProps) {
  const styles = colorStyles[color];
  
  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-card p-6 shadow-card border-2 border-transparent cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in",
        styles.hover
      )}
      style={{ animationDelay: delay }}
    >
      {/* Progress indicator */}
      {progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-muted overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", styles.progressBg)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
           <Link href={link}>
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", styles.bg)}>
          <Icon className={cn("h-7 w-7", styles.icon)} />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </div>
      
   <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      
      {progress !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{progress}% complete</span>
        </div>
      )}
      </Link>
      
      {/* Hover micro-message */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        <span className="text-xs font-medium text-primary">AI-guided feedback →</span>
      </div>
    </div>
  );
}
