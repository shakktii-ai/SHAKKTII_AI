import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from 'react'

interface CreditsCardProps {
  credits: number;
}

export function CreditsCard({ credits }: CreditsCardProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-blue-teal">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Interview Credits</p>
            <p className="text-3xl font-bold text-foreground">{credits.toString().padStart(2, '0')}</p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-3 mb-4">
        Each simulation uses 1 credit
      </p>
      
      <Button variant="secondary" size="sm" className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Earn More Credits
      </Button>
    </div>
  );
}
