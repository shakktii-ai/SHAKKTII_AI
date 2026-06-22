"use client";
import { MapPin, Briefcase, Search, Globe, IndianRupee } from "lucide-react";
import { useState, useEffect } from "react";
import JobCard from "@/components/jobCard"; 

// RecentJobCard component remains intact
function RecentJobCard({ job, expanded, onToggle }) {
  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
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
        <div className="flex flex-wrap gap-2 mt-auto">
          {job.location && (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-500 truncate">{job.location}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [recentJobs, setRecentJobs] = useState([]);
  
  // Form Input States
  const [query, setQuery] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [packageMin, setPackageMin] = useState(""); // New Package Filter state

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function fetchRecentJobs() {
    try {
      const userStr = localStorage.getItem("user");
      let userId = "";
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj.id || userObj._id || "";
      }
      if (userId) {
        const res = await fetch(`/api/jobs?all=true&userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const jobs = data.jobs || [];
          if (jobs.length > 0) {
            setRecentJobs(jobs.slice(0, 5));
            return;
          }
        }
      }
      const historyStr = localStorage.getItem("jobfind_local_history");
      if (historyStr) {
        const historyJobs = JSON.parse(historyStr);
        if (Array.isArray(historyJobs)) setRecentJobs(historyJobs.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to load recent jobs:", e);
    }
  }

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  function closeModal() {
    setIsModalOpen(false);
    setSearched(false);
    setJobs([]);

  }

  function syncJobsToLocalHistory(newJobs) {
    if (!newJobs || newJobs.length === 0) return;
    try {
      const userStr = localStorage.getItem("user");
      let userId = "";
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj.id || userObj._id || "";
      }
      const jobsWithUserId = newJobs.map(job => ({ ...job, userId }));
      localStorage.setItem("jobfind_local_history", JSON.stringify(jobsWithUserId));
      setRecentJobs(jobsWithUserId.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setIsModalOpen(true); 
    setError(null);
    setJobs([]);

    try {
      const userStr = localStorage.getItem("user");
      let userId = "";
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj.id || userObj._id || "";
      }

      // Appending all inputs cleanly to backend API call
      let fetchUrl = `/api/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&experience=${encodeURIComponent(experience)}&mode=${encodeURIComponent(mode)}&package=${encodeURIComponent(packageMin)}`;
      if (userId) fetchUrl += `&userId=${userId}`;

      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch accurate job records");
      
      const data = await res.json();
      const foundJobs = data.jobs || [];
      setJobs(foundJobs);
      setTotal(data.total || 0);
      if (foundJobs.length > 0) {
        syncJobsToLocalHistory(foundJobs);
        setQuery("");
      setLocation("");
      setExperience("");
      setMode("");
      setPackageMin("");
      }

      
    } catch (e) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") search();
  }

  return (
    <div className="font-sans max-w-7xl ">
      <div className="w-full bg-white rounded-[24px] border border-[#EFEFFA] pt-11 px-6 pb-10 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-[-0.03em] m-0 leading-[1.2]">
            Find your dream job now
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search across multi-tiered parameters. Defaulting search priorities to Pune if location preferences are empty.
          </p>
        </div>

        {/* 2-Row Stack Configuration Input System */}
        <div className="flex flex-col gap-4 w-full bg-white rounded-[24px] p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.12)] border border-[#E2E8F0]">
          
          {/* FIRST ROW: Searchbar Input field */}
          <div className="flex items-center w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-3">
            <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter skills / designations / companies (e.g. Frontend Developer)"
              className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[0.95rem] font-normal placeholder-slate-400"
            />
          </div>

          {/* SECOND ROW: Multi-Filters and Action Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
            
            {/* Filter 1: Experience Dropdown */}
            <div className="flex items-center flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-2.5">
              <Briefcase className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[0.9rem] font-normal text-slate-600 cursor-pointer"
              >
                <option value="">Select experience</option>
                <option value="fresher">Fresher (0 Yrs)</option>
                <option value="1 year">1 Year</option>
                <option value="2 years">2 Years</option>
                <option value="3 years">3 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>

            {/* Filter 2: Mode Dropdown */}
            <div className="flex items-center flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-2.5">
              <Globe className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[0.9rem] font-normal text-slate-600 cursor-pointer"
              >
                <option value="">Select mode</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Filter 3: Package/Salary Dropdown */}
            <div className="flex items-center flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-2.5">
              <IndianRupee className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
              <select
                value={packageMin}
                onChange={e => setPackageMin(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[0.9rem] font-normal text-slate-600 cursor-pointer"
              >
                <option value="">Select salary package</option>
                <option value="3 Lakhs">3+ LPA</option>
                <option value="6 Lakhs">6+ LPA</option>
                <option value="10 Lakhs">10+ LPA</option>
                <option value="15 Lakhs">15+ LPA</option>
                <option value="25 Lakhs">25+ LPA</option>
              </select>
            </div>

            {/* Filter 4: Location Input */}
            <div className="flex items-center flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-2.5">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter location (e.g. Pune)"
                className="w-full bg-transparent border-none outline-none text-[#1E293B] text-[0.9rem] font-normal placeholder-slate-400"
              />
            </div>

            {/* Main Action Trigger Search Button */}
            <button
              onClick={search}
              disabled={loading}
              className={`text-white border-none rounded-[16px] py-3 px-8 font-semibold text-[0.95rem] transition-all duration-200 text-center whitespace-nowrap lg:w-auto ${
                loading ? "bg-[#CBD5E1] cursor-not-allowed" : "bg-[#1f7ae0] hover:bg-[#1665c1] cursor-pointer"
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent Jobs Horizontal Scroll View */}
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
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-[750px] max-h-[85vh] rounded-[20px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),_0px_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="py-6 px-8 border-b border-[#F1F5F9] flex justify-between items-center">
              <div>
                <h2 className="text-[1.25rem] font-bold text-[#0F172A] m-0">
                  Search Results
                </h2>
                {!loading && !error && jobs.length > 0 && (
                  <p className="mt-1 mr-0 mb-0 ml-0 text-[0.85rem] text-[#64748B]">
                    Showing {jobs.length} matches for your query
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
                  <p className="text-[0.9rem] m-0">Try adjusting your keywords or filters.</p>
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