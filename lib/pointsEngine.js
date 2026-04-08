// lib/pointsEngine.js
// Central points logic for MockMingle Point System

import PointsProfile from '../models/PointsProfile';
import dbConnect from './dbConnect';

// ─── Level Thresholds ─────────────────────────────────────────────────────────
const LEVELS = [
  { level: 1, name: 'Starter', min: 0, max: 199 },
  { level: 2, name: 'Active Candidate', min: 200, max: 499 },
  { level: 3, name: 'Interview Ready', min: 500, max: 999 },
  { level: 4, name: 'Advanced Candidate', min: 1000, max: 1999 },
  { level: 5, name: 'Industry Ready', min: 2000, max: 3499 },
  { level: 6, name: 'Elite Candidate', min: 3500, max: Infinity },
];

// ─── Skill Practice Points Map ────────────────────────────────────────────────
const SKILL_PRACTICE_POINTS = {
  Speaking: 30,       // Soft Skills
  Personality: 25,    // Behavioral aptitude
  Listening: 20,      // Technical skills proxy
  Reading: 20,
  Writing: 20,
  DecisionMaking: 40, // Simulations
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns or creates a PointsProfile for a user by email.
 */
async function getOrCreateProfile(email) {
  await dbConnect();
  let profile = await PointsProfile.findOne({ email });
  if (!profile) {
    profile = new PointsProfile({
      email,
      weekStartDate: getWeekStart(),
    });
    await profile.save();
  }
  return profile;
}

/**
 * Calculate which level a total points value falls into.
 */
function computeLevel(totalPoints) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].min) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get the start of the current ISO week (Monday 00:00:00).
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get start of today (midnight).
 */
function getDayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Add points to a profile, update level, and append to log.
 * Keeps log to last 200 entries.
 */
async function applyPoints(profile, points, activity, description) {
  if (points <= 0) return;

  profile.totalPoints = (profile.totalPoints || 0) + points;

  // Weekly points — reset if new week
  const weekStart = getWeekStart();
  if (!profile.weekStartDate || profile.weekStartDate.getTime() !== weekStart.getTime()) {
    profile.weeklyPoints = 0;
    profile.weekStartDate = weekStart;
    profile.weeklyModuleCompletions = [];
  }
  profile.weeklyPoints = (profile.weeklyPoints || 0) + points;

  // Recalculate level
  const levelInfo = computeLevel(profile.totalPoints);
  profile.level = levelInfo.level;
  profile.levelName = levelInfo.name;

  // Append to log (keep last 200)
  profile.pointsLog.push({ activity, points, description, earnedAt: new Date() });
  if (profile.pointsLog.length > 200) {
    profile.pointsLog = profile.pointsLog.slice(-200);
  }
}

/**
 * Map a job role to a track category.
 */
