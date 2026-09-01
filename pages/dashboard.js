import { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, User, Mic, Users, Brain, Code, Target, FileText, MicIcon, Upload, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { RankingCard } from "@/components/dashboard/RankingCard";
import { CreditsCard } from "@/components/dashboard/CreditsCard";
import { PracticeZoneCard } from "@/components/dashboard/PracticeZoneCard";
import { StartSimulationButton } from "@/components/dashboard/StartSimulationButton";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { DailyNudge } from "@/components/dashboard/DailyNudge";
import { PointsOverview } from "@/components/dashboard/PointsOverview";
import { PointsHistory } from "@/components/dashboard/PointsHistory";
import Link from "next/link";
import JobFinder from "../components/jobFinder";
import Head from "next/head";
import { IoIosArrowBack } from "react-icons/io";
import { MdAccountCircle, MdOutlineAssignment, MdAssignmentTurnedIn, MdOutlinePending } from 'react-icons/md';
import { useRouter } from 'next/router'; // For programmatic navigation
import { Line, Radar } from 'react-chartjs-2';
import Steper from '@/components/dashboard/Stepper'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';
import Footer from "@/components/dashboard/Footer";
import { FaFire } from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

export default function dashboard({ Logout, user }) {
  const [dropdown, setDropdown] = useState(false);
  const [notification, setNotification] = useState(false); // State to track the notification
  const [firstName, setFirstName] = useState(null); // State to store the first name
  const [userId, setUserId] = useState(null); // State to store userId for resume builder
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State to control mobile menu
  const [performanceScores, setPerformanceScores] = useState([]);
  const dropdownRef = useRef(null);

  const [interviewStats, setInterviewStats] = useState({
    availableInterviews: 0,
    completedInterviews: 0,
    remainingInterviews: 0,
    loading: true
  });
  const [userRank, setUserRank] = useState({
    rank: '--',
    totalUsers: '--',
    percentile: '--'
  });

  // Points system state
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    level: 1,
    levelName: 'Starter',
    currentStreak: 0,
    percentile: 0,
    pointsToNextLevel: 0,
    nextLevelName: null,
    recentLog: [],
    loading: true,
  });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add leaderboard link to the dashboard navigation
  useEffect(() => {
    const navLinks = document.querySelector('.dashboard-links');
    if (navLinks && !document.querySelector('.leaderboard-link')) {
      const leaderboardLink = document.createElement('a');
      leaderboardLink.href = '/leaderboard';
      leaderboardLink.className = 'leaderboard-link flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors';
      leaderboardLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Leaderboard</span>
      `;
      navLinks.appendChild(leaderboardLink);
    }
  }, []);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    scoreData: {
      labels: [],
      datasets: []
    },
    radarData: {
      labels: [],
      datasets: []
    }
  });
  const router = useRouter(); // Next.js router to navigate to /role

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUserId(userFromStorage._id || userFromStorage.id || null);
        setFirstName(userFromStorage.fullName?.split(' ')[0] || null);
        setUserEmail(userFromStorage.email || '');
      }
      if (userFromStorage?.email) {
        fetchReports(userFromStorage.email);
        fetchPointsData(userFromStorage.email);
      }
    }
  }, []);
  const getNormalizedScore = (report, categoryKey) => {
    if (!report) return 0;

    // First try to get the score directly
    let score = report.scores?.[categoryKey];

    // If score is not available, try to extract from reportAnalysis
    if ((!score || score === 0) && report.reportAnalysis) {
      const scorePatterns = {
        'technical_proficiency': /Technical\s*Proficiency[\s:]*([\d.]+)/i,
        'communication': /Communication[\s:]*([\d.]+)/i,
        'decision_making': /Decision[-\s]*Making[\s:]*([\d.]+)/i,
        'confidence': /Confidence[\s:]*([\d.]+)/i,
        'language_fluency': /Language\s*Fluency[\s:]*([\d.]+)/i,
        'overall': /Overall[\s:]*([\d.]+)/i
      };

      const match = report.reportAnalysis.match(scorePatterns[categoryKey] || /(?:)/);
      if (match && match[1]) {
        score = parseFloat(match[1]);
        // If we found a score > 10, it might be out of 50 (for overall) or another scale
        if (score > 10 && categoryKey !== 'overall') {
          score = (score / 5); // Scale down if it's out of 50
        }
      }
    }

    // Ensure we have a valid number between 0-10 (for categories) or 0-50 (for overall)
    const maxScore = categoryKey === 'overall' ? 50 : 10;
    score = parseFloat(score || 0);

    // Ensure score is within valid range
    return Math.min(Math.max(0, isNaN(score) ? 0 : score), maxScore);
  };

  const prepareChartData = (reports) => {
    if (!Array.isArray(reports) || reports.length === 0) {
      return {
        scoreData: {
          labels: [],
          datasets: []
        },
        radarData: {
          labels: [],
          datasets: []
        }
      };
    }

    // Sort reports by date
    const sortedReports = [...reports].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create labels from dates
    const labels = sortedReports.map(report => {
      return new Date(report.date).toLocaleDateString();
    });

    // Define score categories and their colors
    const scoreCategories = [
      { key: 'technical_proficiency', label: 'Technical', color: 'rgba(255, 99, 132, 0.8)' },
      { key: 'communication', label: 'Communication', color: 'rgba(54, 162, 235, 0.8)' },
      { key: 'decision_making', label: 'Decision Making', color: 'rgba(255, 206, 86, 0.8)' },
      { key: 'confidence', label: 'Confidence', color: 'rgba(75, 192, 192, 0.8)' },
      { key: 'language_fluency', label: 'Language', color: 'rgba(153, 102, 255, 0.8)' }
    ];

    // Prepare line chart datasets for each score category
    const datasets = scoreCategories.map(category => {
      const data = sortedReports.map(report => {
        // Get normalized score (0-10 scale)
        return getNormalizedScore(report, category.key);
      });

      return {
        label: category.label,
        data: data,
        borderColor: category.color,
        backgroundColor: category.color.replace('0.8', '0.1'),
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    // Prepare radar chart data for the latest report
    const latestReport = sortedReports[sortedReports.length - 1];
    const radarData = {
      labels: scoreCategories.map(cat => cat.label),
      datasets: [{
        label: 'Latest Performance',
        data: scoreCategories.map(cat => getNormalizedScore(latestReport, cat.key)),
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: 'rgba(124, 58, 237, 0.8)',
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };

    return {
      scoreData: {
        labels,
        datasets
      },
      radarData
    };
  };


  const getPerformanceOverview = (reports) => {
    if (!reports || reports.length === 0) return [];

    // Latest interview
    const latestReport = [...reports].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    const categories = [
      { key: "communication", label: "Communication" },
      { key: "confidence", label: "Confidence" },
      { key: "decision_making", label: "Decision Making" },
      { key: "technical_proficiency", label: "Technical Depth" },
    ];

    return categories.map(cat => ({
      label: cat.label,
      value: Math.round(getNormalizedScore(latestReport, cat.key)),
      trend: "up", // can be dynamic later
    }));
  };


  const fetchUserRank = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`/api/getUserRank?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserRank({
          rank: data.rank || '--',
          totalUsers: data.totalUsers || '--',
          percentile: data.percentile || '--'
        });
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  // Fetch points summary data
  const fetchPointsData = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/points/summary?email=${encodeURIComponent(email)}`);
      const d = await res.json();
      if (d.success !== false) {
        setPointsData({ ...d, loading: false });
        // Also sync streak and rank from points data
        setUserRank({
          rank: d.rank || '--',
          totalUsers: d.totalUsers || '--',
          percentile: d.percentile || '--',
        });
      }
    } catch (e) {
      console.error('Error fetching points data:', e);
    } finally {
      setPointsData(prev => ({ ...prev, loading: false }));
    }
  };


  const fetchInterviewStats = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`/api/getUserStats?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data?.stats) {
        const { no_of_interviews, no_of_interviews_completed } = data.stats;
        setInterviewStats({
          availableInterviews: no_of_interviews || 0,
          completedInterviews: no_of_interviews_completed || 0,
          remainingInterviews: Math.max(0, (no_of_interviews || 0) - (no_of_interviews_completed || 0)),
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching interview stats:', error);
      setInterviewStats(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchReports = async (email) => {
    if (!email) return;

    try {
      // Fetch interview stats in parallel with reports
      await Promise.all([
        fetchInterviewStats(email),
        (async () => {
          const response = await fetch(`/api/getAllReports?email=${encodeURIComponent(email)}`);
          const data = await response.json();

          if (Array.isArray(data)) {
            setReports(data);
            setChartData(prepareChartData(data));
            setPerformanceScores(getPerformanceOverview(data));
          }
        })(),
        fetchUserRank(email)
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };





  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  // const resumeBuilderBaseUrl = "https://mockmingle-resume.vercel.app/";
  const resumeBuilderBaseUrl = "https://mockmingle-resume.vercel.app/";
  const resumeBuilderUrl = token
    ? `${resumeBuilderBaseUrl}?token=${encodeURIComponent(token)}`
    : resumeBuilderBaseUrl;
  // const resumeBuilderBaseUrl = "https://mockmingle-resume.vercel.app/";
  // const resumeBuilderUrl = userId
  //   ? `${resumeBuilderBaseUrl}?userId=${encodeURIComponent(userId)}`
  //   : resumeBuilderBaseUrl;

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Progress", href: "/progress" },
    { label: "Reports", href: "/report" },
    { label: "Skills Test", href: "/practices" },
    // { label: "Learn", href: "/suggestion" },
    { label: "Job History", href: "/jobHistory" },
    // { label: "Resume Builder", href: resumeBuilderUrl },
    // { label: "Logout", href: "#", onClick: () => { Logout(); router.push("/login"); }}
  ];

  const isActive = (path) => router.pathname === path;




  const practiceZones = [
    {
      title: "Interview Simulations",
      description: "Practice full mock interviews with AI-powered feedback and real-time analysis.",
      icon: Mic,
      color: "blue",
      progress: 45,
      link: '/role',
    },
    {
      title: "Resume-Based Interview",
      description: "Practice a mock interview tailored to your uploaded resume with AI-powered feedback and real-time analysis.",
      icon: FileText,
      color: "green",
      progress: 45,
      link: '/resumeRole',
    },
    {
      title: "Behaviour",
      description: "Master STAR method responses and situational questions for any role.",
      icon: Users,
      color: "purple",
      progress: 30,
      link: '/practices'
    },
    {
      title: "Soft Skills",
      description: "Improve communication, leadership, and interpersonal abilities.",
      icon: Brain,
      color: "teal",
      progress: 60,
      link: "#"//skills
    },
    {
      title: "Technical Training",
      description: "Evaluate your technical knowledge and subject understanding through structured tests designed for skill improvement.",
      icon: Target,
      color: "gold",
      progress: 25,
      link: '#'//techMock
    },
  ];





  return (
    <>
      <Head>
        <title>Shakktii Interview Trainer</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>






      <div className="min-h-screen mt-20 bg-background">
        <header className="fixed top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border-light">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground"><img src="MM_LOGO1.png" alt="" className="w-8 h-8" /></span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent hidden sm:inline">MockMingle</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors  ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <StreakBadge days={pointsData.currentStreak} />
                </div>

                <button className="hidden sm:block w-md border border-[#6F24E8] bg-[#ECECFA] text-[#6F24E8] rounded-full px-2 py-2 text-semibold">

                  Earn Interview Credits
                </button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                    2
                  </span>
                </Button>
                {user?.value ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdown((prev) => !prev)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D3D0D0] bg-[#ECECFA] text-[#6F24E8] transition hover:bg-[#E3E0FF]"
                      aria-label="User menu"
                    >
                      <User className="h-5 w-5" />
                    </button>

                    {dropdown && (
                      <div className="absolute right-0 mt-3 w-[170px] sm:w-[192px] bg-white rounded-[16px] shadow-xl border border-gray-100 overflow-hidden py-1 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-[14px] font-bold hover:bg-gray-50 text-[#0A1C40]"
                          onClick={() => setDropdown(false)}
                        >
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdown(false);
                            Logout?.();
                          }}
                          className="w-full text-left px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
              <nav className="md:hidden py-4 border-t border-border-light animate-fade-in">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                          ? "text-primary bg-lavender"
                          : "text-muted-foreground hover:text-purple hover:bg-lavender/50"
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 px-4">
                  <StreakBadge days={pointsData.currentStreak} />
                </div>

                <button className="mt-4 w-md border border-[#6F24E8] bg-[#ECECFA] text-[#6F24E8] rounded-full px-2 py-2 text-semibold">

                  Earn Interview Credits
                </button>
              </nav>
            )}
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="w-full rounded-2xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] px-5 py-5 md:px-8 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              {/* Left Content */}
              <div className="text-white">
                <div className="flex items-center gap-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide text-[#FFD54A]">
                  <span><FaFire size={12} /></span>
                  <span>4-Day Streak Active</span>
                </div>

                <h2 className="mt-1 text-xl md:text-2xl font-bold leading-tight">
                  You're <span className="text-[#FFD54A]">115 XP</span> away from

                  Advanced Candidate
                </h2>

                <p className=" text-xs md:text-sm text-white/90">
                  Complete one interview today to keep your streak alive and level up.
                </p>
              </div>

              {/* Right Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => {
                    const section = document.getElementById("practice");

                    if (section) {
                      section.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  ▶ Let's Practice
                </button>

                <Link href="/role">
                  <button className="flex justify-center items-center px-3 py-2 rounded-full bg-white">
                    <MicIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                    Start Mock Interview
                  </button></Link>
              </div>
            </div>
          </div>
          <Steper />
          {/* Top Section */}
          {/* <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2">
              <WelcomeHero userName={user?.fullName?.split(" ")[0]} />
            </div>
            <div className="space-y-6">
              <RankingCard
                percentile={typeof userRank.percentile === 'number' ? userRank.percentile : 0}
                pointsToNext={pointsData.pointsToNextLevel || 0}
                currentPoints={(() => {
                  const lvlMins = [0, 200, 500, 1000, 2000, 3500];
                  const lvl = (pointsData.level || 1) - 1;
                  const min = lvlMins[Math.min(lvl, 5)];
                  return (pointsData.totalPoints || 0) - min;
                })()}
                maxPoints={(() => {
                  const lvlMaxes = [200, 500, 1000, 2000, 3500, Infinity];
                  const lvlMins = [0, 200, 500, 1000, 2000, 3500];
                  const lvl = (pointsData.level || 1) - 1;
                  const max = lvlMaxes[Math.min(lvl, 5)];
                  const min = lvlMins[Math.min(lvl, 5)];
                  return max === Infinity ? (pointsData.totalPoints || 3500) + 500 : max - min;
                })()}
                level={pointsData.level || 1}
                levelName={pointsData.levelName || 'Starter'}
                totalPoints={pointsData.totalPoints || 0}
              />
            </div>
          </div> */}

          {/* Points Overview Section */}
          {/* {userEmail && (
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <div className="lg:col-span-2">
                <PointsOverview email={userEmail} />
              </div>
              <div>
                <PointsHistory log={pointsData.recentLog || []} />
              </div>
            </div>
          )} */}

          {/* Middle Section */}
          {/* <div className="grid gap-6 lg:grid-cols-3 mb-8"> */}
          <div className="lg:col-span-2">
            <DailyNudge />
          </div>
          {/* <div>
              <CreditsCard credits={interviewStats.loading ? '...' : interviewStats.remainingInterviews} />
            </div>
          </div> */}
          {/* CTA */}
          {/* <div className="flex justify-center mb-12">
            <StartSimulationButton />
          </div> */}

          {/* Practice Zones */}
          <section className="my-6" id="practice">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Practice Zones</h2>
                <p className="text-muted-foreground">Choose an area to improve your skills</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {practiceZones.map((zone, index) => (
                <PracticeZoneCard
                  key={zone.title}
                  {...zone}
                  delay={`${0.3 + index * 0.1}s`}
                />
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="rounded-[20px] bg-gradient-to-r from-[#1F4CBD] via-[#BFD8FF] to-[#FFFFFF] p-[1px] shadow-[0_8px_30px_rgba(59,130,246,0.08)]">
              <div className="rounded-[19px] bg-[#ffffff] px-6 py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Left */}
                  <div className="flex items-start gap-5">

                    {/* Icon */}
                    <div className="h-14 w-14 rounded-[3px] border border-[#E6EAF5] bg-white shadow-md flex items-center justify-center">
                      <img
                        src="/resumedoc.png"
                        alt="Resume"
                        className="h-8 w-8"
                      />
                    </div>

                    <div>
                      <h2 className="text-[28px] font-medium text-[#000000] leading-none">
                        Build a Professional Resume in Minutes
                      </h2>

                      <p className="mt-3 font-medium text-[18px] text-[#000000]">
                        You don't have a resume yet. Create one with our AI-powered
                        builder.
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={resumeBuilderUrl}
                      className="flex items-center justify-center gap-2 rounded-full border border-[#977EFF] bg-[#7C3AED] px-7 py-3 font-semibold text-white transition hover:opacity-95"
                    >
                      <PlusCircle size={24} />
                      Create Resume
                    </Link>

                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="mb-4 ">
            <JobFinder />
          </section>
          {/* Score Overview */}
          {/* <section className="mb-8">
            <div className="max-w-2xl">
              <ScoreChart scores={performanceScores} />
            </div>
          </section> */}
        </main>
        <Footer />
        {/* Footer */}
        {/* <footer className="border-t border-border-light bg-card/50 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg gradient-blue-teal flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">M</span>
                </div>
                <span className="text-sm font-semibold text-foreground">MockMingle 2.0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI Career Coach • Build confidence, one interview at a time.
              </p>
            </div>
          </div>
        </footer> */}
      </div>

    </>
  );
}




