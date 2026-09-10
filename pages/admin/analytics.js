import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RefreshCw
} from "lucide-react";

export default function CohortAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchAnalytics();
  }, [timeRange, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Admintoken");
      const res = await fetch("/api/admin/getAnalyticsData", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching institutional analytics");
    } finally {
      setLoading(false);
    }
  };

  const distribution = analytics?.distribution || [
    { range: "0-40%", count: 2 },
    { range: "41-60%", count: 8 },
    { range: "61-75%", count: 24 },
    { range: "76-90%", count: 38 },
    { range: "91-100%", count: 14 },
  ];

  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  const subjectMastery = analytics?.subjectMastery || [
    { subject: "Data Structures & Algorithms", averageScore: 82, testsCount: 18 },
    { subject: "Database Management", averageScore: 78, testsCount: 15 },
    { subject: "Software Engineering", averageScore: 85, testsCount: 22 },
    { subject: "Computer Networks", averageScore: 74, testsCount: 12 },
    { subject: "Operating Systems", averageScore: 71, testsCount: 9 },
  ];

  const popularRoles = analytics?.popularRoles || [
    { role: "Full Stack Developer", count: 14 },
    { role: "Data Analyst", count: 10 },
    { role: "Frontend Engineer", count: 8 },
    { role: "Product Manager", count: 5 },
  ];

  const maxRoleCount = Math.max(...popularRoles.map((r) => r.count), 1);

  return (
    <AdminLayout
      title="Cohort Analytics & Insights"
      subtitle="Institutional performance benchmarks, score distributions, and subject competency mapping"
      actionButton={
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7060E7] shadow-sm"
          >
            <option value="all">All-Time Cohort</option>
            <option value="90">Last 90 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
          </select>
        </div>
      }
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= TOP ANALYTICS KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500">Readiness Index</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{analytics?.readinessIndex || 82}%</h3>
          <p className="text-xs text-slate-500 mt-1">Students achieving 75%+ score benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500">Evaluations Analyzed</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7060E7]">
              <BarChart3 size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{analytics?.totalEvaluated || 86}</h3>
          <p className="text-xs text-slate-500 mt-1">Total dataset submissions analyzed</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500">Top Performing Area</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0AADD8]">
              <Sparkles size={20} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 truncate">Software Engg</h3>
          <p className="text-xs text-purple-600 font-semibold mt-1">85% Average Mastery</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500">Most Tested Role</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers size={20} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 truncate">Full Stack Dev</h3>
          <p className="text-xs text-slate-500 mt-1">14 completed mock sessions</p>
        </div>

      </div>

      {/* ================= SCORE DISTRIBUTION & POPULAR ROLES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Score Distribution Histogram */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 size={20} className="text-[#7060E7]" />
                Score Distribution Bell Curve
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Student cohort percentage distribution</p>
            </div>
          </div>

          <div className="h-60 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
            {distribution.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.count / maxDist) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-[#7060E7] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count} students
                  </div>
                  <div className="w-full bg-slate-100 rounded-2xl overflow-hidden p-1 flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#7060E7] to-[#0AADD8] rounded-xl shadow-md group-hover:brightness-110 transition-all duration-500"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.range}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Popular Job Roles */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers size={20} className="text-[#0AADD8]" />
                Popular Job Roles Tested
              </h3>
              <span className="text-xs font-bold text-slate-400">By Session Count</span>
            </div>

            <div className="space-y-4">
              {popularRoles.map((roleItem, i) => {
                const widthPercent = Math.max(20, Math.round((roleItem.count / maxRoleCount) * 100));
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{roleItem.role}</span>
                      <span className="text-[#6F24E8]">{roleItem.count} Sessions</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#7060E7] to-[#0AADD8] transition-all duration-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ================= SUBJECT MASTERY BREAKDOWN ================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen size={20} className="text-[#7060E7]" />
              Academic Discipline & Subject Mastery
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Average student scores by subject area</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectMastery.map((sub, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-purple-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{sub.subject}</h4>
                  <span className="text-xs text-slate-500">{sub.testsCount} Assessments</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-extrabold ${sub.averageScore >= 75 ? "text-emerald-600" : "text-amber-500"}`}>
                    {sub.averageScore}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${sub.averageScore}%` }}
                  className={`h-full rounded-full ${
                    sub.averageScore >= 75
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
