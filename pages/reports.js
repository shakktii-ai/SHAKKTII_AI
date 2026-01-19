import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Target, Calendar, TrendingUp, CalendarDays, Loader2, ChevronRight, FileText, Clock, ArrowLeft } from "lucide-react";
import PremiumNavbar from '@/components/navbar';
import ReportsHeader from '@/components/premium/ReportsHeader';
import StatCard from '@/components/premium/StatCard';
import SkillItem from '@/components/premium/SkillItem';
import DetailedReportModal from '@/components/premium/DetailedReportModal';
import { extractSkillFeedback, extractSkillOpportunities } from '@/utils/feedbackParser';
import { cn } from "@/lib/utils";

// --- Skeleton Components ---
const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            <div className="w-12 h-4 bg-slate-50 rounded-lg" />
        </div>
        <div className="w-20 h-8 bg-slate-100 rounded-lg mb-2" />
        <div className="w-24 h-4 bg-slate-50 rounded-lg" />
    </div>
);

const SkillItemSkeleton = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div>
                    <div className="w-32 h-5 bg-slate-100 rounded-lg mb-2" />
                    <div className="w-20 h-4 bg-slate-50 rounded-lg" />
                </div>
            </div>
            <div className="w-16 h-8 bg-slate-100 rounded-full" />
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mb-4" />
        <div className="w-full h-16 bg-slate-50 rounded-xl" />
    </div>
);

const HistoryItemSkeleton = () => (
    <div className="p-4 rounded-xl border border-slate-100 bg-white animate-pulse">
        <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
                <div className="w-3/4 h-4 bg-slate-100 rounded-lg mb-2" />
                <div className="w-1/2 h-3 bg-slate-50 rounded-lg" />
            </div>
            <div className="w-12 h-5 bg-slate-100 rounded-full" />
        </div>
        <div className="w-24 h-3 bg-slate-50 rounded-lg" />
    </div>
);

