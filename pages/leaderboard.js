// // pages/leaderboard.js
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';
// import Link from 'next/link';
// import { Trophy, Crown, Medal, Flame, Star, ChevronLeft, Users, TrendingUp, Zap } from 'lucide-react';
// import { LevelBadge } from '@/components/dashboard/LevelBadge';

// const TRACKS = [
//   { key: 'overall', label: 'Overall', icon: Trophy },
//   { key: 'weekly', label: 'Weekly', icon: Flame },
//   { key: 'finance', label: 'Finance', icon: TrendingUp },
//   { key: 'consulting', label: 'Consulting', icon: Users },
//   { key: 'technical', label: 'Technical', icon: Zap },
// ];

// const getMedal = (rank) => {
//   if (rank === 1) return { emoji: '🥇', bg: 'from-yellow-400 to-amber-500', text: 'text-amber-900' };
//   if (rank === 2) return { emoji: '🥈', bg: 'from-slate-300 to-slate-400', text: 'text-slate-700' };
//   if (rank === 3) return { emoji: '🥉', bg: 'from-amber-600 to-amber-700', text: 'text-amber-100' };
//   return null;
// };

// function RankPosition({ rank }) {
//   const medal = getMedal(rank);
//   if (medal) {
//     return (
//       <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center text-base font-bold shadow-md shrink-0`}>
//         {medal.emoji}
//       </div>
//     );
//   }
//   return (
//     <div className="h-9 w-9 rounded-full bg-lavender flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
//       #{rank}
//     </div>
//   );
// }

// function LeaderboardRow({ entry, currentEmail, index }) {
//   const isCurrentUser = entry.email === currentEmail;
//   const medal = getMedal(entry.rank);

//   return (
//     <div
//       className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
//         ${isCurrentUser
//           ? 'bg-lavender/80 border border-purple/30 shadow-md'
//           : 'hover:bg-lavender/30 border border-transparent'}
//         ${medal ? 'bg-gradient-to-r from-amber-50/60 to-transparent' : ''}
//       `}
//       style={{ animationDelay: `${index * 40}ms` }}
//     >
//       {/* Rank */}
//       <RankPosition rank={entry.rank} />

//       {/* Avatar + Info */}
//       <div className="flex-1 flex items-center gap-3 min-w-0">
//         {entry.profileImg ? (
//           <img
//             src={entry.profileImg}
//             alt={entry.fullName}
//             className="h-10 w-10 rounded-full object-cover shrink-0 border-2 border-card shadow"
//           />
//         ) : (
//           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center shrink-0 shadow">
//             <span className="text-sm font-bold text-white">
//               {(entry.fullName || 'U').charAt(0).toUpperCase()}
//             </span>
//           </div>
//         )}
//         <div className="min-w-0">
//           <div className="flex items-center gap-2 flex-wrap">
//             <p className="text-sm font-bold text-foreground truncate">
//               {entry.fullName || 'Anonymous'}
//               {isCurrentUser && (
//                 <span className="ml-1 text-xs font-semibold text-purple">(You)</span>
//               )}
//             </p>
//             {entry.topBadge && (
//               <span className="text-[10px] font-medium text-amber-700 bg-gold/10 border border-gold/30 rounded-full px-1.5 py-0.5 hidden sm:inline">
//                 {entry.topBadge.name}
//               </span>
//             )}
//           </div>
//           <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.email}</p>
//         </div>
//       </div>

//       {/* Level Badge */}
//       <div className="hidden sm:block shrink-0">
//         <LevelBadge level={entry.level || 1} levelName={entry.levelName || 'Starter'} size="sm" showName />
//       </div>

//       {/* Points */}
//       <div className="text-right shrink-0">
//         <p className="text-lg font-extrabold text-foreground">{(entry.totalPoints || 0).toLocaleString()}</p>
//         <p className="text-xs text-muted-foreground">points</p>
//       </div>
//     </div>
//   );
// }

// export default function Leaderboard({ user }) {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('overall');
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [userEntry, setUserEntry] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);


//   useEffect(() => {
    
//     if (!user || !user.email) {
//       router.push('/login');
//     }
//   }, [user, router]);

//   useEffect(() => {
//     if (user?.email) {
//       fetchLeaderboard(activeTab);
//     }
//   }, [activeTab, user]);

