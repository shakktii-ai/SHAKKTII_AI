"use client";

import { useState, useRef, useEffect } from "react";
import JobCard from "@/components/jobCard"; // Adjust this import path as needed


export default function Home() {
  const [suggestions, setSuggestions] = useState(["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "DevOps Engineer", "Frontend Developer"]);
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

  // Load previous search queries as suggestions
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem("jobfind_local_history");
      if (historyStr) {
        const historyJobs = JSON.parse(historyStr);
        if (Array.isArray(historyJobs)) {
          const uniqueQueries = [];
          for (const job of historyJobs) {
            const sq = job.search_query;
            if (sq && !uniqueQueries.includes(sq)) {
              uniqueQueries.push(sq);
            }
            if (uniqueQueries.length >= 7) break;
          }
          if (uniqueQueries.length > 0) {
            setSuggestions(uniqueQueries);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load suggestions from history:", e);
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
        } catch (e) {}
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
      <div className="w-full bg-white rounded-[24px] border border-[#EFEFFA] pt-11 px-10 pb-10 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
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
    className={`text-white border-none rounded-[12px] py-3 px-6 font-semibold text-[0.95rem] transition-[background] duration-200 ease-in-out text-center whitespace-nowrap w-full sm:w-auto ${
      loading ? "bg-[#CBD5E1] cursor-not-allowed" : "bg-[#834DFA] cursor-pointer"
    }`}
  >
    Search Jobs
  </button>
</div>

        {/* Pill Suggestions */}
        <div className="mt-5 flex flex-wrap gap-[0.625rem]">
          {suggestions.map(s => (
            <button 
              key={s} 
              onClick={() => search(s)} 
              className="bg-white border border-[#E2E8F0] text-[#1E293B] rounded-[10px] py-2 px-4 text-[0.875rem] font-medium cursor-pointer shadow-[0px_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150 ease-in-out hover:border-[#834DFA] hover:text-[#834DFA]"
            >
              {s}
            </button>
          ))}
        </div>
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