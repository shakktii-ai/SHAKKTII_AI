// import { Sparkles } from "lucide-react";

// const motivationalMessages = [
//   "Your clarity improved this week.",
//   "One more interview to reach the next rank!",
//   "Every practice makes you stronger.",
//   "You're building confidence with each session.",
// ];

// interface WelcomeHeroProps {
//   userName: string;
// }

// export function WelcomeHero({ userName }: WelcomeHeroProps) {
//   const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  
//   return (
//     <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow-card animate-fade-in">
//       {/* Background decoration */}
//       <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lavender opacity-50" />
//       <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />
      
//       <div className="relative z-10">
//         <div className="flex items-center gap-2 mb-2">
//           <Sparkles className="h-5 w-5 text-gold" />
//           <span className="text-sm font-medium text-gold">AI Coach Ready</span>
//         </div>
        
//         <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
//           Welcome Back, {userName}
//         </h1>
        
//         <p className="text-lg text-foreground font-medium mb-1">
//           Here's Your Growth Snapshot
//         </p>
        
//         <p className="text-muted-foreground">
//           {randomMessage}
//         </p>
//       </div>
//     </div>
//   );
// }


import { Sparkles } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

const motivationalMessages = [
  "Your clarity improved this week.",
  "One more interview to reach the next rank!",
  "Every practice makes you stronger.",
  "You're building confidence with each session.",
];

interface WelcomeHeroProps {
  userName: string;
}

export function WelcomeHero({ userName }: WelcomeHeroProps) {
  const [randomMessage, setRandomMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
    setRandomMessage(msg);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow-card animate-fade-in">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lavender opacity-50" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="text-sm font-medium text-gold">AI Coach Ready</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Welcome Back, {userName}
        </h1>

        <p className="text-lg text-foreground font-medium mb-1">
          Here's Your Growth Snapshot
        </p>

        <p className="text-muted-foreground">
          {randomMessage ?? "Loading motivation…"}
        </p>
      </div>
    </div>
  );
}