//   const fetchLeaderboard = async (type) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const isTrack = !['overall', 'weekly'].includes(type);
//       const url = isTrack
//         ? `/api/points/leaderboard?type=track&track=${type}&email=${encodeURIComponent(user.email)}`
//         : `/api/points/leaderboard?type=${type}&email=${encodeURIComponent(user.email)}`;

//       const response = await fetch(url);
//       if (!response.ok) throw new Error('Failed to fetch leaderboard');

//       const data = await response.json();
//       setLeaderboard(data.leaderboard || data.top10 || []);
//       setUserEntry(data.userEntry || null);
//       setLastUpdated(data.lastUpdated);
//     } catch (err) {
//       console.error('Leaderboard fetch error:', err);
//       setError(err.message || 'Failed to load leaderboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const currentUserInList = leaderboard.some(e => e.email === user?.email);
//   const top3 = leaderboard.slice(0, 3);
//   const rest = leaderboard.slice(3);

//   return (
//     <>
//       <Head>
//         <title>Leaderboard — MockMingle</title>
//         <meta name="description" content="See how you rank against other candidates on MockMingle" />
//       </Head>

//       <div className="min-h-screen bg-background">
//         {/* Header */}
//         <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border-light">
//           <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
//             <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
//               <ChevronLeft className="h-4 w-4" />
//               Dashboard
//             </Link>
//             <div className="flex-1">
//               <h1 className="text-lg font-bold text-foreground text-center">Leaderboard</h1>
//             </div>
//             {lastUpdated && (
//               <p className="text-xs text-muted-foreground hidden sm:block">
//                 Updated {new Date(lastUpdated).toLocaleTimeString()}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="max-w-3xl mx-auto px-4 py-8">

//           {/* Tabs */}
//           <div className="flex gap-1.5 flex-wrap mb-8 bg-lavender/50 rounded-2xl p-1.5">
//             {TRACKS.map(({ key, label, icon: Icon }) => (
//               <button
//                 key={key}
//                 onClick={() => setActiveTab(key)}
//                 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 justify-center
//                   ${activeTab === key
//                     ? 'bg-card text-purple shadow-card'
//                     : 'text-muted-foreground hover:text-foreground'
//                   }`}
//               >
//                 <Icon className="h-3.5 w-3.5" />
//                 {label}
//               </button>
//             ))}
//           </div>

