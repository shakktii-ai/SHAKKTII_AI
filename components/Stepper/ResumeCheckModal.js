'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function Step2PotentialModal({
  isOpen = true,
  onClose,
  onUploadResume,
  // status = 'Not Started',
  timeEstimate = '20-25 min',
}) {
  if (!isOpen) return null;
const router = useRouter();
  const tags = [
    'Leadership',
    'Problem Solving',
    'Communication',
    'Adaptability',
    'Teamwork',
    'Analytical Thinking',
  ];
 const handleRedirect = () => {
    if (onClose) onClose();
    router.push('/BaseLine/resumeRole');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-3 sm:p-4 overflow-y-auto no-scrollbar">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. FIXED ORANGE HEADER SECTION */}
        <div className="bg-[#FE673B] text-white p-5 sm:p-6 relative flex-shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white shadow-md hover:bg-white/90 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-800" />
          </button>

          {/* Header Main Content */}
          <div className="flex items-start space-x-3.5 mb-3">
            {/* Brain/Muscle Icon Box */}
            <div className="w-14 h-14 rounded-2xl bg-[#B0C9FF]/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/step2img.svg" // Replace with your asset path
                alt="Brain Icon"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback fallback icon
                  e.currentTarget.src =
                    'https://cdn-icons-png.flaticon.com/512/2491/2491921.png';
                }}
              />
            </div>

            <div>
              <span className="text-[11px] font-normal tracking-wider text-white/90 uppercase">
                Step 2 of 7
              </span>
              <h3 className="text-xl font-bold leading-tight">
                Discover Your Potential
              </h3>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-2 mt-2">
            {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-800 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-1.5" />
              {status}
            </span> */}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
              {timeEstimate}
            </span>
          </div>
        </div>

        {/* 2. SCROLLABLE MIDDLE SECTION */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-6 flex-1 text-slate-800">
          
          {/* Section: Why This Matters */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-base leading-none">🎯</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Why This Matters
              </h4>
            </div>
            <div className="bg-[#F6F6F6] rounded-xl p-4 text-xs text-slate-600 leading-relaxed border border-slate-100">
              Upload your resume to discover your strengths, identify skill gaps,
              and get personalized suggestions to improve your job readiness.
            </div>
          </div>

          {/* Section: What You'll Receive */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-base leading-none">🏆</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                What You'll Receive
              </h4>
            </div>

            {/* Skill Badges / Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#336DED]/30 text-[#336DED] border border-[#336DED] transition-all hover:bg-[#cbe0ff]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* 3. FIXED BOTTOM ACTION AREA */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white flex-shrink-0 text-center space-y-2">
          <button
            onClick={handleRedirect}
            className="w-full py-3.5 px-4 bg-[#FF6433] hover:bg-[#e85425] active:scale-[0.99] text-white rounded-2xl font-semibold text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center space-x-2"
          >
            <span>Upload Resume</span>
            <span className="text-lg leading-none">→</span>
          </button>
          <p className="text-[11px] text-slate-400 font-medium">
            Estimated time: {timeEstimate}
          </p>
        </div>

      </div>
    </div>
  );
}