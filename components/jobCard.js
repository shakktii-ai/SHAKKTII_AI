import { Briefcase, MapPin, IndianRupee, ChevronDown, ExternalLink } from "lucide-react";

export default function JobCard({ job, expanded, onToggle }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ease-in-out w-full">
      
      {/* Clickable Card Header */}
      <div 
        onClick={onToggle} 
        className="p-5 md:p-6 cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between select-none"
      >
        <div className="flex gap-4 items-start md:items-center w-full min-w-0">
          {/* Company Logo/Thumbnail Placeholder */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {job.thumbnail ? (
              <img src={job.thumbnail} alt={`${job.company} logo`} className="w-full h-full object-contain" />
            ) : (
              <span className="font-bold text-lg text-slate-500">
                {job.company?.[0]?.toUpperCase() || "🏢"}
              </span>
            )}
          </div>

          {/* Job Info Block */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors truncate mb-1">
              {job.title}
            </h3>
            
            <p className="font-semibold text-sm md:text-base text-slate-700 mb-3">
              {job.company}
            </p>

            {/* Naukri-Style Inline Metadata Details Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs md:text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{job.experience || "0 - 3 Yrs"}</span>
              </div>
              <span className="hidden xs:inline text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{job.salary || "Not disclosed"}</span>
              </div>
              {job.location && (
                <>
                  <span className="hidden xs:inline text-slate-300">|</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Accordion Toggle Indicator Arrow */}
        <div className="self-end sm:self-center pt-2 sm:pt-0 pl-2">
          <div 
            className={`p-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 transition-transform duration-200 ${
              expanded ? "rotate-180 text-indigo-600 bg-indigo-50/50" : "rotate-0"
            }`}
          >
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Expanded Details Body Section */}
      {expanded && (
        <div className="p-5 md:p-6 bg-slate-50/70 border-t border-slate-100 animate-[fadeIn_0.2s_ease-out]">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Job Description
            </h4>
            <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed max-w-none">
              {job.description}
            </p>
          </div>

          {/* Dummy Skill Tags block typically seen on platform cards */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {job.skills.map((skill, index) => (
                <span key={index} className="text-xs bg-white text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          {job.link && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                {job.via ? `via ${job.via}` : "Posted recently"}
              </span>
              <a 
                href={job.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-[#834DFA] hover:bg-[#703ee3] text-white py-2.5 px-5 rounded-xl font-semibold text-sm shadow-sm transition-colors duration-150"
              >
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}