//           {loading ? (
//             <div className="space-y-3">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="h-16 rounded-xl bg-card animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
//               ))}
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
//                 <Trophy className="h-6 w-6 text-destructive" />
//               </div>
//               <p className="text-muted-foreground mb-4">{error}</p>
//               <button
//                 onClick={() => fetchLeaderboard(activeTab)}
//                 className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
//               >
//                 Retry
//               </button>
//             </div>
//           ) : leaderboard.length === 0 ? (
//             <div className="text-center py-16">
//               <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-foreground font-semibold mb-1">No data yet</p>
//               <p className="text-sm text-muted-foreground">Complete activities to appear on the leaderboard!</p>
//             </div>
//           ) : (
//             <>
//               {/* Top 3 Podium */}
//               {top3.length >= 2 && (
//                 <div className="flex items-end justify-center gap-3 mb-8">
//                   {/* 2nd */}
//                   {top3[1] && (
//                     <div className="flex flex-col items-center gap-2 flex-1">
//                       {top3[1].profileImg ? (
//                         <img src={top3[1].profileImg} alt="" className="h-14 w-14 rounded-full object-cover border-4 border-slate-300 shadow-lg" />
//                       ) : (
//                         <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg border-4 border-slate-200">
//                           <span className="text-lg font-bold text-white">{(top3[1].fullName || 'U').charAt(0)}</span>
//                         </div>
//                       )}
//                       <div className="text-center">
//                         <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{top3[1].fullName?.split(' ')[0] || 'Anonymous'}</p>
//                         <p className="text-xs text-muted-foreground font-semibold">{(top3[1].totalPoints || 0).toLocaleString()} pts</p>
//                       </div>
//                       <div className="w-full h-16 rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center">
//                         <span className="text-2xl">🥈</span>
//                       </div>
//                     </div>
//                   )}
//                   {/* 1st */}
//                   {top3[0] && (
//                     <div className="flex flex-col items-center gap-2 flex-1">
//                       {top3[0].profileImg ? (
//                         <img src={top3[0].profileImg} alt="" className="h-18 w-18 rounded-full object-cover border-4 border-yellow-400 shadow-lg" />
//                       ) : (
//                         <div className="h-18 w-18 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border-4 border-yellow-300" style={{ height: 72, width: 72 }}>
//                           <span className="text-xl font-bold text-white">{(top3[0].fullName || 'U').charAt(0)}</span>
//                         </div>
//                       )}
//                       <Crown className="h-5 w-5 text-amber-500" />
//                       <div className="text-center">
//                         <p className="text-sm font-bold text-foreground truncate max-w-[80px]">{top3[0].fullName?.split(' ')[0] || 'Anonymous'}</p>
//                         <p className="text-xs text-amber-600 font-bold">{(top3[0].totalPoints || 0).toLocaleString()} pts</p>
//                       </div>
//                       <div className="w-full h-24 rounded-t-xl bg-gradient-to-b from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
//                         <span className="text-3xl">🥇</span>
//                       </div>
//                     </div>
//                   )}
//                   {/* 3rd */}
//                   {top3[2] && (
//                     <div className="flex flex-col items-center gap-2 flex-1">
//                       {top3[2].profileImg ? (
//                         <img src={top3[2].profileImg} alt="" className="h-14 w-14 rounded-full object-cover border-4 border-amber-600 shadow-lg" />
//                       ) : (
//                         <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg border-4 border-amber-500">
//                           <span className="text-lg font-bold text-amber-100">{(top3[2].fullName || 'U').charAt(0)}</span>
//                         </div>
//                       )}
//                       <div className="text-center">
//                         <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{top3[2].fullName?.split(' ')[0] || 'Anonymous'}</p>
//                         <p className="text-xs text-muted-foreground font-semibold">{(top3[2].totalPoints || 0).toLocaleString()} pts</p>
//                       </div>
//                       <div className="w-full h-10 rounded-t-xl bg-gradient-to-b from-amber-600 to-amber-700 flex items-center justify-center">
//                         <span className="text-2xl">🥉</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Full List - Top 3 */}
//               <div className="space-y-1.5 mb-2">
//                 {top3.map((entry, i) => (
//                   <LeaderboardRow key={entry.email} entry={entry} currentEmail={user?.email} index={i} />
//                 ))}
//               </div>

//               {/* Divider */}
//               {rest.length > 0 && (
//                 <div className="relative my-4">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-border-light" />
//                   </div>
//                   <div className="relative flex justify-center">
//                     <span className="bg-background px-4 text-xs text-muted-foreground">Rankings 4–{leaderboard.length}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Rest of list */}
//               <div className="space-y-1.5">
//                 {rest.map((entry, i) => (
//                   <LeaderboardRow key={entry.email} entry={entry} currentEmail={user?.email} index={i + 3} />
//                 ))}
//               </div>

//               {/* User's rank if not in list */}
//               {!currentUserInList && userEntry && (
//                 <>
//                   <div className="relative my-4">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-border-light border-dashed" />
//                     </div>
//                     <div className="relative flex justify-center">
//                       <span className="bg-background px-4 text-xs text-muted-foreground">Your position</span>
//                     </div>
//                   </div>
//                   <LeaderboardRow entry={userEntry} currentEmail={user?.email} index={99} />
//                 </>
//               )}
//             </>
//           )}

//           {/* Info card at bottom */}
//           <div className="mt-10 rounded-2xl bg-card p-5 shadow-card border border-border-light">
//             <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
//               <Trophy className="h-4 w-4 text-gold" />
//               Top Percentile Rewards
//             </h3>
//             <div className="space-y-2 text-sm text-muted-foreground">
//               <div className="flex gap-2">
//                 <span className="text-purple font-semibold shrink-0">Top 10%</span>
//                 <span>+2 bonus mock credits • Advanced mock unlock • Top 10% badge</span>
//               </div>
//               <div className="flex gap-2">
//                 <span className="text-purple font-semibold shrink-0">Top 5% (Track)</span>
//                 <span>+2 mock credits • HR review of your mocks • Track Mastery badge</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// pages/leaderboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Trophy, Crown, Medal, Flame, Star, ChevronLeft, Users, TrendingUp, Zap } from 'lucide-react';
import { LevelBadge } from '@/components/dashboard/LevelBadge';