function roleToTrack(jobRole) {
  if (!jobRole) return 'general';
  const role = jobRole.toLowerCase();
  if (role.includes('finance') || role.includes('financial') || role.includes('banking') || role.includes('accountant')) return 'finance';
  if (role.includes('consult')) return 'consulting';
  if (role.includes('tech') || role.includes('engineer') || role.includes('developer') || role.includes('software') || role.includes('data')) return 'technical';
  if (role.includes('hr') || role.includes('human resource') || role.includes('recruit')) return 'hr';
  if (role.includes('market') || role.includes('brand') || role.includes('sales')) return 'marketing';
  return 'general';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Award points for completing a mock interview.
 * @param {string} email
 * @param {object} opts - { level, jobRole, isReattempt }
 * @returns {object} { pointsAwarded, totalPoints, level }
 */
export async function awardMockInterviewPoints(email, opts = {}) {
  const { level = 'Beginner', jobRole = '', isReattempt = false } = opts;

  const profile = await getOrCreateProfile(email);
  let points = 0;
  const breakdown = [];

  if (isReattempt) {
    points += 10;
    breakdown.push('Re-attempt interview (+10)');
  } else {
    points += 50;
    breakdown.push('Mock interview completed (+50)');
  }

  // Difficulty bonus for Advanced/Expert
  if (!isReattempt && (level === 'Advanced' || level === 'Expert')) {
    points += 25;
    breakdown.push(`${level} difficulty bonus (+25)`);
  }

  const track = roleToTrack(jobRole);
  profile.trackPoints = profile.trackPoints || {};
  profile.trackPoints[track] = (profile.trackPoints[track] || 0) + points;

  await applyPoints(profile, points, 'mock_interview', breakdown.join(', '));

  // Update streak
  await updateStreakInternal(profile);

  await profile.save();

  return {
    pointsAwarded: points,
    totalPoints: profile.totalPoints,
    level: profile.level,
    levelName: profile.levelName,
    breakdown,
  };
}

/**
 * Award points for reviewing feedback after an interview.
 */
export async function awardFeedbackReviewPoints(email) {
  const profile = await getOrCreateProfile(email);
  const points = 20;

  await applyPoints(profile, points, 'feedback_reviewed', 'Feedback reviewed (+20)');
  await profile.save();

  return { pointsAwarded: points, totalPoints: profile.totalPoints };
}

/**
 * Award points for completing a skill practice module.
 * Limit: same module gives full points max 2 times per week.
 * @param {string} email
 * @param {object} opts - { skillArea, moduleId, difficulty }
 */
export async function awardSkillPracticePoints(email, opts = {}) {
  const { skillArea = 'Speaking', moduleId = 'default', difficulty = 'Beginner' } = opts;

  const profile = await getOrCreateProfile(email);

  // Reset weekly completions if new week
  const weekStart = getWeekStart();
  if (!profile.weekStartDate || profile.weekStartDate.getTime() !== weekStart.getTime()) {
    profile.weeklyModuleCompletions = [];
    profile.weekStartDate = weekStart;
    profile.weeklyPoints = 0;
  }

  // Count completions for this module this week
  const weekCompletions = (profile.weeklyModuleCompletions || []).filter(
    (c) => c.moduleId === moduleId && new Date(c.completedAt) >= weekStart
  );

  const basePoints = SKILL_PRACTICE_POINTS[skillArea] || 20;
  let points = basePoints;
  let description = `${skillArea} module completed (+${basePoints})`;

  if (weekCompletions.length >= 2) {
    // No points after 2 completions
    points = 0;
    description = `${skillArea} module (limit reached for this week, +0)`;
  }

  // Track completion regardless
  profile.weeklyModuleCompletions.push({ moduleId, skillArea, completedAt: new Date() });

  if (points > 0) {
    await applyPoints(profile, points, 'skill_practice', description);
    await updateStreakInternal(profile);
  }

  await profile.save();

  return {
    pointsAwarded: points,
    totalPoints: profile.totalPoints,
    limitReached: points === 0,
  };
}

/**
 * Award points for completing a domain/skill game.
 * Limit: 1 time per day (still playable, just no extra points).
 * @param {string} email
 * @param {object} opts - { gameType, score, maxScore, allPlayerScores }
 */
export async function awardGamePoints(email, opts = {}) {
  const { gameType = 'general', score = 0, maxScore = 100, allPlayerScores = [] } = opts;

  const profile = await getOrCreateProfile(email);

  // Check daily game limit
  const dayStart = getDayStart();
  const todayGames = (profile.dailyGameCompletions || []).filter(
    (c) => c.gameType === gameType && new Date(c.completedAt) >= dayStart
  );

  let points = 0;
  let description = '';
  const breakdown = [];
  let limitReached = false;

  if (todayGames.length >= 1) {
    limitReached = true;
    description = `${gameType} game (daily limit reached, +0)`;
  } else {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Score band
    if (percentage >= 90) {
      points += 50;
      breakdown.push('High score (+50)');
    } else if (percentage >= 60) {
      points += 30;
      breakdown.push('Above average score (+30)');
    } else {
      points += 15;
      breakdown.push('Basic completion (+15)');
    }

    // Top 20% bonus
    if (allPlayerScores.length > 0) {
      const sorted = [...allPlayerScores].sort((a, b) => b - a);
      const top20Index = Math.floor(sorted.length * 0.2);
      const top20Threshold = sorted[top20Index] || sorted[sorted.length - 1];
      if (score >= top20Threshold) {
        points += 20;
        breakdown.push('Top 20% bonus (+20)');
      }
    }

    description = breakdown.join(', ');

    await applyPoints(profile, points, 'domain_game', description);
    await updateStreakInternal(profile);
  }

  // Always record attempt
  profile.dailyGameCompletions.push({ gameType, completedAt: new Date(), score });
  await profile.save();

  return { pointsAwarded: points, totalPoints: profile.totalPoints, limitReached };
}

/**
 * Award improvement bonus when interview score improves vs previous attempt.
 * @param {string} email
 * @param {object} opts - { jobRole, newScore, level }
 */
export async function awardImprovementBonus(email, opts = {}) {
  const { jobRole = '', newScore = 0, level = 'Beginner' } = opts;

  const profile = await getOrCreateProfile(email);

  // Find previous interview for same role
  const prevScores = (profile.interviewScores || [])
    .filter((s) => s.jobRoleId === jobRole)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  let bonusPoints = 0;
  let description = '';

  if (prevScores.length > 0) {
    const previousScore = prevScores[0].score;
    if (previousScore > 0) {
      const improvement = ((newScore - previousScore) / previousScore) * 100;

      if (improvement >= 20) {
        bonusPoints = 60;
        description = `20%+ improvement bonus (+60)`;
      } else if (improvement >= 10) {
        bonusPoints = 30;
        description = `10%+ improvement bonus (+30)`;
      } else if (improvement >= 5) {
        bonusPoints = 15;
        description = `5%+ improvement bonus (+15)`;
      }
    }
  }

  // Record this interview score
  profile.interviewScores.push({ jobRoleId: jobRole, score: newScore, level, completedAt: new Date() });

  if (bonusPoints > 0) {
    await applyPoints(profile, bonusPoints, 'improvement_bonus', description);
  }

  await profile.save();

  return { bonusPoints, totalPoints: profile.totalPoints };
}

/**
 * Update streak for user (call after any qualifying activity).
 * Internal version that mutates profile without saving.
 */
async function updateStreakInternal(profile) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log('=== STREAK DEBUG ===');
  console.log('Current time:', now);
  console.log('Today (normalized):', today);
  console.log('Last activity date:', profile.lastActivityDate);

  if (!profile.lastActivityDate) {
    // First activity ever
    console.log('First activity ever - setting streak to 1');
    profile.currentStreak = 1;
    profile.longestStreak = Math.max(profile.longestStreak || 0, 1);
    profile.lastActivityDate = today;
    return;
  }

  const last = new Date(profile.lastActivityDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

  console.log('Last activity (normalized):', lastDay);
  console.log('Days difference:', diffDays);
  console.log('Current streak before update:', profile.currentStreak);

  if (diffDays === 0) {
    // Already active today — no change
    console.log('Same day activity - no streak change');
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    console.log('Consecutive day - incrementing streak');
    profile.currentStreak = (profile.currentStreak || 0) + 1;
    profile.longestStreak = Math.max(profile.longestStreak || 0, profile.currentStreak);
    profile.lastActivityDate = today;
    // Check streak bonuses
    await applyStreakBonus(profile, profile.currentStreak);
  } else {
    // Streak broken
    console.log('Streak broken - resetting to 1');
    profile.currentStreak = 1;
    profile.lastActivityDate = today;
  }
  
  console.log('Final streak:', profile.currentStreak);
  console.log('==================');
}

async function applyStreakBonus(profile, streak) {
  const bonuses = [
    { days: 30, points: 125, label: '30-day streak' },
    { days: 14, points: 100, label: '14-day streak' },
    { days: 7, points: 50, label: '7-day streak' },
    { days: 3, points: 10, label: '3-day streak' },
  ];

  for (const bonus of bonuses) {
    if (streak === bonus.days) {
      await applyPoints(profile, bonus.points, 'streak_bonus', `${bonus.label} bonus (+${bonus.points})`);
      // Award streak badge
      const badgeId = `streak_${bonus.days}`;
      if (!profile.badges.find((b) => b.badgeId === badgeId)) {
        profile.badges.push({
          badgeId,
          name: `${bonus.days}-Day Streak`,
          description: `Completed activities for ${bonus.days} consecutive days`,
          type: 'streak',
          awardedAt: new Date(),
        });
      }
      break;
    }
  }
}

/**
 * Public streak update (for external use with db connect & save).
 */
export async function updateStreak(email) {
  const profile = await getOrCreateProfile(email);
  await updateStreakInternal(profile);
  await profile.save();
  return { currentStreak: profile.currentStreak, longestStreak: profile.longestStreak };
}

/**
 * Restore a broken streak when user completes an advanced mock.
 */
export async function restoreStreak(email) {
  const profile = await getOrCreateProfile(email);

  if (profile.currentStreak === 0) {
    // Restore to 1
    profile.currentStreak = 1;
    profile.lastActivityDate = new Date();
    profile.streakRestoredAt = new Date();
    await profile.save();
  }

  return { currentStreak: profile.currentStreak };
}

/**
 * Get the full points summary for a user.
 */
export async function getPointsSummary(email) {
  const profile = await getOrCreateProfile(email);

  const levelInfo = computeLevel(profile.totalPoints);
  const nextLevel = LEVELS.find((l) => l.level === profile.level + 1);
  const pointsToNextLevel = nextLevel ? nextLevel.min - profile.totalPoints : 0;

  return {
    totalPoints: profile.totalPoints,
    weeklyPoints: profile.weeklyPoints || 0,
    level: profile.level,
    levelName: profile.levelName,
    pointsToNextLevel: Math.max(0, pointsToNextLevel),
    nextLevelName: nextLevel ? nextLevel.name : null,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    badges: profile.badges || [],
    bonusMockCredits: profile.bonusMockCredits || 0,
    trackPoints: profile.trackPoints || {},
    recentLog: (profile.pointsLog || []).slice(-10).reverse(),
    lastActivityDate: profile.lastActivityDate,
  };
}

/**
 * Get global percentile rank for a user.
 * Uses rolling 30-day active users.
 */
export async function getPercentileRank(email) {
  await dbConnect();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all users active in last 30 days
  const allProfiles = await PointsProfile.find(
    { lastActivityDate: { $gte: thirtyDaysAgo } },
    'email totalPoints'
  ).lean();

  if (allProfiles.length === 0) {
    return { rank: 1, totalUsers: 1, percentile: 99 };
  }

  // Sort descending by total points
  allProfiles.sort((a, b) => b.totalPoints - a.totalPoints);

  const userIndex = allProfiles.findIndex((p) => p.email === email);
  const totalUsers = allProfiles.length;

  if (userIndex === -1) {
    return { rank: totalUsers + 1, totalUsers, percentile: 0 };
  }

  const rank = userIndex + 1;
  const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

  // Track-wise percentile
  const userProfile = allProfiles[userIndex];

  return {
    rank,
    totalUsers,
    percentile: Math.max(0, percentile),
    totalPoints: userProfile.totalPoints,
  };
}

/**
 * Check and award top percentile rewards.
 */
export async function checkAndAwardTopRewards(email) {
  const profile = await getOrCreateProfile(email);
  const { rank, totalUsers } = await getPercentileRank(email);

  if (totalUsers < 5) return; // Skip if not enough users

  const percentileRank = (rank / totalUsers) * 100;
  const rewards = [];

  // Top 10% overall
  if (percentileRank <= 10) {
    const badgeId = 'top_10_overall';
    if (!profile.badges.find((b) => b.badgeId === badgeId)) {
      profile.badges.push({
        badgeId,
        name: 'Top 10% Candidate',
        description: 'Ranked in the top 10% of all active users',
        type: 'top_percentile',
        awardedAt: new Date(),
      });
      profile.bonusMockCredits = (profile.bonusMockCredits || 0) + 2;
      rewards.push({ type: 'badge', name: 'Top 10% Candidate' });
      rewards.push({ type: 'credits', amount: 2 });
    }
  }

  // Track-specific top 5%
  const tracks = Object.keys(profile.trackPoints || {});
  for (const track of tracks) {
    if ((profile.trackPoints[track] || 0) === 0) continue;

    // Get all users for this track
    const allTrackProfiles = await PointsProfile.find(
      { [`trackPoints.${track}`]: { $gt: 0 } },
      `email trackPoints.${track}`
    ).lean();

    allTrackProfiles.sort((a, b) => (b.trackPoints[track] || 0) - (a.trackPoints[track] || 0));
    const trackTotal = allTrackProfiles.length;
    const trackIndex = allTrackProfiles.findIndex((p) => p.email === email);

    if (trackIndex !== -1 && trackTotal >= 5) {
      const trackPercentile = ((trackIndex + 1) / trackTotal) * 100;
      if (trackPercentile <= 5) {
        const badgeId = `top_5_${track}`;
        if (!profile.badges.find((b) => b.badgeId === badgeId)) {
          const trackName = track.charAt(0).toUpperCase() + track.slice(1);
          profile.badges.push({
            badgeId,
            name: `${trackName} Track Master`,
            description: `Top 5% in ${trackName} track`,
            type: 'track',
            awardedAt: new Date(),
          });
          profile.bonusMockCredits = (profile.bonusMockCredits || 0) + 2;
          rewards.push({ type: 'badge', name: `${trackName} Track Master` });
          rewards.push({ type: 'credits', amount: 2 });
        }
      }
    }
  }

  if (rewards.length > 0) {
    profile.lastTopRewardCheck = new Date();
    await profile.save();
  }

  return rewards;
}

/**
 * Get leaderboard data.
 * @param {string} type - 'overall' | 'weekly' | 'track'
 * @param {string} track - track name for track leaderboard
 */
export async function getLeaderboard(type = 'overall', track = null) {
  await dbConnect();

  let profiles;

  if (type === 'weekly') {
    const weekStart = getWeekStart();
    profiles = await PointsProfile.find(
      { weekStartDate: { $gte: weekStart } },
      'email weeklyPoints level levelName badges'
    ).lean();
    profiles.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
  } else if (type === 'track' && track) {
    profiles = await PointsProfile.find(
      { [`trackPoints.${track}`]: { $gt: 0 } },
      `email trackPoints level levelName badges`
    ).lean();
    profiles.sort((a, b) => (b.trackPoints?.[track] || 0) - (a.trackPoints?.[track] || 0));
  } else {
    // Overall
    profiles = await PointsProfile.find(
      {},
      'email totalPoints level levelName badges'
    ).lean();
    profiles.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  }

  // Enrich with user info from User model
  const User = (await import('../models/User')).default;
  const emails = profiles.map((p) => p.email).slice(0, 100);
  const users = await User.find({ email: { $in: emails } }, 'email fullName profileImg').lean();
  const userMap = {};
  users.forEach((u) => { userMap[u.email] = u; });

  return profiles.slice(0, 50).map((p, i) => ({
    rank: i + 1,
    email: p.email,
    fullName: userMap[p.email]?.fullName || 'Anonymous',
    profileImg: userMap[p.email]?.profileImg || '',
    totalPoints: type === 'weekly' ? (p.weeklyPoints || 0) : type === 'track' ? (p.trackPoints?.[track] || 0) : (p.totalPoints || 0),
    level: p.level || 1,
    levelName: p.levelName || 'Starter',
    topBadge: (p.badges || []).at(-1) || null,
  }));
}

export { computeLevel, LEVELS };
