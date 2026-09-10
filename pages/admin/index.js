import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users,
  Activity,
  Award,
  TrendingUp,
  CreditCard,
  UserPlus,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    const adminString = localStorage.getItem("admin");

    if (!token || !adminString) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminString);
      setAdmin(parsedAdmin);
      fetchDashboardData(token);
    } catch (err) {
      console.error(err);
      router.push("/admin/login");
    }
  }, [router]);

  const fetchDashboardData = async (token) => {
    try {
      setRefreshing(true);
      const authToken = token || localStorage.getItem("Admintoken");
      const res = await fetch("/api/admin/getDashboardStats", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      } else {
        toast.error(json.message || "Failed to load dashboard metrics");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const kpis = stats?.kpis || {
    totalStudents: 0,
    activeStudents: 0,
    pendingStudents: 0,
    activeTestsCount: 0,
    totalCompletedAssessments: 0,
    totalMockInterviews: 0,
    totalAcademicTests: 0,
    totalTechnicalTests: 0,
    totalPsychometricTests: 0,
    averageInterviewScore: 76,
    readinessRate: 85,
  };

  const competencies = stats?.competencyAverages || {
    technical: 7.8,
    communication: 8.2,
    decisionMaking: 7.5,
    confidence: 8.0,
    fluency: 7.9,
  };

  const weeklyTrends = stats?.weeklyTrends || [
    { day: "Mon", tests: 4 },
    { day: "Tue", tests: 7 },
    { day: "Wed", tests: 12 },
    { day: "Thu", tests: 9 },
    { day: "Fri", tests: 15 },
    { day: "Sat", tests: 8 },
    { day: "Sun", tests: 6 },
  ];

  const maxWeekly = Math.max(...weeklyTrends.map((w) => w.tests), 1);

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="Campus AI Assessment Analytics & Performance Insights"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-[#6F24E8]" : ""} />
          </button>
          <Link
            href="/admin/signup"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={16} />
            <span>Generate Links</span>
          </Link>
        </div>
      }
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= HERO WELCOME BANNER (Matching User Dashboard) ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-6 sm:p-8 mb-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide text-[#FFD54A] mb-2">
              <Sparkles size={14} />
              <span>Institutional AI Assessment Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {admin?.collageName || "Campus"} <span className="text-[#FFD54A]">Executive Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl">
              Track student mock interviews, academic mastery, technical scores, and psychometric profiles in real-time.
            </p>
          </div>

          {/* Quick Stats Pill Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-[#FFD54A] font-bold">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-white/80">Cohort Readiness</p>
                <p className="text-lg font-bold text-white">{kpis.readinessRate}%</p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-white/80">Avg Interview Score</p>
                <p className="text-lg font-bold text-white">{kpis.averageInterviewScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4 PRIMARY KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECECFA] border border-purple-100 flex items-center justify-center text-[#6F24E8] group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {kpis.activeStudents} Active
            </span>
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Registered Students</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{kpis.totalStudents}</h3>
            <span className="text-xs text-slate-400">({kpis.pendingStudents} pending)</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/studentProfiles" className="text-[#6F24E8] hover:underline font-bold inline-flex items-center gap-1">
              View Profiles <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Completed Assessments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7060E7] group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              4 Engines
            </span>
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Evaluations</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{kpis.totalCompletedAssessments}</h3>
            <span className="text-xs text-purple-600 font-bold">Evaluated</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/reports" className="text-[#7060E7] hover:underline font-bold inline-flex items-center gap-1">
              Browse Reports <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Active Ongoing Tests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0AADD8] group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0AADD8] animate-ping" />
              Live
            </span>
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Live Active Tests</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{kpis.activeTestsCount}</h3>
            <span className="text-xs text-slate-400">In-progress</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Real-time candidate sessions</span>
          </div>
        </div>

        {/* Student ID Passes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              QR Enabled
            </span>
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Student ID Passes</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{kpis.totalStudents}</h3>
            <span className="text-xs text-slate-400">Printable</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/user-links" className="text-emerald-600 hover:underline font-bold inline-flex items-center gap-1">
              Print PDF Cards <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* ================= CHARTS & COMPETENCY METRICS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Weekly Completion Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp size={20} className="text-[#7060E7]" />
                Assessment Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily completed evaluations across the campus</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
              Last 7 Days
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
            {weeklyTrends.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.tests / maxWeekly) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-[#7060E7] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.tests}
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-xl overflow-hidden p-1 flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#7060E7] to-[#0AADD8] rounded-lg shadow-md group-hover:brightness-110 transition-all duration-500"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competency Score Meter */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 size={20} className="text-[#7060E7]" />
                Competency Radar
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ECECFA] text-[#6F24E8] border border-purple-200 rounded-full">
                10 Scale
              </span>
            </div>

            {/* Competency Bars */}
            <div className="space-y-3.5">
              {[
                { label: "Technical Proficiency", val: competencies.technical, color: "from-[#7060E7] to-[#0AADD8]" },
                { label: "Communication Skills", val: competencies.communication, color: "from-blue-500 to-indigo-600" },
                { label: "Decision Making", val: competencies.decisionMaking, color: "from-purple-500 to-pink-500" },
                { label: "Confidence & Poise", val: competencies.confidence, color: "from-pink-500 to-rose-500" },
                { label: "Language Fluency", val: competencies.fluency, color: "from-emerald-500 to-teal-500" },
              ].map((comp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">{comp.label}</span>
                    <span className="text-slate-900 font-bold">{comp.val} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${comp.val * 10}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${comp.color} transition-all duration-700`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/analytics"
              className="text-xs text-[#7060E7] hover:text-[#5848c9] font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              View In-Depth Analytics <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* ================= RECENT ACTIVITY & QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Submissions Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-[#0AADD8]" />
                Live Student Activity Feed
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Recent tests evaluated across all assessment modules</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-[#7060E7] hover:underline font-bold"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-sm">
                      {item.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.studentName}</p>
                      <p className="text-xs text-slate-500 truncate">{item.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 block">{item.score}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      href="/admin/reports"
                      className="p-1.5 text-slate-400 hover:text-[#7060E7] hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No assessment records yet</p>
                <p className="text-xs text-slate-400 mt-1">Share student links to start collecting interview results.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Administration Shortcuts */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Admin Operations
          </h2>

          <div className="space-y-3">
            
            <Link
              href="/admin/signup"
              className="group flex items-center justify-between p-4 rounded-2xl bg-[#ECECFA]/50 border border-purple-100 hover:border-purple-300 hover:bg-[#ECECFA] hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6F24E8] flex items-center justify-center text-white shadow-sm">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#6F24E8] transition-colors">
                    Batch Link Generator
                  </h3>
                  <p className="text-[11px] text-slate-500">Generate multiple student login tokens</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/user-links"
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0AADD8]">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0AADD8] transition-colors">
                    Student ID & QR Passes
                  </h3>
                  <p className="text-[11px] text-slate-500">Export high-res PDF cards & badges</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/reports"
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7060E7]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#7060E7] transition-colors">
                    Assessment Reports Hub
                  </h3>
                  <p className="text-[11px] text-slate-500">Search & download 4-engine evaluations</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/settings"
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Campus Settings & Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">Update contacts & admin security</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
            </Link>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}