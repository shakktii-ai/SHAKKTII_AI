




import { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, User ,Mic,Users,Brain,Code,Target} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { RankingCard } from "@/components/dashboard/RankingCard";
import { CreditsCard } from "@/components/dashboard/CreditsCard";
import { PracticeZoneCard } from "@/components/dashboard/PracticeZoneCard";
import { StartSimulationButton } from "@/components/dashboard/StartSimulationButton";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { DailyNudge } from "@/components/dashboard/DailyNudge";




import Link from "next/link";
import Head from "next/head";
import { IoIosArrowBack } from "react-icons/io";
import { MdAccountCircle, MdOutlineAssignment, MdAssignmentTurnedIn, MdOutlinePending } from 'react-icons/md';
import { useRouter } from 'next/router'; // For programmatic navigation
import { Line, Radar } from 'react-chartjs-2';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State to control mobile menu
  const [performanceScores, setPerformanceScores] = useState([]);

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
      if (userFromStorage?.email) {
        fetchReports(userFromStorage.email);
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
  
  
  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Progress", href: "/progress" },
    { label: "Reports", href: "/report" },
    { label: "SoftSkills", href: "/practices" },
  ];
  
  const isActive = (path) => router.pathname === path;
  



const practiceZones = [
  {
    title: "Interview Simulations",
    description: "Practice full mock interviews with AI-powered feedback and real-time analysis.",
    icon: Mic,
    color: "blue",
    progress: 45,
    link:'/role',
  },
  {
    title: "Behaviour",
    description: "Master STAR method responses and situational questions for any role.",
    icon: Users,
    color: "purple",
    progress: 30,
    link:'/practices'
  },
  {
    title: "Soft Skills",
    description: "Improve communication, leadership, and interpersonal abilities.",
    icon: Brain,
    color: "teal",
    progress: 60,
    link:"/practices"
  },
  {
    title: "PSYCHOMETRIC TEST",
    description: "Take psychometric tests to understand your personality and cognitive abilities.",
    icon: Target,
    color: "gold",
    progress: 25,
    link:'/psychometricTest'
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
              <div className="h-9 w-9 rounded-lg gradient-blue-teal flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground"><img src="MM_LOGO1.png" alt="" className="w-6 h-6" /></span>
              </div>
              <span className="text-xl font-bold text-gradient-blue-teal hidden sm:inline">MockMingle</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
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
              <StreakBadge days={3} />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            {user?.value ? (
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full gradient-purple-indigo flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </Button>
          
             ) : (
              <Link href="/login">
                <button className="px-4 py-2 bg-gradient-to-r  text-white rounded-full  transition duration-300 shadow-lg hover:shadow-xl font-medium">
                  Login
                </button>
              </Link>
            )}
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
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
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
              <StreakBadge days={3} />
            </div>
          </nav>
        )}
      </div>
    </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
           <WelcomeHero userName={user?.fullName?.split(" ")[0]} />
          </div>
          <div className="space-y-6">
            <RankingCard
              percentile={userRank.rank}
              pointsToNext={12}
              currentPoints={88}
              maxPoints={100}
            />
          </div>
        </div>
        
        {/* Middle Section */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <DailyNudge />
          </div>
          <div>
            <CreditsCard credits={interviewStats.loading ? '...' : interviewStats.remainingInterviews} />
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex justify-center mb-12">
          <StartSimulationButton />
        </div>
        
        {/* Practice Zones */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Practice Zones</h2>
              <p className="text-muted-foreground">Choose an area to improve your skills</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {practiceZones.map((zone, index) => (
              <PracticeZoneCard
                key={zone.title}
                {...zone}
                delay={`${0.3 + index * 0.1}s`}
              />
            ))}
          </div>
        </section>
        
        {/* Score Overview */}
        <section className="mb-8">
          <div className="max-w-2xl">
            <ScoreChart scores={performanceScores} />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border-light bg-card/50 py-6">
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
      </footer>
    </div>

    </>
  );
}




