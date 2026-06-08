"use client";
import { MapPin, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JobCard from "@/components/jobCard"; // Adjust this import path as needed
function RecentJobCard({ job, expanded, onToggle }) {
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [expanded]);

  return (
    <>
      <div
        className="flex-shrink-0 w-[212px] sm:w-[240px] bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-sm hover:shadow-md hover:border-[#834DFA] transition-all duration-200 flex flex-col gap-3 cursor-pointer snap-start"
        onClick={onToggle}
      >
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
          {job.thumbnail ? (
            <img src={job.thumbnail} alt={`${job.company} logo`} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-bold text-lg text-slate-500">
              {job.company?.[0]?.toUpperCase() || "🏢"}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-[1rem] text-slate-900 truncate leading-tight" title={job.title}>{job.title}</h3>
          <p className="text-[0.875rem] text-slate-500 truncate mt-1" title={job.company}>{job.company}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto ">
          {job.location && (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-500">{job.location}</span>
            </div>
          )}

        </div>
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out] cursor-default"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[800px] max-h-[85vh] overflow-y-auto shadow-2xl relative [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Basic Info */}
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {job.thumbnail ? (
                  <img src={job.thumbnail} alt={`${job.company} logo`} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="font-bold text-xl text-slate-500">
                    {job.company?.[0]?.toUpperCase() || "🏢"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{job.title}</h3>
                <p className="text-base text-slate-500">{job.company}</p>
              </div>
              <button
                onClick={onToggle}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Expanded Section Details */}
            <div className="p-6 bg-slate-50/50">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Job Description
                </h4>
                <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed max-w-none">
                  {job.description || "No description provided."}
                </p>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {job.link && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {job.via ? `via ${job.via}` : "Posted recently"}
                  </span>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#834DFA] hover:bg-[#703ee3] text-white py-2.5 px-6 rounded-xl font-semibold text-sm shadow-sm transition-colors duration-150"
                  >
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function Home() {
  const [recentJobs, setRecentJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the popup
  const inputRef = useRef(null);

  // Close modal when user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load previous jobs as recent searches
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem("jobfind_local_history");
      if (historyStr) {
        const historyJobs = JSON.parse(historyStr);
        if (Array.isArray(historyJobs)) {
          setRecentJobs(historyJobs.slice(0, 5));
        }
      }
    } catch (e) {
      console.error("Failed to load recent jobs from history:", e);
    }
  }, []);

  function closeModal() {
    setIsModalOpen(false);
    setSearched(false);
    setJobs([]);
  }

  function syncJobsToLocalHistory(newJobs) {
    if (!newJobs || newJobs.length === 0) return;
    try {
      const existingStr = localStorage.getItem("jobfind_local_history");
      let existingJobs = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(existingJobs)) {
        existingJobs = [];
      }
      const jobMap = new Map();
      existingJobs.forEach(job => jobMap.set(job.job_id, job));
      newJobs.forEach(job => jobMap.set(job.job_id, job));
      const mergedJobs = Array.from(jobMap.values());
      mergedJobs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      localStorage.setItem("jobfind_local_history", JSON.stringify(mergedJobs));
    } catch (err) {
      console.error("Failed to sync to localStorage:", err);
    }
  }

  async function search(q) {
    const finalQuery = q || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setIsModalOpen(true); // Open the popup immediately when searching starts
    setError(null);
    setJobs([]);
    if (q) setQuery(q);

    try {
      const userStr = localStorage.getItem("user");
      let userId = "";
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj.id || userObj._id || "";
        } catch (e) { }
      }
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(finalQuery)}${userId ? `&userId=${userId}` : ""}`);
      if (!res.ok) {
        let errMsg = "Failed to fetch jobs";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {
          errMsg = `${res.status} ${res.statusText}`;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      const foundJobs = data.jobs || [];
      setJobs(foundJobs);
      setTotal(data.total || 0);
      if (foundJobs.length > 0) {
        syncJobsToLocalHistory(foundJobs);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") search();
  }

  return (
    <div className="font-sans">

      {/* Main Container Search Box */}
      <div className="w-full bg-white rounded-[24px] border border-[#EFEFFA] pt-11 px-5 pb-10 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-[-0.03em] m-0 leading-[1.2]">
            Find your next opportunity
          </h1>
          <p className="text-muted-foreground">
            Search millions of jobs - results saved to your personal database.
          </p>
        </div>

        {/* Search Input Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-[16px] p-3 sm:py-1.5 sm:pr-1.5 sm:pl-4 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">

          {/* Input Container Wrapper for Icon + Input */}
          <div className="flex items-center flex-1 gap-3 px-1 sm:px-0">
            <div className="flex items-center text-[#94A3B8] shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Job title, skill, or keyword ..."
              className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[1rem] py-2 sm:py-2.5 font-normal"
            />
          </div>

          {/* Button - Spans full width on mobile, auto width on desktop */}
          <button
            onClick={() => search()}
            disabled={loading}
            className={`text-white border-none rounded-[12px] py-3 px-6 font-semibold text-[0.95rem] transition-[background] duration-200 ease-in-out text-center whitespace-nowrap w-full sm:w-auto ${loading ? "bg-[#CBD5E1] cursor-not-allowed" : "bg-[#834DFA] cursor-pointer"
              }`}
          >
            Search Jobs
          </button>
        </div>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Recent Searches</h3>
            <div
              className="flex flex-row gap-4 overflow-x-auto pb-4 snap-x scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentJobs.map(job => (
                <RecentJobCard
                  key={job.job_id}
                  job={job}
                  expanded={expandedId === job.job_id}
                  onToggle={() => setExpandedId(expandedId === job.job_id ? null : job.job_id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL OVERLAY POPUP ================= */}
      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-[rgba(15,23,42,0.4)] backdrop-blur-[4px] z-[9999] flex justify-center items-center p-2"
          onClick={closeModal} // Closes modal if clicking outside the white card area
        >
          {/* Modal Main Content Box */}
          <div
            className="bg-white w-full max-w-[750px] max-h-[85vh] rounded-[20px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),_0px_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside the window
          >

            {/* Modal Header */}
            <div className="py-6 px-8 border-b border-[#F1F5F9] flex justify-between items-center">
              <div>
                <h2 className="text-[1.25rem] font-bold text-[#0F172A] m-0">
                  Search Results
                </h2>
                {!loading && !error && jobs.length > 0 && (
                  <p className="mt-1 mr-0 mb-0 ml-0 text-[0.85rem] text-[#64748B]">
                    Showing {jobs.length} matching matches for "{query}"
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="bg-[#F1F5F9] border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center font-bold text-[#64748B] text-[1rem]"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Results Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {error ? (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-[16px] p-6 text-[#EF4444] text-center">
                  <h3 className="mt-0 mr-0 mb-2 ml-0 font-bold">Search Error</h3>
                  <p className="text-[0.9rem] text-[#64748B] mt-0 mr-0 mb-4 ml-0">{error}</p>
                  <button onClick={() => search()} className="bg-white border border-[#E2E8F0] py-1.5 px-4 rounded-[8px] cursor-pointer font-semibold">Retry</button>
                </div>
              ) : loading ? (
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[100px] bg-[#F1F5F9] rounded-[16px] animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 px-0 text-[#64748B]">
                  <h3 className="font-semibold mt-0 mr-0 mb-1 ml-0">No jobs found</h3>
                  <p className="text-[0.9rem] m-0">Try adjusting your keywords.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobs.map(job => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      expanded={expandedId === job.job_id}
                      onToggle={() => setExpandedId(expandedId === job.job_id ? null : job.job_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}