export default function PremiumReportsPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ date: null, role: null });

    // Authentication Guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage) {
            try {
                const parsedUser = JSON.parse(userFromStorage);
                if (parsedUser.email) {
                    setEmail(parsedUser.email);
                } else {
                    // Fallback if email is missing in user object but token exists
                    console.warn("User email missing in storage");
                }
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!email) return;

        const fetchReports = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?email=${email}`);
                if (!response.ok) throw new Error('Failed to fetch reports');
                const data = await response.json();

                if (data.reports && data.reports.length > 0) {
                    const sorted = data.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setReports(sorted);
                    setSelectedReport(sorted[0]); // Select latest by default
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [email]);

    const handleReportSelect = (report) => {
        setSelectedReport(report);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getSkillData = (report, skillName) => {
        if (!report || !report.reportAnalysis) return null;

        const scoreMatch = report.reportAnalysis.match(new RegExp(`${skillName}:\\s*(\\d+)\\/10`, 'i'));
        const scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 0;

        return {
            skill: skillName,
            score: scoreValue || 0,
            status: scoreValue >= 8 ? "Strong" : scoreValue >= 5 ? "Good" : "Not Attempted",
            lastTested: new Date(report.createdAt).toLocaleDateString(),
            progressColor: "#7C3AED",
            summary: `Performance analysis for ${skillName}.`,
            detailedFeedback: extractSkillFeedback(report.reportAnalysis, skillName),
            opportunities: extractSkillOpportunities(report.reportAnalysis, skillName)
        };
    };

    // Simplified logic for derived data when loading
    const dateFilteredReports = loading ? [] : reports.filter(report => {
        if (filters.date) {
            const reportDate = new Date(report.createdAt);
            const now = new Date();
            const diffDays = (now - reportDate) / (1000 * 60 * 60 * 24);
            return diffDays <= filters.date;
        }
        return true;
    });

    const uniqueRoles = loading ? [] : Array.from(new Set(dateFilteredReports.map(r => (r.role || "Untitled Role").trim().toLowerCase())))
        .map(roleLower => dateFilteredReports.find(r => (r.role || "Untitled Role").trim().toLowerCase() === roleLower).role || "Untitled Role");

    const filteredReports = loading ? [] : dateFilteredReports.filter(report => {
        if (filters.role) {
            return (report.role || "Untitled Role").toLowerCase() === filters.role.toLowerCase();
        }
        return true;
    });

    // Use selectedReport for display, or empty object if none
    const currentViewReport = selectedReport || filteredReports[0] || { role: "N/A", createdAt: new Date() };

    const skillsList = [
        "Technical Proficiency",
        "Communication",
        "Decision-Making",
        "Confidence",
        "Language Fluency"
    ];

    const skills = skillsList.map(s => getSkillData(currentViewReport, s) || {
        skill: s,
        score: "-",
        status: "Not Attempted",
        lastTested: "N/A",
        progressColor: "#E2E8F0",
        summary: "No data available.",
        detailedFeedback: "Take an interview to see your detailed breakdown here.",
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navUser = email ? { value: true, name: email.split('@')[0] } : null;

    return (
        <div className="min-h-screen bg-[#F5F5FF]">
            <Head>
                <title>My Reports | SHAKKTII AI</title>
            </Head>
            {/* <PremiumNavbar user={navUser} Logout={handleLogout} /> */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
                <ReportsHeader
                    onViewFullReport={() => setIsModalOpen(true)}
                    uniqueRoles={uniqueRoles}
                    onFilterChange={setFilters}
                    activeFilters={filters}
                />

                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    {/* Left Side: Report Details */}
                    <div className="flex-1">
                        {/* Stat Cards Row */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {loading ? (
                                <>
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </>
                            ) : (
                                <>
                                    <StatCard
                                        label="Overall Score"
                                        value={currentViewReport.overallScore ? currentViewReport.overallScore.toString() : "0"}
                                        subValue="/50"
                                        icon={Target}
                                        iconColor="text-white"
                                        iconBg="bg-[#0D9488]"
                                    />
                                    <StatCard
                                        label="Job Role"
                                        value={currentViewReport.role || "N/A"}
                                        icon={TrendingUp}
                                        iconColor="text-[#059669]"
                                        iconBg="bg-[#ECFDF5]"
                                        valueClassName="text-lg leading-tight line-clamp-2"
                                    />
                                    <StatCard
                                        label="Date"
                                        value={new Date(currentViewReport.createdAt).toLocaleDateString()}
                                        icon={CalendarDays}
                                        iconColor="text-[#D97706]"
                                        iconBg="bg-[#FFF7ED]"
                                    />
                                    <StatCard
                                        label="Total Reports"
                                        value={reports.length.toString()}
                                        icon={Calendar}
                                        iconColor="text-[#7C3AED]"
                                        iconBg="bg-[#F3E8FF]"
                                    />
                                </>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#0F172A]">
                                {loading ? (
                                    <div className="h-7 w-64 bg-slate-200 rounded-lg animate-pulse" />
                                ) : (
                                    `Skill Analysis: ${currentViewReport.role || "Selected Session"}`
                                )}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {loading ? (
                                    <div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse mt-2" />
                                ) : (
                                    `Detailed breakdown of your performance on ${new Date(currentViewReport.createdAt).toLocaleDateString()}`
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <>
                                    <SkillItemSkeleton />
                                    <SkillItemSkeleton />
                                    <SkillItemSkeleton />
                                </>
                            ) : (
                                skills.map((skillItem) => (
                                    <SkillItem key={skillItem.skill} {...skillItem} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: History Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                                Recent Sessions
                            </h3>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <>
                                        <HistoryItemSkeleton />
                                        <HistoryItemSkeleton />
                                        <HistoryItemSkeleton />
                                        <HistoryItemSkeleton />
                                        <HistoryItemSkeleton />
                                    </>
                                ) : reports.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-8">No reports found.</p>
                                ) : filteredReports.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
                                        <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Filter size={20} className="text-indigo-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No results match your filters</p>
                                        <button
                                            onClick={() => setFilters({ date: null, role: null })}
                                            className="text-indigo-600 text-sm font-bold mt-2 hover:underline"
                                        >
                                            Reset all filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredReports.map((report) => (
                                        <div
                                            key={report._id || Math.random()}
                                            onClick={() => handleReportSelect(report)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${selectedReport && selectedReport._id === report._id
                                                ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-50"
                                                : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-2 text-left">
                                                <h4 className={cn(
                                                    "font-bold text-sm leading-tight text-left break-words flex-1",
                                                    selectedReport && selectedReport._id === report._id ? "text-indigo-700" : "text-slate-700"
                                                )}>
                                                    {report.role || "Untitled Role"}
                                                </h4>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0",
                                                    (report.overallScore || 0) >= 35 ? "bg-green-100 text-green-700" :
                                                        (report.overallScore || 0) >= 20 ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {report.overallScore || 0}/50
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5 capitalize">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 transition-all duration-300",
                                                    selectedReport && selectedReport._id === report._id ? "text-indigo-500 translate-x-1" : "text-slate-300 group-hover:text-indigo-400"
                                                )} />
                                            </div>
                                            {selectedReport && selectedReport._id === report._id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <DetailedReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reportData={selectedReport}
                jobRole={selectedReport?.role || "Interactive Session"}
                date={selectedReport ? new Date(selectedReport.createdAt).toLocaleDateString() : ''}
            />
        </div>
    );
}
