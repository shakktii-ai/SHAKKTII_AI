// import { Target, X } from "lucide-react";
// import { useState } from "react";

// const nudges = [
//   "Improve 1 skill today.",
//   "You're 8 points from next rank!",
//   "Complete a soft skill test to boost confidence.",
//   "Your technical score is rising - keep going!",
// ];

// export function DailyNudge() {
//   const [isVisible, setIsVisible] = useState(true);
//   const randomNudge = nudges[Math.floor(Math.random() * nudges.length)];
  
//   if (!isVisible) return null;
  
//   return (
//     <div className="relative rounded-xl bg-lavender border border-primary/20 p-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
//       <button
//         onClick={() => setIsVisible(false)}
//         className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
//       >
//         <X className="h-4 w-4 text-muted-foreground" />
//       </button>
      
//       <div className="flex items-center gap-3">
//         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
//           <Target className="h-5 w-5 text-primary" />
//         </div>
//         <div>
//           <p className="text-sm font-medium text-muted-foreground">Today's Goal</p>
//           <p className="text-base font-semibold text-primary">{randomNudge}</p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Target, X } from "lucide-react";
import { useEffect, useState } from "react";
import React from 'react'

const nudges = [
  "Improve 1 skill today.",
  "You're 8 points from next rank!",
  "Complete a soft skill test to boost confidence.",
  "Your technical score is rising - keep going!",
];

export function DailyNudge() {
  const [isVisible, setIsVisible] = useState(true);
  const [randomNudge, setRandomNudge] = useState<string | null>(null);

  useEffect(() => {
    const nudge =
      nudges[Math.floor(Math.random() * nudges.length)];
    setRandomNudge(nudge);
  }, []);

  if (!isVisible || !randomNudge) return null;

  return (
    <div
      className="relative rounded-xl bg-lavender border border-primary/20 p-4 animate-fade-in"
      style={{ animationDelay: "0.25s" }}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Today's Goal
          </p>
          <p className="text-base font-semibold text-primary">
            {randomNudge}
          </p>
        </div>
      </div>
    </div>
  );
}