const TRACKS = [
  { key: 'overall', label: 'Overall', icon: Trophy },
  { key: 'weekly', label: 'Weekly', icon: Flame },
  { key: 'finance', label: 'Finance', icon: TrendingUp },
  { key: 'consulting', label: 'Consulting', icon: Users },
  { key: 'technical', label: 'Technical', icon: Zap },
];

const getMedal = (rank) => {
  if (rank === 1) return { emoji: '🥇', bg: 'from-yellow-400 to-amber-500', text: 'text-amber-900' };
  if (rank === 2) return { emoji: '🥈', bg: 'from-slate-300 to-slate-400', text: 'text-slate-700' };
  if (rank === 3) return { emoji: '🥉', bg: 'from-amber-600 to-amber-700', text: 'text-amber-100' };
  return null;
};

function RankPosition({ rank }) {
  const medal = getMedal(rank);
  if (medal) {
    return (
      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center text-base font-bold shadow-md shrink-0`}>
        {medal.emoji}
      </div>
    );
  }
  return (
    <div className="h-9 w-9 rounded-full bg-lavender flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
      #{rank}
    </div>
  );
}

function LeaderboardRow({ entry, currentEmail, index }) {
  const isCurrentUser = entry.email === currentEmail;
  const medal = getMedal(entry.rank);

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
        ${isCurrentUser
          ? 'bg-lavender/80 border border-purple/30 shadow-md'
          : 'hover:bg-lavender/30 border border-transparent'}
        ${medal ? 'bg-gradient-to-r from-amber-50/60 to-transparent' : ''}
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Rank */}
      <RankPosition rank={entry.rank} />

      {/* Avatar + Info */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {entry.profileImg ? (
          <img
            src={entry.profileImg}
            alt={entry.fullName}
            className="h-10 w-10 rounded-full object-cover shrink-0 border-2 border-card shadow"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center shrink-0 shadow">
            <span className="text-sm font-bold text-white">
              {(entry.fullName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-foreground truncate">
              {entry.fullName || 'Anonymous'}
              {isCurrentUser && (
                <span className="ml-1 text-xs font-semibold text-purple">(You)</span>
              )}
            </p>
            {entry.topBadge && (
              <span className="text-[10px] font-medium text-amber-700 bg-gold/10 border border-gold/30 rounded-full px-1.5 py-0.5 hidden sm:inline">
                {entry.topBadge.name}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.email}</p>
        </div>
      </div>

      {/* Level Badge */}
      <div className="hidden sm:block shrink-0">
        <LevelBadge level={entry.level || 1} levelName={entry.levelName || 'Starter'} size="sm" showName />
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <p className="text-lg font-extrabold text-foreground">{(entry.totalPoints || 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
}

export default function Leaderboard({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userEntry, setUserEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── AUTH GUARD (fixed) ───────────────────────────────────────────────────
  // We use `undefined` as "auth still loading" and `null` / missing email as
  // "confirmed unauthenticated". This prevents the race-condition redirect that
  // fires when user is momentarily null on first render before session hydrates.
  useEffect(() => {
    // user === undefined  → session not resolved yet, do nothing
    if (user === undefined) return;

    // user is null OR has no email → confirmed unauthenticated, redirect
    if (!user || !user.email) {
      router.push('/login');
    }
  }, [user, router]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user?.email) {
      fetchLeaderboard(activeTab);
    }
  }, [activeTab, user]);

  const fetchLeaderboard = async (type) => {
    try {
      setLoading(true);
      setError(null);

      const isTrack = !['overall', 'weekly'].includes(type);
      const url = isTrack
        ? `/api/points/leaderboard?type=track&track=${type}&email=${encodeURIComponent(user.email)}`
        : `/api/points/leaderboard?type=${type}&email=${encodeURIComponent(user.email)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setLeaderboard(data.leaderboard || data.top10 || []);
      setUserEntry(data.userEntry || null);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER GUARD ────────────────────────────────────────────────────────
  // While user is undefined (auth not yet resolved) show a blank/loading state
  // so we never flash content or redirect prematurely.
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-purple border-t-transparent animate-spin" />
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  const currentUserInList = leaderboard.some(e => e.email === user?.email);
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <>
      <Head>
        <title>Leaderboard — MockMingle</title>
        <meta name="description" content="See how you rank against other candidates on MockMingle" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border-light">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground text-center">Leaderboard</h1>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap mb-8 bg-lavender/50 rounded-2xl p-1.5">
            {TRACKS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 justify-center
                  ${activeTab === key
                    ? 'bg-card text-purple shadow-card'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-card animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => fetchLeaderboard(activeTab)}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-1">No data yet</p>
              <p className="text-sm text-muted-foreground">Complete activities to appear on the leaderboard!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {top3.length >= 2 && (
                <div className="flex items-end justify-center gap-3 mb-8">
                  {/* 2nd */}
                  {top3[1] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      {top3[1].profileImg ? (
                        <img src={top3[1].profileImg} alt="" className="h-14 w-14 rounded-full object-cover border-4 border-slate-300 shadow-lg" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg border-4 border-slate-200">
                          <span className="text-lg font-bold text-white">{(top3[1].fullName || 'U').charAt(0)}</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{top3[1].fullName?.split(' ')[0] || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground font-semibold">{(top3[1].totalPoints || 0).toLocaleString()} pts</p>
                      </div>
                      <div className="w-full h-16 rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center">
                        <span className="text-2xl">🥈</span>
                      </div>
                    </div>
                  )}
                  {/* 1st */}
                  {top3[0] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      {top3[0].profileImg ? (
                        <img src={top3[0].profileImg} alt="" className="h-18 w-18 rounded-full object-cover border-4 border-yellow-400 shadow-lg" />
                      ) : (
                        <div className="h-18 w-18 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border-4 border-yellow-300" style={{ height: 72, width: 72 }}>
                          <span className="text-xl font-bold text-white">{(top3[0].fullName || 'U').charAt(0)}</span>
                        </div>
                      )}
                      <Crown className="h-5 w-5 text-amber-500" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground truncate max-w-[80px]">{top3[0].fullName?.split(' ')[0] || 'Anonymous'}</p>
                        <p className="text-xs text-amber-600 font-bold">{(top3[0].totalPoints || 0).toLocaleString()} pts</p>
                      </div>
                      <div className="w-full h-24 rounded-t-xl bg-gradient-to-b from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                        <span className="text-3xl">🥇</span>
                      </div>
                    </div>
                  )}
                  {/* 3rd */}
                  {top3[2] && (
                    <div className="flex flex-col items-center gap-2 flex-1">
                      {top3[2].profileImg ? (
                        <img src={top3[2].profileImg} alt="" className="h-14 w-14 rounded-full object-cover border-4 border-amber-600 shadow-lg" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg border-4 border-amber-500">
                          <span className="text-lg font-bold text-amber-100">{(top3[2].fullName || 'U').charAt(0)}</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{top3[2].fullName?.split(' ')[0] || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground font-semibold">{(top3[2].totalPoints || 0).toLocaleString()} pts</p>
                      </div>
                      <div className="w-full h-10 rounded-t-xl bg-gradient-to-b from-amber-600 to-amber-700 flex items-center justify-center">
                        <span className="text-2xl">🥉</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Full List - Top 3 */}
              <div className="space-y-1.5 mb-2">
                {top3.map((entry, i) => (
                  <LeaderboardRow key={entry.email} entry={entry} currentEmail={user?.email} index={i} />
                ))}
              </div>

              {/* Divider */}
              {rest.length > 0 && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-light" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-xs text-muted-foreground">Rankings 4–{leaderboard.length}</span>
                  </div>
                </div>
              )}

              {/* Rest of list */}
              <div className="space-y-1.5">
                {rest.map((entry, i) => (
                  <LeaderboardRow key={entry.email} entry={entry} currentEmail={user?.email} index={i + 3} />
                ))}
              </div>

              {/* User's rank if not in list */}
              {!currentUserInList && userEntry && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border-light border-dashed" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-xs text-muted-foreground">Your position</span>
                    </div>
                  </div>
                  <LeaderboardRow entry={userEntry} currentEmail={user?.email} index={99} />
                </>
              )}
            </>
          )}

          {/* Info card at bottom */}
          <div className="mt-10 rounded-2xl bg-card p-5 shadow-card border border-border-light">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gold" />
              Top Percentile Rewards
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-purple font-semibold shrink-0">Top 10%</span>
                <span>+2 bonus mock credits • Advanced mock unlock • Top 10% badge</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple font-semibold shrink-0">Top 5% (Track)</span>
                <span>+2 mock credits • HR review of your mocks • Track Mastery badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}