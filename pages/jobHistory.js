"use client";

import { useState, useEffect } from "react";
import JobCard from "@/components/jobCard"; // Adjust this import path as needed
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HistoryPage() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [isOfflineHistory, setIsOfflineHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    // Automatically fetch history on mount
    useEffect(() => {
        fetchSavedJobs();
    }, []);

    async function fetchSavedJobs() {
        setHistoryLoading(true);
        setHistoryError(null);
        setIsOfflineHistory(false);
        try {
            const userStr = localStorage.getItem("user");
            let userId = "";
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    userId = userObj.id || userObj._id || "";
                } catch (e) {}
            }
            const res = await fetch(`/api/jobs?all=true${userId ? `&userId=${userId}` : ""}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch history (Status ${res.status})`);
            }
            const data = await res.json();
            const dbJobs = data.jobs || [];
            setSavedJobs(dbJobs);
            if (dbJobs.length > 0) {
                localStorage.setItem("jobfind_local_history", JSON.stringify(dbJobs));
            }
        } catch (e) {
            console.warn("Falling back to localStorage due to database error:", e);
            try {
                const localStr = localStorage.getItem("jobfind_local_history");
                const localJobs = localStr ? JSON.parse(localStr) : [];
                if (Array.isArray(localJobs)) {
                    setSavedJobs(localJobs);
                    setIsOfflineHistory(true);
                } else {
                    setSavedJobs([]);
                }
            } catch (err) {
                console.error("Failed to read local history:", err);
                setHistoryError("Could not retrieve saved jobs history.");
            }
        } finally {
            setHistoryLoading(false);
        }
    }

    const filteredHistoryJobs = savedJobs.filter((job) => {
        const term = historyFilter.toLowerCase().trim();
        if (!term) return true;
        return (
            job.title?.toLowerCase().includes(term) ||
            job.company?.toLowerCase().includes(term) ||
            job.location?.toLowerCase().includes(term) ||
            job.description?.toLowerCase().includes(term) ||
            job.via?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-4 max-w-full mx-auto min-vh-100">
            {/* Navigation Header Left / Right Sync Row */}
            <div className="w-full mb-6 flex items-center justify-between px-2">
                {/* Left Side: Navigation Link */}
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-200"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Right Side: Jobs Counter */}
                <span className="text-slate-500 text-xs sm:text-sm font-medium tracking-tight">
                    {filteredHistoryJobs.length} {filteredHistoryJobs.length === 1 ? "job" : "jobs"} found
                    {isOfflineHistory && " (Offline Mode)"}
                </span>
            </div>

            {/* Content Container Area */}
            <div className="w-full px-2">
                {/* Header Profile Summary Box */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 mb-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Saved Jobs History
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base mb-6">
                        Browse and filter all jobs you have previously searched and saved.
                    </p>

                    {/* Filter Input Field Setup */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-1 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                        <input
                            value={historyFilter}
                            onChange={e => setHistoryFilter(e.target.value)}
                            placeholder="Filter by title, company, location or keyword..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm py-2.5 placeholder-slate-400"
                        />
                        {historyFilter && (
                            <button 
                                onClick={() => setHistoryFilter("")} 
                                className="bg-transparent border-none text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors px-2 py-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Dynamic History List Rendering Engine */}
                {historyLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse w-full" />
                        ))}
                    </div>
                ) : historyError ? (
                    <div className="text-red-500 text-center font-medium py-10 bg-red-50/50 border border-red-100 rounded-2xl">
                        {historyError}
                    </div>
                ) : filteredHistoryJobs.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-sm font-medium">No matching history items found.</p>
                        <p className="text-xs text-slate-400 mt-1">Try modifying your query text parameters.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredHistoryJobs.map(job => (
                            <div key={job.job_id} className="w-full">
                                <JobCard
                                    job={job}
                                    expanded={expandedId === job.job_id}
                                    onToggle={() => setExpandedId(expandedId === job.job_id ? null : job.job_id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}